import React, { useEffect, useState } from 'react';
import { fieldsApi } from '../api/fields';
import type { FormField } from '../types';

interface FieldListProps {
  formId: string;
  onFieldClick?: (field: FormField) => void;
  onFieldDeleted?: () => void;
}

export const FieldList: React.FC<FieldListProps> = ({
  formId,
  onFieldClick,
  onFieldDeleted,
}) => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFields = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fieldsApi.listFields(formId);
      if (response.success && response.data) {
        setFields(response.data.fields);
      } else {
        setError(response.error?.message || 'Failed to load fields');
      }
    } catch (err) {
      setError('An error occurred while loading fields');
      console.error('Error loading fields:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFields();
  }, [formId]);

  const handleDelete = async (fieldId: string) => {
    if (!window.confirm('Are you sure you want to delete this field?')) {
      return;
    }

    try {
      await fieldsApi.deleteField(formId, fieldId);
      await loadFields();
      onFieldDeleted?.();
    } catch (err) {
      console.error('Error deleting field:', err);
      alert('Failed to delete field');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadFields}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No fields yet. Create your first field!</p>
      </div>
    );
  }

  const getFieldTypeLabel = (field: FormField) => {
    if (field.content_type === 'section') return 'Section';
    if (field.content_type === 'display_text') return 'Display Text';
    return field.field_type || 'Input Field';
  };

  return (
    <div className="space-y-2">
      {fields.map((field) => (
        <div
          key={field.field_id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-gray-500">
                  #{field.order_global}
                </span>
                <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded">
                  {getFieldTypeLabel(field)}
                </span>
                {field.is_required && (
                  <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                    Required
                  </span>
                )}
                {field.points > 0 && (
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                    {field.points} pts
                  </span>
                )}
              </div>
              <h3 className="font-medium text-gray-900">{field.label}</h3>
              {field.description && (
                <p className="text-sm text-gray-600 mt-1">{field.description}</p>
              )}
              {field.section_id && (
                <p className="text-xs text-gray-500 mt-2">
                  In section (order: {field.order_in_section})
                </p>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              {onFieldClick && (
                <button
                  onClick={() => onFieldClick(field)}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => handleDelete(field.field_id)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
