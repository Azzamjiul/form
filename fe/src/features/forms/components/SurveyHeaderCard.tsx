import React, { useState, useRef, useEffect } from "react";

interface CanvasItem {
  id: string;
  type: string;
  title: string;
  description: string;
  order: number;
  isEditing?: boolean;
  isSelected?: boolean;
  isDragging?: boolean;
}

interface SurveyHeaderCardProps {
  item: CanvasItem;
  isSelected: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasItem>) => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export const SurveyHeaderCard: React.FC<SurveyHeaderCardProps> = ({
  item,
  isSelected,
  isDragging,
  isDragOver,
  onSelect,
  onUpdate,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}) => {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const titleRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  // Update local state when item changes
  useEffect(() => {
    setTitle(item.title);
    setDescription(item.description);
  }, [item.title, item.description]);

  // Handle title change
  const handleTitleChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newTitle = e.currentTarget.textContent || "";
    setTitle(newTitle);
    onUpdate({ title: newTitle });
  };

  // Handle description change
  const handleDescriptionChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newDescription = e.currentTarget.textContent || "";
    setDescription(newDescription);
    onUpdate({ description: newDescription });
  };

  // Handle paste events to clean up formatting
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  // Handle key events for title
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      descriptionRef.current?.focus();
    }
  };

  return (
    <div
      className={`
        mt-10 relative transition-all duration-200 ease
        ${isDragging ? "opacity-70 scale-102 shadow-lg z-50" : ""}
        ${isDragOver ? "border-2 border-purple-400 bg-purple-50" : ""}
        ${isSelected ? "shadow-md" : "shadow-sm hover:shadow-md"}
      `}
      style={{
        border: "1px solid #D0BFE0",
        borderLeft: "4px solid #5F35F5",
        borderRadius: "8px",
        padding: "24px",
        marginBottom: "24px",
        minHeight: "120px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        position: "relative",
        cursor: isDragging ? "grabbing" : "text",
      }}
      onClick={onSelect}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      {/* Survey Title */}
      <div
        ref={titleRef}
        contentEditable
        suppressContentEditableWarning
        className="outline-none"
        style={{
          fontSize: "32px",
          fontWeight: 400,
          color: "#202124",
          lineHeight: 1.4,
          border: "none",
          borderBottom: "none",
          padding: "8px 0",
          background: "transparent",
          fontFamily: "inherit",
          resize: "none",
          maxHeight: "100px",
          overflow: "hidden",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          minHeight: "40px",
        }}
        onInput={handleTitleChange}
        onKeyDown={handleTitleKeyDown}
        onPaste={handlePaste}
        data-placeholder="Form title"
      >
        {title}
      </div>

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
      <div
        ref={descriptionRef}
        contentEditable
        suppressContentEditableWarning
        className="outline-none"
        style={{
          fontSize: "16px",
          fontWeight: 400,
          color: "#808080",
          border: "none",
          background: "transparent",
          padding: "8px 0",
          outline: "none",
          fontFamily: "inherit",
          resize: "none",
          minHeight: "40px",
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
        }}
        onInput={handleDescriptionChange}
        onPaste={handlePaste}
        data-placeholder="Form description"
      >
        {description}
      </div>

      {/* CSS for contenteditable placeholder */}
      <style>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #808080;
          opacity: 1;
        }
      `}</style>
    </div>
  );
};
