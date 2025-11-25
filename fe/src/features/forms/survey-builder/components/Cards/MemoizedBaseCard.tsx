import React from 'react';
import { BaseCard } from './BaseCard';

export const MemoizedBaseCard = React.memo(BaseCard, (prevProps, nextProps) => {
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.isAnyCardDragging === nextProps.isAnyCardDragging &&
    prevProps.children === nextProps.children
  );
});