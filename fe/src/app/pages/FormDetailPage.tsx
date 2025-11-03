import { useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formsApi } from "../../features/forms";
import { ProtectedRoute } from "../../features/auth";
import { SurveyBuilder } from "../../features/forms/components/SurveyBuilder";
import { TopNavigation } from "../../features/forms/components/TopNavigation";
import { WhitelistManagement } from "../../features/forms/components/WhitelistManagement";
import type { FormWithSections } from "../../features/forms/types";
import { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<'builder' | 'access' | 'results'>('builder');

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

  // Navigate to results page when results tab is selected
  useEffect(() => {
    if (activeTab === 'results') {
      navigate(`/forms/${formId}/results`);
    }
  }, [activeTab, formId, navigate]);

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

      {/* Tab Navigation */}
      <div className="fixed top-14 left-0 right-0 bg-white border-b border-gray-200 z-10">
        <div className="flex gap-1 px-4">
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'builder'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            Questions
          </button>
          <button
            onClick={() => setActiveTab('access')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'access'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            Access Control
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'results'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Results
          </button>
        </div>
      </div>

      {/* Content Area - adjust top padding for tabs */}
      <div className="pt-14">
        {activeTab === 'builder' ? (
          <SurveyBuilder formId={formId!} initialForm={form} />
        ) : (
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <WhitelistManagement formId={formId!} />
          </div>
        )}
      </div>
    </div>
  );
}
