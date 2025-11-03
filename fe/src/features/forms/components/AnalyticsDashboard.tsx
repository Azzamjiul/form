import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Tabs, TabsContent, TabsList, TabsTrigger, Progress } from '../../../components/ui/index';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  Users,
  Award,
  Clock,
  Target,
  BarChart3,
  PieChartIcon,
  LineChartIcon,
} from 'lucide-react';
import type { FormAnalytics, QuestionAnalytics, SectionAnalytics } from '../types';

interface AnalyticsDashboardProps {
  analytics: FormAnalytics | null;
  questionAnalytics: QuestionAnalytics[];
  sectionAnalytics: SectionAnalytics[];
  isLoading: boolean;
  formType: 'survey' | 'quiz';
}


export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  analytics,
  questionAnalytics,
  sectionAnalytics,
  isLoading,
  formType,
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatPercentage = (value: number) => `${Math.round(value)}%`;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No analytics data available</p>
            <p className="text-sm">Analytics will appear once responses are submitted</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold">{analytics.total_responses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {formType === 'quiz' && (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold">{formatPercentage(analytics.average_score)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pass Rate</p>
                    <p className="text-2xl font-bold">{formatPercentage(analytics.pass_rate)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Time</p>
                <p className="text-2xl font-bold">{formatTime(analytics.average_time_seconds)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Questions
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <LineChartIcon className="h-4 w-4" />
            Trends
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Score Distribution */}
            {formType === 'quiz' && analytics.score_distribution && (
              <Card>
                <CardHeader>
                  <CardTitle>Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.score_distribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Response Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Response Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formType === 'quiz' && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pass Rate</span>
                        <span className="font-medium">{formatPercentage(analytics.pass_rate)}</span>
                      </div>
                      <Progress value={analytics.pass_rate} className="h-2" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average Score</span>
                      <span className="font-medium">{formatPercentage(analytics.average_score)}</span>
                    </div>
                    <Progress value={analytics.average_score} className="h-2" />
                  </div>
                  <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Responses:</span>
                        <div className="font-medium">{analytics.total_responses}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg. Time:</span>
                        <div className="font-medium">{formatTime(analytics.average_time_seconds)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {questionAnalytics.map((question) => (
              <Card key={question.field_id}>
                <CardHeader>
                  <CardTitle className="text-lg">{question.label}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{question.field_type}</Badge>
                    <span className="text-sm text-gray-500">
                      {question.total_responses} responses
                    </span>
                    {formType === 'quiz' && question.accuracy_rate !== undefined && (
                      <span className="text-sm font-medium">
                        {formatPercentage(question.accuracy_rate)} correct
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={question.answer_distribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="option_label"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sectionAnalytics.map((section) => (
              <Card key={section.section_id}>
                <CardHeader>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {section.total_responses} responses
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Avg. Score:</span>
                        <div className="text-lg font-medium">
                          {formatPercentage(section.average_score)}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Avg. Time:</span>
                        <div className="text-lg font-medium">
                          {formatTime(section.average_time_seconds)}
                        </div>
                      </div>
                    </div>
                    <Progress value={section.average_score} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.completion_trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Responses"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};