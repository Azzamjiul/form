import React, { useState, useEffect } from 'react';
import { type CanvasItem } from '../types';
import { RichTextEditor } from '../../../components/RichTextEditor';
import { fieldsApi } from '../api/fields';

interface TitleDescriptionCardProps {
  item: CanvasItem;
  formId: string;
  isSelected: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  isAnyCardDragging: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasItem>) => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export const TitleDescriptionCard: React.FC<TitleDescriptionCardProps> = ({
  item,
  formId,
  isSelected,
  isDragging,
  isDragOver,
  isAnyCardDragging,
  onSelect,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd
}) => {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Update local state when item changes
  useEffect(() => {
    setTitle(item.title);
    setDescription(item.description);
  }, [item.title, item.description]);

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onUpdate({ title: newTitle });
  };

  // Handle description change
  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
    onUpdate({ description: newDescription });
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
      onDelete(); // Call parent's onDelete to update local state
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete section:', error);
      alert('Failed to delete section. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(false);
  };

  return (
    <div
      className={`
        canvas-card canvas-card-base relative transition-all duration-200 ease
        ${isDragging ? 'dragging opacity-70 scale-102 shadow-lg z-50' : ''}
        ${isDragOver ? 'drag-over border-2 border-purple-400 bg-purple-50' : ''}
        ${isSelected ? 'active shadow-md' : 'shadow-sm hover:shadow-md'}
        ${isAnyCardDragging && !isDragging ? 'minimized' : ''}
      `}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E8E8E8',
        borderLeft: '4px solid #5F35F5',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        padding: isDragging ? '8px' : '12px', // Reduced padding during drag
        marginBottom: '16px',
        minHeight: isDragging ? '60px' : '80px', // Reduced height during drag
        display: 'flex',
        flexDirection: 'column',
        gap: isDragging ? '4px' : '8px', // Reduced gap during drag
        position: 'relative'
      }}
      onClick={onSelect}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      {/* Top-right actions - Hide during drag */}
      {!isDragging && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            gap: '8px'
          }}
        >
          <button
            className="w-10 h-10 flex items-center justify-center bg-transparent border-none cursor-pointer rounded-md text-gray-600 hover:bg-gray-100 hover:text-purple-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement duplicate functionality
            }}
            title="Duplicate"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            className="w-10 h-10 flex items-center justify-center bg-transparent border-none cursor-pointer rounded-md text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
            onClick={handleDeleteClick}
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}

      {/* Section Title */}
      {isDragging ? (
        // Simplified view during drag - just display title text
        <div className="text-sm font-medium text-gray-900 leading-6 py-1 border-b-2 border-purple-600">
          {title || 'Untitled Section'}
        </div>
      ) : (
        // Full editor when not dragging
        <RichTextEditor
          content={title}
          onChange={handleTitleChange}
          placeholder="Section title"
          showToolbar={true}
          toolbarPosition="bottom"
          style={{
            fontSize: '16px',
            fontWeight: 500,
            color: '#202124',
            lineHeight: 1.5,
            borderBottom: '2px solid #5F35F5',
            background: 'transparent',
            fontFamily: 'inherit',
          }}
        />
      )}

      {/* Section Description - Hide during drag */}
      {!isDragging && description && (
        <RichTextEditor
          content={description}
          onChange={handleDescriptionChange}
          placeholder="Section description (optional)"
          showToolbar={true}
          toolbarPosition="bottom"
          style={{
            fontSize: '14px',
            fontWeight: 400,
            color: '#808080',
            lineHeight: 1.5,
            border: 'none',
            background: 'transparent',
            fontFamily: 'inherit',
            padding: '12px 0',
            borderBottom: '1px solid #E8E8E8',
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCancelDelete}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Section?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this section? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};