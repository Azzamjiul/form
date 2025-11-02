import { useState, useEffect } from 'react';
import type { UpdateWhitelistRequest, WhitelistEntryDetail } from '../types';

interface EditWhitelistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateWhitelistRequest) => void;
  entry: WhitelistEntryDetail | null;
  isLoading?: boolean;
}

export const EditWhitelistDialog = ({
  isOpen,
  onClose,
  onSubmit,
  entry,
  isLoading
}: EditWhitelistDialogProps) => {
  const [formData, setFormData] = useState<UpdateWhitelistRequest>({
    max_attempts: undefined,
    expires_at: undefined,
    metadata: undefined,
  });

  useEffect(() => {
    if (entry && isOpen) {
      // Convert ISO string to datetime-local format
      const expiresDate = new Date(entry.expires_at);
      const localDatetime = new Date(expiresDate.getTime() - expiresDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      setFormData({
        max_attempts: entry.max_attempts,
        expires_at: localDatetime,
        metadata: entry.metadata || {},
      });
    }
  }, [entry, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert expires_at to RFC3339 format if provided
    const submitData: UpdateWhitelistRequest = {};

    if (formData.max_attempts !== undefined) {
      submitData.max_attempts = formData.max_attempts;
    }

    if (formData.expires_at) {
      const expiresDate = new Date(formData.expires_at);
      submitData.expires_at = expiresDate.toISOString();
    }

    if (formData.metadata && Object.keys(formData.metadata).length > 0) {
      submitData.metadata = formData.metadata;
    }

    onSubmit(submitData);
  };

  const handleClose = () => {
    setFormData({
      max_attempts: undefined,
      expires_at: undefined,
      metadata: undefined,
    });
    onClose();
  };

  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Edit Whitelist Entry</h2>

        <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Name:</span> {entry.name}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Email:</span> {entry.email}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">External ID:</span> {entry.external_user_id}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Attempts Used:</span> {entry.attempts_used}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Attempts
              </label>
              <input
                type="number"
                min={entry.attempts_used}
                max="10"
                value={formData.max_attempts || ''}
                onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be at least {entry.attempts_used} (already used)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expires At
              </label>
              <input
                type="datetime-local"
                value={formData.expires_at || ''}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {new Date(entry.expires_at).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metadata (Optional)
              </label>
              <textarea
                value={JSON.stringify(formData.metadata || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setFormData({ ...formData, metadata: parsed });
                  } catch {
                    // Invalid JSON, keep typing
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={4}
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
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
