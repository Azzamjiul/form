import React, { useState, useEffect } from 'react';
import { type CanvasItem } from '../types';
import { RichTextEditor } from '../../../components/RichTextEditor';

interface TitleDescriptionCardProps {
  item: CanvasItem;
  isSelected: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasItem>) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export const TitleDescriptionCard: React.FC<TitleDescriptionCardProps> = ({
  item,
  isSelected,
  isDragging,
  isDragOver,
  onSelect,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd
}) => {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);

  // Update local state when item changes
  useEffect(() => {
    setTitle(item.title);
    setDescription(item.description);
  }, [item.title, item.description]);

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onUpdate({ title: newTitle });
  };

  // Handle description change
  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
    onUpdate({ description: newDescription });
  };

  return (
    <div
      className={`
        relative transition-all duration-200 ease
        ${isDragging ? 'opacity-70 scale-102 shadow-lg z-50' : ''}
        ${isDragOver ? 'border-2 border-purple-400 bg-purple-50' : ''}
        ${isSelected ? 'shadow-md border-l-purple-600' : 'shadow-sm hover:shadow-md'}
      `}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E8E8E8',
        borderLeft: '4px solid #5F35F5',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        padding: '24px',
        marginBottom: '24px',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
        cursor: isDragging ? 'grabbing' : 'text'
      }}
      onClick={onSelect}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      {/* Top-right actions */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          gap: '8px'
        }}
      >
        <button
          className="w-10 h-10 flex items-center justify-center bg-transparent border-none cursor-pointer rounded-md text-gray-600 hover:bg-gray-100 hover:text-purple-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement duplicate functionality
          }}
          title="Duplicate"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          className="w-10 h-10 flex items-center justify-center bg-transparent border-none cursor-pointer rounded-md text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Section Title */}
      <RichTextEditor
        content={title}
        onChange={handleTitleChange}
        placeholder="Section title"
        showToolbar={true}
        toolbarPosition="bottom"
        style={{
          fontSize: '18px',
          fontWeight: 500,
          color: '#202124',
          lineHeight: 1.5,
          borderBottom: '2px solid #5F35F5',
          background: 'transparent',
          fontFamily: 'inherit',
        }}
      />

      {/* Section Description */}
      <RichTextEditor
        content={description}
        onChange={handleDescriptionChange}
        placeholder="Section description (optional)"
        showToolbar={true}
        toolbarPosition="bottom"
        style={{
          fontSize: '14px',
          fontWeight: 400,
          color: '#808080',
          lineHeight: 1.5,
          border: 'none',
          background: 'transparent',
          fontFamily: 'inherit',
          padding: '12px 0',
          borderBottom: '1px solid #E8E8E8',
        }}
      />
    </div>
  );
};