import { useState } from 'react';
import type { CreateWhitelistRequest } from '../types';

interface CreateWhitelistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateWhitelistRequest) => void;
  isLoading?: boolean;
}

export const CreateWhitelistDialog = ({ isOpen, onClose, onSubmit, isLoading }: CreateWhitelistDialogProps) => {
  const [formData, setFormData] = useState<CreateWhitelistRequest>({
    external_user_id: '',
    email: '',
    name: '',
    max_attempts: 1,
    expires_at: '',
    metadata: {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert expires_at to RFC3339 format
    const expiresDate = new Date(formData.expires_at);
    const rfc3339Date = expiresDate.toISOString();

    onSubmit({
      ...formData,
      expires_at: rfc3339Date,
      metadata: formData.metadata && Object.keys(formData.metadata).length > 0
        ? formData.metadata
        : undefined,
    });
  };

  const handleClose = () => {
    setFormData({
      external_user_id: '',
      email: '',
      name: '',
      max_attempts: 1,
      expires_at: '',
      metadata: {},
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add Respondent Access</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                External User ID *
              </label>
              <input
                type="text"
                value={formData.external_user_id}
                onChange={(e) => setFormData({ ...formData, external_user_id: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="CRM_USER_123"
                required
              />
              <p className="text-xs text-gray-500 mt-1.5">ID from your CRM or external system</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="respondent@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Max Attempts *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.max_attempts}
                onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-1.5">How many times can they attempt the quiz</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Expires At *
              </label>
              <input
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-1.5">When this access expires</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Metadata (Optional)
              </label>
              <textarea
                value={JSON.stringify(formData.metadata, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setFormData({ ...formData, metadata: parsed });
                  } catch {
                    // Invalid JSON, keep typing
                  }
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm transition-all"
                rows={3}
                placeholder='{"department": "Sales", "manager": "Jane"}'
              />
              <p className="text-xs text-gray-500 mt-1.5">Additional data in JSON format</p>
            </div>
          </div>

          <div className="flex gap-3 mt-8 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Adding...
                </span>
              ) : (
                'Add Access'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
