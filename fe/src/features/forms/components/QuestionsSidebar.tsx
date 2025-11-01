import React from 'react';
import type { FormField } from '../types';
import { Button } from '../../../components/ui';

interface QuestionsSidebarProps {
  questions: (FormField & { section_title?: string; section_id?: string })[];
  selectedQuestionId: string | null;
  onQuestionSelect: (fieldId: string, sectionId?: string) => void;
  onAddQuestion: () => void;
  onAddSection?: () => void;
}

export const QuestionsSidebar: React.FC<QuestionsSidebarProps> = ({
  questions,
  selectedQuestionId,
  onQuestionSelect,
  onAddQuestion,
}) => {
  return (
    <div className="w-60 bg-white border-r border-gray-200 fixed left-0 top-0 h-screen z-10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="mb-3">
          <input
            type="text"
            className="w-full px-3 py-2 text-lg font-semibold border-2 border-transparent hover:border-gray-300 focus:border-purple-600 focus:outline-none transition-colors"
            placeholder="Form Title"
            defaultValue="Untitled Form"
          />
          <textarea
            className="w-full px-3 py-2 text-sm text-gray-600 border-2 border-transparent hover:border-gray-300 focus:border-purple-600 focus:outline-none resize-none transition-colors mt-2"
            placeholder="Form description"
            rows={2}
            defaultValue="Form description"
          />
        </div>
      </div>

      {/* Questions List */}
      <div className="flex-1 overflow-y-auto p-4">
        {questions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600 text-sm">No questions yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {questions.map((question, index) => (
              <div
                key={question.field_id}
                className={`
                  flex items-center h-14 px-4 cursor-pointer rounded-lg transition-all
                  ${selectedQuestionId === question.field_id
                    ? 'bg-purple-50 border-l-4 border-purple-600'
                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }
                `}
                onClick={() => onQuestionSelect(question.field_id, question.section_id)}
              >
                <div className="w-6 text-center text-xs text-gray-500 font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 ml-3 mr-2">
                  <p className="text-sm text-gray-900 truncate">
                    {question.label}
                  </p>
                  {question.section_title && (
                    <p className="text-xs text-gray-500">
                      {question.section_title}
                    </p>
                  )}
                </div>
                <div className="opacity-0 hover:opacity-100 transition-opacity">
                  <div className="w-5 h-5 text-gray-400 cursor-grab">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path d="M7 2a2 2 0 11-4 0 2 2 0 014 0zM7 8a2 2 0 11-4 0 2 2 0 014 0zM7 14a2 2 0 11-4 0 2 2 0 014 0zM17 2a2 2 0 11-4 0 2 2 0 014 0zM17 8a2 2 0 11-4 0 2 2 0 014 0zM17 14a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Question Button */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={onAddQuestion}
          className="w-full bg-blue-50 text-purple-600 border-blue-200 hover:bg-blue-100 transition-colors"
        >
          <span className="mr-2">+</span>
          Add Question
        </Button>
      </div>
    </div>
  );
};