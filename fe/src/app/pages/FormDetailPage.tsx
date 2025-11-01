import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { formsApi } from '../../features/forms';
import { DashboardLayout } from '../../components/layout';
import { ProtectedRoute } from '../../features/auth';

export default function FormDetailPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <FormBuilderContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function FormBuilderContent() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => formsApi.getFormById(formId!),
    enabled: !!formId,
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="text-gray-500">Loading form...</div>
        </div>
      </div>
    );
  }

  if (error || !data?.success || !data?.data) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="text-red-600">Error loading form. Please try again.</div>
          <button
            onClick={() => navigate('/forms')}
            className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to Forms
          </button>
        </div>
      </div>
    );
  }

  const form = data.data;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/forms')}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
          >
            ← Back to Forms
          </button>

          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
              {form.description && (
                <p className="text-gray-600 mt-2">{form.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  form.is_published
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {form.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>
        </div>

        {/* Form Settings Card */}
        <div className="bg-white border-t-8 border-t-purple-600 rounded-lg p-6 mb-4 shadow-sm">
          <div className="mb-4">
            <input
              type="text"
              value={form.title}
              className="text-2xl font-medium border-b-2 border-transparent hover:border-gray-300 focus:border-purple-600 focus:outline-none w-full px-2 py-1 transition-colors"
              placeholder="Form title"
              readOnly
            />
            {form.description && (
              <textarea
                value={form.description}
                className="text-sm text-gray-600 border-b-2 border-transparent hover:border-gray-300 focus:border-purple-600 focus:outline-none w-full px-2 py-1 mt-2 resize-none transition-colors"
                placeholder="Form description"
                rows={2}
                readOnly
              />
            )}
          </div>

          <div className="pt-4 border-t grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Type:</span>{' '}
              <span className="font-medium capitalize">{form.form_type}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Points:</span>{' '}
              <span className="font-medium">{form.total_points}</span>
            </div>
            {form.time_limit_minutes > 0 && (
              <div>
                <span className="text-gray-600">Time Limit:</span>{' '}
                <span className="font-medium">{form.time_limit_minutes} minutes</span>
              </div>
            )}
            {form.passing_score !== undefined && (
              <div>
                <span className="text-gray-600">Passing Score:</span>{' '}
                <span className="font-medium">{form.passing_score}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Sections and Questions */}
        <div className="space-y-4">
          {form.sections && form.sections.length > 0 ? (
            form.sections.map((section, sectionIndex) => (
              <div key={section.section_id}>
                {/* Section Card */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={section.title}
                        className="text-lg font-semibold border-b-2 border-transparent hover:border-gray-300 focus:border-purple-600 focus:outline-none w-full px-2 py-1 transition-colors"
                        placeholder="Section title"
                        readOnly
                      />
                      {section.description && (
                        <textarea
                          value={section.description}
                          className="text-sm text-gray-600 border-b-2 border-transparent hover:border-gray-300 focus:border-purple-600 focus:outline-none w-full px-2 py-1 mt-2 resize-none transition-colors"
                          placeholder="Section description"
                          rows={1}
                          readOnly
                        />
                      )}
                    </div>
                  </div>

                  {/* Fields in Section */}
                  {section.fields && section.fields.length > 0 && (
                    <div className="space-y-3 mt-4">
                      {section.fields.map((field, fieldIndex) => (
                        <div
                          key={field.field_id}
                          className="border-l-4 border-purple-500 pl-4 py-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {field.label}
                                {field.is_required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </div>
                              {field.description && (
                                <div className="text-sm text-gray-600 mt-1">
                                  {field.description}
                                </div>
                              )}
                              <div className="text-xs text-gray-500 mt-1">
                                Type: {field.field_type || field.content_type}
                              </div>
                            </div>
                            {field.points > 0 && (
                              <div className="text-sm font-medium text-purple-600">
                                {field.points} pts
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Question Button - Inside Section */}
                  <button
                    onClick={() => alert('Add question functionality coming soon')}
                    className="mt-4 w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">+</span>
                    Add Question
                  </button>
                </div>

                {/* Add Button Between Sections */}
                <div className="flex items-center justify-center gap-3 py-2">
                  <button
                    onClick={() => alert('Add section functionality coming soon')}
                    className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-50 shadow-sm transition-colors"
                    title="Add section"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => alert('Add question functionality coming soon')}
                    className="p-2 rounded-full bg-white border border-gray-300 hover:bg-gray-50 shadow-sm transition-colors"
                    title="Add question"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-gray-600 mb-2 font-medium">No sections or questions yet</div>
              <div className="text-sm text-gray-500 mb-6">
                Click below to add your first section
              </div>
              <button
                onClick={() => alert('Add section functionality coming soon')}
                className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                Add Section
              </button>
            </div>
          )}
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-8 right-8 flex flex-col gap-3">
          <button
            onClick={() => alert('Add section functionality coming soon')}
            className="p-4 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
            title="Add section"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
