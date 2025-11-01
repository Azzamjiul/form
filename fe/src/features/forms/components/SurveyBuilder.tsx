import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { formsApi } from '../api/forms';
import { fieldsApi } from '../api/fields';
import type { FormWithSections } from '../types';
import { CreateSectionDialog } from './CreateSectionDialog';
import { CreateFieldDialog } from './CreateFieldDialog';
import { DraggableQuestionsSidebar } from './DraggableQuestionsSidebar';
import { QuestionCanvas } from './QuestionCanvas';
import { BuilderToolbar } from './BuilderToolbar';
import { useAutoSave } from '../../../hooks/useAutoSave';
import { useResponsive } from '../../../hooks/useResponsive';

interface SurveyBuilderProps {
  formId: string;
  initialForm: FormWithSections;
}

export const SurveyBuilder: React.FC<SurveyBuilderProps> = ({ formId, initialForm }) => {
  const [form, setForm] = useState(initialForm);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [showCreateSection, setShowCreateSection] = useState(false);
  const [showCreateField, setShowCreateField] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const queryClient = useQueryClient();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Auto-save functionality
  const { triggerSave } = useAutoSave(
    form,
    async (formData) => {
      const response = await formsApi.updateForm(formId, {
        title: formData.title,
        description: formData.description,
      });
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to save form');
      }
    },
    {
      delay: 2000,
      onSave: setIsSaving,
      onError: (error) => console.error('Auto-save error:', error),
    }
  );

  
  const handleSelectQuestion = (fieldId: string) => {
    setSelectedFieldId(fieldId);
  };

  const handleQuestionReorder = async (oldIndex: number, newIndex: number) => {
    const allFields = (form.sections || []).flatMap(section =>
      (section.fields || []).map(field => ({
        ...field,
        section_id: section.section_id,
      }))
    );

    if (oldIndex < 0 || oldIndex >= allFields.length || newIndex < 0 || newIndex >= allFields.length) {
      return;
    }

    const reorderedFields = [...allFields];
    const [movedField] = reorderedFields.splice(oldIndex, 1);
    reorderedFields.splice(newIndex, 0, movedField);

    // Update order values
    const updatedFields = reorderedFields.map((field, index) => ({
      field_id: field.field_id,
      order_global: index + 1,
      section_id: field.section_id,
      order_in_section: index + 1,
    }));

    try {
      await fieldsApi.reorderFields(formId, { items: updatedFields });
      queryClient.invalidateQueries({ queryKey: ['form', formId] });
    } catch (error) {
      console.error('Failed to reorder fields:', error);
    }
  };

  // Flatten all fields for the questions list
  const allFields = (form.sections || []).flatMap(section =>
    (section.fields || []).map(field => ({
      ...field,
      section_id: section.section_id,
      section_title: section.title,
    }))
  );

  // Get selected field
  const selectedField = allFields.find(f => f.field_id === selectedFieldId);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Auto-save indicator */}
      {isSaving && (
        <div className="fixed top-16 right-4 bg-green-500 text-white px-3 py-1 rounded-lg text-sm z-50">
          Saving...
        </div>
      )}

      {/* Desktop Layout - 3 Column */}
      {isDesktop && (
        <>
          {/* Left Sidebar - Questions List with Drag & Drop */}
          <DraggableQuestionsSidebar
            questions={allFields}
            selectedQuestionId={selectedFieldId}
            onQuestionSelect={handleSelectQuestion}
            onQuestionReorder={handleQuestionReorder}
            onAddQuestion={() => setShowCreateField(true)}
          />

          {/* Center Canvas - Question Editor */}
          <QuestionCanvas
            selectedField={selectedField}
          />

          {/* Right Toolbar */}
          <BuilderToolbar
            onAddSection={() => setShowCreateSection(true)}
            onAddQuestion={() => setShowCreateField(true)}
            onAddImage={() => console.log('Add image clicked')}
            onAddVideo={() => console.log('Add video clicked')}
            onCustomize={() => console.log('Customize clicked')}
          />
        </>
      )}

      {/* Tablet Layout - Modified 3 Column */}
      {isTablet && (
        <>
          {/* Left Sidebar - Collapsible */}
          <div className="w-48 bg-white border-r border-gray-200 fixed left-0 top-0 h-screen z-10 flex flex-col">
            <div className="p-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {form.title || 'Untitled Form'}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-1">
                {allFields.map((question, index) => (
                  <div
                    key={question.field_id}
                    className={`
                      flex items-center h-12 px-3 cursor-pointer rounded-lg transition-all text-xs
                      ${selectedFieldId === question.field_id
                        ? 'bg-purple-50 border-l-4 border-purple-600'
                        : 'hover:bg-gray-50 border-l-4 border-transparent'
                      }
                    `}
                    onClick={() => handleSelectQuestion(question.field_id)}
                  >
                    <div className="w-4 text-center text-xs text-gray-500 font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 ml-2 mr-1">
                      <p className="text-xs text-gray-900 truncate">
                        {question.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={() => setShowCreateField(true)}
                className="w-full py-2 px-3 bg-blue-50 text-purple-600 border-blue-200 hover:bg-blue-100 transition-colors text-xs rounded-lg"
              >
                + Add Question
              </button>
            </div>
          </div>

          {/* Center Canvas */}
          <div className="flex-1 ml-48 mr-16">
            <QuestionCanvas
              selectedField={selectedField}
            />
          </div>

          {/* Right Toolbar - Smaller */}
          <div className="w-16 bg-white border-l border-gray-200 fixed right-0 top-0 h-screen z-10 flex flex-col">
            <div className="flex-1 py-2">
              <div className="space-y-1">
                <button
                  onClick={() => setShowCreateField(true)}
                  className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-100 mx-auto"
                  title="Add question"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowCreateSection(true)}
                  className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-100 mx-auto"
                  title="Add section"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile Layout - Single Column with Drawers */}
      {isMobile && (
        <div className="flex-1 relative">
          {/* Mobile Top Bar */}
          <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between sticky top-0 z-10">
            <button
              onClick={() => console.log('Mobile menu clicked')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-sm font-medium text-gray-900 truncate flex-1 mx-2">
              {form.title || 'Untitled Form'}
            </h2>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>

          {/* Mobile Canvas */}
          <div className="pb-20">
            <QuestionCanvas
              selectedField={selectedField}
            />
          </div>

          {/* Mobile Bottom Toolbar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-10">
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateField(true)}
                className="flex-1 py-2 px-3 bg-purple-600 text-white rounded-lg text-sm font-medium"
              >
                + Add Question
              </button>
              <button
                onClick={() => setShowCreateSection(true)}
                className="py-2 px-3 border border-gray-300 rounded-lg text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Questions Drawer (could be expanded) */}
          <div className="fixed top-14 left-0 right-0 bg-white border-b border-gray-200 p-3 z-10">
            <div className="flex gap-2 overflow-x-auto">
              {allFields.slice(0, 5).map((question, index) => (
                <button
                  key={question.field_id}
                  onClick={() => handleSelectQuestion(question.field_id)}
                  className={`
                    px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors
                    ${selectedFieldId === question.field_id
                      ? 'bg-purple-100 text-purple-700 border border-purple-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }
                  `}
                >
                  {index + 1}. {question.label.length > 15 ? question.label.substring(0, 15) + '...' : question.label}
                </button>
              ))}
              {allFields.length > 5 && (
                <button className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 border border-gray-200">
                  +{allFields.length - 5} more
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CreateSectionDialog
        formId={formId}
        isOpen={showCreateSection}
        onClose={() => setShowCreateSection(false)}
        onSectionCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['form', formId] });
        }}
        defaultOrderGlobal={Math.max(0, ...(form.sections?.map(s => s.order_global) || [0])) + 1}
      />

      <CreateFieldDialog
        formId={formId}
        isOpen={showCreateField}
        onClose={() => setShowCreateField(false)}
        onFieldCreated={() => {
          queryClient.invalidateQueries({ queryKey: ['form', formId] });
        }}
        defaultOrderGlobal={Math.max(0, ...allFields.map(f => f.order_global)) + 1}
      />
    </div>
  );
};