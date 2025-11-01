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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Add Respondent Access</h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                External User ID *
              </label>
              <input
                type="text"
                value={formData.external_user_id}
                onChange={(e) => setFormData({ ...formData, external_user_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CRM_USER_123"
                required
              />
              <p className="text-xs text-gray-500 mt-1">ID from your CRM or external system</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="respondent@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Attempts *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.max_attempts}
                onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">How many times can they attempt the quiz</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expires At *
              </label>
              <input
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">When this access expires</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={3}
                placeholder='{"department": "Sales", "manager": "Jane"}'
              />
              <p className="text-xs text-gray-500 mt-1">Additional data in JSON format</p>
            </div>
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
              {isLoading ? 'Adding...' : 'Add Access'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
