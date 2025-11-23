import React, { useState } from 'react';
import { fieldsApi } from '../api/fields';
import type { CreateFieldRequest } from '../types';
import { Dialog, Button, Input, Textarea, Toggle } from '../../../components/ui';
import { ImageUpload } from './ImageUpload';

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
    console.log('Create field form submitted:', { formId, formData });
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

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create Field"
      size="lg"
    >
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
        <Input
          label="Label"
          required
          value={formData.label || ''}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          placeholder="Enter field label"
        />

        {/* Description */}
        <Textarea
          label="Description"
          value={formData.description || ''}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          placeholder="Optional description or help text"
        />

        {/* Image Upload */}
        {formData.content_type === 'input_field' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Image (Optional)
            </label>
            <ImageUpload
              value={formData.image_file_id}
              onChange={(imageFileId) =>
                setFormData({ ...formData, image_file_id: imageFileId || undefined })
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Add an image to display alongside the question text
            </p>
          </div>
        )}

        {/* Order Global */}
        <Input
          label="Order (Global)"
          type="number"
          required
          min="1"
          value={formData.order_global?.toString() || ''}
          onChange={(e) =>
            setFormData({ ...formData, order_global: parseInt(e.target.value) })
          }
        />

        {/* Required (only for input_field) */}
        {formData.content_type === 'input_field' && (
          <Toggle
            label="Required field"
            checked={formData.is_required || false}
            onChange={(checked) =>
              setFormData({ ...formData, is_required: checked as any })
            }
          />
        )}

        {/* Points (only for input_field) */}
        {formData.content_type === 'input_field' && (
          <Input
            label="Points"
            type="number"
            min="0"
            value={formData.points?.toString() || '0'}
            onChange={(e) =>
              setFormData({ ...formData, points: parseInt(e.target.value) || 0 })
            }
          />
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={onClose}
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            className="flex-1"
          >
            Create Field
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
