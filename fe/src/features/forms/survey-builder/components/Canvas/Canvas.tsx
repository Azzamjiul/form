import React from 'react';
import { DragDropCanvas } from './DragDropCanvas';

export const Canvas: React.FC<{ formId: string }> = ({ formId }) => {
  return <DragDropCanvas formId={formId} />;
};