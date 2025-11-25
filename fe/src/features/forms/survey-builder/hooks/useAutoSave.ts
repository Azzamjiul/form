import { useState, useCallback, useRef } from 'react';
import type { AutoSaveOptions, UseAutoSaveResult } from '../types/canvas';

export function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => Promise<void>,
  options: AutoSaveOptions = {}
): UseAutoSaveResult<T> {
  const { delay = 2000, onSave, onError } = options;
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timerRef = useRef<number | null>(null);
  const lastSavedDataRef = useRef<T | null>(null);

  const save = useCallback(async (saveData: T) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setIsSaving(true);
    setError(null);

    try {
      await saveFunction(saveData);
      lastSavedDataRef.current = saveData;
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Auto-save failed');
      setError(error);
      onError?.(error);
    } finally {
      setIsSaving(false);
      onSave?.(false);
    }
  }, [saveFunction, onSave, onError]);

  const debouncedSave = useCallback(
    (saveData: T) => {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Don't save if data hasn't changed since last save
      if (lastSavedDataRef.current && JSON.stringify(saveData) === JSON.stringify(lastSavedDataRef.current)) {
        return;
      }

      onSave?.(true);

      // Set new timer
      timerRef.current = window.setTimeout(() => {
        save(saveData);
        timerRef.current = null;
      }, delay);
    },
    [save, delay, onSave]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-save when data changes
  const triggerAutoSave = useCallback(() => {
    debouncedSave(data);
  }, [data, debouncedSave]);

  return {
    isSaving,
    error,
    save,
    clearError,
    triggerAutoSave,
  };
}

// Specialized hook for field auto-saving
export function useFieldAutoSave(
  fieldId: string,
  saveField: (fieldId: string, updates: any) => Promise<void>,
  options: AutoSaveOptions = {}
) {
  const updateTimersRef = useRef<Map<string, number>>(new Map());

  const saveFieldUpdates = useCallback(
    async (updates: any) => {
      try {
        await saveField(fieldId, updates);
      } catch (err) {
        console.error(`Failed to save field ${fieldId}:`, err);
        throw err;
      }
    },
    [fieldId, saveField]
  );

  const debouncedFieldUpdate = useCallback(
    (updates: any) => {
      // Clear existing timer for this field
      const existingTimer = updateTimersRef.current.get(fieldId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new debounced save timer
      const newTimer = window.setTimeout(() => {
        saveFieldUpdates(updates);
        updateTimersRef.current.delete(fieldId);
      }, options.delay || 2000);

      updateTimersRef.current.set(fieldId, newTimer);
    },
    [fieldId, saveFieldUpdates, options.delay]
  );

  // Cleanup timer on unmount
  const cleanup = useCallback(() => {
    const timer = updateTimersRef.current.get(fieldId);
    if (timer) {
      clearTimeout(timer);
      updateTimersRef.current.delete(fieldId);
    }
  }, [fieldId]);

  return {
    debouncedFieldUpdate,
    cleanup,
  };
}