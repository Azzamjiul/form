import { useState, useEffect } from 'react';
import { whitelistApi } from '../api/whitelist';
import { quizApi } from '../api/quiz';
import type { ValidateTokenResponse, StartQuizResponse } from '../types';

interface QuizStartPageProps {
  accessToken: string;
  onQuizStarted: (sessionData: StartQuizResponse) => void;
}

export const QuizStartPage = ({ accessToken, onQuizStarted }: QuizStartPageProps) => {
  const [validation, setValidation] = useState<ValidateTokenResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    validateToken();
  }, [accessToken]);

  const validateToken = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await whitelistApi.validateAccessToken(accessToken);
      setValidation(result);

      if (!result.is_valid) {
        setError('Invalid or expired access token');
      }
    } catch (err) {
      console.error('Failed to validate token:', err);
      setError('Failed to validate access token');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    setIsStarting(true);
    setError(null);
    try {
      const result = await quizApi.startQuiz({ access_token: accessToken });
      onQuizStarted(result);
    } catch (err: any) {
      console.error('Failed to start quiz:', err);
      setError(err.message || 'Failed to start quiz');
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating access...</p>
        </div>
      </div>
    );
  }

  if (error || !validation?.is_valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Access Denied</h2>
            <p className="mt-2 text-sm text-gray-600">
              {error || 'Your access token is invalid or has expired.'}
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Please contact the form administrator for a new access link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!validation.can_attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">No Attempts Remaining</h2>
            <p className="mt-2 text-sm text-gray-600">
              You have used all your available attempts for this {validation.form?.form_type || 'form'}.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Attempts remaining: {validation.attempts_remaining || 0}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {validation.form?.title}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome, {validation.name}!
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Quiz Information</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Type: <span className="font-medium ml-1 capitalize">{validation.form?.form_type}</span>
              </li>
              {validation.form?.time_limit_minutes && validation.form.time_limit_minutes > 0 && (
                <li className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Time Limit: <span className="font-medium ml-1">{validation.form.time_limit_minutes} minutes</span>
                </li>
              )}
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Attempts Remaining: <span className="font-medium ml-1">{validation.attempts_remaining}</span>
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Expires: <span className="font-medium ml-1">{new Date(validation.expires_at || '').toLocaleString()}</span>
              </li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">Important Notes</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
              <li>Make sure you have a stable internet connection</li>
              <li>Your answers will be auto-saved as you progress</li>
              <li>Once started, the timer cannot be paused</li>
              <li>You can navigate between questions before final submission</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleStartQuiz}
            disabled={isStarting}
            className="flex-1 px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStarting ? 'Starting...' : `Start ${validation.form?.form_type === 'quiz' ? 'Quiz' : 'Survey'}`}
          </button>
        </div>

        <p className="mt-4 text-xs text-center text-gray-500">
          By starting, you agree to complete the {validation.form?.form_type} honestly and to the best of your ability.
        </p>
      </div>
    </div>
  );
};
