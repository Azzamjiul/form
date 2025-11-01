import { useCallback, useRef, useEffect } from 'react';

// Custom debounce implementation - very lightweight
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

interface AutoSaveOptions {
  delay?: number;
  onSave?: (isSaving: boolean) => void;
  onError?: (error: Error) => void;
}

export function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => Promise<void>,
  options: AutoSaveOptions = {}
) {
  const { delay = 2000, onSave, onError } = options;
  const saveTimeoutRef = useRef<number>();
  const isSavingRef = useRef(false);
  const dataRef = useRef(data);

  // Update data ref when data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const debouncedSave = useCallback(
    debounce(async (saveData: T) => {
      if (isSavingRef.current) return;

      try {
        isSavingRef.current = true;
        onSave?.(true);

        await saveFunction(saveData);

        onSave?.(false);
      } catch (error) {
        console.error('Auto-save failed:', error);
        onError?.(error as Error);
        onSave?.(false);
      } finally {
        isSavingRef.current = false;
      }
    }, delay),
    [saveFunction, delay, onSave, onError]
  );

  const triggerSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      debouncedSave(dataRef.current);
    }, 100);
  }, [debouncedSave]);

  const immediateSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    try {
      isSavingRef.current = true;
      onSave?.(true);

      await saveFunction(dataRef.current);

      onSave?.(false);
    } catch (error) {
      console.error('Immediate save failed:', error);
      onError?.(error as Error);
      onSave?.(false);
    } finally {
      isSavingRef.current = false;
    }
  }, [saveFunction, onSave, onError]);

  // Cleanup on unmount
  const cancelSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  }, []);

  return {
    triggerSave,
    immediateSave,
    cancelSave,
  };
}