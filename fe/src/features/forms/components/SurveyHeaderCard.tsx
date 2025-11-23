import React, { useState, useEffect } from "react";
import { type CanvasItem } from "../types";
import { formsApi } from "../api/forms";
import { RichTextEditor } from "../../../components/RichTextEditor";

interface SurveyHeaderCardProps {
  item: CanvasItem;
  formId: string;
  isSelected: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  isAnyCardDragging: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasItem>) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export const SurveyHeaderCard: React.FC<SurveyHeaderCardProps> = ({
  item,
  formId,
  isSelected,
  isDragging,
  isDragOver,
  isAnyCardDragging,
  onSelect,
  onUpdate,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}) => {
  const [title, setTitle] = useState(item.title || "");
  const [description, setDescription] = useState(item.description || "");
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when item changes
  useEffect(() => {
    // Initialize with HTML content (plain text or formatted)
    setTitle(item.title || "");
    setDescription(item.description || "");
  }, [item.title, item.description]);

  // Debounced backend update
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (title !== item.title || description !== item.description) {
        setIsSaving(true);
        try {
          // Update the form via API
          await formsApi.updateForm(formId, {
            title: title !== item.title ? title : undefined,
            description:
              description !== item.description ? description : undefined,
          });

          // Update local state to reflect successful save
          onUpdate({ title, description });
        } catch (error) {
          console.error("Failed to save form:", error);
          // Revert to original values on error
          setTitle(item.title);
          setDescription(item.description);
        } finally {
          setIsSaving(false);
        }
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [title, description, item.title, item.description, formId, onUpdate]);

  return (
    <div
      className={`
        mt-10 canvas-card canvas-card-base relative transition-all duration-200 ease bg-white
        ${isDragging ? "dragging opacity-70 scale-102 shadow-lg z-50" : ""}
        ${isDragOver ? "drag-over border-2 border-purple-400 bg-purple-50" : ""}
        ${isSelected ? "active shadow-md" : "shadow-sm hover:shadow-md"}
        ${isAnyCardDragging && !isDragging ? "minimized" : ""}
      `}
      style={{
        border: "1px solid #D0BFE0",
        borderLeft: "4px solid #5F35F5",
        borderRadius: "8px",
        padding: isDragging ? "8px" : "12px", // Reduced padding during drag
        marginBottom: "16px",
        minHeight: isDragging ? "60px" : "80px", // Reduced height during drag
        display: "flex",
        flexDirection: "column",
        gap: isDragging ? "4px" : "8px", // Reduced gap during drag
        position: "relative"
      }}
      onClick={onSelect}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      {/* Save Status Indicator */}
      {isSaving && (
        <div
          className="absolute top-2 right-2 text-xs text-purple-600"
          style={{ zIndex: 5 }}
        >
          Saving...
        </div>
      )}

      {/* Survey Title */}
      {isDragging ? (
        // Simplified view during drag - just display title text
        <div className="text-lg font-medium text-gray-900 leading-5 py-0.5">
          {title || "Untitled Form"}
        </div>
      ) : (
        // Full editor when not dragging
        <RichTextEditor
          content={title}
          onChange={setTitle}
          placeholder="Form title"
          showToolbar={true}
          toolbarPosition="bottom"
          style={{
            fontSize: "24px",
            fontWeight: 400,
            color: "#202124",
            lineHeight: 1.4,
            border: "none",
            background: "transparent",
            fontFamily: "inherit",
          }}
          className={`
            transition-all duration-200
            ${isSelected ? "" : ""}
          `}
        />
      )}

      {/* Divider - Hide during drag */}
      {!isDragging && (
        <div
          style={{
            height: "1px",
            background: "#E8E8E8",
            margin: "0",
            width: "100%",
          }}
        />
      )}

      {/* Survey Description - Hide during drag */}
      {!isDragging && description && (
        <RichTextEditor
          content={description}
          onChange={setDescription}
          placeholder="Form description"
          showToolbar={true}
          toolbarPosition="bottom"
          style={{
            fontSize: "16px",
            fontWeight: 400,
            color: "#808080",
            border: "none",
            background: "transparent",
            fontFamily: "inherit",
            padding: "8px 0",
          }}
          className={`
            transition-all duration-200
            ${isSelected ? "" : ""}
          `}
        />
      )}
    </div>
  );
};
