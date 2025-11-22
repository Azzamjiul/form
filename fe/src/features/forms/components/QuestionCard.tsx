import React, { useState, useEffect } from 'react';
import { type CanvasItem, type AnswerKey } from '../types';
import { RichTextEditor } from '../../../components/RichTextEditor';
import { fieldsApi } from '../api/fields';

interface QuestionCardProps {
  item: CanvasItem;
  formId: string;
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
  { value: 'multiple_choice', label: 'Multiple choice', icon: '◉' }
];

export const QuestionCard: React.FC<QuestionCardProps> = ({
  item,
  formId,
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
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // const [showScaleDialog, setShowScaleDialog] = useState(false); // TODO: Implement scale dialog
  const [scaleMin, setScaleMin] = useState(1);
  const [scaleMax, setScaleMax] = useState(5);
  const [points, setPoints] = useState(item.points || 0);

  // Answer key state
  const [newAcceptableAnswer, setNewAcceptableAnswer] = useState('');

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

    // Initialize options and answer key for multiple choice questions
    if (newType === 'multiple_choice' && (!item.options || item.options.length === 0)) {
      onUpdate({
        questionType: newType,
        options: [
          { id: '1', label: 'Option 1' },
          { id: '2', label: 'Option 2' }
        ],
        answerKey: {
          type: 'multiple_choice',
          correct_options: []
        }
      });
    } else {
      onUpdate({ questionType: newType });
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

  // Answer Key Handlers
  const handleToggleCorrectOption = (optionId: string) => {
    const currentAnswerKey = item.answerKey as any;
    const correctOptions = currentAnswerKey?.correct_options || [];

    let newCorrectOptions: string[];
    if (questionType === 'multiple_choice') {
      // Single selection - replace
      newCorrectOptions = correctOptions.includes(optionId) ? [] : [optionId];
    } else {
      // Multiple selection (checkbox) - toggle
      newCorrectOptions = correctOptions.includes(optionId)
        ? correctOptions.filter((id: string) => id !== optionId)
        : [...correctOptions, optionId];
    }

    const newAnswerKey: AnswerKey = {
      type: questionType as any,
      correct_options: newCorrectOptions
    };

    onUpdate({ answerKey: newAnswerKey });
  };

  const handleAddAcceptableAnswer = () => {
    if (!newAcceptableAnswer.trim()) return;

    const currentAnswerKey = item.answerKey as any;
    const acceptableAnswers = currentAnswerKey?.acceptable_answers || [];

    const newAnswerKey: AnswerKey = {
      type: 'text',
      case_sensitive: currentAnswerKey?.case_sensitive || false,
      acceptable_answers: [...acceptableAnswers, newAcceptableAnswer.trim()],
      trim_whitespace: currentAnswerKey?.trim_whitespace !== false
    };

    onUpdate({ answerKey: newAnswerKey });
    setNewAcceptableAnswer('');
  };

  const handleRemoveAcceptableAnswer = (index: number) => {
    const currentAnswerKey = item.answerKey as any;
    const acceptableAnswers = currentAnswerKey?.acceptable_answers || [];

    const newAnswerKey: AnswerKey = {
      type: 'text',
      case_sensitive: currentAnswerKey?.case_sensitive || false,
      acceptable_answers: acceptableAnswers.filter((_: string, i: number) => i !== index),
      trim_whitespace: currentAnswerKey?.trim_whitespace !== false
    };

    onUpdate({ answerKey: newAnswerKey });
  };

  const handleToggleCaseSensitive = () => {
    const currentAnswerKey = item.answerKey as any;

    const newAnswerKey: AnswerKey = {
      type: 'text',
      case_sensitive: !(currentAnswerKey?.case_sensitive || false),
      acceptable_answers: currentAnswerKey?.acceptable_answers || [],
      trim_whitespace: currentAnswerKey?.trim_whitespace !== false
    };

    onUpdate({ answerKey: newAnswerKey });
  };

  const handlePointsChange = (newPoints: number) => {
    setPoints(newPoints);
    onUpdate({ points: newPoints });
  };

  // Handle delete confirmation
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await fieldsApi.deleteField(formId, item.id);
      onDelete(); // Call parent's onDelete to update local state
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete field:', error);
      alert('Failed to delete item. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(false);
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
        const mcAnswerKey = item.answerKey as any;
        const mcCorrectOptions = mcAnswerKey?.correct_options || [];
        return (
          <div className="space-y-2">
            {item.options?.map((option) => {
              const isCorrect = mcCorrectOptions.includes(option.id);
              return (
                <div key={option.id} className="flex items-center gap-3 group py-1">
                  <div
                    className={`w-5 h-5 border-2 rounded-full flex-shrink-0 cursor-pointer flex items-center justify-center transition-colors ${
                      isCorrect ? 'border-green-600 bg-green-50' : 'border-gray-400'
                    }`}
                    onClick={() => handleToggleCorrectOption(option.id)}
                    title={isCorrect ? 'Correct answer' : 'Mark as correct'}
                  >
                    {isCorrect && (
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                    className="flex-1 text-sm text-gray-700 border-none outline-none bg-transparent px-1 py-1.5 focus:bg-gray-50 rounded"
                    placeholder="Option"
                  />
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 flex items-center justify-center text-gray-400 hover:text-gray-600"
                    onClick={() => handleDeleteOption(option.id)}
                    disabled={item.options?.length === 2}
                    title="Delete option"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
            <button
              className="flex items-center gap-3 mt-2 text-gray-600 hover:text-gray-800 text-sm py-1"
              onClick={handleAddOption}
            >
              <div className="w-5 h-5 border-2 border-gray-400 rounded-full" />
              <span>Add option</span>
            </button>
          </div>
        );

      case 'checkbox':
        const cbAnswerKey = item.answerKey as any;
        const cbCorrectOptions = cbAnswerKey?.correct_options || [];
        return (
          <div className="space-y-3">
            {item.options?.map((option) => {
              const isCorrect = cbCorrectOptions.includes(option.id);
              return (
                <div key={option.id} className="flex items-center gap-3 group p-2 rounded hover:bg-gray-50">
                  <div
                    className={`w-6 h-6 border-2 rounded flex-shrink-0 cursor-pointer flex items-center justify-center transition-colors ${
                      isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    }`}
                    onClick={() => handleToggleCorrectOption(option.id)}
                    title={isCorrect ? 'Correct answer' : 'Mark as correct'}
                  >
                    {isCorrect && (
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
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
              );
            })}
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
        padding: '16px',
        marginBottom: '24px',
        minHeight: '140px',
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
      {/* Title and Type Selector Row */}
      <div className="flex items-start gap-4">
        {/* Question Title */}
        <div className="flex-1">
          <RichTextEditor
            content={title}
            onChange={handleTitleChange}
            placeholder="Question"
            showToolbar={true}
            toolbarPosition="bottom"
            style={{
              fontSize: '14px',
              fontWeight: 400,
              color: '#202124',
              lineHeight: 1.5,
              border: 'none',
              background: 'transparent',
              fontFamily: 'inherit',
            }}
            className="transition-all duration-200"
          />
        </div>

        {/* Question Type Selector */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors min-w-[180px] justify-between"
            onClick={(e) => {
              e.stopPropagation();
              setShowTypeDropdown(!showTypeDropdown);
            }}
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center text-lg">
                {QUESTION_TYPES.find(t => t.value === questionType)?.icon || '◉'}
              </span>
              <span>{currentTypeLabel}</span>
            </div>
            <svg
              className="w-4 h-4 text-gray-500 transition-transform"
              style={{ transform: showTypeDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showTypeDropdown && (
            <div
              className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 min-w-[220px] max-h-[400px] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {QUESTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  className={`
                    w-full px-4 py-2 flex items-center gap-3 text-sm text-gray-700 border-none bg-transparent cursor-pointer hover:bg-gray-100 transition-colors
                    ${questionType === type.value ? 'bg-purple-50 text-purple-700 font-medium' : ''}
                  `}
                  onClick={() => handleTypeChange(type.value)}
                >
                  <span className="w-5 h-5 flex items-center justify-center text-base">
                    {type.icon}
                  </span>
                  {type.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Question Description */}
      {description && (
        <RichTextEditor
          content={description}
          onChange={handleDescriptionChange}
          placeholder="Description (optional)"
          showToolbar={true}
          toolbarPosition="bottom"
          style={{
            fontSize: '13px',
            fontWeight: 400,
            color: '#70757a',
            border: 'none',
            background: 'transparent',
            fontFamily: 'inherit',
            padding: '0',
          }}
          className="transition-all duration-200"
        />
      )}

      {/* Divider */}
      <div
        style={{
          height: '1px',
          background: '#dadce0',
          margin: '8px 0',
          width: '100%'
        }}
      />

      {/* Question Content Preview */}
      <div>
        {renderQuestionContent()}
      </div>

      {/* Answer Key Section for Text Questions - Collapsible */}
      {(questionType === 'text' || questionType === 'paragraph') && (
        <div className="mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAnswerKey(!showAnswerKey);
            }}
            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium mb-2"
          >
            <svg
              className="w-4 h-4 transition-transform"
              style={{ transform: showAnswerKey ? 'rotate(90deg)' : 'rotate(0deg)' }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span>Answer Key</span>
          </button>

          {showAnswerKey && (
            <div className="space-y-3 pl-6 pb-2">
              {/* Case Sensitive Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`case-sensitive-${item.id}`}
                  checked={(item.answerKey as any)?.case_sensitive || false}
                  onChange={handleToggleCaseSensitive}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor={`case-sensitive-${item.id}`} className="text-sm text-gray-700">
                  Case sensitive
                </label>
              </div>

              {/* Acceptable Answers List */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">
                  Acceptable Answers
                </label>
                <div className="space-y-1.5">
                  {((item.answerKey as any)?.acceptable_answers || []).map((answer: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded px-2 py-1.5">
                      <span className="flex-1 text-sm text-gray-700">{answer}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveAcceptableAnswer(index);
                        }}
                        className="p-0.5 flex items-center justify-center text-gray-400 hover:text-red-500"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Answer */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAcceptableAnswer}
                  onChange={(e) => setNewAcceptableAnswer(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.stopPropagation();
                      handleAddAcceptableAnswer();
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Add acceptable answer..."
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddAcceptableAnswer();
                  }}
                  disabled={!newAcceptableAnswer.trim()}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>

              <p className="text-xs text-gray-500 italic">
                Students can provide any of these answers to get full credit.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Bottom Actions Bar */}
      <div
        className="flex items-center justify-between pt-4 border-t border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Actions */}
        <div className="flex items-center gap-3">
          <button
            className="p-2 flex items-center justify-center bg-transparent border-none cursor-pointer rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
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
            className="p-2 flex items-center justify-center bg-transparent border-none cursor-pointer rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={handleDeleteClick}
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <div className="w-px h-6 bg-gray-300"></div>
          <button
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full border-none cursor-pointer transition-colors
              ${item.required ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}
            `}
            onClick={() => onUpdate({ required: !item.required })}
          >
            <span className="text-sm font-medium">Required</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Points Input */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Points:</label>
            <input
              type="number"
              value={points}
              onChange={(e) => handlePointsChange(Number(e.target.value))}
              onClick={(e) => e.stopPropagation()}
              min="0"
              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <div className="w-px h-6 bg-gray-300"></div>
          <button
            className="p-2 flex items-center justify-center bg-transparent border-none cursor-pointer rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => {
              // TODO: Implement more options
            }}
            title="More options"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCancelDelete}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Question?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this question? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};