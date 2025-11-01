import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formsApi } from "../../features/forms";
import { ProtectedRoute } from "../../features/auth";
import { SurveyBuilder } from "../../features/forms/components/SurveyBuilder";
import { TopNavigation } from "../../features/forms/components/TopNavigation";
import type { FormWithSections } from "../../features/forms/types";

export default function FormDetailPage() {
  return (
    <ProtectedRoute>
      <FormBuilderContent />
    </ProtectedRoute>
  );
}

function FormBuilderContent() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["form", formId],
    queryFn: () => formsApi.getFormById(formId!),
    enabled: !!formId,
  });

  const updateFormMutation = useMutation({
    mutationFn: (data: {
      title?: string;
      description?: string;
      shuffle_questions?: boolean;
    }) => formsApi.updateForm(formId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form", formId] });
    },
  });

  const handleFormUpdate = (data: {
    title?: string;
    description?: string;
    shuffle_questions?: boolean;
  }) => {
    updateFormMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500">Loading form...</div>
        </div>
      </div>
    );
  }

  if (error || !data?.success || !data?.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            Error loading form. Please try again.
          </div>
          <button
            onClick={() => navigate("/forms")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Back to Forms
          </button>
        </div>
      </div>
    );
  }

  const form = data.data as FormWithSections;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <TopNavigation form={form} onFormUpdate={handleFormUpdate} />

      {/* Survey Builder */}
      <SurveyBuilder formId={formId!} initialForm={form} />
    </div>
  );
}
