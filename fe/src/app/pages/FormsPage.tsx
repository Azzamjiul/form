import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { formsApi } from '../../features/forms';
import type { CreateFormRequest, FormListParams } from '../../features/forms';
import { FormList, CreateFormDialog } from '../../features/forms/components';
import { DashboardLayout } from '../../components/layout';
import { ProtectedRoute } from '../../features/auth';

export default function FormsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <FormsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function FormsContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [params, setParams] = useState<FormListParams>({
    page: 1,
    per_page: 9,
    sort_by: 'modified',
    order: 'desc',
  });

  // Fetch forms
  const { data, isLoading, error } = useQuery({
    queryKey: ['forms', params],
    queryFn: () => formsApi.listUserForms(params),
  });

  // Create form mutation
  const createFormMutation = useMutation({
    mutationFn: (data: CreateFormRequest) => formsApi.createForm(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        queryClient.invalidateQueries({ queryKey: ['forms'] });
        setIsCreateDialogOpen(false);
        // Navigate to the form editor
        navigate(`/forms/${response.data.form_id}`);
      }
    },
  });

  // Delete form mutation
  const deleteFormMutation = useMutation({
    mutationFn: (formId: string) => formsApi.deleteForm(formId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
  });

  // Duplicate form mutation
  const duplicateFormMutation = useMutation({
    mutationFn: ({ formId, newTitle }: { formId: string; newTitle: string }) =>
      formsApi.duplicateForm(formId, { new_title: newTitle }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
  });

  // Publish form mutation
  const publishFormMutation = useMutation({
    mutationFn: (formId: string) => formsApi.publishForm(formId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
    },
  });

  const handleCreateForm = (formData: CreateFormRequest) => {
    createFormMutation.mutate(formData);
  };

  const handleDeleteForm = (formId: string) => {
    deleteFormMutation.mutate(formId);
  };

  const handleDuplicateForm = (formId: string) => {
    const form = data?.data?.forms.find((f) => f.form_id === formId);
    if (form) {
      const newTitle = prompt('Enter a title for the duplicated form:', `${form.title} - Copy`);
      if (newTitle) {
        duplicateFormMutation.mutate({ formId, newTitle });
      }
    }
  };

  const handlePublishForm = (formId: string) => {
    if (confirm('Are you sure you want to publish this form? It will be available for respondents.')) {
      publishFormMutation.mutate(formId);
    }
  };

  const handleFormClick = (formId: string) => {
    navigate(`/forms/${formId}`);
  };

  const handlePageChange = (page: number) => {
    setParams({ ...params, page });
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Forms</h1>
            <p className="text-gray-600 mt-1">
              Create and manage your surveys and quizzes
            </p>
          </div>
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Form
          </button>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading forms...</div>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-red-600">Error loading forms. Please try again.</div>
          </div>
        )}

        {data?.success && data.data && (
          <FormList
            forms={data.data.forms}
            pagination={data.data.pagination}
            onDelete={handleDeleteForm}
            onDuplicate={handleDuplicateForm}
            onPublish={handlePublishForm}
            onClick={handleFormClick}
            onPageChange={handlePageChange}
          />
        )}

        <CreateFormDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={handleCreateForm}
          isLoading={createFormMutation.isPending}
        />
      </div>
    </div>
  );
}

