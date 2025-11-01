import React, { useState } from 'react';
import { fieldsApi } from '../api/fields';
import type { CreateFieldRequest } from '../types';

interface CreateFieldDialogProps {
  formId: string;
  isOpen: boolean;
  onClose: () => void;
  onFieldCreated: () => void;
  defaultOrderGlobal?: number;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
  { value: 'file_upload', label: 'File Upload' },
  { value: 'linear_scale', label: 'Linear Scale' },
  { value: 'grid', label: 'Grid' },
];

export const CreateFieldDialog: React.FC<CreateFieldDialogProps> = ({
  formId,
  isOpen,
  onClose,
  onFieldCreated,
  defaultOrderGlobal = 1,
}) => {
  const [formData, setFormData] = useState<Partial<CreateFieldRequest>>({
    content_type: 'input_field',
    order_global: defaultOrderGlobal,
    is_required: false,
    points: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.label) {
      setError('Label is required');
      return;
    }

    if (formData.content_type === 'input_field' && !formData.field_type) {
      setError('Field type is required for input fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fieldsApi.createField(formId, formData as CreateFieldRequest);

      if (response.success) {
        onFieldCreated();
        onClose();
        // Reset form
        setFormData({
          content_type: 'input_field',
          order_global: defaultOrderGlobal,
          is_required: false,
          points: 0,
        });
      } else {
        setError(response.error?.message || 'Failed to create field');
      }
    } catch (err) {
      console.error('Error creating field:', err);
      setError('An error occurred while creating the field');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Field</h2>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Content Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content Type *
              </label>
              <select
                value={formData.content_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    content_type: e.target.value as any,
                    field_type: e.target.value === 'input_field' ? 'text' : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="input_field">Input Field</option>
                <option value="section">Section</option>
                <option value="display_text">Display Text</option>
              </select>
            </div>

            {/* Field Type (only for input_field) */}
            {formData.content_type === 'input_field' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Type *
                </label>
                <select
                  value={formData.field_type || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, field_type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {FIELD_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label *
              </label>
              <input
                type="text"
                value={formData.label || ''}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter field label"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Optional description or help text"
              />
            </div>

            {/* Order Global */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order (Global) *
              </label>
              <input
                type="number"
                value={formData.order_global || ''}
                onChange={(e) =>
                  setFormData({ ...formData, order_global: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="1"
              />
            </div>

            {/* Required (only for input_field) */}
            {formData.content_type === 'input_field' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_required"
                  checked={formData.is_required || false}
                  onChange={(e) =>
                    setFormData({ ...formData, is_required: e.target.checked })
                  }
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_required" className="ml-2 text-sm text-gray-700">
                  Required field
                </label>
              </div>
            )}

            {/* Points (only for input_field) */}
            {formData.content_type === 'input_field' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points
                </label>
                <input
                  type="number"
                  value={formData.points || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, points: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                />
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Field'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
