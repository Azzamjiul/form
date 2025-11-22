import { useParams, useNavigate, useLocation } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formsApi } from "../../features/forms";
import { ProtectedRoute } from "../../features/auth";
import { SurveyBuilder } from "../../features/forms/components/SurveyBuilder";
import { TopNavigation } from "../../features/forms/components/TopNavigation";
import { WhitelistManagement } from "../../features/forms/components/WhitelistManagement";
import { ResponseListTable } from "../../features/forms/components/ResponseListTable";
import { ResponseDetailsModal } from "../../features/forms/components/ResponseDetailsModal";
import { AnalyticsDashboard } from "../../features/forms/components/AnalyticsDashboard";
import { ExportMenu } from "../../features/forms/components/ExportMenu";
import {
  responsesApi,
  analyticsApi,
  exportApi,
} from "../../features/forms/api/responses";
import type {
  FormWithSections,
  FormResponseDetail,
  ResponseListParams,
  ExportOptions,
} from "../../features/forms/types";
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
  const location = useLocation();
  const queryClient = useQueryClient();

  // Get active tab from URL hash, default to 'builder'
  const getActiveTabFromHash = (): "builder" | "access" | "results" => {
    const hash = location.hash.replace("#", "");
    return ["builder", "access", "results"].includes(hash)
      ? (hash as "builder" | "access" | "results")
      : "builder";
  };

  const [activeTab, setActiveTab] = useState<"builder" | "access" | "results">(
    getActiveTabFromHash(),
  );

  // Results state management
  const [resultsActiveTab, setResultsActiveTab] = useState("responses");
  const [selectedResponse, setSelectedResponse] =
    useState<FormResponseDetail | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [responseFilters, setResponseFilters] = useState<ResponseListParams>({
    page: 1,
    per_page: 20,
    sort_by: "submitted_at",
    order: "desc",
  });

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

  // Results queries
  const { data: responsesData, isLoading: isResponsesLoading } = useQuery({
    queryKey: ["form-responses", formId, responseFilters],
    queryFn: () => responsesApi.getResponses(formId!, responseFilters),
    enabled: !!formId,
  });

  const { data: analyticsData, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ["form-analytics", formId],
    queryFn: () => analyticsApi.getFormAnalytics(formId!),
    enabled: !!formId && activeTab === "results",
  });

  const { data: questionAnalyticsData, isLoading: isQuestionAnalyticsLoading } =
    useQuery({
      queryKey: ["question-analytics", formId],
      queryFn: () => analyticsApi.getQuestionAnalytics(formId!),
      enabled: !!formId && activeTab === "results",
    });

  const { data: sectionAnalyticsData, isLoading: isSectionAnalyticsLoading } =
    useQuery({
      queryKey: ["section-analytics", formId],
      queryFn: () => analyticsApi.getSectionAnalytics(formId!),
      enabled: !!formId && activeTab === "results",
    });

  // Results mutations
  const deleteResponseMutation = useMutation({
    mutationFn: (responseId: string) =>
      responsesApi.deleteResponse(formId!, responseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-responses", formId] });
      queryClient.invalidateQueries({ queryKey: ["form-analytics", formId] });
    },
  });

  const flagResponseMutation = useMutation({
    mutationFn: ({
      responseId,
      isFlagged,
    }: {
      responseId: string;
      isFlagged: boolean;
    }) =>
      responsesApi.flagResponse(formId!, responseId, { is_flagged: isFlagged }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-responses", formId] });
      if (selectedResponse) {
        setSelectedResponse({
          ...selectedResponse,
          is_flagged: !selectedResponse.is_flagged,
        });
      }
    },
  });

  const exportMutation = useMutation({
    mutationFn: (options: ExportOptions) =>
      exportApi.exportResponses(formId!, options),
  });

  // Sync active tab with URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const newTab = getActiveTabFromHash();
      setActiveTab(newTab);
    };

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

    // Initial sync
    handleHashChange();

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [location.hash]);

  // Tab navigation with URL hash
  const handleTabClick = (tab: "builder" | "access" | "results") => {
    navigate(`#${tab}`);
  };

  const handleFormUpdate = (data: {
    title?: string;
    description?: string;
    shuffle_questions?: boolean;
  }) => {
    updateFormMutation.mutate(data);
  };

  // Results handler functions
  const handleViewDetails = async (responseId: string) => {
    try {
      const responseDetail = await responsesApi.getResponse(
        formId!,
        responseId,
      );
      setSelectedResponse(responseDetail.data);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch response details:", error);
    }
  };

  const handleDeleteResponse = async (responseId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this response? This action cannot be undone.",
      )
    ) {
      try {
        await deleteResponseMutation.mutateAsync(responseId);
      } catch (error) {
        console.error("Failed to delete response:", error);
      }
    }
  };

  const handleFlagResponse = async (responseId: string, isFlagged: boolean) => {
    try {
      await flagResponseMutation.mutateAsync({ responseId, isFlagged });
    } catch (error) {
      console.error("Failed to flag response:", error);
    }
  };

  const handlePageChange = (page: number) => {
    setResponseFilters({ ...responseFilters, page });
  };

  const handleFiltersChange = (filters: ResponseListParams) => {
    setResponseFilters({ ...filters, page: 1 });
  };

  const handleExport = async (options: ExportOptions) => {
    try {
      await exportMutation.mutateAsync(options);
    } catch (error) {
      console.error("Export failed:", error);
      throw error;
    }
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

  // Results data calculations
  const responses = responsesData?.data;
  const analytics = analyticsData?.data || null;
  const questionAnalytics = questionAnalyticsData?.data || [];
  const sectionAnalytics = sectionAnalyticsData?.data || [];
  const totalResponses = responses?.pagination.total_items || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <TopNavigation form={form} onFormUpdate={handleFormUpdate} />

      {/* Tab Navigation */}
      <div className="fixed top-14 left-0 right-0 bg-white border-b border-gray-200 z-10">
        <div className="flex gap-1 px-4">
          <button
            onClick={() => handleTabClick("builder")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "builder"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            Questions
          </button>
          <button
            onClick={() => handleTabClick("access")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "access"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            Access Control
          </button>
          <button
            onClick={() => handleTabClick("results")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "results"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Results
          </button>
        </div>
      </div>

      {/* Content Area - adjust top padding for tabs */}
      <div className="pt-14">
        {activeTab === "builder" ? (
          <SurveyBuilder formId={formId!} initialForm={form} />
        ) : activeTab === "access" ? (
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <WhitelistManagement formId={formId!} />
          </div>
        ) : (
          /* Results Tab Content */
          <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between mt-10">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">Results</h1>
                {form.description && (
                  <p className="text-gray-600">{form.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <ExportMenu
                  onExport={handleExport}
                  isLoading={exportMutation.isPending}
                  disabled={totalResponses === 0}
                />
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Responses
                    </p>
                    <p className="text-2xl font-bold">{totalResponses}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Questions
                    </p>
                    <p className="text-2xl font-bold">
                      {form.fields?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              {form.form_type === "quiz" && (
                <>
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Total Points
                        </p>
                        <p className="text-2xl font-bold">
                          {form.total_points}
                        </p>
                      </div>
                    </div>
                  </div>

                  {form.passing_score && (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <BarChart3 className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">
                            Passing Score
                          </p>
                          <p className="text-2xl font-bold">
                            {form.passing_score}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Results Tabs */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setResultsActiveTab("responses")}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      resultsActiveTab === "responses"
                        ? "border-purple-600 text-purple-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Responses ({totalResponses})
                  </button>
                  <button
                    onClick={() => setResultsActiveTab("analytics")}
                    className={`px-6 py-3 text-sm font-medium border-b-2 ${
                      resultsActiveTab === "analytics"
                        ? "border-purple-600 text-purple-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Analytics
                  </button>
                </div>
              </div>

              <div className="p-6">
                {resultsActiveTab === "responses" ? (
                  totalResponses === 0 ? (
                    <div className="text-center py-12">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium text-gray-900">
                        No responses yet
                      </p>
                      <p className="text-gray-600">
                        Responses will appear here once people start submitting
                        the form
                      </p>
                    </div>
                  ) : (
                    <ResponseListTable
                      responses={responses?.responses || []}
                      pagination={
                        responses?.pagination || {
                          current_page: 1,
                          per_page: 20,
                          total_items: 0,
                          total_pages: 0,
                        }
                      }
                      isLoading={isResponsesLoading}
                      onViewDetails={handleViewDetails}
                      onDeleteResponse={handleDeleteResponse}
                      onFlagResponse={handleFlagResponse}
                      onPageChange={handlePageChange}
                      onFiltersChange={handleFiltersChange}
                      formType={form.form_type}
                    />
                  )
                ) : (
                  <AnalyticsDashboard
                    analytics={analytics}
                    questionAnalytics={questionAnalytics}
                    sectionAnalytics={sectionAnalytics}
                    isLoading={
                      isAnalyticsLoading ||
                      isQuestionAnalyticsLoading ||
                      isSectionAnalyticsLoading
                    }
                    formType={form.form_type}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Response Details Modal */}
      <ResponseDetailsModal
        response={selectedResponse}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedResponse(null);
        }}
        onFlagResponse={handleFlagResponse}
        isLoading={flagResponseMutation.isPending}
      />
    </div>
  );
}
