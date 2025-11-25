import React from 'react';
import type { ReactNode } from 'react';
import type { BaseCardProps } from '../../types/canvas';

export const BaseCard: React.FC<BaseCardProps> = ({
  children,
  isSelected,
  isDragging,
  isAnyCardDragging,
  onSelect,
  className = '',
  draggable = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}) => {
  const cardClasses = [
    'canvas-card',
    'bg-white',
    'rounded-xl',
    'shadow-sm',
    'border-2',
    'transition-all',
    'duration-200',
    'cursor-pointer',
    'hover:shadow-md',
    'relative',
    isSelected ? 'border-blue-500 shadow-lg' : 'border-transparent',
    isDragging ? 'dragging' : '',
    isAnyCardDragging && !isDragging ? 'opacity-60 scale-95' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleDragStart = (e: React.DragEvent) => {
    if (draggable && onDragStart) {
      onDragStart(e);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (onDragOver) {
      onDragOver(e);
    }
  };

  const handleDragLeave = () => {
    if (onDragLeave) {
      onDragLeave();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (onDrop) {
      onDrop(e);
    }
  };

  const handleDragEnd = () => {
    if (onDragEnd) {
      onDragEnd();
    }
  };

  return (
    <div
      className={cardClasses}
      draggable={draggable}
      onClick={onSelect}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={isSelected}
    >
      {children}
    </div>
  );
};