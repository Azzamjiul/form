import React, { useState, useRef, useEffect } from 'react';

interface CanvasItem {
  id: string;
  type: string;
  title: string;
  description: string;
  sectionNumber?: number;
  totalSections?: number;
  order: number;
  isEditing?: boolean;
  isSelected?: boolean;
  isDragging?: boolean;
}

interface PageBreakCardProps {
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

export const PageBreakCard: React.FC<PageBreakCardProps> = ({
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
  const [showFormatting, setShowFormatting] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  const sectionNumber = item.sectionNumber || 1;
  const totalSections = item.totalSections || 1;

  // Update local state when item changes
  useEffect(() => {
    setTitle(item.title);
    setDescription(item.description);
  }, [item.title, item.description]);

  // Handle title change
  const handleTitleChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newTitle = e.currentTarget.textContent || '';
    setTitle(newTitle);
    onUpdate({ title: newTitle });
  };

  // Handle description change
  const handleDescriptionChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newDescription = e.currentTarget.textContent || '';
    setDescription(newDescription);
    onUpdate({ description: newDescription });
  };

  // Handle paste events to clean up formatting
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Handle key events for title
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      descriptionRef.current?.focus();
    }
  };

  // Text formatting commands
  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    titleRef.current?.focus();
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
        minHeight: '100px',
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
      {/* Section Label Badge */}
      <div
        style={{
          background: '#5F35F5',
          color: '#FFFFFF',
          fontSize: '12px',
          fontWeight: 600,
          padding: '8px 12px',
          borderRadius: '4px',
          width: 'fit-content',
          marginBottom: '12px',
          position: 'absolute',
          top: '12px',
          left: '12px'
        }}
      >
        Section {sectionNumber} of {totalSections}
      </div>

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

      {/* Page Break Title */}
      <div
        ref={titleRef}
        contentEditable
        suppressContentEditableWarning
        className="outline-none"
        style={{
          fontSize: '18px',
          fontWeight: 500,
          color: '#202124',
          lineHeight: 1.5,
          border: 'none',
          borderBottom: '2px solid #5F35F5',
          padding: '8px 0 12px 0',
          background: 'transparent',
          fontFamily: 'inherit',
          resize: 'none',
          maxHeight: '100px',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          marginTop: '20px'
        }}
        onInput={handleTitleChange}
        onKeyDown={handleTitleKeyDown}
        onPaste={handlePaste}
        onFocus={() => setShowFormatting(true)}
        onBlur={() => setTimeout(() => setShowFormatting(false), 200)}
        data-placeholder="Section title"
      >
        {title}
      </div>

      {/* Text Formatting Toolbar */}
      {showFormatting && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '12px',
            paddingBottom: '12px',
            borderBottom: '1px solid #E8E8E8'
          }}
        >
          <button
            className="w-8 h-8 flex items-center justify-center bg-transparent border border-transparent rounded-md cursor-pointer text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              formatText('bold');
            }}
            title="Bold"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
            </svg>
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center bg-transparent border border-transparent rounded-md cursor-pointer text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              formatText('italic');
            }}
            title="Italic"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>
            </svg>
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center bg-transparent border border-transparent rounded-md cursor-pointer text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              formatText('underline');
            }}
            title="Underline"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
            </svg>
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center bg-transparent border border-transparent rounded-md cursor-pointer text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              formatText('strikeThrough');
            }}
            title="Strikethrough"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 4h4v6h2.5c1.93 0 3.5 1.57 3.5 3.5S18.43 17 16.5 17H14v2h2.5c3.04 0 5.5-2.46 5.5-5.5S19.54 8 16.5 8H14V4h-4zm0 8h4v2h-4v-2z"/>
            </svg>
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center bg-transparent border border-transparent rounded-md cursor-pointer text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement link functionality
            }}
            title="Insert link"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
            </svg>
          </button>
        </div>
      )}

      {/* Page Break Description */}
      <div
        ref={descriptionRef}
        contentEditable
        suppressContentEditableWarning
        className="outline-none"
        style={{
          fontSize: '14px',
          fontWeight: 400,
          color: '#808080',
          lineHeight: 1.5,
          border: 'none',
          borderBottom: '1px solid #E8E8E8',
          padding: '12px 0',
          background: 'transparent',
          fontFamily: 'inherit',
          resize: 'none',
          minHeight: '60px',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}
        onInput={handleDescriptionChange}
        onPaste={handlePaste}
        onFocus={() => setShowFormatting(true)}
        data-placeholder="Section description (optional)"
      >
        {description}
      </div>

      {/* Page Break Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          padding: '24px 0',
          margin: '0',
          borderTop: 'none',
          borderBottom: 'none'
        }}
      >
        <span className="text-sm text-gray-500">Continue to next section</span>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm font-medium text-gray-700">Section {sectionNumber + 1}</span>
        </div>
      </div>

      {/* Visual Page Break Line */}
      <div
        style={{
          height: '2px',
          background: 'linear-gradient(to right, transparent, #E8E8E8 20%, #E8E8E8 80%, transparent)',
          margin: '12px 0',
          borderRadius: '1px'
        }}
      />

      {/* CSS for contenteditable placeholder */}
      <style jsx>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #808080;
          opacity: 1;
        }
      `}</style>
    </div>
  );
};