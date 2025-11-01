import React, { useState } from 'react';
import { FieldList } from './FieldList';
import { CreateFieldDialog } from './CreateFieldDialog';
import type { FormField } from '../types';

interface FieldManagementProps {
  formId: string;
}

export const FieldManagement: React.FC<FieldManagementProps> = ({ formId }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFieldCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleFieldDeleted = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleFieldClick = (field: FormField) => {
    // TODO: Implement edit functionality
    console.log('Edit field:', field);
    alert('Edit functionality coming soon!');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Form Fields</h2>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Add Field
        </button>
      </div>

      <FieldList
        key={refreshKey}
        formId={formId}
        onFieldClick={handleFieldClick}
        onFieldDeleted={handleFieldDeleted}
      />

      <CreateFieldDialog
        formId={formId}
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onFieldCreated={handleFieldCreated}
      />
    </div>
  );
};
