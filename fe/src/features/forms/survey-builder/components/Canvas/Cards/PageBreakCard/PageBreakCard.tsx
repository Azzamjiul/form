import React from "react";
import { BaseCard } from "../../../Cards/BaseCard";
import { useCanvasCardIsSelected, useCanvasCardIsDragging, useCanvasAnyCardDragging } from "../../../../context/CanvasContext";
import type { PageBreakCardProps } from "./PageBreakCard.types";

export const PageBreakCard: React.FC<PageBreakCardProps> = ({
  item,
  onSelect,
}) => {
  // Use canvas context for selection state
  const isSelected = useCanvasCardIsSelected(item.id);
  const isDragging = useCanvasCardIsDragging(item.id);
  const isAnyCardDragging = useCanvasAnyCardDragging();
  return (
    <BaseCard
      isSelected={isSelected}
      isDragging={isDragging}
      isAnyCardDragging={isAnyCardDragging}
      onSelect={onSelect}
      className={`${!isSelected ? 'border-dashed border-gray-300' : 'border-solid'} bg-gray-50`}
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