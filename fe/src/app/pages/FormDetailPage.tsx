import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { formsApi } from '../../features/forms';

export default function FormDetailPage() {
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
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/forms')}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
          >
            ← Back to Forms
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{form.title}</h1>
              {form.description && (
                <p className="text-gray-600 mt-2">{form.description}</p>
              )}
            </div>
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

        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Form Settings</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
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
            <div>
              <span className="text-gray-600">Show Correct Answers:</span>{' '}
              <span className="font-medium">{form.show_correct_answers ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-gray-600">Shuffle Questions:</span>{' '}
              <span className="font-medium">{form.shuffle_questions ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {form.sections && form.sections.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Sections & Questions</h2>
            {form.sections.map((section) => (
              <div key={section.section_id} className="bg-white border rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{section.title}</h3>
                {section.description && (
                  <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                )}

                {section.fields && section.fields.length > 0 ? (
                  <div className="space-y-3">
                    {section.fields.map((field) => (
                      <div
                        key={field.field_id}
                        className="border-l-2 border-blue-500 pl-4 py-2"
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
                            <div className="text-sm font-medium text-blue-600">
                              {field.points} pts
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    No questions in this section yet
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border rounded-lg p-8 text-center">
            <div className="text-gray-600 mb-2">No sections or questions yet</div>
            <div className="text-sm text-gray-500">
              Add sections and questions to build your form
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
