import React, { useState, useEffect, useCallback } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { formsApi } from '../api/forms';
import { fieldsApi } from '../api/fields';
import type { FormWithSections, CreateFieldRequest, CanvasItem } from '../types';
import { CenterCanvas } from './CenterCanvas';
import { useAutoSave } from '../../../hooks/useAutoSave';

interface SurveyBuilderProps {
  formId: string;
  initialForm: FormWithSections;
}

export const SurveyBuilder: React.FC<SurveyBuilderProps> = ({ formId, initialForm }) => {
  const queryClient = useQueryClient();

  // Use React Query to keep form data synchronized
  const { data: formResponse } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => formsApi.getFormById(formId),
    initialData: { success: true, data: initialForm, error: null, timestamp: new Date().toISOString() },
  });

  const form = formResponse?.success ? formResponse.data : initialForm;

  // State management for canvas items
  const [items, setItems] = useState<CanvasItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

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

    let canvasOrder = 1;
    let sectionCount = 0;

    // Process content items (already sorted by order_global from backend)
    if (formData.content_items && formData.content_items.length > 0) {
      formData.content_items.forEach((item, index) => {
        if (item.type === 'field' && item.field) {
          // Add standalone field
          const field = item.field;
          transformedItems.push({
            id: field.field_id,
            type: 'question',
            title: field.label || 'Untitled Question',
            description: field.description || '',
            questionType: field.field_type || 'text',
            required: field.is_required || false,
            options: field.options || [],
            answerKey: field.answer_key as any,
            points: field.points || 0,
            order: canvasOrder++,
            isEditing: false,
            isSelected: false,
            isDragging: false
          });
        } else if (item.type === 'section' && item.section) {
          // Add section
          const section = item.section;
          sectionCount++;

          transformedItems.push({
            id: `section-${section.section_id}`,
            type: 'title-description',
            title: section.title || '',
            description: section.description || '',
            order: canvasOrder++,
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
                answerKey: field.answer_key as any,
                points: field.points || 0,
                order: canvasOrder++,
                isEditing: false,
                isSelected: false,
                isDragging: false
              });
            });
          }

          // Add page break if next item is also a section
          const nextItem = formData.content_items[index + 1];
          if (nextItem && nextItem.type === 'section') {
            transformedItems.push({
              id: `page-break-${section.section_id}`,
              type: 'page-break',
              title: '',
              description: '',
              sectionNumber: sectionCount,
              totalSections: formData.sections?.length || 0,
              order: canvasOrder++,
              isEditing: false,
              isSelected: false,
              isDragging: false
            });
          }
        }
      });
    }

    return transformedItems;
  }, []);

  // Update items when form data changes
  useEffect(() => {
    if (!form) return;
    const newItems = transformFormToItems(form);
    setItems(newItems);
  }, [form, transformFormToItems]);

  // Auto-save functionality
  useAutoSave(
    form,
    async (formData) => {
      if (!formData) return;
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
  const handleAddQuestion = useCallback(async (type: string = 'text', _afterId?: string) => {
    if (isCreating) return;

    setIsCreating(true);
    try {
      const nextOrder = Math.max(0, ...items.map(item => item.order)) + 1;

      const defaultQuestion: CreateFieldRequest = {
        content_type: 'input_field',
        field_type: type,
        label: 'Untitled Question',
        description: '',
        order_global: nextOrder,
        section_id: undefined,
        order_in_section: undefined,
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
  const handleAddSection = useCallback(async (_afterId?: string) => {
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

  // Debounced field update to backend
  const saveFieldToBackend = useCallback(async (fieldId: string, updates: Partial<CanvasItem>) => {
    try {
      setIsSaving(true);
      const updatePayload: any = {};

      if (updates.title !== undefined) updatePayload.label = updates.title;
      if (updates.description !== undefined) updatePayload.description = updates.description;
      if (updates.required !== undefined) updatePayload.is_required = updates.required;
      if (updates.questionType !== undefined) updatePayload.field_type = updates.questionType;
      if (updates.options !== undefined) updatePayload.options = updates.options;
      if (updates.answerKey !== undefined) updatePayload.answer_key = updates.answerKey;
      if (updates.points !== undefined) updatePayload.points = updates.points;

      await fieldsApi.updateField(formId, fieldId, updatePayload);
      setIsSaving(false);
      setJustSaved(true);

      // Hide success notification after 3 seconds
      setTimeout(() => setJustSaved(false), 3000);
    } catch (error) {
      console.error('Failed to update field:', error);
      setIsSaving(false);
    }
  }, [formId]);

  // Debounce timer ref
  const updateTimersRef = React.useRef<Map<string, number>>(new Map());

  // Handle item updates with auto-save
  const handleUpdateItem = useCallback((itemId: string, updates: Partial<CanvasItem>) => {
    // Update local state immediately
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );

    // Skip auto-save for non-field items
    if (itemId === 'survey-header' || itemId.startsWith('section-') || itemId.startsWith('page-break-')) {
      return;
    }

    // Clear existing timer for this item
    const existingTimer = updateTimersRef.current.get(itemId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounced save timer (2 seconds)
    const newTimer = setTimeout(() => {
      saveFieldToBackend(itemId, updates);
      updateTimersRef.current.delete(itemId);
    }, 2000);

    updateTimersRef.current.set(itemId, newTimer);
  }, [saveFieldToBackend]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      updateTimersRef.current.forEach((timer) => clearTimeout(timer));
      updateTimersRef.current.clear();
    };
  }, []);

  // Handle item deletion
  const handleDeleteItem = useCallback((itemId: string) => {
    if (itemId === 'survey-header') return; // Cannot delete header

    setItems(prevItems => prevItems.filter(item => item.id !== itemId));

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
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Canvas Container */}
      <div
        className="flex-1 bg-gray-50 overflow-y-auto overflow-x-hidden"
        style={{
          padding: '24px 20px',
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
            gap: '16px'
          }}
        >
          <CenterCanvas
            items={items}
            formId={formId}
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
            isSaving={isSaving}
            justSaved={justSaved}
          />
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 1024px) {
          div[style*="padding: '24px 20px'"] {
            padding: 20px 16px;
          }
        }

        @media (max-width: 768px) {
          div[style*="padding: '24px 20px'"] {
            padding: 16px;
          }

          div[style*="maxWidth: '900px'"] {
            maxWidth: 100%;
          }

          div[style*="gap: '16px'"] {
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};