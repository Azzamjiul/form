import React, { useState } from 'react';
import type { CanvasItem, AnswerKey } from '../../../../types';

const QUESTION_TYPES = [
  { value: 'text', label: 'Short answer', icon: 'T' },
  { value: 'paragraph', label: 'Paragraph', icon: '¶' },
  { value: 'multiple_choice', label: 'Multiple choice', icon: '◉' },
  { value: 'checkbox', label: 'Checkboxes', icon: '☑' },
  { value: 'dropdown', label: 'Dropdown', icon: '▼' },
  { value: 'linear_scale', label: 'Linear scale', icon: '—' },
];

interface QuestionTypeConfigProps {
  item: CanvasItem;
  onUpdate: (updates: Partial<CanvasItem>) => void;
}

export const QuestionTypeConfig: React.FC<QuestionTypeConfigProps> = ({
  item,
  onUpdate,
}) => {
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const questionType = item.questionType || 'text';

  // Handle question type change
  const handleTypeChange = (newType: string) => {
    setShowTypeDropdown(false);

    // Initialize options and answer key for choice-based questions
    if (
      (newType === 'multiple_choice' || newType === 'checkbox' || newType === 'dropdown') &&
      (!item.options || item.options.length === 0)
    ) {
      const defaultOptions = [
        { id: '1', label: 'Option 1' },
        { id: '2', label: 'Option 2' },
      ];

      let answerKey: AnswerKey;
      if (newType === 'checkbox') {
        answerKey = {
          type: 'checkbox',
          correct_options: [],
        };
      } else {
        answerKey = {
          type: 'multiple_choice',
          correct_options: [],
        };
      }

      onUpdate({
        questionType: newType,
        options: defaultOptions,
        answerKey,
      });
    } else if (newType === 'linear_scale') {
      // Initialize scale answer key
      onUpdate({
        questionType: newType,
        answerKey: {
          type: 'linear_scale',
          correct_value: 3,
        },
      });
    } else {
      // For text/paragraph, clear options and set simple answer key
      onUpdate({
        questionType: newType,
        options: [],
        answerKey: {
          type: 'text',
          case_sensitive: false,
          acceptable_answers: [],
          trim_whitespace: true,
        },
      });
    }
  };

  const selectedType = QUESTION_TYPES.find(type => type.value === questionType);

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <button
          onClick={() => setShowTypeDropdown(!showTypeDropdown)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <span className="text-lg font-medium text-gray-600 w-5 text-center">
            {selectedType?.icon}
          </span>
          <span className="text-gray-700 font-medium">
            {selectedType?.label || 'Unknown type'}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${
              showTypeDropdown ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {showTypeDropdown && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-1">
              {QUESTION_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeChange(type.value)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    type.value === questionType
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="text-lg font-medium w-5 text-center">
                    {type.icon}
                  </span>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};