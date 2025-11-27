import { createContext, useContext, useReducer, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { CanvasState, CanvasAction, CanvasContextType, CanvasItem } from '../types/canvas';

const initialState: CanvasState = {
  items: [],
  selection: {
    selectedId: null,
    isDragging: false,
    draggedId: null,
  },
  ui: {
    isCreating: false,
    errors: [],
  },
  // Manual save state
  save: {
    hasUnsavedChanges: false,
    isManualSaving: false,
    isSaving: false,
    justSaved: false,
    lastSaveTime: null,
    saveErrors: [],
  },
};

function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case 'LOAD_ITEMS':
      return {
        ...state,
        items: action.payload,
      };

    case 'SELECT_ITEM':
      return {
        ...state,
        selection: {
          ...state.selection,
          selectedId: action.payload,
        },
        items: state.items.map(item => ({
          ...item,
          isSelected: item.id === action.payload,
        })),
      };

    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, ...action.payload.updates }
            : item
        ),
      };

    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload],
      };

    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        selection: {
          ...state.selection,
          selectedId: state.selection.selectedId === action.payload ? null : state.selection.selectedId,
        },
      };

    case 'REORDER_ITEMS':
      // Handle both old format (draggedId, targetId) and new format (items array)
      if ('items' in action.payload) {
        // New format: directly use the provided reordered items
        return {
          ...state,
          items: action.payload.items.map((item, index) => ({ ...item, order: index })),
        };
      } else {
        // Old format: legacy behavior for backward compatibility
        const { draggedId, targetId } = action.payload;
        const draggedIndex = state.items.findIndex(item => item.id === draggedId);
        const targetIndex = state.items.findIndex(item => item.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return state;

        const newItems = [...state.items];
        const [draggedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, draggedItem);

        return {
          ...state,
          items: newItems.map((item, index) => ({ ...item, order: index })),
        };
      }

    case 'SET_DRAGGING':
      return {
        ...state,
        selection: {
          ...state.selection,
          isDragging: action.payload.isDragging,
          draggedId: action.payload.draggedId || null,
        },
        items: state.items.map(item => ({
          ...item,
          isDragging: item.id === (action.payload.draggedId || null),
        })),
      };

    case 'SET_CREATING':
      return {
        ...state,
        ui: {
          ...state.ui,
          isCreating: action.payload,
        },
      };

    case 'MARK_DIRTY':
      return {
        ...state,
        save: {
          ...state.save,
          hasUnsavedChanges: true,
        },
      };

    case 'MARK_CLEAN':
      return {
        ...state,
        save: {
          ...state.save,
          hasUnsavedChanges: false,
          lastSaveTime: action.payload.lastSaveTime,
          saveErrors: [],
        },
      };

    case 'SET_MANUAL_SAVING':
      return {
        ...state,
        save: {
          ...state.save,
          isManualSaving: action.payload,
        },
      };

    case 'SET_SAVING':
      return {
        ...state,
        save: {
          ...state.save,
          isSaving: action.payload,
        },
      };

    case 'SET_SAVE_ERROR':
      return {
        ...state,
        save: {
          ...state.save,
          saveErrors: [...state.save.saveErrors, action.payload],
        },
      };

    case 'SET_JUST_SAVED':
      return {
        ...state,
        save: {
          ...state.save,
          justSaved: action.payload,
        },
      };

    case 'CLEAR_SAVE_ERRORS':
      return {
        ...state,
        save: {
          ...state.save,
          saveErrors: [],
        },
      };

    case 'ADD_ERROR':
      return {
        ...state,
        ui: {
          ...state.ui,
          errors: [...state.ui.errors, action.payload],
        },
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        ui: {
          ...state.ui,
          errors: [],
        },
      };

    default:
      return state;
  }
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

interface CanvasProviderProps {
  children: ReactNode;
}

export function CanvasProvider({ children }: CanvasProviderProps) {
  const [state, dispatch] = useReducer(canvasReducer, initialState);

  const actions = useMemo(() => ({
    selectItem: (id: string) => dispatch({ type: 'SELECT_ITEM', payload: id }),
    updateItem: (id: string, updates: Partial<CanvasItem>) =>
      dispatch({ type: 'UPDATE_ITEM', payload: { id, updates } }),
    addItem: (item: CanvasItem) => dispatch({ type: 'ADD_ITEM', payload: item }),
    deleteItem: (id: string) => dispatch({ type: 'DELETE_ITEM', payload: id }),
    reorderItems: (draggedId: string, targetId: string) =>
      dispatch({ type: 'REORDER_ITEMS', payload: { draggedId, targetId } }),
    reorderItemsWithArray: (reorderedItems: CanvasItem[], _draggedId: string, _targetId: string) =>
      dispatch({ type: 'REORDER_ITEMS', payload: { items: reorderedItems } }),
    setDragging: (isDragging: boolean, draggedId?: string) =>
      dispatch({ type: 'SET_DRAGGING', payload: { isDragging, draggedId } }),
    setCreating: (isCreating: boolean) => dispatch({ type: 'SET_CREATING', payload: isCreating }),
    addError: (error: string) => dispatch({ type: 'ADD_ERROR', payload: error }),
    clearErrors: () => dispatch({ type: 'CLEAR_ERRORS' }),
    loadItems: (items: CanvasItem[]) => dispatch({ type: 'LOAD_ITEMS', payload: items }),
    // Manual save actions
    markDirty: () => dispatch({ type: 'MARK_DIRTY' }),
    markClean: (lastSaveTime?: Date) => dispatch({ type: 'MARK_CLEAN', payload: { lastSaveTime: lastSaveTime || new Date() } }),
    setManualSaving: (isSaving: boolean) => dispatch({ type: 'SET_MANUAL_SAVING', payload: isSaving }),
    setSaveError: (error: string) => dispatch({ type: 'SET_SAVE_ERROR', payload: error }),
    clearSaveErrors: () => dispatch({ type: 'CLEAR_SAVE_ERRORS' }),
    setSaving: (isSaving: boolean) => dispatch({ type: 'SET_SAVING', payload: isSaving }),
    setJustSaved: (justSaved: boolean) => dispatch({ type: 'SET_JUST_SAVED', payload: justSaved }),
  }), []); // Empty dependency array since actions reference dispatch which is stable

  const value: CanvasContextType = useMemo(() => ({
    state,
    dispatch,
    actions,
  }), [state, dispatch, actions]);

  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvasContext(): CanvasContextType {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error('useCanvasContext must be used within a CanvasProvider');
  }
  return context;
}

// Helper hooks for direct card state access (replacing CardSelectionContext)
export const useCanvasCardIsSelected = (id: string): boolean => {
  const { state } = useCanvasContext();
  return state.selection.selectedId === id;
};

export const useCanvasCardIsDragging = (id: string): boolean => {
  const { state } = useCanvasContext();
  return state.selection.draggedId === id;
};

export const useCanvasAnyCardDragging = (): boolean => {
  const { state } = useCanvasContext();
  return state.selection.isDragging;
};