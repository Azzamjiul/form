import React from 'react';
import { QuestionCard } from './QuestionCard';

export const MemoizedQuestionCard = React.memo(QuestionCard, (prevProps, nextProps) => {
  // Only re-render if these props have changed
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.title === nextProps.item.title &&
    prevProps.item.description === nextProps.item.description &&
    prevProps.item.questionType === nextProps.item.questionType &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.isAnyCardDragging === nextProps.isAnyCardDragging &&
    JSON.stringify(prevProps.item.options) === JSON.stringify(nextProps.item.options)
  );
});