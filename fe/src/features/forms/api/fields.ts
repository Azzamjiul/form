import { api } from '../../../utils/api';
import type {
  CreateFieldRequest,
  UpdateFieldRequest,
  ReorderFieldsRequest,
  FieldDetailResponse,
  FieldListResponse,
  ReorderFieldsResponse,
} from '../types';

export const fieldsApi = {
  /**
   * Create a new field for a form
   */
  createField: async (
    formId: string,
    data: CreateFieldRequest
  ): Promise<FieldDetailResponse> => {
    const response = await api
      .post(`forms/${formId}/fields`, {
        json: data,
      })
      .json<FieldDetailResponse>();

    return response;
  },

  /**
   * Get field details
   */
  getFieldById: async (
    formId: string,
    fieldId: string
  ): Promise<FieldDetailResponse> => {
    const response = await api
      .get(`forms/${formId}/fields/${fieldId}`)
      .json<FieldDetailResponse>();

    return response;
  },

  /**
   * Update field details
   */
  updateField: async (
    formId: string,
    fieldId: string,
    data: UpdateFieldRequest
  ): Promise<FieldDetailResponse> => {
    const response = await api
      .put(`forms/${formId}/fields/${fieldId}`, {
        json: data,
      })
      .json<FieldDetailResponse>();

    return response;
  },

  /**
   * Delete field (associated answers also deleted)
   */
  deleteField: async (formId: string, fieldId: string): Promise<void> => {
    await api.delete(`forms/${formId}/fields/${fieldId}`);
  },

  /**
   * Get all fields in form (ordered by order_global)
   */
  listFields: async (formId: string): Promise<FieldListResponse> => {
    const response = await api
      .get(`forms/${formId}/fields`)
      .json<FieldListResponse>();

    return response;
  },

  /**
   * Reorder fields (change order_global and section assignments)
   */
  reorderFields: async (
    formId: string,
    data: ReorderFieldsRequest
  ): Promise<ReorderFieldsResponse> => {
    const response = await api
      .patch(`forms/${formId}/fields/reorder`, {
        json: data,
      })
      .json<ReorderFieldsResponse>();

    return response;
  },
};
