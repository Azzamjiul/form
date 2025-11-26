import React, { useCallback, useEffect, useRef } from "react";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CanvasTransformer } from "../../utils/transformations";
import { useCanvasContext } from "../../context/CanvasContext";
import { CardSelectionProvider, useCardIsSelected, useAnyCardDragging } from "../../context/CardContext";
import { useDragDrop } from "../../hooks/useDragDrop";
import { QuestionCard } from "../Cards/QuestionCard/QuestionCard";
import { SurveyHeaderCard, SectionCard, PageBreakCard, EmptyState } from "./Cards";
import type { FormWithSections, CanvasItem } from "../../../types";

interface DragDropCanvasProps {
  formId: string;
  form: FormWithSections;
  onReorder?: (reorderedItems: CanvasItem[], draggedId: string, targetId: string) => Promise<void>;
  surveyHeaderState?: {
    title: string;
    description: string;
    lastSaved: {
      title: string;
      description: string;
    };
  };
  onSurveyHeaderUpdate?: (updates: { title?: string; description?: string }) => void;
}

export const DragDropCanvas: React.FC<DragDropCanvasProps> = ({
  formId,
  form,
  onReorder,
  surveyHeaderState,
  onSurveyHeaderUpdate
}) => {
  const { state, actions } = useCanvasContext();

  // Track form prop changes to prevent unnecessary rebuilds
  const lastFormRef = useRef<FormWithSections | null>(null);
  const formUpdateTriggerRef = useRef<string>("");

  // Form prop change handling for manual save system
  useEffect(() => {
    if (!form) return;

    // Generate a unique trigger for this form change
    const formTrigger = `${form.form_id}-${form.title}-${form.description}-${form.updated_at || ''}`;

    // Skip if form hasn't actually changed (prevents unnecessary rebuilds)
    if (lastFormRef.current && formTrigger === formUpdateTriggerRef.current) {
      return;
    }

    // Update canvas items
    const canvasItems = CanvasTransformer.fromFormToCanvas(form);

    // Merge survey header state from parent if available
    if (surveyHeaderState) {
      const surveyHeaderItem = canvasItems.find(item => item.id === "survey-header");
      if (surveyHeaderItem) {
        surveyHeaderItem.title = surveyHeaderState.title;
        surveyHeaderItem.description = surveyHeaderState.description;
      }
    }

    actions.loadItems(canvasItems);

    // Update refs for next comparison
    lastFormRef.current = form;
    formUpdateTriggerRef.current = formTrigger;
  }, [form, actions.loadItems, surveyHeaderState]);

  // Custom onReorder handler that updates local state and calls backend sync
  const handleReorder = useCallback(async (
    reorderedItems: CanvasItem[],
    draggedId: string,
    targetId: string
  ): Promise<void> => {
    // Update local state immediately
    actions.loadItems(reorderedItems);

    // Call backend sync if provided
    if (onReorder) {
      try {
        await onReorder(reorderedItems, draggedId, targetId);
      } catch (error) {
        console.error("Backend sync failed:", error);
        // If backend sync throws an error, revert to original order
        const canvasItems = CanvasTransformer.fromFormToCanvas(form);
        actions.loadItems(canvasItems);
      }
    }
  }, [actions.loadItems, onReorder, form]);

  // Use centralized drag and drop logic
  const { dragState, sensors, handlers } = useDragDrop({
    items: state.items,
    onReorder: handleReorder,
    debounceMs: 300,
  });

  // Sync drag state with canvas context
  React.useEffect(() => {
    actions.setDragging(dragState.isDragging, dragState.draggedId || undefined);
  }, [dragState.isDragging, dragState.draggedId, actions.setDragging]); // Only depend on specific action function

  // Get sortable items (only questions can be sorted)
  const sortableItems = React.useMemo(
    () => state.items.filter((item) => item.type === "question"),
    [state.items],
  );

  // Render individual canvas items
  const renderCanvasItem = useCallback(
    (item: any) => {
      switch (item.type) {
        case "header":
          return (
            <SurveyHeaderCard
              key={item.id}
              item={item}
              surveyHeaderState={surveyHeaderState}
              onSurveyHeaderUpdate={onSurveyHeaderUpdate}
              onSelect={() => actions.selectItem(item.id)}
            />
          );

        case "title-description":
          return (
            <SectionCard
              key={item.id}
              item={item}
              onSelect={() => actions.selectItem(item.id)}
              onUpdate={(updates) => actions.updateItem(item.id, updates)}
            />
          );

        case "question":
          return (
            <SortableQuestionCard
              key={item.id}
              item={item}
              formId={formId}
              onSelect={() => actions.selectItem(item.id)}
              onUpdate={(updates) => actions.updateItem(item.id, updates)}
              onDelete={() => actions.deleteItem(item.id)}
            />
          );

        case "page-break":
          return (
            <PageBreakCard
              key={item.id}
              item={item}
              onSelect={() => actions.selectItem(item.id)}
            />
          );

        default:
          return null;
      }
    },
    [actions.selectItem, actions.updateItem, actions.deleteItem, formId],
  );

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Loading form...</div>
      </div>
    );
  }

  return (
    <CardSelectionProvider>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handlers.onDragStart}
        onDragOver={handlers.onDragOver}
        onDragEnd={handlers.onDragEnd}
      >
      <SortableContext
        items={sortableItems}
        strategy={verticalListSortingStrategy}
      >
        <div className="canvas-container">
          {state.items.map(renderCanvasItem)}

          {/* Empty state */}
          {state.items.length === 1 && <EmptyState formId={formId} />}
        </div>

        {/* Custom CSS for canvas container spacing */}
        <style>{`
          .canvas-container > * + * {
            margin-top: 1rem;
          }

          .canvas-container > *:first-child {
            margin-top: 2.5rem; /* Special spacing for survey header */
          }

          .canvas-container .dragging {
            opacity: 0.7;
            transform: scale(1.02);
            z-index: 50;
          }
        `}</style>
      </SortableContext>

      <DragOverlay>
        {state.selection.draggedId ? (
          <div className="bg-white p-4 rounded-lg shadow-xl border border-blue-500 opacity-90">
            {(() => {
              const draggedItem = state.items.find(
                (item) => item.id === state.selection.draggedId,
              );
              return draggedItem ? (
                <div className="flex items-center gap-3">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                  <span className="font-medium">
                    {draggedItem.title || "Untitled Question"}
                  </span>
                </div>
              ) : null;
            })()}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
    </CardSelectionProvider>
  );
};

// Sortable Question Card wrapper
const SortableQuestionCard: React.FC<{
  item: any;
  formId: string;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
}> = ({
  item,
  formId,
  onSelect,
  onUpdate,
  onDelete,
}) => {
  // Use context instead of props for selection state
  const isSelected = useCardIsSelected(item.id);
  const isAnyCardDragging = useAnyCardDragging();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <QuestionCard
        item={item}
        formId={formId}
        isSelected={isSelected}
        isDragging={isDragging}
        isAnyCardDragging={isAnyCardDragging}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onDragStart={() => {}}
        onDragOver={() => {}}
        onDragLeave={() => {}}
        onDrop={() => {}}
        onDragEnd={() => {}}
      />
    </div>
  );
};




