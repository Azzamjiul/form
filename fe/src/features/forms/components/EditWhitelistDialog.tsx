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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Whitelist Entry</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Current Information</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Name:</span> {entry.name}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Email:</span> {entry.email}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">External ID:</span> <code className="font-mono text-xs bg-white/70 px-2 py-0.5 rounded">{entry.external_user_id}</code>
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-gray-900">Attempts Used:</span> <span className="font-bold text-blue-600">{entry.attempts_used}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Max Attempts
              </label>
              <input
                type="number"
                min={entry.attempts_used}
                max="10"
                value={formData.max_attempts || ''}
                onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) || undefined })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Must be at least {entry.attempts_used} (already used)
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Expires At
              </label>
              <input
                type="datetime-local"
                value={formData.expires_at || ''}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Current: {new Date(entry.expires_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm transition-all"
                rows={4}
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
                  Updating...
                </span>
              ) : (
                'Update'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
