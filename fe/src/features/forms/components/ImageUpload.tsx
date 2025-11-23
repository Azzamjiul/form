import React, { useState, useRef } from 'react';
import { filesApi, type FileUploadResponse } from '../api/files';

interface ImageUploadProps {
  value?: string; // image_file_id
  onChange: (imageFileId: string | null, imageData?: FileUploadResponse) => void;
  disabled?: boolean;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    // If we have an image_file_id, generate preview URL
    if (value) {
      setPreview(filesApi.getImageUrl(value));
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image size must be less than 10MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Create local preview immediately
      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);

      // Upload to server
      const response = await filesApi.uploadImage(file);

      // Call onChange with the new image_file_id
      onChange(response.id, response);

      // Update preview with the server URL (not local blob)
      setPreview(response.url);

      // Clean up local preview
      URL.revokeObjectURL(localPreview);

    } catch (err) {
      setError('Failed to upload image. Please try again.');
      // Reset preview on error
      setPreview(value ? filesApi.getImageUrl(value) : null);
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    onChange(null);
    setPreview(null);
    setError(null);
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        className="hidden"
      />

      {/* Upload area / Preview */}
      <div
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg overflow-hidden cursor-pointer
          transition-colors duration-200
          ${disabled || uploading
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        {preview ? (
          <div className="relative">
            {/* Image preview */}
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover"
            />

            {/* Overlay with controls */}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              {!disabled && !uploading && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClick();
                    }}
                    className="px-3 py-1 bg-white bg-opacity-90 text-gray-800 rounded text-sm hover:bg-opacity-100"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Upload indicator */}
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm">Uploading...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center">
            {uploading ? (
              <div className="text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto mb-2"></div>
                <p className="text-sm">Uploading image...</p>
              </div>
            ) : (
              <div className="text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-2"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-sm font-medium">Click to upload image</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 10MB</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Instructions */}
      {!preview && !error && !uploading && (
        <p className="text-xs text-gray-500">
          Upload an image to display with this question or option
        </p>
      )}
    </div>
  );
};