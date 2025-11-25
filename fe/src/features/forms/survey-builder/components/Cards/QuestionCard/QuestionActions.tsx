import React, { useState } from 'react';
import { fieldsApi } from '../../../../api/fields';
import type { CanvasItem } from '../../../../types';

interface QuestionActionsProps {
  item: CanvasItem;
  formId: string;
  onUpdate: (updates: Partial<CanvasItem>) => void;
  onDelete: () => void;
}

export const QuestionActions: React.FC<QuestionActionsProps> = ({
  item,
  formId,
  onUpdate,
  onDelete,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPointsEdit, setShowPointsEdit] = useState(false);
  const [points, setPoints] = useState(item.points || 0);

  // Handle required toggle
  const handleToggleRequired = () => {
    onUpdate({ required: !item.required });
  };

  // Handle points change
  const handlePointsChange = (newPoints: number) => {
    setPoints(newPoints);
    onUpdate({ points: newPoints });
  };

  // Handle delete confirmation
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await fieldsApi.deleteField(formId, item.id);
      onDelete();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete field:', error);
      alert('Failed to delete item. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Required toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleRequired();
          }}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
            item.required
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title={item.required ? 'Required question' : 'Optional question'}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">{item.required ? 'Required' : 'Optional'}</span>
        </button>

        {/* Points button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowPointsEdit(!showPointsEdit);
          }}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          title={`${points} points`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="font-medium">{points} pts</span>
        </button>

        {/* Delete button */}
        <button
          onClick={handleDeleteClick}
          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
          title="Delete question"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Points edit modal */}
      {showPointsEdit && (
        <div
          className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3"
          onClick={(e) => e.stopPropagation()}
        >
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Points
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              value={points}
              onChange={(e) => handlePointsChange(parseInt(e.target.value) || 0)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
            />
            <span className="text-sm text-gray-600">pts</span>
          </div>
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => setShowPointsEdit(false)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete Question
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete "{item.title || 'this question'}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};