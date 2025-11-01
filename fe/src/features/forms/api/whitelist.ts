import { api } from '../../../utils/api';
import type {
  CreateWhitelistRequest,
  BatchCreateWhitelistRequest,
  UpdateWhitelistRequest,
  WhitelistEntryResponse,
  WhitelistEntryDetailResponse,
  WhitelistListResponse,
  WhitelistBatchResponse,
  ValidateTokenResponse,
  WhitelistListParams,
} from '../types';

export const whitelistApi = {
  /**
   * Create a single whitelist entry
   */
  createWhitelistEntry: async (
    formId: string,
    data: CreateWhitelistRequest
  ): Promise<WhitelistEntryResponse> => {
    const response = await api
      .post(`forms/${formId}/whitelist`, {
        json: data,
      })
      .json<{ success: boolean; data: WhitelistEntryResponse }>();

    return response.data;
  },

  /**
   * Batch create whitelist entries
   */
  batchCreateWhitelist: async (
    formId: string,
    data: BatchCreateWhitelistRequest
  ): Promise<WhitelistBatchResponse> => {
    const response = await api
      .post(`forms/${formId}/whitelist/batch`, {
        json: data,
      })
      .json<{ success: boolean; data: WhitelistBatchResponse }>();

    return response.data;
  },

  /**
   * Get whitelist entry details
   */
  getWhitelistEntry: async (
    formId: string,
    whitelistId: string
  ): Promise<WhitelistEntryDetailResponse> => {
    const response = await api
      .get(`forms/${formId}/whitelist/${whitelistId}`)
      .json<{ success: boolean; data: WhitelistEntryDetailResponse }>();

    return response.data;
  },

  /**
   * List whitelist entries for a form (paginated)
   */
  listWhitelistEntries: async (
    formId: string,
    params?: WhitelistListParams
  ): Promise<WhitelistListResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.page) {
      searchParams.append('page', params.page.toString());
    }
    if (params?.per_page) {
      searchParams.append('per_page', params.per_page.toString());
    }
    if (params?.sort_by) {
      searchParams.append('sort_by', params.sort_by);
    }

    const queryString = searchParams.toString();
    const url = queryString
      ? `forms/${formId}/whitelist?${queryString}`
      : `forms/${formId}/whitelist`;

    const response = await api
      .get(url)
      .json<{ success: boolean; data: WhitelistListResponse }>();

    return response.data;
  },

  /**
   * Update whitelist entry
   */
  updateWhitelistEntry: async (
    formId: string,
    whitelistId: string,
    data: UpdateWhitelistRequest
  ): Promise<WhitelistEntryDetailResponse> => {
    const response = await api
      .put(`forms/${formId}/whitelist/${whitelistId}`, {
        json: data,
      })
      .json<{ success: boolean; data: WhitelistEntryDetailResponse }>();

    return response.data;
  },

  /**
   * Revoke whitelist entry
   */
  revokeWhitelistEntry: async (
    formId: string,
    whitelistId: string
  ): Promise<void> => {
    await api.delete(`forms/${formId}/whitelist/${whitelistId}`);
  },

  /**
   * Validate access token (public endpoint, no auth required)
   */
  validateAccessToken: async (
    accessToken: string
  ): Promise<ValidateTokenResponse> => {
    const response = await api
      .get(`whitelist/validate/${accessToken}`)
      .json<{ success: boolean; data: ValidateTokenResponse }>();

    return response.data;
  },
};
