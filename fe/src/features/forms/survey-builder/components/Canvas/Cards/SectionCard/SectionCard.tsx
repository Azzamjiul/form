import React from "react";
import { BaseCard } from "../../../Cards/BaseCard";
import RichTextEditor from "../../../../../../../components/RichTextEditor";
import { useCardIsSelected, useCardIsDragging, useAnyCardDragging } from "../../../../context/CardContext";
import type { SectionCardProps } from "./SectionCard.types";

export const SectionCard: React.FC<SectionCardProps> = ({
  item,
  onSelect,
  onUpdate,
}) => {
  // Use context instead of props for selection state
  const isSelected = useCardIsSelected(item.id);
  const isDragging = useCardIsDragging(item.id);
  const isAnyCardDragging = useAnyCardDragging();

  // Simple save handler for section (manual save system)
  const handleSectionChange = (updates: Partial<any>) => {
    onUpdate(updates);
  };

  return (
    <BaseCard
      isSelected={isSelected}
      isDragging={isDragging}
      isAnyCardDragging={isAnyCardDragging}
      onSelect={onSelect}
    >
      <div className="p-6">
        <RichTextEditor
          content={item.title}
          onChange={(title) => handleSectionChange({ title })}
          placeholder="Section Title"
          className="text-xl font-semibold text-gray-900 min-h-[28px]"
        />
        {item.description && (
          <div className="mt-2">
            <RichTextEditor
              content={item.description}
              onChange={(description) => handleSectionChange({ description })}
              placeholder="Section description..."
              className="text-gray-600 min-h-[20px]"
            />
          </div>
        )}
      </div>
    </BaseCard>
  );
};