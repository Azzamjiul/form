import React, { useState, useEffect } from 'react';
import { RichTextEditor } from '../../../../../../components/RichTextEditor';
// import { CompactImageUpload } from '../../../../components/CompactImageUpload'; // TODO: Enable when image upload UI is implemented
import type { CanvasItem } from '../../../types/canvas';

interface QuestionEditorProps {
  item: CanvasItem;
  onUpdate: (updates: Partial<CanvasItem>) => void;
  isMinimized?: boolean;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  item,
  onUpdate,
  isMinimized = false,
}) => {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);

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

  // Handle image change
  // const handleImageChange = (imageFileId: string | null) => {
  //   onUpdate({ imageFileId: imageFileId || undefined });
  // };

  if (isMinimized) {
    return (
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900 truncate">
          {title || 'Untitled Question'}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Question Title */}
      <div>
        <RichTextEditor
          content={title}
          onChange={handleTitleChange}
          placeholder="Question title"
          className="min-h-[24px]"
        />
      </div>

      {/* Question Description */}
      {description && (
        <div>
          <RichTextEditor
            content={description}
            onChange={handleDescriptionChange}
            placeholder="Add description (optional)"
            className="min-h-[20px] text-sm text-gray-600"
          />
        </div>
      )}

      {/* Question Image - TODO: Fix CompactImageUpload import */}
      {item.imageFileId && (
        <div className="mt-3">
          <div className="text-sm text-gray-500">
            Image upload temporarily disabled due to import issues
          </div>
        </div>
      )}
    </div>
  );
};