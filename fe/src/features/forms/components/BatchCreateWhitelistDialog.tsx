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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Batch Add Respondents</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSV Data
            </label>
            <div className="text-xs text-gray-500 mb-2 p-3 bg-gray-50 rounded border border-gray-200">
              <p className="font-medium mb-1">CSV Format (comma-separated):</p>
              <code className="block font-mono text-xs">
                external_user_id,email,name,max_attempts,expires_at,metadata
                <br />
                CRM_001,user1@example.com,John Doe,1,2025-02-20T23:59:59Z,{"{\"department\":\"Sales\"}"}
                <br />
                CRM_002,user2@example.com,Jane Smith,2,2025-02-20T23:59:59Z,{"{\"department\":\"Marketing\"}"}
              </code>
              <p className="mt-2 text-gray-600">
                Note: metadata column is optional. If included, must be valid JSON.
              </p>
            </div>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={8}
              placeholder="Paste your CSV data here..."
            />
          </div>

          {parseError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{parseError}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleParseCSV}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            disabled={!csvText.trim() || isLoading}
          >
            Parse CSV
          </button>

          {previewData.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Preview ({previewData.length} entries)
              </h3>
              <div className="border border-gray-200 rounded-md overflow-x-auto max-h-64">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">External ID</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Max Attempts</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Expires</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((entry, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 whitespace-nowrap">{entry.external_user_id}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{entry.email}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{entry.name}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{entry.max_attempts}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {new Date(entry.expires_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
            type="button"
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading || previewData.length === 0}
          >
            {isLoading ? 'Creating...' : `Create ${previewData.length} Entries`}
          </button>
        </div>
      </div>
    </div>
  );
};
