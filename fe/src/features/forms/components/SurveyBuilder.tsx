import React, { useState, useEffect, useCallback } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { formsApi } from '../api/forms';
import { fieldsApi } from '../api/fields';
import type { FormWithSections, CreateFieldRequest } from '../types';
import { CenterCanvas } from './CenterCanvas';
import { useAutoSave } from '../../../hooks/useAutoSave';

interface SurveyBuilderProps {
  formId: string;
  initialForm: FormWithSections;
}

interface CanvasItem {
  id: string;
  type: 'header' | 'title-description' | 'question' | 'page-break';
  title: string;
  description: string;
  questionType?: string;
  required?: boolean;
  options?: Array<{ id: string; label: string }>;
  sectionNumber?: number;
  totalSections?: number;
  order: number;
  isEditing?: boolean;
  isSelected?: boolean;
  isDragging?: boolean;
}

export const SurveyBuilder: React.FC<SurveyBuilderProps> = ({ formId, initialForm }) => {
  const queryClient = useQueryClient();

  // Use React Query to keep form data synchronized
  const { data: formResponse } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => formsApi.getFormById(formId),
    initialData: { success: true, data: initialForm },
  });

  const form = formResponse?.success ? formResponse.data : initialForm;

  // State management for canvas items
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Transform form data into canvas items
  const transformFormToItems = useCallback((formData: FormWithSections): CanvasItem[] => {
    const transformedItems: CanvasItem[] = [];

    // Always start with survey header
    transformedItems.push({
      id: 'survey-header',
      type: 'header',
      title: formData.title || 'Untitled Form',
      description: formData.description || '',
      order: 0,
      isEditing: false,
      isSelected: false,
      isDragging: false
    });

    let currentOrder = 1;

    // Add sections and their fields
    if (formData.sections && formData.sections.length > 0) {
      formData.sections.forEach((section, sectionIndex) => {
        // Add title/description section
        transformedItems.push({
          id: `section-${section.section_id}`,
          type: 'title-description',
          title: section.title || '',
          description: section.description || '',
          order: currentOrder++,
          isEditing: false,
          isSelected: false,
          isDragging: false
        });

        // Add fields for this section
        if (section.fields && section.fields.length > 0) {
          section.fields.forEach((field) => {
            transformedItems.push({
              id: field.field_id,
              type: 'question',
              title: field.label || 'Untitled Question',
              description: field.description || '',
              questionType: field.field_type || 'text',
              required: field.is_required || false,
              options: field.options || [],
              order: currentOrder++,
              isEditing: false,
              isSelected: false,
              isDragging: false
            });
          });
        }

        // Add page break except for last section
        if (sectionIndex < formData.sections!.length - 1) {
          transformedItems.push({
            id: `page-break-${section.section_id}`,
            type: 'page-break',
            title: '',
            description: '',
            sectionNumber: sectionIndex + 1,
            totalSections: formData.sections!.length,
            order: currentOrder++,
            isEditing: false,
            isSelected: false,
            isDragging: false
          });
        }
      });
    }

    return transformedItems;
  }, []);

  // Update items when form data changes
  useEffect(() => {
    const newItems = transformFormToItems(form);
    setItems(newItems);
  }, [form, transformFormToItems]);

  // Auto-save functionality
  const { triggerSave } = useAutoSave(
    form,
    async (formData) => {
      const response = await formsApi.updateForm(formId, {
        title: formData.title,
        description: formData.description,
      });
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to save form');
      }
    },
    {
      delay: 2000,
      onSave: setIsSaving,
      onError: (error) => console.error('Auto-save error:', error),
    }
  );

  // Handle adding new question
  const handleAddQuestion = useCallback(async (afterId?: string) => {
    if (isCreating) return;

    setIsCreating(true);
    try {
      const nextOrder = Math.max(0, ...items.map(item => item.order)) + 1;

      const defaultQuestion: CreateFieldRequest = {
        content_type: 'input_field',
        field_type: 'text',
        label: 'Untitled Question',
        description: '',
        order_global: nextOrder,
        order_in_section: nextOrder,
        is_required: false,
        points: 0,
      };

      const response = await fieldsApi.createField(formId, defaultQuestion);
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['form', formId] });
      }
    } catch (error) {
      console.error('Failed to create question:', error);
    } finally {
      setIsCreating(false);
    }
  }, [isCreating, items, formId, queryClient]);

  // Handle adding new section
  const handleAddSection = useCallback(async (afterId?: string) => {
    if (isCreating) return;

    setIsCreating(true);
    try {
      const nextOrder = Math.max(0, ...items.map(item => item.order)) + 1;

      const defaultSection: CreateFieldRequest = {
        content_type: 'section',
        label: 'Untitled Section',
        description: '',
        order_global: nextOrder,
        is_required: false,
        points: 0,
      };

      const response = await fieldsApi.createField(formId, defaultSection);
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['form', formId] });
      }
    } catch (error) {
      console.error('Failed to create section:', error);
    } finally {
      setIsCreating(false);
    }
  }, [isCreating, items, formId, queryClient]);

  // Handle item selection
  const handleSelectItem = useCallback((itemId: string) => {
    setSelectedItemId(itemId);
    setItems(prevItems =>
      prevItems.map(item => ({
        ...item,
        isSelected: item.id === itemId
      }))
    );
  }, []);

  // Handle item updates
  const handleUpdateItem = useCallback((itemId: string, updates: Partial<CanvasItem>) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
    setHasUnsavedChanges(true);
  }, []);

  // Handle item deletion
  const handleDeleteItem = useCallback((itemId: string) => {
    if (itemId === 'survey-header') return; // Cannot delete header

    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    setHasUnsavedChanges(true);

    if (selectedItemId === itemId) {
      setSelectedItemId(null);
    }
  }, [selectedItemId]);

  // Handle item reordering
  const handleReorderItems = useCallback((draggedId: string, targetId: string) => {
    setItems(prevItems => {
      const draggedIndex = prevItems.findIndex(item => item.id === draggedId);
      const targetIndex = prevItems.findIndex(item => item.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) return prevItems;

      const newItems = [...prevItems];
      const [draggedItem] = newItems.splice(draggedIndex, 1);
      newItems.splice(targetIndex, 0, draggedItem);

      // Update order values
      return newItems.map((item, index) => ({
        ...item,
        order: index
      }));
    });

    setHasUnsavedChanges(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Auto-save indicator */}
      {isSaving && (
        <div className="fixed top-16 right-4 bg-green-500 text-white px-3 py-1 rounded-lg text-sm z-50 shadow-lg">
          Menyimpan...
        </div>
      )}

      {/* Main Canvas Container */}
      <div
        className="flex-1 bg-gray-50 overflow-y-auto overflow-x-hidden"
        style={{
          padding: '40px 32px',
          minHeight: '100vh',
          position: 'relative'
        }}
      >
        {/* Content Wrapper */}
        <div
          className="mx-auto"
          style={{
            maxWidth: '900px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          <CenterCanvas
            items={items}
            selectedItemId={selectedItemId}
            draggedItemId={draggedItemId}
            onSelectItem={handleSelectItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onAddQuestion={handleAddQuestion}
            onAddSection={handleAddSection}
            onReorderItems={handleReorderItems}
            onSetDraggedItem={setDraggedItemId}
            isCreating={isCreating}
            hasUnsavedChanges={hasUnsavedChanges}
            lastSavedAt={lastSavedAt}
          />
        </div>
      </div>

      {/* Responsive styles */}
      <style jsx>{`
        @media (max-width: 1024px) {
          div[style*="padding: '40px 32px'"] {
            padding: 32px 24px;
          }
        }

        @media (max-width: 768px) {
          div[style*="padding: '40px 32px'"] {
            padding: 16px;
          }

          div[style*="maxWidth: '900px'"] {
            maxWidth: 100%;
          }

          div[style*="gap: '24px'"] {
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};