import React, { memo, useCallback, useEffect, useState } from "react";
import { CanvasProvider, useCanvasContext } from "../context/CanvasContext";
import { useManualSave } from "../hooks/useManualSave";
import { SaveButton } from "./SaveButton";
import { Canvas } from "./Canvas/Canvas";
import type { FormWithSections, CanvasItem } from "../../types";

interface SurveyBuilderProps {
  formId: string;
  form: FormWithSections;
}

// Main wrapper component - handles provider wrapping
export const SurveyBuilder = memo(
  (props: SurveyBuilderProps) => {
    // Early return if form is undefined (no context needed)
    if (!props.form) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="text-gray-500">Loading form...</div>
          </div>
        </div>
      );
    }

    return (
      <CanvasProvider>
        <SurveyBuilderComponent {...props} />
      </CanvasProvider>
    );
  },
  // Existing memo comparison
  (prevProps, nextProps) => {
    return (
      prevProps.formId === nextProps.formId &&
      prevProps.form?.form_id === nextProps.form?.form_id &&
      !!prevProps.form === !!nextProps.form
    );
  },
);

// Internal component - contains all business logic using context
const SurveyBuilderComponent: React.FC<SurveyBuilderProps> = ({
  formId,
  form,
}) => {
    const [surveyHeaderUpdates, setSurveyHeaderUpdates] = useState<{ title?: string; description?: string }>({});

  // Get canvas context for dirty state management (now within provider!)
  const { state, actions } = useCanvasContext();

  // Manual save hook
  const manualSave = useManualSave({
    formId,
    initialForm: form,
    canvasItems: state.items,
    surveyHeaderUpdates,
    onSaveStart: () => {
      actions.setManualSaving(true);
    },
    onSaveComplete: () => {
      actions.setManualSaving(false);
      // Clear survey header updates after successful save
      setSurveyHeaderUpdates({});
    },
    onSaveError: (errors: string[]) => {
      actions.setSaveError(errors.join(', '));
    },
  });

  
  // Mark form as dirty when canvas items or survey header changes
  useEffect(() => {
    if (state.items.length > 0 || Object.keys(surveyHeaderUpdates).length > 0) {
      manualSave.markDirty();
    }
  }, [state.items, surveyHeaderUpdates, manualSave.markDirty]);

  // Survey header update handler
  const handleSurveyHeaderUpdate = useCallback((updates: { title?: string; description?: string }) => {
    setSurveyHeaderUpdates(prev => ({ ...prev, ...updates }));
    actions.markDirty();
  }, [actions.markDirty]);

  // Handle reordering with backend sync
  const handleReorder = useCallback(
    async (reorderedItems: CanvasItem[], draggedId: string, targetId: string): Promise<void> => {
      try {
        // Update local state immediately
        actions.reorderItemsWithArray(reorderedItems, draggedId, targetId);

        // Sync to backend with only question items for reordering
        const questionItems = reorderedItems.filter(item => item.type === "question");
        const reorderRequest = {
          fields: questionItems.map(item => ({
            field_id: item.id,
            order_global: item.order || 0,
          }))
        };

        // Call reorder API
        const response = await fetch(`/api/v1/forms/${formId}/fields/reorder`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reorderRequest),
        });

        if (!response.ok) {
          throw new Error('Failed to reorder items');
        }

        // Mark as clean since reorder is immediately saved
        manualSave.markClean();
      } catch (error) {
        console.error("Failed to reorder items:", error);
        actions.setSaveError('Failed to reorder items. Please try again.');
        // Don't throw error - let user try again or save manually
      }
    },
    [formId, actions, manualSave]
  );

  // Handle browser navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (manualSave.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [manualSave.hasUnsavedChanges]);

  // Handle page visibility change (user switching tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && manualSave.hasUnsavedChanges) {
        // User is leaving the page - auto-save changes
        manualSave.saveAll();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [manualSave.hasUnsavedChanges, manualSave.saveAll]);

  return (
    <CanvasProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Save Button */}
        <SaveButton
          onSave={manualSave.saveAll}
          isSaving={manualSave.isSaving}
          hasUnsavedChanges={manualSave.hasUnsavedChanges}
          saveErrors={manualSave.saveErrors}
          variant="floating"
        />

        
        {/* Main Canvas Container */}
        <div
          className="flex-1 bg-gray-50 overflow-y-auto overflow-x-hidden"
          style={{
            padding: "24px 20px",
            minHeight: "100vh",
            position: "relative",
          }}
        >
          {/* Content Wrapper */}
          <div
            className="mx-auto"
            style={{
              maxWidth: "900px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <Canvas
              formId={formId}
              form={{
                ...form,
                // Merge current form data with survey header updates for display
                title: surveyHeaderUpdates.title ?? form.title,
                description: surveyHeaderUpdates.description ?? form.description,
              }}
              onReorder={handleReorder}
              surveyHeaderState={{
                title: (surveyHeaderUpdates.title || form.title) ?? '',
                description: (surveyHeaderUpdates.description || form.description) ?? '',
                lastSaved: {
                  title: form.title ?? '',
                  description: form.description ?? '',
                },
              }}
              onSurveyHeaderUpdate={handleSurveyHeaderUpdate}
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
    </CanvasProvider>
  );
};

