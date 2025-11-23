import React, { useState, useEffect } from "react";
import { type CanvasItem } from "../types";
import { formsApi } from "../api/forms";
import { RichTextEditor } from "../../../components/RichTextEditor";

interface SurveyHeaderCardProps {
  item: CanvasItem;
  formId: string;
  isSelected: boolean;
  isAnyCardDragging: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasItem>) => void;
}

export const SurveyHeaderCard: React.FC<SurveyHeaderCardProps> = ({
  item,
  formId,
  isSelected,
  isAnyCardDragging,
  onSelect,
  onUpdate,
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
        ${isSelected ? "active shadow-md" : "shadow-sm hover:shadow-md"}
        ${isAnyCardDragging ? "minimized" : ""}
      `}
      style={{
        border: "1px solid #D0BFE0",
        borderLeft: "4px solid #5F35F5",
        borderRadius: "8px",
        padding: "12px",
        marginBottom: "16px",
        minHeight: "80px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        position: "relative"
      }}
      onClick={onSelect}
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

      {/* Divider */}
      <div
        style={{
          height: "1px",
          background: "#E8E8E8",
          margin: "0",
          width: "100%",
        }}
      />

      {/* Survey Description */}
      {description && (
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
