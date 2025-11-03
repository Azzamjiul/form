import { kyInstance } from '../../../utils/api';
import type {
  FormResponseListResponse,
  FormResponseDetailResponse,
  FormAnalyticsResponse,
  QuestionAnalyticsResponse,
  SectionAnalyticsResponse,
  ExportResponse,
  ResponseListParams,
  FlagResponseRequest,
  AnalyticsParams,
  ExportOptions,
} from '../types';

export const responsesApi = {
  // Get all responses for a form
  getResponses: async (
    formId: string,
    params?: ResponseListParams
  ): Promise<FormResponseListResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    if (params?.sort_by) searchParams.set('sort_by', params.sort_by);
    if (params?.order) searchParams.set('order', params.order);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.is_flagged !== undefined) searchParams.set('is_flagged', params.is_flagged.toString());
    if (params?.is_passed !== undefined) searchParams.set('is_passed', params.is_passed.toString());
    if (params?.date_from) searchParams.set('date_from', params.date_from);
    if (params?.date_to) searchParams.set('date_to', params.date_to);

    const queryString = searchParams.toString();
    const url = queryString
      ? `/forms/${formId}/responses?${queryString}`
      : `/forms/${formId}/responses`;

    return kyInstance.get(url).json<FormResponseListResponse>();
  },

  // Get specific response details
  getResponse: async (
    formId: string,
    responseId: string
  ): Promise<FormResponseDetailResponse> => {
    return kyInstance
      .get(`/forms/${formId}/responses/${responseId}`)
      .json<FormResponseDetailResponse>();
  },

  // Delete a response
  deleteResponse: async (
    formId: string,
    responseId: string
  ): Promise<FormResponseDetailResponse> => {
    return kyInstance
      .delete(`/forms/${formId}/responses/${responseId}`)
      .json<FormResponseDetailResponse>();
  },

  // Flag/unflag a response
  flagResponse: async (
    formId: string,
    responseId: string,
    data: FlagResponseRequest
  ): Promise<FormResponseDetailResponse> => {
    return kyInstance
      .put(`/forms/${formId}/responses/${responseId}/flag`, {
        json: data,
      })
      .json<FormResponseDetailResponse>();
  },
};

export const analyticsApi = {
  // Get comprehensive analytics for a form
  getFormAnalytics: async (
    formId: string,
    params?: AnalyticsParams
  ): Promise<FormAnalyticsResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.date_from) searchParams.set('date_from', params.date_from);
    if (params?.date_to) searchParams.set('date_to', params.date_to);

    const queryString = searchParams.toString();
    const url = queryString
      ? `/forms/${formId}/analytics?${queryString}`
      : `/forms/${formId}/analytics`;

    return kyInstance.get(url).json<FormAnalyticsResponse>();
  },

  // Get question-level analytics
  getQuestionAnalytics: async (
    formId: string,
    params?: AnalyticsParams
  ): Promise<QuestionAnalyticsResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.date_from) searchParams.set('date_from', params.date_from);
    if (params?.date_to) searchParams.set('date_to', params.date_to);

    const queryString = searchParams.toString();
    const url = queryString
      ? `/forms/${formId}/analytics/questions?${queryString}`
      : `/forms/${formId}/analytics/questions`;

    return kyInstance.get(url).json<QuestionAnalyticsResponse>();
  },

  // Get section-level analytics
  getSectionAnalytics: async (
    formId: string,
    params?: AnalyticsParams
  ): Promise<SectionAnalyticsResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.date_from) searchParams.set('date_from', params.date_from);
    if (params?.date_to) searchParams.set('date_to', params.date_to);

    const queryString = searchParams.toString();
    const url = queryString
      ? `/forms/${formId}/analytics/sections?${queryString}`
      : `/forms/${formId}/analytics/sections`;

    return kyInstance.get(url).json<SectionAnalyticsResponse>();
  },

  // Get completion trends
  getCompletionTrends: async (
    formId: string,
    params?: AnalyticsParams
  ): Promise<FormAnalyticsResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.date_from) searchParams.set('date_from', params.date_from);
    if (params?.date_to) searchParams.set('date_to', params.date_to);

    const queryString = searchParams.toString();
    const url = queryString
      ? `/forms/${formId}/analytics/trends?${queryString}`
      : `/forms/${formId}/analytics/trends`;

    return kyInstance.get(url).json<FormAnalyticsResponse>();
  },
};

export const exportApi = {
  // Export responses data
  exportResponses: async (
    formId: string,
    options: ExportOptions
  ): Promise<ExportResponse> => {
    const searchParams = new URLSearchParams();

    searchParams.set('format', options.format);
    if (options.include_analytics) {
      searchParams.set('include_analytics', options.include_analytics.toString());
    }
    if (options.date_range?.start_date) {
      searchParams.set('start_date', options.date_range.start_date);
    }
    if (options.date_range?.end_date) {
      searchParams.set('end_date', options.date_range.end_date);
    }

    const queryString = searchParams.toString();
    const url = `/forms/${formId}/export?${queryString}`;

    // For file downloads, we need to handle the response differently
    const response = await kyInstance.get(url);

    if (options.format === 'json') {
      return response.json<ExportResponse>();
    } else {
      // For CSV/Excel, handle as blob download
      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition') || '';

      // Extract filename from content-disposition header if available
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch?.[1] || `export.${options.format === 'excel' ? 'xlsx' : 'csv'}`;

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return {
        success: true,
        data: { message: `File downloaded as ${filename}`, data: null },
        error: null,
        timestamp: new Date().toISOString(),
      } as ExportResponse;
    }
  },
};