import React, { useState, useCallback, useEffect } from 'react';

export interface SaveButtonProps {
  onSave: () => Promise<void>;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  saveErrors?: string[];
  className?: string;
  variant?: 'floating' | 'inline' | 'compact';
  disabled?: boolean;
}

type SaveState = 'default' | 'dirty' | 'saving' | 'success' | 'error';

export const SaveButton: React.FC<SaveButtonProps> = ({
  onSave,
  isSaving,
  hasUnsavedChanges,
  saveErrors = [],
  className = '',
  variant = 'floating',
  disabled = false
}) => {
  const [saveState, setSaveState] = useState<SaveState>('default');
  const [showErrors, setShowErrors] = useState(false);

  // Update save state based on props
  useEffect(() => {
    if (isSaving) {
      setSaveState('saving');
      setShowErrors(false);
    } else if (saveErrors.length > 0) {
      setSaveState('error');
      setShowErrors(true);
    } else if (hasUnsavedChanges) {
      setSaveState('dirty');
      setShowErrors(false);
    } else if (saveState === 'success') {
      // Keep success state for 2 seconds, then go to default
      const timer = setTimeout(() => {
        setSaveState('default');
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setSaveState('default');
      setShowErrors(false);
    }
  }, [isSaving, hasUnsavedChanges, saveErrors]);

  const handleClick = useCallback(async () => {
    if (disabled || isSaving) {
      return;
    }

    try {
      await onSave();
      setSaveState('success');
    } catch (error) {
      setSaveState('error');
      setShowErrors(true);
      console.error('Save failed:', error);
    }
  }, [onSave, disabled, isSaving]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Support Enter and Space keys for accessibility
    if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isSaving) {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick, disabled, isSaving]);

  // Keyboard shortcut support (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!disabled && !isSaving && hasUnsavedChanges) {
          handleClick();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClick, disabled, isSaving, hasUnsavedChanges]);

  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Variant-specific classes
  const variantClasses = {
    floating: 'fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg',
    inline: 'px-4 py-2 rounded-md shadow-sm',
    compact: 'px-3 py-1.5 rounded text-sm'
  };

  // State-specific classes
  const getStateClasses = () => {
    switch (saveState) {
      case 'dirty':
        return 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-blue-200 cursor-pointer';
      case 'saving':
        return 'bg-blue-600 text-white cursor-not-allowed focus:ring-blue-500';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 cursor-pointer';
      case 'error':
        return 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 cursor-pointer';
      default:
        return 'bg-gray-300 hover:bg-gray-400 text-gray-700 focus:ring-gray-500 cursor-pointer';
    }
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${getStateClasses()} ${className}`;

  const getButtonText = () => {
    switch (saveState) {
      case 'dirty':
        return 'Save';
      case 'saving':
        return (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </>
        );
      case 'success':
        return (
          <>
            <svg className="-ml-1 mr-2 h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Saved!
          </>
        );
      case 'error':
        return 'Error - Retry';
      default:
        return 'Saved';
    }
  };

  const getAriaLabel = () => {
    switch (saveState) {
      case 'dirty':
        return 'Save changes';
      case 'saving':
        return 'Saving in progress';
      case 'success':
        return 'All changes saved successfully';
      case 'error':
        return 'Save failed - click to retry';
      default:
        return 'No unsaved changes';
    }
  };

  return (
    <div className="relative">
      <button
        className={buttonClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled || isSaving || (!hasUnsavedChanges && saveState !== 'error')}
        aria-label={getAriaLabel()}
        title={getAriaLabel()}
      >
        {getButtonText()}
      </button>

      {/* Error tooltip */}
      {showErrors && saveErrors.length > 0 && (
        <div className="absolute top-full mt-2 right-0 w-64 p-3 bg-red-50 border border-red-200 rounded-md shadow-lg z-50">
          <div className="text-sm font-medium text-red-800 mb-1">Save Error</div>
          <ul className="text-xs text-red-600 space-y-1">
            {saveErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
          <button
            onClick={() => setShowErrors(false)}
            className="absolute top-1 right-1 text-red-400 hover:text-red-600"
            aria-label="Dismiss error"
          >
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Keyboard shortcut hint (only for floating variant) */}
      {variant === 'floating' && saveState === 'dirty' && !isSaving && (
        <div className="absolute top-full mt-1 right-0 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm whitespace-nowrap">
          Press Ctrl+S to save
        </div>
      )}
    </div>
  );
};