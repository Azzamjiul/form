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
    isSaving: false,
    justSaved: false,
    isCreating: false,
    errors: [],
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

    case 'SET_SAVING':
      return {
        ...state,
        ui: {
          ...state.ui,
          isSaving: action.payload,
        },
      };

    case 'SET_JUST_SAVED':
      return {
        ...state,
        ui: {
          ...state.ui,
          justSaved: action.payload,
        },
      };

    case 'SET_CREATING':
      return {
        ...state,
        ui: {
          ...state.ui,
          isCreating: action.payload,
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
    deleteItem: (id: string) => dispatch({ type: 'DELETE_ITEM', payload: id }),
    reorderItems: (draggedId: string, targetId: string) =>
      dispatch({ type: 'REORDER_ITEMS', payload: { draggedId, targetId } }),
    setDragging: (isDragging: boolean, draggedId?: string) =>
      dispatch({ type: 'SET_DRAGGING', payload: { isDragging, draggedId } }),
    setSaving: (isSaving: boolean) => dispatch({ type: 'SET_SAVING', payload: isSaving }),
    setJustSaved: (justSaved: boolean) => dispatch({ type: 'SET_JUST_SAVED', payload: justSaved }),
    setCreating: (isCreating: boolean) => dispatch({ type: 'SET_CREATING', payload: isCreating }),
    addError: (error: string) => dispatch({ type: 'ADD_ERROR', payload: error }),
    clearErrors: () => dispatch({ type: 'CLEAR_ERRORS' }),
    loadItems: (items: CanvasItem[]) => dispatch({ type: 'LOAD_ITEMS', payload: items }),
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