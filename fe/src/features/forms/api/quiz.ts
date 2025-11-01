import { api } from '../../../utils/api';
import type {
  StartQuizRequest,
  StartQuizResponse,
  QuizContentResponse,
  AutoSaveAnswerRequest,
  AutoSaveResponse,
  SessionStatusResponse,
  SubmitQuizRequest,
  SubmitQuizResponse,
  QuizResultResponse,
  ResumeQuizRequest,
  ResumeQuizResponse,
} from '../types';

// Create a separate instance for quiz API calls that don't use the standard auth
const createQuizApi = (sessionToken?: string) => {
  if (sessionToken) {
    // For quiz endpoints, we use session token in Authorization header
    return api.extend({
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });
  }
  return api;
};

export const quizApi = {
  /**
   * Start a quiz session with access token (no auth required)
   */
  startQuiz: async (data: StartQuizRequest): Promise<StartQuizResponse> => {
    const response = await api
      .post('quiz/start', {
        json: data,
      })
      .json<{ success: boolean; data: StartQuizResponse }>();

    return response.data;
  },

  /**
   * Get quiz content/questions
   */
  getQuizContent: async (
    sessionId: string,
    sessionToken: string
  ): Promise<QuizContentResponse> => {
    const quizApiInstance = createQuizApi(sessionToken);
    const response = await quizApiInstance
      .get(`quiz/${sessionId}/content`)
      .json<{ success: boolean; data: QuizContentResponse }>();

    return response.data;
  },

  /**
   * Auto-save an answer (debounced)
   */
  autoSaveAnswer: async (
    sessionId: string,
    sessionToken: string,
    data: AutoSaveAnswerRequest
  ): Promise<AutoSaveResponse> => {
    const quizApiInstance = createQuizApi(sessionToken);
    const response = await quizApiInstance
      .post(`quiz/${sessionId}/autosave`, {
        json: data,
      })
      .json<{ success: boolean; data: AutoSaveResponse }>();

    return response.data;
  },

  /**
   * Get session status (time remaining, answers saved)
   */
  getSessionStatus: async (
    sessionId: string,
    sessionToken: string
  ): Promise<SessionStatusResponse> => {
    const quizApiInstance = createQuizApi(sessionToken);
    const response = await quizApiInstance
      .get(`quiz/${sessionId}/status`)
      .json<{ success: boolean; data: SessionStatusResponse }>();

    return response.data;
  },

  /**
   * Submit quiz/survey
   */
  submitQuiz: async (
    sessionId: string,
    sessionToken: string,
    data: SubmitQuizRequest
  ): Promise<SubmitQuizResponse> => {
    const quizApiInstance = createQuizApi(sessionToken);
    const response = await quizApiInstance
      .post(`quiz/${sessionId}/submit`, {
        json: data,
      })
      .json<{ success: boolean; data: SubmitQuizResponse }>();

    return response.data;
  },

  /**
   * Get quiz result
   */
  getQuizResult: async (
    responseId: string,
    sessionToken: string
  ): Promise<QuizResultResponse> => {
    const quizApiInstance = createQuizApi(sessionToken);
    const response = await quizApiInstance
      .get(`quiz/result/${responseId}`)
      .json<{ success: boolean; data: QuizResultResponse }>();

    return response.data;
  },

  /**
   * Resume an incomplete quiz session
   */
  resumeQuiz: async (data: ResumeQuizRequest): Promise<ResumeQuizResponse> => {
    const response = await api
      .post('quiz/resume', {
        json: data,
      })
      .json<{ success: boolean; data: ResumeQuizResponse }>();

    return response.data;
  },
};
