import React, { useState } from 'react';
import type { FormWithSections, FormSection, FormField } from '../types';
import { Card, Button, Input, Textarea, Toggle } from '../../../components/ui';

interface QuestionCanvasProps {
  form?: FormWithSections;
  allFields?: (FormField & { section_title?: string })[];
  onAddQuestion?: () => void;
  onAddSection?: () => void;
  isCreating?: boolean;
}

export const QuestionCanvas: React.FC<QuestionCanvasProps> = ({
  form,
  allFields = [],
  onAddQuestion,
  onAddSection,
  isCreating = false,
}) => {

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
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <div className="text-gray-500 text-sm">Dropdown</div>
          </div>
        );
      case 'linear_scale':
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
            </div>
            <div className="flex justify-between">
              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="w-8 h-8 border-2 border-gray-300 rounded" />
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
      default:
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <div className="text-gray-500 text-sm">Unknown field type</div>
          </div>
        );
    }
  };

  // Single question editor component
  const QuestionCard: React.FC<{ field: FormField & { section_title?: string } }> = ({ field }) => {
    const [fieldTitle, setFieldTitle] = useState(field.label || '');
    const [fieldDescription, setFieldDescription] = useState(field.description || '');
    const [fieldRequired, setFieldRequired] = useState(field.is_required || false);

    return (
      <Card className="p-6">
        {/* Drag Handle */}
        <div className="flex items-start gap-3 mb-4">
          <div className="opacity-0 hover:opacity-100 transition-opacity cursor-move mt-1">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>

          <div className="flex-1">
            {/* Question Title */}
            <div className="mb-4">
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
            <div className="mb-4">
              <Textarea
                value={fieldDescription}
                onChange={(e) => setFieldDescription(e.target.value)}
                placeholder="Description (optional)"
                className="text-sm text-gray-600 border-2 border-transparent hover:border-gray-300 focus:border-purple-600 rounded-none resize-none overflow-hidden"
                rows={1}
                style={{ minHeight: 'auto' }}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-4" />

            {/* Question Content Preview */}
            <div className="mb-4">
              {getFieldPreview(field)}
            </div>

            {/* Answer Options (for choice questions) */}
            {['multiple_choice', 'checkbox'].includes(field.field_type || '') && (
              <div className="space-y-3 mb-4">
                {['Option 1', 'Option 2'].map((option, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    {field.field_type === 'multiple_choice' ? (
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
                <Button
                  variant="ghost"
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  onClick={() => console.log('Add option clicked')}
                >
                  Add option
                </Button>
              </div>
            )}

            {/* Required Toggle */}
            <div className="flex items-center gap-3 mt-4">
              <Toggle
                checked={fieldRequired}
                onCheckedChange={setFieldRequired}
              />
              <span className="text-sm text-gray-700">Required</span>
            </div>
          </div>

          {/* Question Actions */}
          <div className="flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log('Duplicate question clicked')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => console.log('Delete question clicked')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  // Section component
  const SectionCard: React.FC<{ section: FormSection }> = ({ section }) => (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{section.title}</h2>
        {section.description && (
          <p className="text-gray-600 text-sm">{section.description}</p>
        )}
      </div>
      <div className="space-y-6">
        {section.fields?.map((field) => (
          <QuestionCard key={field.field_id} field={field} />
        ))}
      </div>
      <div className="flex justify-center mt-6">
        <Button
          variant="outline"
          onClick={() => onAddQuestion?.()}
          className="text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
          disabled={isCreating}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Question
        </Button>
      </div>
    </div>
  );

  // Empty state
  if (allFields.length === 0) {
    return (
      <div className="py-8">
        {/* Empty State - Google Forms style */}
        <div className="text-center py-16">
          <div className="text-gray-400 mb-6">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Create your form
          </h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            Add questions, sections, and customize your form to get started.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => onAddQuestion?.()} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Add Question'}
            </Button>
            <Button variant="outline" onClick={() => onAddSection?.()} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Add Section'}
            </Button>
          </div>
        </div>

              </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Render sections and their fields */}
      {form?.sections?.map((section) => (
        <SectionCard key={section.section_id} section={section} />
      ))}

      {/* Add Question/Section buttons at the end */}
      <div className="flex gap-3 justify-center">
        <Button onClick={() => onAddQuestion?.()} disabled={isCreating}>
          {isCreating ? 'Creating...' : 'Add Question'}
        </Button>
        <Button variant="outline" onClick={() => onAddSection?.()} disabled={isCreating}>
          {isCreating ? 'Creating...' : 'Add Section'}
        </Button>
      </div>
    </div>
  );
};