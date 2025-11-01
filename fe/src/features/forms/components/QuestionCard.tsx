import React, { useState, useEffect } from 'react';
import { type CanvasItem, type AnswerKey } from '../types';
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
  { value: 'multiple_choice', label: 'Multiple choice', icon: '◉' }
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
  const [showAnswerKey, setShowAnswerKey] = useState(false);
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
          <div className="space-y-3">
            {item.options?.map((option) => {
              const isCorrect = mcCorrectOptions.includes(option.id);
              return (
                <div key={option.id} className="flex items-center gap-3 group p-2 rounded hover:bg-gray-50">
                  <div
                    className={`w-6 h-6 border-2 rounded-full flex-shrink-0 cursor-pointer flex items-center justify-center transition-colors ${
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
              <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
              Add option
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

      {/* Answer Key Section for Text Questions */}
      {(questionType === 'text' || questionType === 'paragraph') && (
        <div className="mb-4 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-semibold text-gray-800">Answer Key</h3>
            </div>
            <button
              onClick={() => setShowAnswerKey(!showAnswerKey)}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              {showAnswerKey ? 'Hide' : 'Show'}
            </button>
          </div>

          {showAnswerKey && (
            <div className="space-y-3">
              {/* Case Sensitive Toggle */}
              <div className="flex items-center gap-3">
                <button
                  className={`w-12 h-6 rounded-full border-none cursor-pointer relative transition-colors ${
                    (item.answerKey as any)?.case_sensitive ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                  onClick={handleToggleCaseSensitive}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${
                      (item.answerKey as any)?.case_sensitive ? 'left-6' : 'left-0.5'
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-700">Case sensitive</span>
              </div>

              {/* Acceptable Answers List */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-2 block">
                  Acceptable Answers
                </label>
                <div className="space-y-2">
                  {((item.answerKey as any)?.acceptable_answers || []).map((answer: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded px-3 py-2">
                      <span className="flex-1 text-sm text-gray-700">{answer}</span>
                      <button
                        onClick={() => handleRemoveAcceptableAnswer(index)}
                        className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500"
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
                  onKeyPress={(e) => e.key === 'Enter' && handleAddAcceptableAnswer()}
                  placeholder="Add acceptable answer..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleAddAcceptableAnswer}
                  disabled={!newAcceptableAnswer.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>

              <p className="text-xs text-gray-500 italic">
                Students can provide any of these answers to get full credit. Leave empty if this is not a quiz question.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Points Field */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Points
        </label>
        <input
          type="number"
          value={points}
          onChange={(e) => handlePointsChange(Number(e.target.value))}
          min="0"
          className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
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