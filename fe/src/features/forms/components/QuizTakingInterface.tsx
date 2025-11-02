import { useState, useEffect, useCallback } from 'react';
import { quizApi } from '../api/quiz';
import type { StartQuizResponse, QuizContentResponse, SubmitQuizResponse } from '../types';
import { QuizTimer } from './QuizTimer';

interface QuizTakingInterfaceProps {
  sessionData: StartQuizResponse;
  onQuizCompleted: (result: SubmitQuizResponse) => void;
}

export const QuizTakingInterface = ({ sessionData, onQuizCompleted }: QuizTakingInterfaceProps) => {
  const [quizContent, setQuizContent] = useState<QuizContentResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  useEffect(() => {
    loadQuizContent();
  }, []);

  // Auto-save answers with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      Object.entries(answers).forEach(([fieldId, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          autoSaveAnswer(fieldId, value);
        }
      });
    }, 2000); // Debounce for 2 seconds

    return () => clearTimeout(timeoutId);
  }, [answers]);

  const loadQuizContent = async () => {
    setIsLoading(true);
    try {
      const content = await quizApi.getQuizContent(
        sessionData.session_id,
        sessionData.session_token
      );
      setQuizContent(content);
    } catch (err) {
      console.error('Failed to load quiz content:', err);
      setError('Failed to load quiz content');
    } finally {
      setIsLoading(false);
    }
  };

  const autoSaveAnswer = async (fieldId: string, value: any) => {
    try {
      await quizApi.autoSaveAnswer(
        sessionData.session_id,
        sessionData.session_token,
        {
          field_id: fieldId,
          answer_value: { value },
        }
      );
    } catch (err) {
      console.error('Failed to auto-save answer:', err);
      // Don't show error to user for auto-save failures
    }
  };

  const handleAnswerChange = (fieldId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!quizContent) return;

    // Check required fields
    const requiredFields = quizContent.sections
      .flatMap(s => s.fields)
      .filter(f => f.is_required);

    const missingFields = requiredFields.filter(
      f => !answers[f.field_id] || answers[f.field_id] === ''
    );

    if (missingFields.length > 0) {
      alert(`Please answer all required questions (${missingFields.length} remaining)`);
      return;
    }

    if (!confirm('Are you sure you want to submit? You cannot change your answers after submission.')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await quizApi.submitQuiz(
        sessionData.session_id,
        sessionData.session_token,
        {
          answers: Object.entries(answers).map(([field_id, value]) => ({
            field_id,
            answer_value: { value },
          })),
        }
      );
      onQuizCompleted(result);
    } catch (err: any) {
      console.error('Failed to submit quiz:', err);
      setError(err.message || 'Failed to submit quiz');
      setIsSubmitting(false);
    }
  };

  const handleTimeExpired = useCallback(() => {
    // Auto-submit when time expires
    handleSubmit();
  }, [answers, quizContent]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quizContent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Error</h2>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const currentSection = quizContent.sections[currentSectionIndex];
  const totalSections = quizContent.sections.length;
  const allFields = quizContent.sections.flatMap(s => s.fields);
  const answeredCount = allFields.filter(f => answers[f.field_id]).length;
  const progressPercentage = allFields.length > 0 ? (answeredCount / allFields.length) * 100 : 0;

  // Handle empty sections
  if (!currentSection || totalSections === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-yellow-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">No Content Available</h2>
          <p className="mt-2 text-sm text-gray-600">This quiz has no sections or questions yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                dangerouslySetInnerHTML={{ __html: quizContent.form.title }}
              />
              <p className="text-sm text-gray-500 mt-1">
                Section {currentSectionIndex + 1} of {totalSections}: {currentSection.title}
              </p>
            </div>
            {sessionData.time_limit_minutes > 0 && (
              <QuizTimer
                expiresAt={sessionData.expires_at}
                onTimeExpired={handleTimeExpired}
              />
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {answeredCount} of {allFields.length} questions answered
          </p>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="space-y-6">
            {currentSection.fields.map((field, index) => (
              <div key={field.field_id} className="border-b border-gray-200 pb-6 last:border-0">
                <label className="block mb-2">
                  <span className="text-gray-900 font-medium">
                    {index + 1}. {field.label}
                    {field.is_required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                  {field.description && (
                    <span className="block text-sm text-gray-500 mt-1">
                      {field.description}
                    </span>
                  )}
                </label>

                {/* Text input */}
                {field.field_type === 'text' && (
                  <input
                    type="text"
                    value={answers[field.field_id] || ''}
                    onChange={(e) => handleAnswerChange(field.field_id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your answer"
                    required={field.is_required}
                  />
                )}

                {/* Number input */}
                {field.field_type === 'number' && (
                  <input
                    type="number"
                    value={answers[field.field_id] || ''}
                    onChange={(e) => handleAnswerChange(field.field_id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter a number"
                    required={field.is_required}
                  />
                )}

                {/* Email input */}
                {field.field_type === 'email' && (
                  <input
                    type="email"
                    value={answers[field.field_id] || ''}
                    onChange={(e) => handleAnswerChange(field.field_id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                    required={field.is_required}
                  />
                )}

                {/* Textarea */}
                {field.field_type === 'textarea' && (
                  <textarea
                    value={answers[field.field_id] || ''}
                    onChange={(e) => handleAnswerChange(field.field_id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Enter your answer"
                    required={field.is_required}
                  />
                )}

                {/* Multiple choice / Single choice */}
                {(field.field_type === 'multiple_choice' || field.field_type === 'single_choice') && field.options && (
                  <div className="space-y-2">
                    {field.options.map((option) => (
                      <div key={option.id} className="flex items-center">
                        <input
                          type="radio"
                          id={`${field.field_id}-${option.id}`}
                          name={field.field_id}
                          value={option.id}
                          checked={answers[field.field_id] === option.id}
                          onChange={(e) => handleAnswerChange(field.field_id, e.target.value)}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500"
                          required={field.is_required}
                        />
                        <label htmlFor={`${field.field_id}-${option.id}`} className="text-gray-700">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {/* Checkbox */}
                {field.field_type === 'checkbox' && field.options && (
                  <div className="space-y-2">
                    {field.options.map((option) => {
                      const selectedOptions = answers[field.field_id] || [];
                      return (
                        <div key={option.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`${field.field_id}-${option.id}`}
                            value={option.id}
                            checked={Array.isArray(selectedOptions) && selectedOptions.includes(option.id)}
                            onChange={(e) => {
                              const currentValues = Array.isArray(answers[field.field_id])
                                ? [...answers[field.field_id]]
                                : [];
                              if (e.target.checked) {
                                handleAnswerChange(field.field_id, [...currentValues, option.id]);
                              } else {
                                handleAnswerChange(
                                  field.field_id,
                                  currentValues.filter((v: string) => v !== option.id)
                                );
                              }
                            }}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
                          />
                          <label htmlFor={`${field.field_id}-${option.id}`} className="text-gray-700">
                            {option.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Dropdown */}
                {field.field_type === 'dropdown' && field.options && (
                  <select
                    value={answers[field.field_id] || ''}
                    onChange={(e) => handleAnswerChange(field.field_id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={field.is_required}
                  >
                    <option value="">Select an option</option>
                    {field.options.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {/* Linear Scale */}
                {field.field_type === 'linear_scale' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      {Array.from(
                        { length: (field.max_value || 10) - (field.min_value || 1) + 1 },
                        (_, i) => (field.min_value || 1) + i
                      ).map((value) => (
                        <label key={value} className="flex flex-col items-center cursor-pointer">
                          <input
                            type="radio"
                            name={field.field_id}
                            value={value}
                            checked={answers[field.field_id] === value.toString()}
                            onChange={(e) => handleAnswerChange(field.field_id, e.target.value)}
                            className="mb-1"
                            required={field.is_required}
                          />
                          <span className="text-sm">{value}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date */}
                {field.field_type === 'date' && (
                  <input
                    type="date"
                    value={answers[field.field_id] || ''}
                    onChange={(e) => handleAnswerChange(field.field_id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={field.is_required}
                  />
                )}

                {/* Time */}
                {field.field_type === 'time' && (
                  <input
                    type="time"
                    value={answers[field.field_id] || ''}
                    onChange={(e) => handleAnswerChange(field.field_id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={field.is_required}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentSectionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentSectionIndex === 0}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous Section
            </button>

            <div className="flex gap-3">
              {currentSectionIndex < totalSections - 1 ? (
                <button
                  onClick={() => setCurrentSectionIndex(prev => prev + 1)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Next Section
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
