import React, { useState } from 'react';
import { Dialog, Toggle, Textarea } from '../../../components/ui';
import type { FormWithSections } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: FormWithSections;
  onFormUpdate: (data: any) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  form,
  onFormUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'presentation' | 'responses' | 'confirmation'>('presentation');

  // Settings states
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [showQuestionNumbers, setShowQuestionNumbers] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(form.shuffle_questions);
  const [oneQuestionPerPage, setOneQuestionPerPage] = useState(false);
  const [collectEmail, setCollectEmail] = useState(false);
  const [allowEditResponses, setAllowEditResponses] = useState(false);
  const [limitOneResponse, setLimitOneResponse] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(true);
  const [confirmationMessage, setConfirmationMessage] = useState(
    'Thank you for completing our survey! Your response has been recorded.'
  );

  const handleSaveSettings = () => {
    const settings = {
      shuffle_questions: shuffleQuestions,
      show_correct_answers: form.show_correct_answers,
      // Add other settings as needed
    };
    onFormUpdate(settings);
    onClose();
  };

  const renderPresentationTab = () => (
    <div className="space-y-4">
      <Toggle
        label="Show progress bar"
        description="Display a progress bar at the top of the form"
        checked={showProgressBar}
        onChange={(checked) => setShowProgressBar(checked as any)}
      />
      <Toggle
        label="Show question numbers"
        description="Number each question in the form"
        checked={showQuestionNumbers}
        onChange={(checked) => setShowQuestionNumbers(checked as any)}
      />
      <Toggle
        label="Shuffle question order"
        description="Randomize the order of questions for each respondent"
        checked={shuffleQuestions}
        onChange={(checked) => setShuffleQuestions(checked as any)}
      />
      <Toggle
        label="One question per page"
        description="Show one question at a time with navigation buttons"
        checked={oneQuestionPerPage}
        onChange={(checked) => setOneQuestionPerPage(checked as any)}
      />
    </div>
  );

  const renderResponsesTab = () => (
    <div className="space-y-4">
      <Toggle
        label="Collect email addresses"
        description="Require respondents to provide their email address"
        checked={collectEmail}
        onChange={(checked) => setCollectEmail(checked as any)}
      />
      <Toggle
        label="Allow users to edit responses"
        description="Let respondents go back and change their answers"
        checked={allowEditResponses}
        onChange={(checked) => setAllowEditResponses(checked as any)}
      />
      <Toggle
        label="Limit to one response per user"
        description="Prevent users from submitting the form multiple times"
        checked={limitOneResponse}
        onChange={(checked) => setLimitOneResponse(checked as any)}
      />
      <Toggle
        label="Show confirmation message"
        description="Display a custom message after form submission"
        checked={showConfirmationMessage}
        onChange={(checked) => setShowConfirmationMessage(checked as any)}
      />
    </div>
  );

  const renderConfirmationTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirmation message
        </label>
        <Textarea
          value={confirmationMessage}
          onChange={(e) => setConfirmationMessage(e.target.value)}
          rows={4}
          placeholder="Enter the message respondents will see after submitting the form"
        />
      </div>
    </div>
  );

  const tabs = [
    { id: 'presentation', label: 'Presentation' },
    { id: 'responses', label: 'Responses' },
    { id: 'confirmation', label: 'Confirmation Message' },
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      size="lg"
    >
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              px-4 py-2 text-sm font-medium border-b-2 transition-colors
              ${activeTab === tab.id
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mb-6">
        {activeTab === 'presentation' && renderPresentationTab()}
        {activeTab === 'responses' && renderResponsesTab()}
        {activeTab === 'confirmation' && renderConfirmationTab()}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveSettings}
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Save
        </button>
      </div>
    </Dialog>
  );
};