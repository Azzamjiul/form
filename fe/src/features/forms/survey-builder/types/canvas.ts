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
    isSaving: boolean;
    justSaved: boolean;
    isCreating: boolean;
    errors: string[];
  };
}

export type CanvasAction =
  | { type: 'SELECT_ITEM'; payload: string }
  | { type: 'UPDATE_ITEM'; payload: { id: string; updates: Partial<CanvasItem> } }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'REORDER_ITEMS'; payload: { draggedId: string; targetId: string } }
  | { type: 'SET_DRAGGING'; payload: { isDragging: boolean; draggedId?: string } }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_JUST_SAVED'; payload: boolean }
  | { type: 'SET_CREATING'; payload: boolean }
  | { type: 'ADD_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'LOAD_ITEMS'; payload: CanvasItem[] };

export interface CanvasContextType {
  state: CanvasState;
  dispatch: React.Dispatch<CanvasAction>;
  actions: {
    selectItem: (id: string) => void;
    updateItem: (id: string, updates: Partial<CanvasItem>) => void;
    deleteItem: (id: string) => void;
    reorderItems: (draggedId: string, targetId: string) => void;
    setDragging: (isDragging: boolean, draggedId?: string) => void;
    setSaving: (isSaving: boolean) => void;
    setJustSaved: (justSaved: boolean) => void;
    setCreating: (isCreating: boolean) => void;
    addError: (error: string) => void;
    clearErrors: () => void;
    loadItems: (items: CanvasItem[]) => void;
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
  onReorder: (draggedId: string, targetId: string) => void;
  debounceMs?: number;
  visualFeedback?: boolean;
}

export interface AutoSaveOptions {
  delay?: number;
  onSave?: (isSaving: boolean) => void;
  onError?: (error: Error) => void;
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