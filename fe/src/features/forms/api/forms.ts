import { api } from '../../../utils/api';
import type {
  CreateFormRequest,
  UpdateFormRequest,
  DuplicateFormRequest,
  FormListParams,
  FormResponse,
  FormWithSectionsResponse,
  FormListResponse,
  PublishFormResponse,
} from '../types';

export const formsApi = {
  /**
   * Create a new form
   */
  createForm: async (data: CreateFormRequest): Promise<FormResponse> => {
    const response = await api.post('forms', {
      json: data,
    }).json<FormResponse>();

    return response;
  },

  /**
   * Get form details with all sections and fields
   */
  getFormById: async (formId: string): Promise<FormWithSectionsResponse> => {
    // Fetch form details and all fields
    const [formResponse, fieldsResponse] = await Promise.all([
      api.get(`forms/${formId}`).json<{ success: boolean; data: any; error: any; timestamp: string }>(),
      api.get(`forms/${formId}/fields`).json<{ success: boolean; data: { fields: any[] }; error: any; timestamp: string }>(),
    ]);

    if (!formResponse.success || !fieldsResponse.success) {
      return {
        success: false,
        data: null,
        error: formResponse.error || fieldsResponse.error,
        timestamp: formResponse.timestamp,
      };
    }

    // Structure the data correctly
    const formData = formResponse.data;
    const allFields = fieldsResponse.data.fields;

    // Group fields by section
    const sectionsMap = new Map<string, any>();
    const unsectionedFields: any[] = [];

    // Process all fields and group them
    allFields.forEach((field: any) => {
      if (field.content_type === 'section') {
        // This is a section
        sectionsMap.set(field.field_id, {
          section_id: field.field_id,
          title: field.label,
          description: field.description,
          order_global: field.order_global,
          visibility_type: 'always', // Default visibility
          fields: [], // Will be populated below
        });
      } else if (field.section_id) {
        // This field belongs to a section
        const section = sectionsMap.get(field.section_id);
        if (section) {
          section.fields.push(field);
        }
      } else {
        // This field doesn't belong to any section
        unsectionedFields.push(field);
      }
    });

    // Convert to array and sort by order
    const sections = Array.from(sectionsMap.values()).sort((a, b) => a.order_global - b.order_global);

    // Create a default section for unsectioned fields if there are any
    if (unsectionedFields.length > 0) {
      sections.push({
        section_id: 'default',
        title: 'Questions',
        description: '',
        order_global: sections.length + 1,
        visibility_type: 'always',
        fields: unsectionedFields,
      });
    }

    // Combine form data with sections
    const formWithSections = {
      ...formData,
      sections,
    };

    console.log('Form data structured:', {
      formId,
      totalSections: sections.length,
      totalFields: sections.reduce((acc, section) => acc + (section.fields?.length || 0), 0),
      sections: sections.map(s => ({
        id: s.section_id,
        title: s.title,
        fieldCount: s.fields?.length || 0
      }))
    });

    return {
      success: true,
      data: formWithSections,
      error: null,
      timestamp: formResponse.timestamp,
    };
  },

  /**
   * Update form settings
   */
  updateForm: async (formId: string, data: UpdateFormRequest): Promise<FormResponse> => {
    const response = await api.put(`forms/${formId}`, {
      json: data,
    }).json<FormResponse>();

    return response;
  },

  /**
   * Get all forms created by current user (paginated)
   */
  listUserForms: async (params?: FormListParams): Promise<FormListResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params?.order) searchParams.append('order', params.order);

    const queryString = searchParams.toString();
    const url = queryString ? `forms?${queryString}` : 'forms';

    const response = await api.get(url).json<FormListResponse>();

    return response;
  },

  /**
   * Delete form (soft delete)
   */
  deleteForm: async (formId: string): Promise<void> => {
    await api.delete(`forms/${formId}`);
  },

  /**
   * Duplicate form with all settings and questions
   */
  duplicateForm: async (formId: string, data: DuplicateFormRequest): Promise<FormResponse> => {
    const response = await api.post(`forms/${formId}/duplicate`, {
      json: data,
    }).json<FormResponse>();

    return response;
  },

  /**
   * Publish form (make it available for respondents)
   */
  publishForm: async (formId: string): Promise<PublishFormResponse> => {
    const response = await api.patch(`forms/${formId}/publish`).json<PublishFormResponse>();

    return response;
  },
};
