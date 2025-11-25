import React, { useState } from 'react';
import type { CanvasItem } from '../../../../types';

interface OptionManagerProps {
  item: CanvasItem;
  onUpdate: (updates: Partial<CanvasItem>) => void;
}

export const OptionManager: React.FC<OptionManagerProps> = ({ item, onUpdate }) => {
  const questionType = item.questionType || 'text';

  // Only show for choice-based questions
  if (!['multiple_choice', 'checkbox', 'dropdown'].includes(questionType)) {
    return null;
  }

  // Handle option change
  const handleOptionChange = (optionId: string, newLabel: string) => {
    const updatedOptions = item.options?.map((opt) =>
      opt.id === optionId ? { ...opt, label: newLabel } : opt,
    );
    onUpdate({ options: updatedOptions });
  };

  // Add new option
  const handleAddOption = () => {
    const newOption = {
      id: Date.now().toString(),
      label: `Option ${(item.options?.length || 0) + 1}`,
    };
    onUpdate({ options: [...(item.options || []), newOption] });
  };

  // Delete option
  const handleDeleteOption = (optionId: string) => {
    if (item.options && item.options.length > 1) {
      const updatedOptions = item.options.filter((opt) => opt.id !== optionId);
      onUpdate({ options: updatedOptions });
    }
  };

  // Handle option image change
  const handleOptionImageChange = (
    optionId: string,
    imageFileId: string | null,
  ) => {
    const updatedOptions = item.options?.map((opt) =>
      opt.id === optionId
        ? { ...opt, imageFileId: imageFileId || undefined }
        : opt,
    );
    onUpdate({ options: updatedOptions });
  };

  return (
    <div className="space-y-2">
      {/* Options Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Options</span>
        <button
          onClick={handleAddOption}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + Add option
        </button>
      </div>

      {/* Options List */}
      {item.options?.map((option, index) => (
        <OptionRow
          key={option.id}
          option={option}
          index={index}
          questionType={questionType}
          onLabelChange={(newLabel) => handleOptionChange(option.id, newLabel)}
          onDelete={() => handleDeleteOption(option.id)}
          onImageChange={(imageFileId) => handleOptionImageChange(option.id, imageFileId)}
          canDelete={item.options && item.options.length > 1}
        />
      ))}

      {(!item.options || item.options.length === 0) && (
        <div className="text-sm text-gray-500 italic">
          No options added yet. Click "Add option" to get started.
        </div>
      )}
    </div>
  );
};

interface OptionRowProps {
  option: { id: string; label: string; imageFileId?: string };
  index: number;
  questionType: string;
  onLabelChange: (newLabel: string) => void;
  onDelete: () => void;
  onImageChange: (imageFileId: string | null) => void;
  canDelete: boolean;
}

const OptionRow: React.FC<OptionRowProps> = ({
  option,
  index,
  questionType,
  onLabelChange,
  onDelete,
  onImageChange,
  canDelete,
}) => {
  const [showImageUpload, setShowImageUpload] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 group py-1">
        {/* Option indicator */}
        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
          {questionType === 'multiple_choice' ? (
            <div className="w-4 h-4 border-2 border-gray-400 rounded-full" />
          ) : questionType === 'checkbox' ? (
            <div className="w-4 h-4 border-2 border-gray-400 rounded" />
          ) : (
            <div className="w-4 h-4 border-2 border-gray-400 rounded text-xs flex items-center justify-center text-gray-500">
              {index + 1}
            </div>
          )}
        </div>

        {/* Option input */}
        <input
          type="text"
          value={option.label}
          onChange={(e) => onLabelChange(e.target.value)}
          className="flex-1 text-sm text-gray-700 border border-gray-200 rounded-md px-2 py-1.5 focus:border-blue-500 focus:outline-none"
          placeholder="Option text"
        />

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Image button */}
          <button
            onClick={() => setShowImageUpload(!showImageUpload)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
            title="Add image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Delete button */}
          {canDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-600 rounded"
              title="Delete option"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Image upload */}
      {showImageUpload && (
        <div className="ml-8">
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Option Image</span>
              <button
                onClick={() => setShowImageUpload(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Here you would integrate your image upload component */}
            <div className="text-sm text-gray-500">
              Image upload functionality would go here
            </div>
          </div>
        </div>
      )}

      {/* Option image preview */}
      {option.imageFileId && (
        <div className="ml-8">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <img
              src={`/api/files/${option.imageFileId}`}
              alt={option.label}
              className="w-full h-24 object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
};