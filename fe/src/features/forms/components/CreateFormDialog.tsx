import { useState } from 'react';
import type { CreateFormRequest } from '../types';

interface CreateFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFormRequest) => void;
  isLoading?: boolean;
}

export const CreateFormDialog = ({ isOpen, onClose, onSubmit, isLoading }: CreateFormDialogProps) => {
  const [formData, setFormData] = useState<CreateFormRequest>({
    title: '',
    description: '',
    form_type: 'survey',
    time_limit_minutes: 0,
    show_correct_answers: false,
    shuffle_questions: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      form_type: 'survey',
      time_limit_minutes: 0,
      show_correct_answers: false,
      shuffle_questions: false,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create New Form</h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Form Type *
              </label>
              <select
                value={formData.form_type}
                onChange={(e) => setFormData({ ...formData, form_type: e.target.value as 'survey' | 'quiz' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="survey">Survey</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>

            {formData.form_type === 'quiz' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.time_limit_minutes}
                    onChange={(e) => setFormData({ ...formData, time_limit_minutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passing Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.passing_score || ''}
                    onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="show_correct_answers"
                    checked={formData.show_correct_answers}
                    onChange={(e) => setFormData({ ...formData, show_correct_answers: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="show_correct_answers" className="text-sm text-gray-700">
                    Show correct answers after submission
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="shuffle_questions"
                    checked={formData.shuffle_questions}
                    onChange={(e) => setFormData({ ...formData, shuffle_questions: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="shuffle_questions" className="text-sm text-gray-700">
                    Shuffle questions
                  </label>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
