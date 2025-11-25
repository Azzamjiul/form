import { useCallback } from 'react';
import { useCanvasContext } from '../context/CanvasContext';
import { CanvasTransformer } from '../utils/transformations';
import type { CanvasItem } from '../types/canvas';

export function useCanvasState() {
  const { state, actions } = useCanvasContext();

  // Enhanced actions with validation
  const enhancedActions = {
    // Item management
    selectItem: useCallback((id: string) => {
      actions.selectItem(id);
    }, [actions.selectItem]),

    updateItem: useCallback((id: string, updates: Partial<CanvasItem>) => {
      // Validate item exists
      const item = state.items.find(item => item.id === id);
      if (!item) {
        actions.addError(`Item with id ${id} not found`);
        return;
      }

      // Validate updates
      const updatedItem = { ...item, ...updates };
      if (!CanvasTransformer.validateCanvasItem(updatedItem)) {
        actions.addError('Invalid item update');
        return;
      }

      actions.updateItem(id, updates);
    }, [state.items, actions]),

    deleteItem: useCallback((id: string) => {
      // Prevent deletion of header
      if (id === 'survey-header') {
        actions.addError('Cannot delete survey header');
        return;
      }

      actions.deleteItem(id);
    }, [actions]),

    reorderItems: useCallback((draggedId: string, targetId: string) => {
      actions.reorderItems(draggedId, targetId);
    }, [actions.reorderItems]),

    // Drag state management
    setDragging: useCallback((isDragging: boolean, draggedId?: string) => {
      actions.setDragging(isDragging, draggedId);
    }, [actions.setDragging]),

    // Loading state management
    setSaving: useCallback((isSaving: boolean) => {
      actions.setSaving(isSaving);
    }, [actions.setSaving]),

    setJustSaved: useCallback((justSaved: boolean) => {
      actions.setJustSaved(justSaved);
    }, [actions.setJustSaved]),

    setCreating: useCallback((isCreating: boolean) => {
      actions.setCreating(isCreating);
    }, [actions.setCreating]),

    // Error management
    addError: useCallback((error: string) => {
      actions.addError(error);
    }, [actions.addError]),

    clearErrors: useCallback(() => {
      actions.clearErrors();
    }, [actions.clearErrors]),

    // Load items with validation
    loadItems: useCallback((items: any[]) => {
      // Validate all items
      const validItems = items.filter(item => CanvasTransformer.validateCanvasItem(item));

      if (validItems.length !== items.length) {
        actions.addError('Some items failed validation and were filtered out');
      }

      actions.loadItems(validItems);
    }, [actions]),

    // Utility methods
    getSelectedItem: useCallback(() => {
      return state.items.find(item => item.id === state.selection.selectedId);
    }, [state.items, state.selection.selectedId]),

    getItemById: useCallback((id: string) => {
      return state.items.find(item => item.id === id);
    }, [state.items]),

    getNextOrderNumber: useCallback(() => {
      return CanvasTransformer.getNextOrderNumber(state.items);
    }, [state.items]),

    isAnyCardDragging: useCallback(() => {
      return state.selection.isDragging;
    }, [state.selection.isDragging]),
  };

  return {
    state,
    actions: enhancedActions,
  };
}