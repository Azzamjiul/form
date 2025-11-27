import React, { useState, useEffect, useCallback } from 'react';
import { useItemCreation } from '../../hooks/useItemCreation';
import {
  getSafePosition,
  throttle,
  debounce
} from './positioning';
import type { ButtonPosition } from './positioning';

export interface AddItemButtonsProps {
  formId: string;
  visible: boolean;
  cardRef: React.RefObject<HTMLDivElement | null>;
  isCardDragging: boolean;
  onItemCreated?: (newItemId: string) => void;
}

export const AddItemButtons: React.FC<AddItemButtonsProps> = ({
  formId,
  visible,
  cardRef,
  isCardDragging,
  onItemCreated
}) => {
  const { createQuestion, isCreating } = useItemCreation(formId);
  const [position, setPosition] = useState<ButtonPosition | null>(null);

  // Throttled position calculation
  const updatePosition = useCallback(
    throttle(() => {
      if (!cardRef.current || !visible || isCardDragging) {
        setPosition(null);
        return;
      }

      const cardElement = cardRef.current;
      const safePosition = getSafePosition(cardElement);
      setPosition(safePosition);
    }, 16), // ~60fps
    [cardRef, visible, isCardDragging]
  );

  // Debounced position calculation for scroll events
  const debouncedUpdatePosition = useCallback(
    debounce(updatePosition, 100),
    [updatePosition]
  );

  // Set up event listeners
  useEffect(() => {
    if (!visible || isCardDragging) return;

    // Initial position calculation
    updatePosition();

    // Listen for window resize and scroll
    window.addEventListener('resize', debouncedUpdatePosition);
    window.addEventListener('scroll', debouncedUpdatePosition);

    return () => {
      window.removeEventListener('resize', debouncedUpdatePosition);
      window.removeEventListener('scroll', debouncedUpdatePosition);
    };
  }, [visible, isCardDragging, updatePosition, debouncedUpdatePosition]);

  // Handle button clicks
  const handleAddItem = useCallback(async (questionType: 'text' | 'multiple_choice') => {
    try {
      await createQuestion(questionType);

      // The hook already handles the item creation and adding to the canvas
      // We don't need to track loading state separately since the hook manages it
      // and the UI will update automatically

      // Notify parent component that an item was created
      if (onItemCreated) {
        onItemCreated('');
      }

    } catch (error) {
      console.error('Failed to create question:', error);
    }
  }, [createQuestion, onItemCreated]);

  // Don't render if not visible or if card is dragging
  if (!visible || isCardDragging || !position) {
    return null;
  }

  return (
    <div
      className="focus-within"
    >
    <div
      className="fixed z-40 flex flex-col gap-2"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        opacity: visible && !isCardDragging ? 1 : 0,
        transition: 'opacity 200ms ease-in-out',
        pointerEvents: visible && !isCardDragging ? 'auto' : 'none'
      }}
      role="group"
      aria-label="Add new items"
    >
      {/* Short Text Button */}
      <button
        onClick={() => handleAddItem('text')}
        disabled={isCreating}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
          transition-all duration-200 shadow-sm hover:shadow-md
          ${isCreating
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
          }
        `}
        aria-label="Add short text question"
        title="Add Short Text Question"
      >
        {isCreating ? (
          <>
            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            <span>Adding...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Short Text</span>
          </>
        )}
      </button>

      {/* Multiple Choice Button */}
      <button
        onClick={() => handleAddItem('multiple_choice')}
        disabled={isCreating}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
          transition-all duration-200 shadow-sm hover:shadow-md
          ${isCreating
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400'
          }
        `}
        aria-label="Add multiple choice question"
        title="Add Multiple Choice Question"
      >
        {isCreating ? (
          <>
            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            <span>Adding...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Multiple Choice</span>
          </>
        )}
      </button>
    </div>
    </div>
  );
};

export default AddItemButtons;