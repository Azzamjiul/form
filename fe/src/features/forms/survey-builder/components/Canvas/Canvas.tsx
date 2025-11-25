import React from "react";
import { DragDropCanvas } from "./DragDropCanvas";
import type { FormWithSections } from "../../../types";

export const Canvas: React.FC<{ formId: string; form: FormWithSections }> = ({ formId, form }) => {
  return <DragDropCanvas formId={formId} form={form} />;
};
