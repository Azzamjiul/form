import type {
  AnswerKey,
  CanvasItem,
  FormWithSections,
  ReorderFieldsRequest,
  UpdateFieldRequest,
} from '../../types';

// Re-export types for external use
export type {
  AnswerKey,
  CanvasItem,
  FormWithSections,
  ReorderFieldsRequest,
  UpdateFieldRequest,
};

export interface CanvasState {
  items: CanvasItem[];
  selection: {
    selectedId: string | null;
    isDragging: boolean;
    draggedId: string | null;
  };
  ui: {
    isCreating: boolean;
    errors: string[];
  };
  save: {
    hasUnsavedChanges: boolean;
    isManualSaving: boolean;
    isSaving: boolean;
    justSaved: boolean;
    lastSaveTime: Date | null;
    saveErrors: string[];
  };
}

export type CanvasAction =
  | { type: 'SELECT_ITEM'; payload: string }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<CanvasItem> } }
  | { type: 'ADD_ITEM'; payload: CanvasItem }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'REORDER_ITEMS'; payload: { draggedId: string; targetId: string } | { items: CanvasItem[] } }
  | { type: 'SET_DRAGGING'; payload: { isDragging: boolean; draggedId?: string } }
  | { type: 'SET_CREATING'; payload: boolean }
  | { type: 'ADD_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'LOAD_ITEMS'; payload: CanvasItem[] }
  // Manual save actions
  | { type: 'MARK_DIRTY' }
  | { type: 'MARK_CLEAN'; payload: { lastSaveTime: Date } }
  | { type: 'SET_MANUAL_SAVING'; payload: boolean }
  | { type: 'SET_SAVE_ERROR'; payload: string }
  | { type: 'CLEAR_SAVE_ERRORS' }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_JUST_SAVED'; payload: boolean };

export interface CanvasContextType {
  state: CanvasState;
  dispatch: React.Dispatch<CanvasAction>;
  actions: {
    selectItem: (id: string) => void;
    updateItem: (id: string, updates: Partial<CanvasItem>) => void;
    addItem: (item: CanvasItem) => void;
    deleteItem: (id: string) => void;
    reorderItems: (draggedId: string, targetId: string) => void;
    reorderItemsWithArray: (reorderedItems: CanvasItem[], _draggedId: string, _targetId: string) => void;
    setDragging: (isDragging: boolean, draggedId?: string) => void;
    setCreating: (isCreating: boolean) => void;
    addError: (error: string) => void;
    clearErrors: () => void;
    loadItems: (items: CanvasItem[]) => void;
    // Manual save actions
    markDirty: () => void;
    markClean: (lastSaveTime?: Date) => void;
    setManualSaving: (isSaving: boolean) => void;
    setSaveError: (error: string) => void;
    clearSaveErrors: () => void;
    setSaving: (isSaving: boolean) => void;
    setJustSaved: (justSaved: boolean) => void;
  };
}

export interface DragDropState {
  draggedId: string | null;
  dragOverId: string | null;
  dragPosition: 'above' | 'below' | null;
  isDragging: boolean;
}

export interface DragDropHandlers {
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
}

export interface UseDragDropOptions {
  items: CanvasItem[];
  onReorder: (reorderedItems: CanvasItem[], draggedId: string, targetId: string) => Promise<void>;
  debounceMs?: number;
  visualFeedback?: boolean;
}

export interface AutoSaveOptions {
  delay?: number;
  onSave?: (isSaving: boolean) => void;
  onError?: (error: Error) => void;
  saveId?: string; // Unique identifier for save coordination
}

export interface TransformationUtils {
  fromFormToCanvas: (form: FormWithSections) => CanvasItem[];
  fromCanvasToReorderRequest: (items: CanvasItem[]) => ReorderFieldsRequest;
  itemToFieldUpdate: (item: CanvasItem) => UpdateFieldRequest;
}

export interface BaseCardProps {
  children: React.ReactNode;
  isSelected: boolean;
  isDragging: boolean;
  isAnyCardDragging: boolean;
  onSelect: () => void;
  className?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  cardId?: string;
}

export interface QuestionCardProps extends Omit<BaseCardProps, 'children'> {
  item: CanvasItem;
  formId: string;
  onUpdate: (updates: Partial<CanvasItem>) => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export interface FieldTypeConfig {
  type: string;
  label: string;
  icon: string;
  component: React.ComponentType<any>;
  answerKeyComponent: React.ComponentType<any>;
  defaultOptions: any;
  validator: (value: any) => boolean;
}

export interface UseAutoSaveResult<T> {
  isSaving: boolean;
  error: Error | null;
  save: (data: T) => Promise<void>;
  clearError: () => void;
  debouncedSave: (data: T) => void;
}

export interface UseFieldAutoSaveResult {
  debouncedFieldUpdate: (updates: any) => void;
  isSaving: boolean;
  error: Error | null;
  clearError: () => void;
  cleanup: () => void;
}