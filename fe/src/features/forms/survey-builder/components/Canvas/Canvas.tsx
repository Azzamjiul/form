import React from "react";
import { DragDropCanvas } from "./DragDropCanvas";
import type { FormWithSections, CanvasItem } from "../../../types";

export const Canvas: React.FC<{
  formId: string;
  form: FormWithSections;
  onReorder?: (reorderedItems: CanvasItem[], draggedId: string, targetId: string) => Promise<void>;
  surveyHeaderState?: {
    title: string;
    description: string;
    lastSaved: {
      title: string;
      description: string;
    };
  };
  onSurveyHeaderUpdate?: (updates: { title?: string; description?: string }) => void;
}> = ({ formId, form, onReorder, surveyHeaderState, onSurveyHeaderUpdate }) => {
  return (
    <DragDropCanvas
      formId={formId}
      form={form}
      onReorder={onReorder}
      surveyHeaderState={surveyHeaderState}
      onSurveyHeaderUpdate={onSurveyHeaderUpdate}
    />
  );
};
