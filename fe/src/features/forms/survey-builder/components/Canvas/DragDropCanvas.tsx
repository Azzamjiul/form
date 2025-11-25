import React from 'react';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragOverlay,
} from '@dnd-kit/core';
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useQuery } from '@tanstack/react-query';
import { formsApi } from '../../../api/forms';
import { CanvasTransformer } from '../../utils/transformations';
import { useCanvasContext } from '../../context/CanvasContext';
import { QuestionCard } from '../Cards/QuestionCard/QuestionCard';
import { BaseCard } from '../Cards/BaseCard';
import { RichTextEditor } from '../../../../../components/RichTextEditor';

interface DragDropCanvasProps {
  formId: string;
}

export const DragDropCanvas: React.FC<DragDropCanvasProps> = ({ formId }) => {
  const { state, actions } = useCanvasContext();

  // Load form data
  const { data: formResponse } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => formsApi.getFormById(formId),
  });

  const form = formResponse?.success ? formResponse.data : null;

  // Transform form to canvas items when data changes
  React.useEffect(() => {
    if (form) {
      const canvasItems = CanvasTransformer.fromFormToCanvas(form);
      actions.loadItems(canvasItems);
    }
  }, [form, actions]);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    actions.setDragging(true, active.id as string);
  };

  // Handle drag over
  const handleDragOver = () => {
    // Handled automatically by @dnd-kit
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    actions.setDragging(false);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = state.items.findIndex(item => item.id === active.id);
    const newIndex = state.items.findIndex(item => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(state.items, oldIndex, newIndex);
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order: index,
    }));

    actions.loadItems(reorderedItems);

    // Trigger reorder logic
    actions.reorderItems(active.id as string, over.id as string);
  };

  // Get sortable items (only questions can be sorted)
  const sortableItems = state.items
    .filter(item => item.type === 'question')
    .map(item => ({ id: item.id, ...item }));

  // Render individual canvas items
  const renderCanvasItem = (item: any) => {
    const isSelected = state.selection.selectedId === item.id;
    const isDragging = state.selection.draggedId === item.id;
    const isAnyCardDragging = state.selection.isDragging;

    switch (item.type) {
      case 'header':
        return (
          <SurveyHeaderCard
            key={item.id}
            item={item}
            isSelected={isSelected}
            isDragging={isDragging}
            isAnyCardDragging={isAnyCardDragging}
            onSelect={() => actions.selectItem(item.id)}
            onUpdate={(updates) => actions.updateItem(item.id, updates)}
          />
        );

      case 'title-description':
        return (
          <SectionCard
            key={item.id}
            item={item}
            isSelected={isSelected}
            isDragging={isDragging}
            isAnyCardDragging={isAnyCardDragging}
            onSelect={() => actions.selectItem(item.id)}
            onUpdate={(updates) => actions.updateItem(item.id, updates)}
          />
        );

      case 'question':
        return (
          <SortableQuestionCard
            key={item.id}
            item={item}
            formId={formId}
            isSelected={isSelected}
            isAnyCardDragging={isAnyCardDragging}
            onSelect={() => actions.selectItem(item.id)}
            onUpdate={(updates) => actions.updateItem(item.id, updates)}
            onDelete={() => actions.deleteItem(item.id)}
          />
        );

      case 'page-break':
        return (
          <PageBreakCard
            key={item.id}
            item={item}
            isSelected={isSelected}
            isDragging={isDragging}
            isAnyCardDragging={isAnyCardDragging}
            onSelect={() => actions.selectItem(item.id)}
          />
        );

      default:
        return null;
    }
  };

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">Loading form...</div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortableItems}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {state.items.map(renderCanvasItem)}

          {/* Empty state */}
          {state.items.length === 1 && (
            <EmptyState formId={formId} />
          )}
        </div>
      </SortableContext>

      <DragOverlay>
        {state.selection.draggedId ? (
          <div className="bg-white p-4 rounded-lg shadow-xl border border-blue-500 opacity-90">
            {(() => {
              const draggedItem = state.items.find(item => item.id === state.selection.draggedId);
              return draggedItem ? (
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                  <span className="font-medium">{draggedItem.title || 'Untitled Question'}</span>
                </div>
              ) : null;
            })()}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

// Sortable Question Card wrapper
const SortableQuestionCard: React.FC<{
  item: any;
  formId: string;
  isSelected: boolean;
  isAnyCardDragging: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
}> = ({ item, formId, isSelected, isAnyCardDragging, onSelect, onUpdate, onDelete }) => {
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

// Survey Header Card Component
const SurveyHeaderCard: React.FC<{
  item: any;
  isSelected: boolean;
  isDragging: boolean;
  isAnyCardDragging: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
}> = ({ item, isSelected, isDragging, isAnyCardDragging, onSelect, onUpdate }) => {
  const handleTitleChange = (title: string) => {
    onUpdate({ title });
  };

  const handleDescriptionChange = (description: string) => {
    onUpdate({ description });
  };

  return (
    <BaseCard
      isSelected={isSelected}
      isDragging={isDragging}
      isAnyCardDragging={isAnyCardDragging}
      onSelect={onSelect}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
    >
      <div className="p-6">
        <RichTextEditor
          content={item.title}
          onChange={handleTitleChange}
          placeholder="Untitled Form"
          className="text-2xl font-bold text-gray-900 min-h-[32px]"
        />
        {item.description && (
          <div className="mt-2">
            <RichTextEditor
              content={item.description}
              onChange={handleDescriptionChange}
              placeholder="Add a description..."
              className="text-gray-600 min-h-[20px]"
            />
          </div>
        )}
      </div>
    </BaseCard>
  );
};

// Section Card Component
const SectionCard: React.FC<{
  item: any;
  isSelected: boolean;
  isDragging: boolean;
  isAnyCardDragging: boolean;
  onSelect: () => void;
  onUpdate: (updates: any) => void;
}> = ({ item, isSelected, isDragging, isAnyCardDragging, onSelect, onUpdate }) => {
  return (
    <BaseCard
      isSelected={isSelected}
      isDragging={isDragging}
      isAnyCardDragging={isAnyCardDragging}
      onSelect={onSelect}
    >
      <div className="p-6">
        <RichTextEditor
          content={item.title}
          onChange={(title) => onUpdate({ title })}
          placeholder="Section Title"
          className="text-xl font-semibold text-gray-900 min-h-[28px]"
        />
        {item.description && (
          <div className="mt-2">
            <RichTextEditor
              content={item.description}
              onChange={(description) => onUpdate({ description })}
              placeholder="Section description..."
              className="text-gray-600 min-h-[20px]"
            />
          </div>
        )}
      </div>
    </BaseCard>
  );
};

// Page Break Card Component
const PageBreakCard: React.FC<{
  item: any;
  isSelected: boolean;
  isDragging: boolean;
  isAnyCardDragging: boolean;
  onSelect: () => void;
}> = ({ item, isSelected, isDragging, isAnyCardDragging, onSelect }) => {
  return (
    <BaseCard
      isSelected={isSelected}
      isDragging={isDragging}
      isAnyCardDragging={isAnyCardDragging}
      onSelect={onSelect}
      className="border-dashed border-gray-300 bg-gray-50"
    >
      <div className="p-4 text-center">
        <div className="text-gray-400 text-sm">
          {item.sectionNumber && item.totalSections ? (
            <>Page {item.sectionNumber} of {item.totalSections}</>
          ) : (
            <>Page Break</>
          )}
        </div>
      </div>
    </BaseCard>
  );
};

// Empty State Component
const EmptyState: React.FC<{ formId: string }> = ({ formId }) => {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Start building your form
      </h3>
      <p className="text-gray-500 mb-6">
        Add questions to get started with your form.
      </p>
      <div className="flex justify-center gap-3">
        <button
          onClick={() => {
            console.log('Add question clicked');
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Question
        </button>
        <button
          onClick={() => {
            console.log('Add section clicked');
          }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Add Section
        </button>
      </div>
    </div>
  );
};