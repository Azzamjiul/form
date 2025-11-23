import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { formsApi } from '../../features/forms';
import type { CreateFormRequest, FormListParams } from '../../features/forms';
import { FormList, CreateFormDialog } from '../../features/forms/components';
import { FormListSkeleton } from '../../components/ui/Skeleton';
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
      // Extract plain text from HTML title for the prompt
      const getPlainText = (html: string) => {
        const div = document.createElement('div');
        div.innerHTML = html || '';
        return div.textContent || div.innerText || '';
      };

      const plainTitle = getPlainText(form.title || 'Untitled Form');
      const newTitle = prompt('Enter a title for the duplicated form:', `${plainTitle} - Copy`);
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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Forms</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Create and manage your surveys and quizzes
            </p>
          </div>
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Form
          </button>
        </div>

        {isLoading && <FormListSkeleton />}

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

