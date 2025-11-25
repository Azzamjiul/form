import React from 'react';
import { SurveyBuilder as OriginalSurveyBuilder } from '../../components/SurveyBuilder';

// Simple wrapper to maintain compatibility while refactoring is complete
export const SurveyBuilder: React.FC<any> = (props) => {
  return <OriginalSurveyBuilder {...props} />;
};