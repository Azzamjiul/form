import React, { useState } from 'react';
import type { CanvasItem, AnswerKey } from '../../../../types';

interface AnswerKeyManagerProps {
  item: CanvasItem;
  onUpdate: (updates: Partial<CanvasItem>) => void;
}

export const AnswerKeyManager: React.FC<AnswerKeyManagerProps> = ({ item, onUpdate }) => {
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [newAcceptableAnswer, setNewAcceptableAnswer] = useState('');
  const questionType = item.questionType || 'text';

  // Handle correct option toggle for multiple choice/checkbox
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
      correct_options: newCorrectOptions,
    };

    onUpdate({ answerKey: newAnswerKey });
  };

  // Handle linear scale correct value
  const handleScaleValueChange = (value: number) => {
    const newAnswerKey: AnswerKey = {
      type: 'linear_scale',
      correct_value: value,
    };
    onUpdate({ answerKey: newAnswerKey });
  };

  // Text answer handlers
  const handleAddAcceptableAnswer = () => {
    if (!newAcceptableAnswer.trim()) return;

    const currentAnswerKey = item.answerKey as any;
    const acceptableAnswers = currentAnswerKey?.acceptable_answers || [];

    const newAnswerKey: AnswerKey = {
      type: 'text',
      case_sensitive: currentAnswerKey?.case_sensitive || false,
      acceptable_answers: [...acceptableAnswers, newAcceptableAnswer.trim()],
      trim_whitespace: currentAnswerKey?.trim_whitespace !== false,
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
      trim_whitespace: currentAnswerKey?.trim_whitespace !== false,
    };

    onUpdate({ answerKey: newAnswerKey });
  };

  const handleToggleCaseSensitive = () => {
    const currentAnswerKey = item.answerKey as any;

    const newAnswerKey: AnswerKey = {
      type: 'text',
      case_sensitive: !(currentAnswerKey?.case_sensitive || false),
      acceptable_answers: currentAnswerKey?.acceptable_answers || [],
      trim_whitespace: currentAnswerKey?.trim_whitespace !== false,
    };

    onUpdate({ answerKey: newAnswerKey });
  };

  const hasAnswerKey = !!item.answerKey;

  return (
    <div className="space-y-3">
      {/* Answer Key Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Answer Key</span>
          {hasAnswerKey && (
            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
              Configured
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAnswerKey(!showAnswerKey)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showAnswerKey ? 'Hide' : 'Configure'}
        </button>
      </div>

      {/* Answer Key Configuration */}
      {showAnswerKey && (
        <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
          {questionType === 'multiple_choice' && (
            <MultipleChoiceAnswerKey
              item={item}
              onToggleCorrect={handleToggleCorrectOption}
            />
          )}

          {questionType === 'checkbox' && (
            <CheckboxAnswerKey
              item={item}
              onToggleCorrect={handleToggleCorrectOption}
            />
          )}

          {questionType === 'text' && (
            <TextAnswerKey
              item={item}
              newAcceptableAnswer={newAcceptableAnswer}
              onNewAnswerChange={setNewAcceptableAnswer}
              onAddAnswer={handleAddAcceptableAnswer}
              onRemoveAnswer={handleRemoveAcceptableAnswer}
              onToggleCaseSensitive={handleToggleCaseSensitive}
            />
          )}

          {questionType === 'linear_scale' && (
            <LinearScaleAnswerKey
              item={item}
              onValueChange={handleScaleValueChange}
            />
          )}

          {['paragraph', 'dropdown'].includes(questionType) && (
            <div className="text-sm text-gray-500 italic">
              Answer key configuration is not applicable for this question type.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper components for different answer key types
const MultipleChoiceAnswerKey: React.FC<{
  item: CanvasItem;
  onToggleCorrect: (optionId: string) => void;
}> = ({ item, onToggleCorrect }) => {
  const currentAnswerKey = item.answerKey as any;
  const correctOptions = currentAnswerKey?.correct_options || [];

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-600">Select the correct answer:</p>
      {item.options?.map((option) => {
        const isCorrect = correctOptions.includes(option.id);
        return (
          <div key={option.id} className="flex items-center gap-2">
            <button
              onClick={() => onToggleCorrect(option.id)}
              className={`w-4 h-4 border-2 rounded-full flex items-center justify-center transition-colors ${
                isCorrect ? 'border-green-600 bg-green-50' : 'border-gray-300'
              }`}
            >
              {isCorrect && <div className="w-2 h-2 bg-green-600 rounded-full" />}
            </button>
            <span className="text-sm text-gray-700">{option.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const CheckboxAnswerKey: React.FC<{
  item: CanvasItem;
  onToggleCorrect: (optionId: string) => void;
}> = ({ item, onToggleCorrect }) => {
  const currentAnswerKey = item.answerKey as any;
  const correctOptions = currentAnswerKey?.correct_options || [];

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-600">Select all correct answers:</p>
      {item.options?.map((option) => {
        const isCorrect = correctOptions.includes(option.id);
        return (
          <div key={option.id} className="flex items-center gap-2">
            <button
              onClick={() => onToggleCorrect(option.id)}
              className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${
                isCorrect ? 'border-green-600 bg-green-50' : 'border-gray-300'
              }`}
            >
              {isCorrect && (
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <span className="text-sm text-gray-700">{option.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const TextAnswerKey: React.FC<{
  item: CanvasItem;
  newAcceptableAnswer: string;
  onNewAnswerChange: (value: string) => void;
  onAddAnswer: () => void;
  onRemoveAnswer: (index: number) => void;
  onToggleCaseSensitive: () => void;
}> = ({ item, newAcceptableAnswer, onNewAnswerChange, onAddAnswer, onRemoveAnswer, onToggleCaseSensitive }) => {
  const currentAnswerKey = item.answerKey as any;
  const acceptableAnswers = currentAnswerKey?.acceptable_answers || [];
  const caseSensitive = currentAnswerKey?.case_sensitive || false;

  return (
    <div className="space-y-3">
      {/* Case sensitivity toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="case-sensitive"
          checked={caseSensitive}
          onChange={onToggleCaseSensitive}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="case-sensitive" className="text-sm text-gray-700">
          Case sensitive
        </label>
      </div>

      {/* Acceptable answers */}
      <div className="space-y-2">
        <p className="text-xs text-gray-600">Acceptable answers:</p>

        {/* Add new answer */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newAcceptableAnswer}
            onChange={(e) => onNewAnswerChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onAddAnswer()}
            placeholder="Enter acceptable answer"
            className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={onAddAnswer}
            disabled={!newAcceptableAnswer.trim()}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>

        {/* List of acceptable answers */}
        {acceptableAnswers.map((answer: string, index: number) => (
          <div key={index} className="flex items-center justify-between bg-white border border-gray-200 rounded px-2 py-1">
            <span className="text-sm text-gray-700">{answer}</span>
            <button
              onClick={() => onRemoveAnswer(index)}
              className="text-red-500 hover:text-red-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {acceptableAnswers.length === 0 && (
          <p className="text-xs text-gray-500 italic">No acceptable answers defined.</p>
        )}
      </div>
    </div>
  );
};

const LinearScaleAnswerKey: React.FC<{
  item: CanvasItem;
  onValueChange: (value: number) => void;
}> = ({ item, onValueChange }) => {
  const currentAnswerKey = item.answerKey as any;
  const correctValue = currentAnswerKey?.correct_value || 3;

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-600">Select the correct value:</p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          max="10"
          value={correctValue}
          onChange={(e) => onValueChange(parseInt(e.target.value) || 1)}
          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
        />
        <span className="text-sm text-gray-600">out of 10</span>
      </div>
    </div>
  );
};