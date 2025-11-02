import { useState } from 'react';
import type { BatchCreateWhitelistRequest, CreateWhitelistRequest } from '../types';

interface BatchCreateWhitelistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BatchCreateWhitelistRequest) => void;
  isLoading?: boolean;
}

export const BatchCreateWhitelistDialog = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading
}: BatchCreateWhitelistDialogProps) => {
  const [csvText, setCsvText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<CreateWhitelistRequest[]>([]);

  const handleParseCSV = () => {
    try {
      setParseError(null);
      const lines = csvText.trim().split('\n');

      if (lines.length < 2) {
        setParseError('CSV must have at least a header row and one data row');
        return;
      }

      // Parse header
      const header = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredFields = ['external_user_id', 'email', 'name', 'max_attempts', 'expires_at'];

      for (const field of requiredFields) {
        if (!header.includes(field)) {
          setParseError(`Missing required field: ${field}`);
          return;
        }
      }

      // Parse data rows
      const entries: CreateWhitelistRequest[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());

        if (values.length !== header.length) {
          setParseError(`Row ${i + 1}: Column count mismatch`);
          return;
        }

        const entry: any = {};
        header.forEach((field, index) => {
          entry[field] = values[index];
        });

        // Convert max_attempts to number
        entry.max_attempts = parseInt(entry.max_attempts);
        if (isNaN(entry.max_attempts)) {
          setParseError(`Row ${i + 1}: max_attempts must be a number`);
          return;
        }

        // Convert expires_at to RFC3339
        const expiresDate = new Date(entry.expires_at);
        if (isNaN(expiresDate.getTime())) {
          setParseError(`Row ${i + 1}: Invalid date format for expires_at`);
          return;
        }
        entry.expires_at = expiresDate.toISOString();

        // Parse metadata if present
        if (entry.metadata) {
          try {
            entry.metadata = JSON.parse(entry.metadata);
          } catch {
            setParseError(`Row ${i + 1}: Invalid JSON in metadata field`);
            return;
          }
        }

        entries.push(entry as CreateWhitelistRequest);
      }

      setPreviewData(entries);
    } catch (error) {
      setParseError('Failed to parse CSV: ' + (error as Error).message);
    }
  };

  const handleSubmit = () => {
    if (previewData.length === 0) {
      setParseError('Please parse the CSV first');
      return;
    }

    onSubmit({ entries: previewData });
  };

  const handleClose = () => {
    setCsvText('');
    setParseError(null);
    setPreviewData([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Batch Add Respondents</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              CSV Data
            </label>
            <div className="text-xs mb-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <p className="font-semibold text-gray-900 mb-2">CSV Format (comma-separated):</p>
              <code className="block font-mono text-xs bg-white/70 p-3 rounded border border-blue-200">
                external_user_id,email,name,max_attempts,expires_at,metadata
                <br />
                CRM_001,user1@example.com,John Doe,1,2025-02-20T23:59:59Z,{"{\"department\":\"Sales\"}"}
                <br />
                CRM_002,user2@example.com,Jane Smith,2,2025-02-20T23:59:59Z,{"{\"department\":\"Marketing\"}"}
              </code>
              <p className="mt-2 text-gray-700 text-xs">
                Note: metadata column is optional. If included, must be valid JSON.
              </p>
            </div>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm transition-all"
              rows={8}
              placeholder="Paste your CSV data here..."
            />
          </div>

          {parseError && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-800 font-medium">{parseError}</p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={handleParseCSV}
            className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            disabled={!csvText.trim() || isLoading}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Parse CSV
            </span>
          </button>

          {previewData.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h3 className="text-sm font-semibold text-green-900">
                  Preview ({previewData.length} entries ready)
                </h3>
              </div>
              <div className="border border-green-200 rounded-lg overflow-hidden bg-white max-h-64 overflow-y-auto">
                <table className="min-w-full divide-y divide-green-100 text-sm">
                  <thead className="bg-green-50/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">External ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Max Attempts</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Expires</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {previewData.map((entry, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{entry.external_user_id}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">{entry.email}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-900">{entry.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">{entry.max_attempts}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                          {new Date(entry.expires_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
            type="button"
            onClick={handleSubmit}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            disabled={isLoading || previewData.length === 0}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                Creating...
              </span>
            ) : (
              `Create ${previewData.length} Entries`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
