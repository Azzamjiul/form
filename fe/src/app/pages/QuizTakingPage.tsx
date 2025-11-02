import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { QuizStartPage } from '../../features/forms/components/QuizStartPage';
import { QuizTakingInterface } from '../../features/forms/components/QuizTakingInterface';
import { QuizResultDisplay } from '../../features/forms/components/QuizResultDisplay';
import { quizApi } from '../../features/forms/api/quiz';
import type { StartQuizResponse, SubmitQuizResponse, ResumeQuizResponse } from '../../features/forms/types';

type QuizState = 'detect' | 'start' | 'taking' | 'result';

const QuizTakingPage = () => {
  const { accessToken } = useParams<{ accessToken: string }>();
  const [quizState, setQuizState] = useState<QuizState>('detect');
  const [sessionData, setSessionData] = useState<StartQuizResponse | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitQuizResponse | null>(null);
  const [isResuming, setIsResuming] = useState(false);

  // Check for existing session on component mount
  useEffect(() => {
    if (quizState === 'detect') {
      const savedSessionToken = localStorage.getItem('quiz_session_token');
      if (savedSessionToken) {
        attemptResumeSession(savedSessionToken);
      } else {
        setQuizState('start');
      }
    }
  }, [quizState]);

  const attemptResumeSession = async (sessionToken: string) => {
    setIsResuming(true);
    try {
      const resumeData: ResumeQuizResponse = await quizApi.resumeQuiz({
        session_token: sessionToken
      });

      if (resumeData.is_resumed) {
        // Convert resume data to session data format
        // We need to get the full form content, so we'll fetch it
        const quizContent = await quizApi.getQuizContent(
          resumeData.session_id,
          sessionToken
        );

        const sessionData: StartQuizResponse = {
          session_id: resumeData.session_id,
          session_token: sessionToken,
          form_id: quizContent.form.form_id,
          whitelist_id: "", // This will be populated from the original session
          started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + resumeData.time_remaining_seconds * 1000).toISOString(),
          time_limit_minutes: 0, // This info isn't available in quiz content, will need to be fetched separately
          form: {
            title: quizContent.form.title,
            description: "", // Not available in QuizFormBasicInfo
            form_type: quizContent.form.form_type,
            shuffle_questions: false, // Not available in QuizFormBasicInfo
            total_questions: 0 // Not available in QuizFormBasicInfo
          }
        };

        setSessionData(sessionData);
        setAnswers(resumeData.saved_answers);
        setQuizState('taking');
      } else {
        // No active session to resume, clear the token
        localStorage.removeItem('quiz_session_token');
        setQuizState('start');
      }
    } catch (error) {
      console.error('Failed to resume session:', error);
      // Clear invalid session token
      localStorage.removeItem('quiz_session_token');
      setQuizState('start');
    } finally {
      setIsResuming(false);
    }
  };

  const [answers, setAnswers] = useState<Record<string, any>>({});

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
    // Store session token in localStorage for persistence across page refreshes
    localStorage.setItem('quiz_session_token', data.session_token);
    setAnswers({});
    setQuizState('taking');
  };

  const handleQuizCompleted = (result: SubmitQuizResponse) => {
    setSubmitResult(result);
    // Clear session token when quiz is completed
    localStorage.removeItem('quiz_session_token');
    setQuizState('result');
  };

  // Show loading state while detecting/resuming session
  if (quizState === 'detect' || isResuming) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              {isResuming ? 'Resuming Session...' : 'Loading...'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isResuming
                ? 'Restoring your previous quiz session.'
                : 'Preparing your quiz experience.'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          initialAnswers={answers}
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
