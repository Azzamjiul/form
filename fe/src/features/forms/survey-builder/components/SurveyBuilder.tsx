import React, { memo, useCallback } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { formsApi } from '../../api/forms';
import { fieldsApi } from '../../api/fields';
import { CanvasProvider } from '../context/CanvasContext';
import { CanvasTransformer } from '../utils/transformations';
import { useFieldAutoSave } from '../hooks/useAutoSave';
import { Canvas } from './Canvas/Canvas';
import type { FormWithSections, CreateFieldRequest } from '../../types';

interface SurveyBuilderProps {
  formId: string;
  initialForm: FormWithSections;
}

const SurveyBuilderComponent: React.FC<SurveyBuilderProps> = ({
  formId,
  initialForm,
}) => {
  const queryClient = useQueryClient();

  // Use React Query to keep form data synchronized
  const { data: formResponse } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => formsApi.getFormById(formId),
    initialData: {
      success: true,
      data: initialForm,
      error: null,
      timestamp: new Date().toISOString(),
    },
  });

  const form = formResponse?.success ? formResponse.data : initialForm;

  // Auto-save functionality for form metadata
  const { triggerAutoSave } = useFieldAutoSave(
    formId,
    async (formId, updates) => {
      const response = await formsApi.updateForm(formId, updates);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to save form');
      }
    },
    { delay: 2000 }
  );

  // Handle adding new question
  const handleAddQuestion = React.useCallback(
    async (type: string = 'text', afterId?: string) => {
      try {
        const nextOrder = 0; // This would be calculated based on existing items

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
      }
    },
    [formId, queryClient],
  );

  // Handle adding new section
  const handleAddSection = React.useCallback(async () => {
    try {
      const nextOrder = 0; // This would be calculated based on existing items

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
    }
  }, [formId, queryClient]);

  // Handle reordering with backend sync
  const handleReorderItems = React.useCallback(
    async (draggedId: string, targetId: string) => {
      try {
        // Get current canvas items (this would come from context)
        const canvasItems = CanvasTransformer.fromFormToCanvas(form);
        const reorderedItems = canvasItems.filter(item => item.type === 'question');

        // Reorder logic
        const draggedIndex = reorderedItems.findIndex(item => item.id === draggedId);
        const targetIndex = reorderedItems.findIndex(item => item.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const [draggedItem] = reorderedItems.splice(draggedIndex, 1);
        reorderedItems.splice(targetIndex, 0, draggedItem);

        // Sync to backend
        const reorderRequest = CanvasTransformer.fromCanvasToReorderRequest(reorderedItems);
        await fieldsApi.reorderFields(formId, reorderRequest);

        // Refresh data
        queryClient.invalidateQueries({ queryKey: ['form', formId] });
      } catch (error) {
        console.error('Failed to reorder items:', error);
      }
    },
    [formId, form, queryClient],
  );

  return (
    <CanvasProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Main Canvas Container */}
        <div
          className="flex-1 bg-gray-50 overflow-y-auto overflow-x-hidden"
          style={{
            padding: '24px 20px',
            minHeight: '100vh',
            position: 'relative',
          }}
        >
          {/* Content Wrapper */}
          <div
            className="mx-auto"
            style={{
              maxWidth: '900px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <Canvas formId={formId} />
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
    </CanvasProvider>
  );
};

export const SurveyBuilder = memo(SurveyBuilderComponent, (prevProps, nextProps) => {
  return prevProps.formId === nextProps.formId && prevProps.initialForm.form_id === nextProps.initialForm.form_id;
});