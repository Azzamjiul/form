import { getOptionsArray } from '../../types';
import type {
  CanvasItem,
  FormWithSections,
  ReorderFieldsRequest,
  UpdateFieldRequest,
} from '../../types';

export class CanvasTransformer {
  /**
   * Transform FormWithSections to CanvasItem array
   */
  static fromFormToCanvas(formData: FormWithSections): CanvasItem[] {
    const transformedItems: CanvasItem[] = [];

    // Always start with survey header
    transformedItems.push({
      id: "survey-header",
      type: "header",
      title: formData.title || "Untitled Form",
      description: formData.description || "",
      order: 0,
      isEditing: false,
      isSelected: false,
      isDragging: false,
    });

    let canvasOrder = 1;
    let sectionCount = 0;

    // Process content items (already sorted by order_global from backend)
    if (formData.content_items && formData.content_items.length > 0) {
      formData.content_items.forEach((item, index) => {
        if (item.type === "field" && item.field) {
          // Add standalone field
          const field = item.field;
          transformedItems.push({
            id: field.field_id,
            type: "question",
            title: field.label || "Untitled Question",
            description: field.description || "",
            questionType: field.field_type || "text",
            required: field.is_required || false,
            options: this.normalizeOptions(field.options),
            answerKey: field.answer_key,
            points: field.points || 0,
            imageFileId: field.image_file_id,
            order: canvasOrder++,
            isEditing: false,
            isSelected: false,
            isDragging: false,
          });
        } else if (item.type === "section" && item.section) {
          // Add section
          const section = item.section;
          sectionCount++;

          transformedItems.push({
            id: `section-${section.section_id}`,
            type: "title-description",
            title: section.title || "",
            description: section.description || "",
            order: canvasOrder++,
            isEditing: false,
            isSelected: false,
            isDragging: false,
          });

          // Add fields for this section
          if (section.fields && section.fields.length > 0) {
            section.fields.forEach((field) => {
              transformedItems.push({
                id: field.field_id,
                type: "question",
                title: field.label || "Untitled Question",
                description: field.description || "",
                questionType: field.field_type || "text",
                required: field.is_required || false,
                options: this.normalizeOptions(field.options),
                answerKey: field.answer_key,
                points: field.points || 0,
                imageFileId: field.image_file_id,
                order: canvasOrder++,
                isEditing: false,
                isSelected: false,
                isDragging: false,
              });
            });
          }

          // Add page break if next item is also a section
          const nextItem = formData.content_items[index + 1];
          if (nextItem && nextItem.type === "section") {
            transformedItems.push({
              id: `page-break-${section.section_id}`,
              type: "page-break",
              title: "",
              description: "",
              sectionNumber: sectionCount,
              totalSections: formData.sections?.length || 0,
              order: canvasOrder++,
              isEditing: false,
              isSelected: false,
              isDragging: false,
            });
          }
        }
      });
    }

    return transformedItems;
  }

  /**
   * Transform CanvasItem array to ReorderFieldsRequest
   */
  static fromCanvasToReorderRequest(canvasItems: CanvasItem[]): ReorderFieldsRequest {
    const reorderItems = canvasItems
      .filter(item =>
        item.type === 'question' &&
        item.id !== 'survey-header' &&
        !item.id.startsWith('page-break-')
      )
      .map((item, index) => ({
        field_id: item.id,
        order_global: index,
        section_id: item.sectionId,
        order_in_section: item.orderInSection,
      }));

    return { items: reorderItems };
  }

  /**
   * Transform single CanvasItem to UpdateFieldRequest
   */
  static itemToFieldUpdate(item: CanvasItem): UpdateFieldRequest {
    const updatePayload: UpdateFieldRequest = {};

    if (item.title !== undefined) updatePayload.label = item.title;
    if (item.description !== undefined) updatePayload.description = item.description;
    if (item.required !== undefined) updatePayload.is_required = item.required;
    if (item.questionType !== undefined) updatePayload.field_type = item.questionType;
    if (item.options !== undefined) updatePayload.answer_key = item.options;
    if (item.answerKey !== undefined) updatePayload.answer_key = item.answerKey;
    if (item.points !== undefined) updatePayload.points = item.points;
    if (item.imageFileId !== undefined) updatePayload.image_file_id = item.imageFileId;

    return updatePayload;
  }

  /**
   * Normalize options to consistent format
   */
  private static normalizeOptions(options: any): Array<{ id: string; label: string; imageFileId?: string }> {
    if (!options) return [];
    return getOptionsArray(options).map(opt => ({
      ...opt,
      imageFileId: (opt as any).image_file_id,
    }));
  }

  /**
   * Create a new question CanvasItem with default values
   */
  static createQuestionItem(
    fieldId: string,
    type: string = "text",
    order: number
  ): CanvasItem {
    return {
      id: fieldId,
      type: "question",
      title: "Untitled Question",
      description: "",
      questionType: type,
      required: false,
      options: [],
      points: 0,
      order,
      isEditing: false,
      isSelected: false,
      isDragging: false,
    };
  }

  /**
   * Create a new section CanvasItem with default values
   */
  static createSectionItem(
    sectionId: string,
    order: number
  ): CanvasItem {
    return {
      id: `section-${sectionId}`,
      type: "title-description",
      title: "Untitled Section",
      description: "",
      order,
      isEditing: false,
      isSelected: false,
      isDragging: false,
    };
  }

  /**
   * Validate CanvasItem structure
   */
  static validateCanvasItem(item: CanvasItem): boolean {
    if (!item.id || !item.type || typeof item.order !== 'number') {
      return false;
    }

    const validTypes = ['header', 'title-description', 'question', 'page-break'];
    if (!validTypes.includes(item.type)) {
      return false;
    }

    if (item.type === 'question' && !item.questionType) {
      return false;
    }

    return true;
  }

  /**
   * Get next order number for new items
   */
  static getNextOrderNumber(items: CanvasItem[]): number {
    if (items.length === 0) return 0;
    return Math.max(...items.map(item => item.order)) + 1;
  }
}