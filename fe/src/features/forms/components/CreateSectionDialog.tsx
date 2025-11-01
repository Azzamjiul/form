import React, { useState } from 'react';
import { sectionsApi } from '../api/sections';
import type { CreateSectionRequest } from '../types';
import { Dialog, Button, Input, Textarea } from '../../../components/ui';

interface CreateSectionDialogProps {
  formId: string;
  isOpen: boolean;
  onClose: () => void;
  onSectionCreated: () => void;
  defaultOrderGlobal?: number;
}

export const CreateSectionDialog: React.FC<CreateSectionDialogProps> = ({
  formId,
  isOpen,
  onClose,
  onSectionCreated,
  defaultOrderGlobal = 1,
}) => {
  const [formData, setFormData] = useState<Partial<CreateSectionRequest>>({
    title: '',
    description: '',
    order_global: defaultOrderGlobal,
    visibility_type: 'always',
    prerequisite_section_id: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Create section form submitted:', { formId, formData });
    setError(null);

    // Validation
    if (!formData.title?.trim()) {
      setError('Section title is required');
      return;
    }

    if (!formData.order_global || formData.order_global < 1) {
      setError('Valid order is required');
      return;
    }

    try {
      setLoading(true);
      const response = await sectionsApi.createSection(formId, formData as CreateSectionRequest);

      if (response.success) {
        onSectionCreated();
        onClose();
        // Reset form
        setFormData({
          title: '',
          description: '',
          order_global: defaultOrderGlobal,
          visibility_type: 'always',
          prerequisite_section_id: undefined,
        });
      } else {
        setError(response.error?.message || 'Failed to create section');
      }
    } catch (err) {
      console.error('Error creating section:', err);
      setError('An error occurred while creating the section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create Section"
      size="md"
    >
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <Input
          label="Section Title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter section title"
          autoFocus
        />

        {/* Description */}
        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          placeholder="Optional section description"
        />

        {/* Order */}
        <Input
          label="Order"
          type="number"
          required
          min="1"
          value={formData.order_global?.toString() || '1'}
          onChange={(e) =>
            setFormData({ ...formData, order_global: parseInt(e.target.value) || 1 })
          }
        />

        {/* Visibility Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Visibility
          </label>
          <select
            value={formData.visibility_type}
            onChange={(e) =>
              setFormData({
                ...formData,
                visibility_type: e.target.value as any,
                prerequisite_section_id:
                  e.target.value === 'always' ? undefined : formData.prerequisite_section_id,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="always">Always Visible</option>
            <option value="after_section">After Previous Section</option>
          </select>
        </div>

        {/* Prerequisite Section (conditional) */}
        {formData.visibility_type === 'after_section' && (
          <Input
            label="Prerequisite Section"
            value={formData.prerequisite_section_id || ''}
            onChange={(e) =>
              setFormData({ ...formData, prerequisite_section_id: e.target.value || undefined })
            }
            placeholder="Enter section ID"
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
            Create Section
          </Button>
        </div>
      </form>
    </Dialog>
  );
};