import React, { useCallback, useRef } from "react";
import { BaseCard } from "../../../Cards/BaseCard";
import RichTextEditor from "../../../../../../../components/RichTextEditor";
import AddItemButtons from "../../../AddItemButtons/AddItemButtons";
import {
  useCanvasCardIsSelected,
  useCanvasCardIsDragging,
  useCanvasAnyCardDragging,
} from "../../../../context/CanvasContext";
import { useCanvasContext } from "../../../../context/CanvasContext";
import type { SurveyHeaderCardProps } from "./SurveyHeaderCard.types";

export const SurveyHeaderCard: React.FC<SurveyHeaderCardProps> = ({
  item,
  surveyHeaderState,
  onSurveyHeaderUpdate,
  onSelect,
}) => {
  // Use canvas context for selection state
  const isSelected = useCanvasCardIsSelected(item.id);
  const isDragging = useCanvasCardIsDragging(item.id);
  const isAnyCardDragging = useCanvasAnyCardDragging();

  // Get canvas context for manual save integration
  const { state, actions } = useCanvasContext();

  // Add ref for AddItemButtons positioning
  const cardRef = useRef<HTMLDivElement>(null);

  // Add click handler for card selection
  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      // Only trigger selection if not clicking on RichTextEditor toolbar or interactive elements
      if (onSelect && !e.defaultPrevented) {
        onSelect();
      }
    },
    [onSelect],
  );

  // Enhanced change handlers with manual save integration
  const handleTitleChange = useCallback(
    (title: string) => {
      // Update local state
      actions.updateItem(item.id, { title });

      // Mark form as dirty
      actions.markDirty();

      // Notify parent of survey header update
      if (onSurveyHeaderUpdate) {
        onSurveyHeaderUpdate({ title });
      }
    },
    [item.id, actions, onSurveyHeaderUpdate],
  );

  const handleDescriptionChange = useCallback(
    (description: string) => {
      // Update local state
      actions.updateItem(item.id, { description });

      // Mark form as dirty
      actions.markDirty();

      // Notify parent of survey header update
      if (onSurveyHeaderUpdate) {
        onSurveyHeaderUpdate({ description });
      }
    },
    [item.id, actions, onSurveyHeaderUpdate],
  );

  // Use dedicated survey header state instead of item state
  const title = surveyHeaderState?.title || item.title || "";
  const description = surveyHeaderState?.description || item.description || "";

  return (
    <>
      <BaseCard
        isSelected={isSelected}
        isDragging={isDragging}
        isAnyCardDragging={isAnyCardDragging}
        onSelect={onSelect}
        className="mt-10"
        cardId={item.id}
      >
        <div
          ref={cardRef}
          onClick={handleCardClick}
          className="p-6"
        >
          {/* Title Editor */}
          <div className="transition-all duration-200">
            <RichTextEditor
              content={title}
              onChange={handleTitleChange}
              placeholder="Untitled Form"
              className="text-2xl text-gray-900 min-h-[32px]"
              debounceMs={600} // Faster debounce for better UX
              context="title"
            />
          </div>

          {/* Description Editor with conditional rendering */}
          {(description || surveyHeaderState) && (
            <div className="mt-3 transition-all duration-200">
              <RichTextEditor
                content={description}
                onChange={handleDescriptionChange}
                placeholder="Add a description..."
                className="text-gray-600 min-h-[20px]"
                debounceMs={600} // Faster debounce for better UX
                context="description"
              />
            </div>
          )}
        </div>
      </BaseCard>

      {/* AddItemButtons for adding new questions */}
      <AddItemButtons
        formId={item.form_id}
        visible={isSelected && !isAnyCardDragging}
        cardRef={cardRef}
        isCardDragging={isDragging}
        onItemCreated={(newItemId) => {
          // Optional: Handle new item creation
          if (newItemId) {
            console.log('New item created:', newItemId);
          }
        }}
      />
    </>
  );
};
