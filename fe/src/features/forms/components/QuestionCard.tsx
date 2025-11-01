import React, { useState, useEffect } from 'react';
import { type CanvasItem } from '../types';
import { RichTextEditor } from '../../../components/RichTextEditor';

interface QuestionCardProps {
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

const QUESTION_TYPES = [
  { value: 'text', label: 'Short answer', icon: 'T' },
  { value: 'paragraph', label: 'Paragraph', icon: '¶' },
  { value: 'multiple_choice', label: 'Multiple choice', icon: '◉' },
  { value: 'checkbox', label: 'Checkboxes', icon: '☐' },
  { value: 'dropdown', label: 'Dropdown', icon: '▼' },
  { value: 'linear_scale', label: 'Linear scale', icon: '1―5' },
  { value: 'rating', label: 'Rating', icon: '★' },
  { value: 'date', label: 'Date', icon: '📅' },
  { value: 'time', label: 'Time', icon: '🕐' },
  { value: 'file_upload', label: 'File upload', icon: '📎' }
];

export const QuestionCard: React.FC<QuestionCardProps> = ({
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
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  // const [showScaleDialog, setShowScaleDialog] = useState(false); // TODO: Implement scale dialog
  const [scaleMin, setScaleMin] = useState(1);
  const [scaleMax, setScaleMax] = useState(5);

  const questionType = item.questionType || 'text';

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

  // Handle question type change
  const handleTypeChange = (newType: string) => {
    setShowTypeDropdown(false);
    onUpdate({ questionType: newType });

    // Initialize options for choice-based questions
    if (['multiple_choice', 'checkbox'].includes(newType) && (!item.options || item.options.length === 0)) {
      onUpdate({
        options: [
          { id: '1', label: 'Option 1' },
          { id: '2', label: 'Option 2' }
        ]
      });
    }
  };

  // Handle option change
  const handleOptionChange = (optionId: string, newLabel: string) => {
    const updatedOptions = item.options?.map(opt =>
      opt.id === optionId ? { ...opt, label: newLabel } : opt
    );
    onUpdate({ options: updatedOptions });
  };

  // Add new option
  const handleAddOption = () => {
    const newOption = {
      id: Date.now().toString(),
      label: `Option ${(item.options?.length || 0) + 1}`
    };
    onUpdate({ options: [...(item.options || []), newOption] });
  };

  // Delete option
  const handleDeleteOption = (optionId: string) => {
    if (item.options && item.options.length > 2) {
      const updatedOptions = item.options.filter(opt => opt.id !== optionId);
      onUpdate({ options: updatedOptions });
    }
  };


  // Render question content preview
  const renderQuestionContent = () => {
    switch (questionType) {
      case 'text':
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <div className="text-gray-500 text-sm">Short answer text</div>
          </div>
        );

      case 'paragraph':
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-6">
            <div className="text-gray-500 text-sm">Long answer text</div>
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {item.options?.map((option) => (
              <div key={option.id} className="flex items-center gap-3 group p-2 rounded hover:bg-gray-50">
                <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex-shrink-0" />
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => handleOptionChange(option.id, e.target.value)}
                  className="flex-1 text-sm text-gray-700 border-b border-transparent hover:border-gray-300 focus:border-purple-600 outline-none bg-transparent"
                  placeholder="Option"
                />
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500"
                  onClick={() => handleDeleteOption(option.id)}
                  disabled={item.options?.length === 2}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              className="flex items-center gap-3 mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium"
              onClick={handleAddOption}
            >
              <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
              Add option
            </button>
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            {item.options?.map((option) => (
              <div key={option.id} className="flex items-center gap-3 group p-2 rounded hover:bg-gray-50">
                <div className="w-6 h-6 border-2 border-gray-300 rounded flex-shrink-0" />
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => handleOptionChange(option.id, e.target.value)}
                  className="flex-1 text-sm text-gray-700 border-b border-transparent hover:border-gray-300 focus:border-purple-600 outline-none bg-transparent"
                  placeholder="Option"
                />
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500"
                  onClick={() => handleDeleteOption(option.id)}
                  disabled={item.options?.length === 2}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              className="flex items-center gap-3 mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium"
              onClick={handleAddOption}
            >
              <div className="w-6 h-6 border-2 border-gray-300 rounded" />
              Add option
            </button>
          </div>
        );

      case 'dropdown':
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <div className="text-gray-500 text-sm">Dropdown</div>
          </div>
        );

      case 'linear_scale':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={scaleMin}
                  onChange={(e) => setScaleMin(Number(e.target.value))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                  min="0"
                  max="10"
                />
                <span className="text-sm text-gray-600">to</span>
                <input
                  type="number"
                  value={scaleMax}
                  onChange={(e) => setScaleMax(Number(e.target.value))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                  min="1"
                  max="10"
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              {Array.from({ length: scaleMax - scaleMin + 1 }, (_, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 border-2 border-gray-300 rounded-full" />
                  <span className="text-xs text-gray-500">{scaleMin + i}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'rating':
        return (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg key={star} className="w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        );

      case 'date':
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <div className="text-gray-500 text-sm">Date</div>
          </div>
        );

      case 'time':
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <div className="text-gray-500 text-sm">Time</div>
          </div>
        );

      case 'file_upload':
        return (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div className="text-gray-500 text-sm">Click to upload or drag and drop</div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <div className="text-gray-500 text-sm">Unknown question type</div>
          </div>
        );
    }
  };

  const currentTypeLabel = QUESTION_TYPES.find(t => t.value === questionType)?.label || 'Short answer';

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
        minHeight: '180px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
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

      {/* Question Title */}
      <RichTextEditor
        content={title}
        onChange={handleTitleChange}
        placeholder="Question"
        showToolbar={true}
        toolbarPosition="bottom"
        style={{
          fontSize: '18px',
          fontWeight: 500,
          color: '#202124',
          lineHeight: 1.5,
          border: 'none',
          background: 'transparent',
          fontFamily: 'inherit',
        }}
        className="transition-all duration-200"
      />

      {/* Question Description */}
      <RichTextEditor
        content={description}
        onChange={handleDescriptionChange}
        placeholder="Description (optional)"
        showToolbar={true}
        toolbarPosition="bottom"
        style={{
          fontSize: '14px',
          fontWeight: 400,
          color: '#808080',
          border: 'none',
          background: 'transparent',
          fontFamily: 'inherit',
          padding: '8px 0',
        }}
        className="transition-all duration-200"
      />

      {/* Divider */}
      <div
        style={{
          height: '1px',
          background: '#E8E8E8',
          margin: '0',
          width: '100%'
        }}
      />

      {/* Question Type Selector */}
      <div className="flex items-start gap-3">
        <div className="relative">
          <button
            className="flex items-center gap-3 bg-gray-100 border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 transition-colors min-w-[200px] justify-between"
            onClick={(e) => {
              e.stopPropagation();
              setShowTypeDropdown(!showTypeDropdown);
            }}
          >
            <span>{currentTypeLabel}</span>
            <svg
              className="w-3 h-3 text-gray-500 transition-transform"
              style={{ transform: showTypeDropdown ? 'scaleY(-1)' : 'scaleY(1)' }}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showTypeDropdown && (
            <div
              className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 min-w-[250px] max-h-[400px] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {QUESTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  className={`
                    w-full px-4 py-3 h-10 flex items-center gap-3 text-sm text-gray-700 border-none bg-transparent cursor-pointer hover:bg-gray-100
                    ${questionType === type.value ? 'bg-blue-50 text-purple-600 font-semibold' : ''}
                  `}
                  onClick={() => handleTypeChange(type.value)}
                >
                  <span className="w-5 h-5 flex items-center justify-center text-sm">
                    {type.icon}
                  </span>
                  {type.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Question Content Preview */}
      <div className="mb-4">
        {renderQuestionContent()}
      </div>

      {/* Required Toggle and Actions */}
      <div
        className="flex items-center justify-between pt-3 border-t border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <button
            className={`
              w-12 h-6 rounded-full border-none cursor-pointer relative transition-colors
              ${item.required ? 'bg-purple-600' : 'bg-gray-300'}
            `}
            onClick={() => onUpdate({ required: !item.required })}
          >
            <span
              className={`
                absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all
                ${item.required ? 'left-6' : 'left-0.5'}
              `}
            />
          </button>
          <span className="text-sm text-gray-700 font-medium">Required</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="w-10 h-10 flex items-center justify-center bg-transparent border-none cursor-pointer rounded-md text-gray-600 hover:bg-gray-100 hover:text-purple-600 transition-colors"
            onClick={() => {
              // TODO: Implement more options
            }}
            title="More options"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};