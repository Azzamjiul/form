import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/index';
import {
  ArrowLeft,
  BarChart3,
  List,
  Settings,
  Users,
} from 'lucide-react';

import { formsApi } from '../api/forms';
import { responsesApi, analyticsApi, exportApi } from '../api/responses';
import type {
  FormResponseDetail,
  ResponseListParams,
  ExportOptions,
} from '../types';

import { ResponseListTable } from './ResponseListTable';
import { ResponseDetailsModal } from './ResponseDetailsModal';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { ExportMenu } from './ExportMenu';

export const AdminResultsPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('responses');
  const [selectedResponse, setSelectedResponse] = useState<FormResponseDetail | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [responseFilters, setResponseFilters] = useState<ResponseListParams>({
    page: 1,
    per_page: 20,
    sort_by: 'submitted_at',
    order: 'desc',
  });

  // Fetch form details
  const {
    data: formData,
    isLoading: isFormLoading,
    error: formError,
  } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => formsApi.getFormById(formId!),
    enabled: !!formId,
  });

  // Fetch responses
  const {
    data: responsesData,
    isLoading: isResponsesLoading,
  } = useQuery({
    queryKey: ['form-responses', formId, responseFilters],
    queryFn: () => responsesApi.getResponses(formId!, responseFilters),
    enabled: !!formId,
  });

  // Fetch analytics
  const {
    data: analyticsData,
    isLoading: isAnalyticsLoading,
  } = useQuery({
    queryKey: ['form-analytics', formId],
    queryFn: () => analyticsApi.getFormAnalytics(formId!),
    enabled: !!formId && activeTab === 'analytics',
  });

  // Fetch question analytics
  const {
    data: questionAnalyticsData,
    isLoading: isQuestionAnalyticsLoading,
  } = useQuery({
    queryKey: ['question-analytics', formId],
    queryFn: () => analyticsApi.getQuestionAnalytics(formId!),
    enabled: !!formId && activeTab === 'analytics',
  });

  // Fetch section analytics
  const {
    data: sectionAnalyticsData,
    isLoading: isSectionAnalyticsLoading,
  } = useQuery({
    queryKey: ['section-analytics', formId],
    queryFn: () => analyticsApi.getSectionAnalytics(formId!),
    enabled: !!formId && activeTab === 'analytics',
  });

  // Delete response mutation
  const deleteResponseMutation = useMutation({
    mutationFn: (responseId: string) =>
      responsesApi.deleteResponse(formId!, responseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-responses', formId] });
      queryClient.invalidateQueries({ queryKey: ['form-analytics', formId] });
    },
  });

  // Flag response mutation
  const flagResponseMutation = useMutation({
    mutationFn: ({ responseId, isFlagged }: { responseId: string; isFlagged: boolean }) =>
      responsesApi.flagResponse(formId!, responseId, { is_flagged: isFlagged }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-responses', formId] });
      if (selectedResponse) {
        setSelectedResponse({
          ...selectedResponse,
          is_flagged: !selectedResponse.is_flagged,
        });
      }
    },
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (options: ExportOptions) => exportApi.exportResponses(formId!, options),
  });

  const handleViewDetails = async (responseId: string) => {
    try {
      const responseDetail = await responsesApi.getResponse(formId!, responseId);
      setSelectedResponse(responseDetail.data);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch response details:', error);
    }
  };

  const handleDeleteResponse = async (responseId: string) => {
    if (window.confirm('Are you sure you want to delete this response? This action cannot be undone.')) {
      try {
        await deleteResponseMutation.mutateAsync(responseId);
      } catch (error) {
        console.error('Failed to delete response:', error);
      }
    }
  };

  const handleFlagResponse = async (responseId: string, isFlagged: boolean) => {
    try {
      await flagResponseMutation.mutateAsync({ responseId, isFlagged });
    } catch (error) {
      console.error('Failed to flag response:', error);
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
      console.error('Export failed:', error);
      throw error;
    }
  };

  if (isFormLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (formError || !formData?.data) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-red-500">
              <p className="text-lg font-medium">Failed to load form</p>
              <p className="text-sm">Please try again or contact support</p>
              <Button
                onClick={() => navigate('/forms')}
                variant="outline"
                className="mt-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Forms
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const form = formData.data;
  const responses = responsesData?.data;
  const analytics = analyticsData?.data || null;
  const questionAnalytics = questionAnalyticsData?.data || [];
  const sectionAnalytics = sectionAnalyticsData?.data || [];

  const totalResponses = responses?.pagination.total_items || 0;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/forms')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Badge variant="outline" className="capitalize">
              {form.form_type}
            </Badge>
            {form.is_published ? (
              <Badge variant="default">Published</Badge>
            ) : (
              <Badge variant="secondary">Draft</Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold">{form.title}</h1>
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
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold">{totalResponses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <List className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold">{form.fields?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {form.form_type === 'quiz' && (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Points</p>
                    <p className="text-2xl font-bold">{form.total_points}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {form.passing_score && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Settings className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Passing Score</p>
                      <p className="text-2xl font-bold">{form.passing_score}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="responses" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Responses ({totalResponses})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Responses Tab */}
        <TabsContent value="responses" className="space-y-4">
          {totalResponses === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-500">
                  <List className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No responses yet</p>
                  <p className="text-sm">Responses will appear here once people start submitting the form</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <ResponseListTable
              responses={responses?.responses || []}
              pagination={responses?.pagination || {
                current_page: 1,
                per_page: 20,
                total_items: 0,
                total_pages: 0,
              }}
              isLoading={isResponsesLoading}
              onViewDetails={handleViewDetails}
              onDeleteResponse={handleDeleteResponse}
              onFlagResponse={handleFlagResponse}
              onPageChange={handlePageChange}
              onFiltersChange={handleFiltersChange}
              formType={form.form_type}
            />
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsDashboard
            analytics={analytics}
            questionAnalytics={questionAnalytics}
            sectionAnalytics={sectionAnalytics}
            isLoading={isAnalyticsLoading || isQuestionAnalyticsLoading || isSectionAnalyticsLoading}
            formType={form.form_type}
          />
        </TabsContent>
      </Tabs>

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
};