import React, { useState } from "react";
import { filesApi, type FileUploadResponse } from "../api/files";
import { Dialog } from "../../../components/ui/Dialog";
import { ImageUpload } from "./ImageUpload";

interface CompactImageUploadProps {
  value?: string;
  onChange: (
    imageFileId: string | null,
    imageData?: FileUploadResponse,
  ) => void;
  disabled?: boolean;
  className?: string;
}

export const CompactImageUpload: React.FC<CompactImageUploadProps> = ({
  value,
  onChange,
  disabled = false,
  className = "",
}) => {
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadClick = () => {
    if (disabled) return;
    setShowModal(true);
    setError(null);
  };

  const handleModalUpload = (
    imageFileId: string | null,
    imageData?: FileUploadResponse,
  ) => {
    onChange(imageFileId, imageData);
    setShowModal(false);
    setError(null);
  };

  const handleDelete = () => {
    if (value) {
      onChange(null);
    }
  };

  const imageUrl = value ? filesApi.getImageUrl(value) : "";

  return (
    <div className={`inline-flex items-center ${className}`}>
      {/* Upload button or image preview */}
      {!value ? (
        <button
          onClick={handleUploadClick}
          disabled={disabled}
          className={`
            w-8 h-8 rounded-lg border-2 border-dashed border-gray-300
            flex items-center justify-center text-gray-400
            hover:border-gray-400 hover:text-gray-500
            transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
          title="Add image"
        >
          {false ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-500"></div>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          )}
        </button>
      ) : (
        <div className="relative group">
          {/* Large preview image */}
          <div className="cursor-pointer" onClick={handleUploadClick}>
            <img
              src={imageUrl}
              alt="Image preview"
              className="max-w-full h-auto rounded-lg border border-gray-200"
            />
          </div>

          {/* Edit/Delete overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleUploadClick();
              }}
              className="mr-2 p-2 bg-white bg-opacity-90 text-gray-700 rounded-lg hover:bg-opacity-100"
              title="Change image"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="p-2 bg-white bg-opacity-90 text-red-600 rounded-lg hover:bg-opacity-100"
              title="Delete image"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <Dialog
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        size="lg"
        title="Upload Image"
      >
        <ImageUpload
          value={value}
          onChange={handleModalUpload}
          disabled={disabled}
        />
      </Dialog>

      {/* Error message */}
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};
