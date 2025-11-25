import { useState, useCallback, useRef, useEffect } from 'react';
import type { AutoSaveOptions, UseAutoSaveResult, UseFieldAutoSaveResult } from '../types/canvas';

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

  // Debounced save function for external use
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
  useEffect(() => {
    debouncedSave(data);
  }, [data, debouncedSave]);

  return {
    isSaving,
    error,
    save,
    clearError,
    debouncedSave,
  };
}

// Specialized hook for field auto-saving
export function useFieldAutoSave(
  fieldId: string,
  saveField: (fieldId: string, updates: any) => Promise<void>,
  options: AutoSaveOptions = {}
): UseFieldAutoSaveResult {
  const updateTimersRef = useRef<Map<string, number>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const saveFieldUpdates = useCallback(
    async (updates: any) => {
      setIsSaving(true);
      setError(null);
      try {
        await saveField(fieldId, updates);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(`Failed to save field ${fieldId}`);
        setError(error);
        console.error(`Failed to save field ${fieldId}:`, err);
        throw err;
      } finally {
        setIsSaving(false);
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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

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
    isSaving,
    error,
    clearError,
    cleanup,
  };
}