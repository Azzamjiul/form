import React from "react";
import { BaseCard } from "../../../Cards/BaseCard";
import { useCardIsSelected, useCardIsDragging, useAnyCardDragging } from "../../../../context/CardContext";
import type { PageBreakCardProps } from "./PageBreakCard.types";

export const PageBreakCard: React.FC<PageBreakCardProps> = ({
  item,
  onSelect,
}) => {
  // Use context instead of props for selection state
  const isSelected = useCardIsSelected(item.id);
  const isDragging = useCardIsDragging(item.id);
  const isAnyCardDragging = useAnyCardDragging();
  return (
    <BaseCard
      isSelected={isSelected}
      isDragging={isDragging}
      isAnyCardDragging={isAnyCardDragging}
      onSelect={onSelect}
      className="border-dashed border-gray-300 bg-gray-50"
    >
      <div className="p-4 text-center">
        <div className="text-gray-400 text-sm">
          {item.sectionNumber && item.totalSections ? (
            <>
              Page {item.sectionNumber} of {item.totalSections}
            </>
          ) : (
            <>Page Break</>
          )}
        </div>
      </div>
    </BaseCard>
  );
};