import React from 'react';
import { BaseCard } from '../BaseCard';
import { QuestionEditor } from './QuestionEditor';
import { QuestionTypeConfig } from './QuestionTypeConfig';
import { OptionManager } from './OptionManager';
import { AnswerKeyManager } from './AnswerKeyManager';
import { QuestionActions } from './QuestionActions';
import type { QuestionCardProps } from '../../../types/canvas';

export const QuestionCard: React.FC<QuestionCardProps> = ({
  item,
  formId,
  isSelected,
  isDragging,
  isAnyCardDragging,
  onSelect,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}) => {
  const questionType = item.questionType || 'text';
  const isChoiceBased = ['multiple_choice', 'checkbox', 'dropdown'].includes(questionType);

  return (
    <BaseCard
      isSelected={isSelected}
      isDragging={isDragging}
      isAnyCardDragging={isAnyCardDragging}
      onSelect={onSelect}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      cardId={item.id}
    >
      <div className="p-6 space-y-4">
        {/* Header with question type */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <QuestionEditor
              item={item}
              onUpdate={onUpdate}
              isMinimized={isAnyCardDragging}
            />
          </div>
          <div className="ml-4">
            <QuestionTypeConfig
              item={item}
              onUpdate={onUpdate}
            />
          </div>
        </div>

        {/* Configuration sections - only show when not dragging */}
        {!isAnyCardDragging && (
          <>
            {/* Options for choice-based questions */}
            {isChoiceBased && (
              <div className="border-t pt-4">
                <OptionManager
                  item={item}
                  onUpdate={onUpdate}
                />
              </div>
            )}

            {/* Answer Key configuration */}
            <div className="border-t pt-4">
              <AnswerKeyManager
                item={item}
                onUpdate={onUpdate}
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between border-t pt-4">
              <QuestionActions
                item={item}
                formId={formId}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            </div>
          </>
        )}

        {/* Drag handle */}
        <div className="absolute top-2 left-2 opacity-0 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </div>
      </div>
    </BaseCard>
  );
};