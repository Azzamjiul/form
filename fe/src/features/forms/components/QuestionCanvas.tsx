import React, { useState } from 'react';
import type { FormWithSections, FormSection, FormField } from '../types';
import { Card, Button, Input, Textarea, Toggle } from '../../../components/ui';

interface QuestionCanvasProps {
  form?: FormWithSections;
  selectedSection?: FormSection | undefined;
  selectedField?: (FormField & { section_title?: string }) | undefined;
  onFormUpdate?: (data: { title?: string; description?: string }) => void;
  onFieldSelect?: (fieldId: string, sectionId?: string) => void;
}

export const QuestionCanvas: React.FC<QuestionCanvasProps> = ({
  selectedField,
}) => {
  const [fieldTitle, setFieldTitle] = useState(selectedField?.label || '');
  const [fieldDescription, setFieldDescription] = useState(selectedField?.description || '');
  const [fieldRequired, setFieldRequired] = useState(selectedField?.is_required || false);

  const getFieldPreview = (field: FormField) => {
    switch (field.field_type) {
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
          <div className="space-y-2">
            {['Option 1', 'Option 2'].map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                <div className="text-gray-700 text-sm">{option}</div>
              </div>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {['Option 1', 'Option 2'].map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-gray-300 rounded" />
                <div className="text-gray-700 text-sm">{option}</div>
              </div>
            ))}
          </div>
        );
      case 'dropdown':
        return (
          <div className="border border-gray-300 rounded-lg px-4 py-3 bg-white">
            <div className="text-gray-700 text-sm">Dropdown</div>
          </div>
        );
      case 'linear_scale':
        return (
          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm">1</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="w-8 h-8 border-2 border-gray-300 rounded-full" />
              ))}
            </div>
            <span className="text-gray-600 text-sm">5</span>
          </div>
        );
      case 'date':
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <div className="text-gray-500 text-sm">Date picker</div>
          </div>
        );
      case 'time':
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <div className="text-gray-500 text-sm">Time picker</div>
          </div>
        );
      case 'file_upload':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-gray-400 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="text-gray-600 text-sm">Click to upload file</div>
          </div>
        );
      default:
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <div className="text-gray-500 text-sm">Unknown field type</div>
          </div>
        );
    }
  };

  if (!selectedField) {
    return (
      <div className="flex-1 ml-60 mr-20 p-8">
        <div className="max-w-2xl mx-auto">
          {/* Empty State */}
          <div className="text-center py-16">
            <div className="text-gray-400 mb-6">
              <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select a question to edit
            </h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Choose a question from the left sidebar to start editing, or add a new question to get started.
            </p>
            <div className="mt-6">
              <Button onClick={() => console.log('Add question clicked')}>
                Add Question
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 ml-60 mr-20 p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        {/* Question Card */}
        <Card className="mb-6">
          {/* Question Title */}
          <div className="mb-6">
            <Textarea
              value={fieldTitle}
              onChange={(e) => setFieldTitle(e.target.value)}
              placeholder="Question"
              className="text-lg font-semibold border-2 border-transparent hover:border-gray-300 focus:border-purple-600 rounded-none resize-none overflow-hidden"
              rows={1}
              style={{ minHeight: 'auto' }}
            />
          </div>

          {/* Question Description */}
          {(fieldDescription || true) && (
            <div className="mb-6">
              <Textarea
                value={fieldDescription}
                onChange={(e) => setFieldDescription(e.target.value)}
                placeholder="Description (optional)"
                className="text-sm text-gray-600 border-2 border-transparent hover:border-gray-300 focus:border-purple-600 rounded-none resize-none overflow-hidden"
                rows={1}
                style={{ minHeight: 'auto' }}
              />
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200 mb-6" />

          {/* Question Content Preview */}
          <div className="mb-6">
            {getFieldPreview(selectedField)}
          </div>

          {/* Answer Options (for choice questions) */}
          {['multiple_choice', 'checkbox'].includes(selectedField.field_type || '') && (
            <div className="space-y-3 mb-6">
              {['Option 1', 'Option 2'].map((option, index) => (
                <div key={index} className="flex items-center gap-3 group">
                  {selectedField.field_type === 'multiple_choice' ? (
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex-shrink-0" />
                  ) : (
                    <div className="w-6 h-6 border-2 border-gray-300 rounded flex-shrink-0" />
                  )}
                  <Input
                    value={option}
                    onChange={(e) => console.log('Option changed:', e.target.value)}
                    className="flex-1 border-2 border-transparent hover:border-gray-300 focus:border-purple-600 rounded-none"
                    placeholder="Option"
                  />
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => console.log('Delete option clicked')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}

              <button className="flex items-center gap-3 text-purple-600 text-sm font-medium hover:text-purple-700 transition-colors">
                {selectedField.field_type === 'multiple_choice' ? (
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />
                ) : (
                  <div className="w-6 h-6 border-2 border-gray-300 rounded" />
                )}
                Add option or add "Other"
              </button>
            </div>
          )}

          {/* Required Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Required</span>
            </div>
            <Toggle
              checked={fieldRequired}
              onChange={(checked) => setFieldRequired(checked as any)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => console.log('Duplicate clicked')}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Duplicate
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => console.log('Delete clicked')}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => console.log('More options clicked')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </Button>
            </div>
          </div>
        </Card>

        {/* Add Question Button Between Questions */}
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log('Add question below clicked')}
              className="text-gray-700 hover:text-gray-900"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add question
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log('Add section below clicked')}
              className="text-gray-700 hover:text-gray-900"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
              </svg>
              Add section
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};