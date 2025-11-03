import { api } from '../../../utils/api';
import type {
  CreateFormRequest,
  UpdateFormRequest,
  DuplicateFormRequest,
  FormListParams,
  FormApiResponse,
  FormWithSectionsResponse,
  FormListResponse,
  PublishFormResponse,
} from '../types';

export const formsApi = {
  /**
   * Create a new form
   */
  createForm: async (data: CreateFormRequest): Promise<FormApiResponse> => {
    const response = await api.post('forms', {
      json: data,
    }).json<FormApiResponse>();

    return response;
  },

  /**
   * Get form details with all sections and fields
   */
  getFormById: async (formId: string): Promise<FormWithSectionsResponse> => {
    // Backend now returns content_items with proper ordering
    const response = await api
      .get(`forms/${formId}`)
      .json<FormWithSectionsResponse>();

    return response;
  },

  /**
   * Update form settings
   */
  updateForm: async (formId: string, data: UpdateFormRequest): Promise<FormApiResponse> => {
    const response = await api.put(`forms/${formId}`, {
      json: data,
    }).json<FormApiResponse>();

    return response;
  },

  /**
   * Get all forms created by current user (paginated)
   */
  listUserForms: async (params?: FormListParams): Promise<FormListResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.per_page) searchParams.append('per_page', params.per_page.toString());
    if (params?.sort_by) searchParams.append('sort_by', params.sort_by);
    if (params?.order) searchParams.append('order', params.order);

    const queryString = searchParams.toString();
    const url = queryString ? `forms?${queryString}` : 'forms';

    const response = await api.get(url).json<FormListResponse>();

    return response;
  },

  /**
   * Delete form (soft delete)
   */
  deleteForm: async (formId: string): Promise<void> => {
    await api.delete(`forms/${formId}`);
  },

  /**
   * Duplicate form with all settings and questions
   */
  duplicateForm: async (formId: string, data: DuplicateFormRequest): Promise<FormApiResponse> => {
    const response = await api.post(`forms/${formId}/duplicate`, {
      json: data,
    }).json<FormApiResponse>();

    return response;
  },

  /**
   * Publish form (make it available for respondents)
   */
  publishForm: async (formId: string): Promise<PublishFormResponse> => {
    const response = await api.patch(`forms/${formId}/publish`).json<PublishFormResponse>();

    return response;
  },
};
