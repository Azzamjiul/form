import { api } from '../../../utils/api';
import type {
  CreateSectionRequest,
  UpdateSectionRequest,
  SectionDetailResponse,
  SectionListResponse,
} from '../types';

export const sectionsApi = {
  /**
   * Create a new section for a form
   */
  createSection: async (
    formId: string,
    data: CreateSectionRequest
  ): Promise<SectionDetailResponse> => {
    const response = await api
      .post(`forms/${formId}/sections`, {
        json: data,
      })
      .json<SectionDetailResponse>();

    return response;
  },

  /**
   * Get section details with all its fields
   */
  getSectionById: async (
    formId: string,
    sectionId: string
  ): Promise<SectionDetailResponse> => {
    const response = await api
      .get(`forms/${formId}/sections/${sectionId}`)
      .json<SectionDetailResponse>();

    return response;
  },

  /**
   * Update section details
   */
  updateSection: async (
    formId: string,
    sectionId: string,
    data: UpdateSectionRequest
  ): Promise<SectionDetailResponse> => {
    const response = await api
      .put(`forms/${formId}/sections/${sectionId}`, {
        json: data,
      })
      .json<SectionDetailResponse>();

    return response;
  },

  /**
   * Delete section (fields will have section_id set to NULL)
   */
  deleteSection: async (formId: string, sectionId: string): Promise<void> => {
    await api.delete(`forms/${formId}/sections/${sectionId}`);
  },

  /**
   * Get all sections in a form (ordered by order_global)
   */
  listSections: async (formId: string): Promise<SectionListResponse> => {
    const response = await api
      .get(`forms/${formId}/sections`)
      .json<SectionListResponse>();

    return response;
  },
};
