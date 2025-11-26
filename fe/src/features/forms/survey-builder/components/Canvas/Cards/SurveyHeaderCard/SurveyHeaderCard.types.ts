export interface SurveyHeaderCardProps {
  item: any;
  surveyHeaderState?: {
    title: string;
    description: string;
    lastSaved: {
      title: string;
      description: string;
    };
  };
  onSurveyHeaderUpdate?: (updates: { title?: string; description?: string }) => void;
  onSelect: () => void;
}