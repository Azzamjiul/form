import React, { useCallback } from "react";
import { BaseCard } from "../../../Cards/BaseCard";
import RichTextEditor from "../../../../../../../components/RichTextEditor";
import {
  useCardIsSelected,
  useCardIsDragging,
  useAnyCardDragging,
} from "../../../../context/CardContext";
import { useCanvasContext } from "../../../../context/CanvasContext";
import type { SurveyHeaderCardProps } from "./SurveyHeaderCard.types";

export const SurveyHeaderCard: React.FC<SurveyHeaderCardProps> = ({
  item,
  surveyHeaderState,
  onSurveyHeaderUpdate,
  onSelect,
}) => {
  // Use context instead of props for selection state
  const isSelected = useCardIsSelected(item.id);
  const isDragging = useCardIsDragging(item.id);
  const isAnyCardDragging = useAnyCardDragging();

  // Get canvas context for manual save integration
  const { state, actions } = useCanvasContext();

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

  // Enhanced state checks for better UX feedback
  const hasUnsavedChanges = surveyHeaderState
    ? title !== surveyHeaderState.lastSaved.title ||
      description !== surveyHeaderState.lastSaved.description
    : state.save.hasUnsavedChanges;

  return (
    <BaseCard
      isSelected={isSelected}
      isDragging={isDragging}
      isAnyCardDragging={isAnyCardDragging}
      onSelect={onSelect}
      className={`
        border-blue-200 mt-10 transition-all duration-200
        shadow-sm
        ${hasUnsavedChanges ? "shadow-lg shadow-blue-100 border-blue-300" : ""}
      `}
    >
      <div className="p-6">
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
  );
};
