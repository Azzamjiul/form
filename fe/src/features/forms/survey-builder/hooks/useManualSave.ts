import { useState, useCallback, useRef, useEffect } from 'react';
import { formsApi, fieldsApi } from '../../api';
import type { FormWithSections, CanvasItem } from '../types/canvas';

export interface ManualSaveState {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  lastSaveTime: Date | null;
  saveErrors: string[];
}

export interface ManualSaveActions {
  markDirty: () => void;
  markClean: () => void;
  saveAll: () => Promise<void>;
  setSaveError: (error: string) => void;
  clearSaveErrors: () => void;
}

export interface ManualSaveOptions {
  formId: string;
  initialForm?: FormWithSections;
  canvasItems?: CanvasItem[];
  surveyHeaderUpdates?: { title?: string; description?: string };
  onSaveStart?: () => void;
  onSaveComplete?: () => void;
  onSaveError?: (errors: string[]) => void;
}

export function useManualSave(options: ManualSaveOptions): ManualSaveState & ManualSaveActions {
  const {
    formId,
    initialForm,
    canvasItems = [],
    surveyHeaderUpdates = {},
    onSaveStart,
    onSaveComplete,
    onSaveError
  } = options;

  const [state, setState] = useState<ManualSaveState>({
    hasUnsavedChanges: false,
    isSaving: false,
    lastSaveTime: null,
    saveErrors: []
  });

  // Track dirty state for canvas items
  const dirtyItemsRef = useRef<Set<string>>(new Set());

  const markDirty = useCallback(() => {
    setState(prev => ({ ...prev, hasUnsavedChanges: true }));
  }, []);

  const markClean = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasUnsavedChanges: false,
      lastSaveTime: new Date(),
      saveErrors: []
    }));

    // Clear dirty items tracking
    dirtyItemsRef.current.clear();
  }, []);

  const setSaveError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      saveErrors: [...prev.saveErrors, error]
    }));

    if (onSaveError) {
      onSaveError([...state.saveErrors, error]);
    }
  }, [onSaveError]);

  const clearSaveErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      saveErrors: []
    }));
  }, []);

  // Save all changes
  const saveAll = useCallback(async (): Promise<void> => {
    if (!state.hasUnsavedChanges || state.isSaving) {
      return;
    }

    setState(prev => ({ ...prev, isSaving: true }));
    onSaveStart?.();

    try {
      const savePromises: Promise<any>[] = [];

      // Save survey header if it has changes
      if (surveyHeaderUpdates && Object.keys(surveyHeaderUpdates).length > 0) {
        const headerUpdateData: any = {};

        if (surveyHeaderUpdates.title !== undefined) {
          headerUpdateData.title = surveyHeaderUpdates.title;
        }

        if (surveyHeaderUpdates.description !== undefined) {
          headerUpdateData.description = surveyHeaderUpdates.description;
        }

        savePromises.push(formsApi.updateForm(formId, headerUpdateData));
      }

      // Save canvas items if they have changes
      const dirtyCanvasItems = canvasItems.filter(item =>
        dirtyItemsRef.current.has(item.id)
      );

      if (dirtyCanvasItems.length > 0) {
        for (const item of dirtyCanvasItems) {
          if (item.type === 'question') {
            // Create field update payload
            const fieldUpdate: any = {
              label: item.title,
              description: item.description || '',
              is_required: item.required || false,
              points: item.points || 0
            };

            // Include answer key if available
            if (item.answerKey) {
              fieldUpdate.answer_key = item.answerKey;
            }

            savePromises.push(fieldsApi.updateField(formId, item.id, fieldUpdate));
          } else if (item.type === 'title-description') {
            const sectionUpdate = {
              label: item.title,
              description: item.description || ''
            };

            savePromises.push(fieldsApi.updateField(formId, item.id, sectionUpdate));
          }
        }
      }

      // Execute all saves in parallel
      if (savePromises.length > 0) {
        await Promise.all(savePromises);
      }

      setState(prev => ({
        ...prev,
        hasUnsavedChanges: false,
        isSaving: false,
        lastSaveTime: new Date(),
        saveErrors: []
      }));

      onSaveComplete?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Save failed';

      setState(prev => ({
        ...prev,
        isSaving: false,
        saveErrors: [errorMessage]
      }));

      onSaveError?.([errorMessage]);
    }
  }, [
    formId,
    canvasItems,
    surveyHeaderUpdates,
    onSaveStart,
    onSaveComplete,
    onSaveError,
    state.hasUnsavedChanges,
    dirtyItemsRef
  ]);

  // Track changes to canvas items and mark dirty
  useEffect(() => {
    if (canvasItems.length === 0) {
      return;
    }

    // Mark items as dirty if they differ from initial form
    canvasItems.forEach(item => {
      const initialItem = initialForm?.fields?.find((field: any) => field.field_id === item.id);

      if (initialItem) {
        // Compare current item with initial item
        const currentItemData = {
          title: item.title,
          description: item.description,
          required: item.required,
          points: item.points,
          answer_key: item.answerKey
        };

        const initialItemData = {
          title: initialItem.label,
          description: initialItem.description,
          required: initialItem.is_required,
          points: initialItem.points,
          answer_key: initialItem.answer_key
        };

        const hasChanged = JSON.stringify(currentItemData) !== JSON.stringify(initialItemData);

        if (hasChanged) {
          dirtyItemsRef.current.add(item.id);
        } else {
          dirtyItemsRef.current.delete(item.id);
        }
      }
    });
  }, [canvasItems, initialForm, formId]);

  return {
    ...state,
    markDirty,
    markClean,
    saveAll,
    setSaveError,
    clearSaveErrors
  };
}

// Hook for tracking dirty state of individual items
export function useItemDirtyState(
  globalMarkDirty: () => void,
  globalMarkClean: () => void
) {
  const [isDirty, setIsDirty] = useState(false);
  const originalValueRef = useRef<any>(null);

  const markItemDirty = useCallback((value: any) => {
    if (!originalValueRef.current) {
      originalValueRef.current = value;
      return;
    }

    const hasChanged = JSON.stringify(value) !== JSON.stringify(originalValueRef.current);
    setIsDirty(hasChanged);

    if (hasChanged) {
      globalMarkDirty();
    } else {
      globalMarkClean();
    }
  }, [globalMarkDirty, globalMarkClean]);

  const resetOriginalValue = useCallback((value: any) => {
    originalValueRef.current = value;
    setIsDirty(false);
  }, []);

  return {
    isDirty,
    markItemDirty,
    resetOriginalValue
  };
}

