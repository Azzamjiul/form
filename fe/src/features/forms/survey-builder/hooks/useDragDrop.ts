import { useState, useCallback, useRef, useEffect } from 'react';
import {
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
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
import type { CanvasItem } from '../../types';
import type { UseDragDropOptions, DragDropState, DragDropHandlers } from '../types/canvas';

export function useDragDrop({ items, onReorder, debounceMs = 1500 }: UseDragDropOptions) {
  const [dragState, setDragState] = useState<DragDropState>({
    draggedId: null,
    dragOverId: null,
    dragPosition: null,
    isDragging: false,
  });

  const reorderTimerRef = useRef<number | null>(null);

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
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setDragState({
      draggedId: active.id as string,
      dragOverId: null,
      dragPosition: null,
      isDragging: true,
    });
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) {
      setDragState(prev => ({ ...prev, dragOverId: null, dragPosition: null }));
      return;
    }

    if (active.id === over.id) {
      setDragState(prev => ({ ...prev, dragOverId: null, dragPosition: null }));
      return;
    }

    // Determine drag position based on relative positions
    const activeIndex = items.findIndex(item => item.id === active.id);
    const overIndex = items.findIndex(item => item.id === over.id);

    if (activeIndex === -1 || overIndex === -1) return;

    const isBelow = activeIndex < overIndex;
    const dragPosition = isBelow ? 'below' : 'above';

    setDragState(prev => ({
      ...prev,
      dragOverId: over.id as string,
      dragPosition,
    }));
  }, [items]);

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    setDragState({
      draggedId: null,
      dragOverId: null,
      dragPosition: null,
      isDragging: false,
    });

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex(item => item.id === active.id);
    const newIndex = items.findIndex(item => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newItems = arrayMove(items, oldIndex, newIndex);
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order: index,
    }));

    // Clear existing timer
    if (reorderTimerRef.current) {
      clearTimeout(reorderTimerRef.current);
    }

    // Debounced reorder
    reorderTimerRef.current = setTimeout(() => {
      onReorder(active.id as string, over.id as string);
      reorderTimerRef.current = null;
    }, debounceMs);
  }, [items, onReorder, debounceMs]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (reorderTimerRef.current) {
        clearTimeout(reorderTimerRef.current);
      }
    };
  }, []);

  // Get drag over style for visual feedback
  const getDragOverStyle = useCallback((itemId: string) => {
    if (!dragState.isDragging || dragState.draggedId === itemId || dragState.dragOverId !== itemId) {
      return {};
    }

    const baseStyle = {
      transition: 'all 0.2s ease-in-out',
    };

    if (dragState.dragPosition === 'above') {
      return {
        ...baseStyle,
        borderTop: '3px solid #5F35F5',
        marginTop: '-3px',
      };
    }

    if (dragState.dragPosition === 'below') {
      return {
        ...baseStyle,
        borderBottom: '3px solid #5F35F5',
        marginBottom: '-3px',
      };
    }

    return baseStyle;
  }, [dragState]);

  // Get dragging style
  const getDraggingStyle = useCallback((itemId: string) => {
    if (dragState.draggedId !== itemId) {
      return {};
    }

    return {
      opacity: 0.7,
      transform: 'scale(1.02)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      cursor: 'grabbing',
      zIndex: 50,
    };
  }, [dragState.draggedId]);

  // Drag handlers for legacy HTML5 DnD compatibility
  const legacyHandlers: DragDropHandlers = {
    onDragStart: useCallback((e: React.DragEvent, id: string) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
      e.dataTransfer.setData('application/json', JSON.stringify({
        type: 'canvas-item',
        itemId: id,
      }));
      setDragState(prev => ({
        ...prev,
        draggedId: id,
        isDragging: true,
      }));
    }, []),

    onDragOver: useCallback((e: React.DragEvent, id: string) => {
      e.preventDefault();
      if (dragState.draggedId && dragState.draggedId !== id) {
        const rect = e.currentTarget.getBoundingClientRect();
        const midPoint = rect.top + rect.height / 2;
        const position = e.clientY < midPoint ? 'above' : 'below';
        setDragState(prev => ({
          ...prev,
          dragOverId: id,
          dragPosition: position,
        }));
      }
    }, [dragState.draggedId]),

    onDragLeave: useCallback(() => {
      setDragState(prev => ({
        ...prev,
        dragOverId: null,
        dragPosition: null,
      }));
    }, []),

    onDrop: useCallback((e: React.DragEvent, id: string) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData('text/plain');

      if (draggedId && draggedId !== id) {
        // Clear existing timer
        if (reorderTimerRef.current) {
          clearTimeout(reorderTimerRef.current);
        }

        // Debounced reorder
        reorderTimerRef.current = setTimeout(() => {
          onReorder(draggedId, id);
          reorderTimerRef.current = null;
        }, debounceMs);
      }

      setDragState({
        draggedId: null,
        dragOverId: null,
        dragPosition: null,
        isDragging: false,
      });
    }, [onReorder, debounceMs]),

    onDragEnd: useCallback(() => {
      setDragState({
        draggedId: null,
        dragOverId: null,
        dragPosition: null,
        isDragging: false,
      });
    }, []),
  };

  return {
    dragState,
    sensors,
    handlers: {
      onDragStart: handleDragStart,
      onDragOver: handleDragOver,
      onDragEnd: handleDragEnd,
    },
    legacyHandlers,
    getDragOverStyle,
    getDraggingStyle,
  };
}