import { useState, useEffect } from 'react';
import { quizApi } from '../api/quiz';
import type { SubmitQuizResponse, QuizResultResponse } from '../types';

interface QuizResultDisplayProps {
  submitResult: SubmitQuizResponse;
  sessionToken: string;
}

export const QuizResultDisplay = ({ submitResult, sessionToken }: QuizResultDisplayProps) => {
  const [resultDetail, setResultDetail] = useState<QuizResultResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResultDetail();
  }, []);

  const loadResultDetail = async () => {
    setIsLoading(true);
    try {
      const detail = await quizApi.getQuizResult(submitResult.response_id, sessionToken);
      setResultDetail(detail);
    } catch (err) {
      console.error('Failed to load result detail:', err);
      setError('Failed to load result details');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Error</h2>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
            <div className="mt-6">
              <p className="text-sm text-gray-700 font-medium">Your submission was successful!</p>
              <p className="text-xs text-gray-500 mt-1">{submitResult.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isQuiz = resultDetail?.form.form_type === 'quiz';
  const score = submitResult.score || resultDetail?.result.score;
  const isPassed = submitResult.is_passed ?? resultDetail?.result.is_passed;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Result Summary */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="text-center">
            {/* Success Icon */}
            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${
              isQuiz && isPassed ? 'bg-green-100' : isQuiz && !isPassed ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              {isQuiz && isPassed ? (
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : isQuiz && !isPassed ? (
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-bold text-gray-900">
              {isQuiz ? (isPassed ? 'Congratulations!' : 'Quiz Completed') : 'Thank You!'}
            </h1>
            <p className="mt-2 text-gray-600">
              {submitResult.message}
            </p>

            {submitResult.was_auto_submitted && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⏰ Your quiz was automatically submitted because time expired
                </p>
              </div>
            )}

            {/* Score Display for Quiz */}
            {isQuiz && score !== undefined && (
              <div className="mt-6">
                <div className="inline-block">
                  <div className="text-6xl font-bold text-blue-600">
                    {score.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    Your Score
                  </div>
                </div>

                {resultDetail?.form.passing_score !== undefined && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      Passing Score: {resultDetail.form.passing_score}%
                    </p>
                    {isPassed ? (
                      <p className="text-sm font-medium text-green-600 mt-1">
                        ✓ You passed!
                      </p>
                    ) : (
                      <p className="text-sm font-medium text-red-600 mt-1">
                        ✗ You did not pass
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Time Spent */}
            <div className="mt-6 flex justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {formatTime(submitResult.time_spent_seconds)}
                </div>
                <div className="text-sm text-gray-500">Time Spent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {new Date(submitResult.submitted_at).toLocaleTimeString()}
                </div>
                <div className="text-sm text-gray-500">Submitted At</div>
              </div>
            </div>
          </div>
        </div>

        {/* Answer Review (if quiz and show_correct_answers is true) */}
        {isQuiz && resultDetail?.form.show_correct_answers && resultDetail.result.answers && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Answer Review</h2>
            <div className="space-y-4">
              {resultDetail.result.answers.map((answer, index) => (
                <div
                  key={answer.field_id}
                  className={`border rounded-lg p-4 ${
                    answer.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {index + 1}. {answer.label}
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Your Answer:</span>{' '}
                          {typeof answer.user_answer === 'object'
                            ? JSON.stringify(answer.user_answer)
                            : answer.user_answer}
                        </p>
                      </div>
                      {answer.points_earned !== undefined && answer.max_points !== undefined && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            Points: {answer.points_earned} / {answer.max_points}
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      {answer.is_correct ? (
                        <div className="flex items-center text-green-600">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Non-quiz thank you message */}
        {!isQuiz && (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <p className="text-gray-700">
              Your responses have been recorded. Thank you for your time!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
