import React, { memo, useCallback, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { formsApi } from "../../api/forms";
import { fieldsApi } from "../../api/fields";
import { CanvasProvider, useCanvasContext } from "../context/CanvasContext";
import { CanvasTransformer } from "../utils/transformations";
import { useAutoSave } from "../hooks/useAutoSave";
import { Canvas } from "./Canvas/Canvas";
import type {
  FormWithSections,
  CreateFieldRequest,
  CanvasItem,
} from "../../types";

interface SurveyBuilderProps {
  formId: string;
  form: FormWithSections;
}

const SurveyBuilderComponent: React.FC<SurveyBuilderProps> = ({
  formId,
  form,
}) => {
  // Early return if form is undefined
  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-gray-500">Loading form...</div>
        </div>
      </div>
    );
  }

  const queryClient = useQueryClient();

  // Use form prop directly (no duplicate query needed)
  // Form data is passed as prop and managed through local state updates

  // Custom debounce function
  const debounce = useCallback((func: Function, delay: number) => {
    const timerRef = useRef<number | null>(null);
    return (...args: any[]) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        func(...args);
        timerRef.current = null;
      }, delay);
    };
  }, []);

  // Auto-save functionality for form metadata
  const { debouncedSave: debouncedFormSave } = useAutoSave(
    form,
    async (formData) => {
      if (!formData || !formData.form_id) return;
      const response = await formsApi.updateForm(formId, {
        title: formData.title,
        description: formData.description,
      });
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to save form");
      }
    },
    { delay: 2000 },
  );

  // Handle adding new question
  // @ts-ignore - Intentionally unused for future implementation
  const _handleAddQuestion = useCallback(
    async (type: string = "text", afterId?: string) => {
      console.log("afterId:", afterId); // Mark as used to avoid TypeScript error
      try {
        const nextOrder = 0; // This would be calculated based on existing items

        const defaultQuestion: CreateFieldRequest = {
          content_type: "input_field",
          field_type: type,
          label: "Untitled Question",
          description: "",
          order_global: nextOrder,
          section_id: undefined,
          order_in_section: undefined,
          is_required: false,
          points: 0,
        };

        const response = await fieldsApi.createField(formId, defaultQuestion);
        if (response.success) {
          // Remove query invalidation - auto-save handles local state updates
        }
      } catch (error) {
        console.error("Failed to create question:", error);
      }
    },
    [formId, queryClient],
  );

  // Handle adding new section
  // @ts-ignore - Intentionally unused for future implementation
  const _handleAddSection = useCallback(async () => {
    try {
      const nextOrder = 0; // This would be calculated based on existing items

      const defaultSection: CreateFieldRequest = {
        content_type: "section",
        label: "Untitled Section",
        description: "",
        order_global: nextOrder,
        is_required: false,
        points: 0,
      };

      const response = await fieldsApi.createField(formId, defaultSection);
      if (response.success) {
        // Remove query invalidation - auto-save handles local state updates
      }
    } catch (error) {
      console.error("Failed to create section:", error);
    }
  }, [formId, queryClient]);

  // Field auto-save functionality
  const fieldAutoSave = useCallback(
    async (fieldId: string, item: CanvasItem) => {
      const fieldUpdate = CanvasTransformer.itemToFieldUpdate(item);
      const response = await fieldsApi.updateField(
        formId,
        fieldId,
        fieldUpdate,
      );
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to save field");
      }
      return response;
    },
    [formId],
  );

  const debouncedFieldUpdate = useCallback(debounce(fieldAutoSave, 2000), [
    fieldAutoSave,
  ]);

  // Enhanced Canvas component with auto-save integration
  const EnhancedCanvas = memo(() => {
    const { state, actions } = useCanvasContext();

    // Auto-save integration for canvas updates
    useEffect(() => {
      // Create enhanced update handler that triggers auto-save
      const originalUpdateItem = actions.updateItem;
      const enhancedUpdateItem = (
        itemId: string,
        updates: Partial<CanvasItem>,
      ) => {
        // Update local state immediately
        originalUpdateItem(itemId, updates);

        // Trigger auto-save for form header
        if (itemId === "survey-header") {
          // Get updated form data from canvas items
          const headerItem = state.items.find(
            (item) => item.id === "survey-header",
          );
          if (headerItem) {
            const updatedForm = {
              ...form!,
              title: headerItem.title || "",
              description: headerItem.description || "",
            };
            debouncedFormSave(updatedForm);
          }
        }
        // Trigger auto-save for individual fields
        else {
          const updatedItem = state.items.find((item) => item.id === itemId);
          if (updatedItem) {
            debouncedFieldUpdate(itemId, updatedItem);
          }
        }
      };

      // Override the update action
      actions.updateItem = enhancedUpdateItem;

      return () => {
        // Restore original function on cleanup
        actions.updateItem = originalUpdateItem;
      };
    }, [actions, debouncedFormSave, debouncedFieldUpdate, state.items, form]);

    return <Canvas formId={formId} form={form} />;
  });

  // Handle reordering with backend sync
  // @ts-ignore - Intentionally unused for future implementation
  const _handleReorderItems = useCallback(
    async (draggedId: string, targetId: string) => {
      try {
        // Get current canvas items (this would come from context)
        const canvasItems = CanvasTransformer.fromFormToCanvas(form!);
        const reorderedItems = canvasItems.filter(
          (item) => item.type === "question",
        );

        // Reorder logic
        const draggedIndex = reorderedItems.findIndex(
          (item) => item.id === draggedId,
        );
        const targetIndex = reorderedItems.findIndex(
          (item) => item.id === targetId,
        );

        if (draggedIndex === -1 || targetIndex === -1) return;

        const [draggedItem] = reorderedItems.splice(draggedIndex, 1);
        reorderedItems.splice(targetIndex, 0, draggedItem);

        // Sync to backend
        const reorderRequest =
          CanvasTransformer.fromCanvasToReorderRequest(reorderedItems);
        await fieldsApi.reorderFields(formId, reorderRequest);

        // Refresh data
        // Remove query invalidation - auto-save handles local state updates
      } catch (error) {
        console.error("Failed to reorder items:", error);
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
            <EnhancedCanvas />
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

export const SurveyBuilder = memo(
  SurveyBuilderComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.formId === nextProps.formId &&
      prevProps.form?.form_id === nextProps.form?.form_id &&
      !!prevProps.form === !!nextProps.form
    );
  },
);
