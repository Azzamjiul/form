import { api } from '../../../utils/api';

export interface FileUploadResponse {
  id: string;
  filename: string;
  size: number;
  content_type: string;
  width: number;
  height: number;
  url: string;
}

export const filesApi = {
  /**
   * Upload an image file
   */
  uploadImage: async (file: File): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    // Use native fetch for file uploads because ky doesn't handle FormData Content-Type correctly
    const accessToken = localStorage.getItem('access_token');
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        // Don't set Content-Type - let browser set it with boundary for multipart/form-data
        'Authorization': accessToken ? `Bearer ${accessToken}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.data || data;
  },

  /**
   * Get image URL (for serving images)
   */
  getImageUrl: (fileId: string): string => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
    return `${API_BASE_URL}/images/${fileId}`;
  },

  /**
   * Delete an image
   */
  deleteImage: async (fileId: string): Promise<void> => {
    await api.delete(`images/${fileId}`);
  },
};