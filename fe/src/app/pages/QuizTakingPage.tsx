import { useState } from 'react';
import { useParams } from 'react-router';
import { QuizStartPage } from '../../features/forms/components/QuizStartPage';
import { QuizTakingInterface } from '../../features/forms/components/QuizTakingInterface';
import { QuizResultDisplay } from '../../features/forms/components/QuizResultDisplay';
import type { StartQuizResponse, SubmitQuizResponse } from '../../features/forms/types';

type QuizState = 'start' | 'taking' | 'result';

const QuizTakingPage = () => {
  const { accessToken } = useParams<{ accessToken: string }>();
  const [quizState, setQuizState] = useState<QuizState>('start');
  const [sessionData, setSessionData] = useState<StartQuizResponse | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitQuizResponse | null>(null);

  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Invalid Access</h2>
            <p className="mt-2 text-sm text-gray-600">
              No access token provided. Please use the link provided to you.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleQuizStarted = (data: StartQuizResponse) => {
    setSessionData(data);
    setQuizState('taking');
  };

  const handleQuizCompleted = (result: SubmitQuizResponse) => {
    setSubmitResult(result);
    setQuizState('result');
  };

  return (
    <div>
      {quizState === 'start' && (
        <QuizStartPage
          accessToken={accessToken}
          onQuizStarted={handleQuizStarted}
        />
      )}

      {quizState === 'taking' && sessionData && (
        <QuizTakingInterface
          sessionData={sessionData}
          onQuizCompleted={handleQuizCompleted}
        />
      )}

      {quizState === 'result' && submitResult && sessionData && (
        <QuizResultDisplay
          submitResult={submitResult}
          sessionToken={sessionData.session_token}
        />
      )}
    </div>
  );
};

export default QuizTakingPage;
