import React from 'react';
import {
  Dialog,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/index';
import {
  Clock,
  User,
  Calendar,
  Flag,
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
} from 'lucide-react';
import type { FormResponseDetail } from '../types/index';
import { format } from 'date-fns';

interface ResponseDetailsModalProps {
  response: FormResponseDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onFlagResponse: (responseId: string, isFlagged: boolean) => void;
  isLoading: boolean;
}

export const ResponseDetailsModal: React.FC<ResponseDetailsModalProps> = ({
  response,
  isOpen,
  onClose,
  onFlagResponse,
  isLoading,
}) => {
  if (!response) return null;

  const formatTimeSpent = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatAnswerValue = (answer: any) => {
    if (answer === null || answer === undefined) {
      return <span className="text-gray-500 italic">Not answered</span>;
    }

    if (Array.isArray(answer)) {
      return (
        <div className="space-y-1">
          {answer.map((item, index) => (
            <div key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
              {typeof item === 'object' ? JSON.stringify(item) : formatSingleAnswer(item)}
            </div>
          ))}
        </div>
      );
    }

    if (typeof answer === 'object') {
      return <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">{JSON.stringify(answer, null, 2)}</pre>;
    }

    return <div className="text-sm">{formatSingleAnswer(answer)}</div>;
  };

  const formatSingleAnswer = (answer: string) => {
    if (typeof answer !== 'string') {
      return answer;
    }

    // Check if the answer contains HTML tags
    if (/<[^>]+>/.test(answer)) {
      return (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: answer }}
        />
      );
    }

    return answer;
  };

  const correctAnswers = response.answers.filter(a => a.is_correct === true).length;
  const totalAnswered = response.answers.filter(a => a.user_answer !== null && a.user_answer !== undefined).length;
  const totalPoints = response.answers.reduce((sum, a) => sum + (a.max_points || 0), 0);
  const earnedPoints = response.answers.reduce((sum, a) => sum + (a.points_earned || 0), 0);

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="xl">
      <div className="max-h-[90vh] overflow-y-auto">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Response Details</h2>
            <div className="flex items-center gap-2">
              {response.is_flagged && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  <Flag className="h-3 w-3 mr-1" />
                  Flagged
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFlagResponse(response.response_id, !response.is_flagged)}
                disabled={isLoading}
              >
                <Flag className="h-4 w-4 mr-2" />
                {response.is_flagged ? 'Unflag' : 'Flag'}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Summary Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-2" />
                    Respondent
                  </div>
                  <div>
                    <div className="font-medium">
                      {response.name || 'Anonymous'}
                    </div>
                    {response.email && (
                      <div className="text-sm text-gray-500">{response.email}</div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    Submitted
                  </div>
                  <div>
                    <div className="text-sm">
                      {format(new Date(response.submitted_at), 'MMM d, yyyy')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(response.submitted_at), 'h:mm a')}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    Time Spent
                  </div>
                  <div className="text-sm font-medium">
                    {formatTimeSpent(response.time_spent_seconds)}
                  </div>
                </div>

                {response.form_info.form_type === 'quiz' && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Award className="h-4 w-4 mr-2" />
                      Performance
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-bold">
                        {response.score !== undefined ? `${response.score}%` : 'N/A'}
                      </div>
                      <div className="flex items-center gap-2">
                        {response.is_passed !== undefined && (
                          <Badge variant={response.is_passed ? 'default' : 'destructive'}>
                            {response.is_passed ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Passed
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Failed
                              </>
                            )}
                          </Badge>
                        )}
                        {response.form_info.passing_score && (
                          <span className="text-xs text-gray-500">
                            (Passing: {response.form_info.passing_score}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quiz Statistics (for quiz forms) */}
          {response.form_info.form_type === 'quiz' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Performance Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {correctAnswers}/{totalAnswered}
                    </div>
                    <div className="text-sm text-gray-600">Correct Answers</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Accuracy Rate</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {earnedPoints}/{totalPoints}
                    </div>
                    <div className="text-sm text-gray-600">Points Earned</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round((earnedPoints / totalPoints) * 100) || 0}%
                    </div>
                    <div className="text-sm text-gray-600">Score Percentage</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Form Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Form Title:</span>
                  <div className="font-medium">{response.form_info.title}</div>
                </div>
                <div>
                  <span className="text-gray-500">Form Type:</span>
                  <div className="font-medium capitalize">{response.form_info.form_type}</div>
                </div>
                {response.form_info.form_type === 'quiz' && (
                  <>
                    <div>
                      <span className="text-gray-500">Total Points:</span>
                      <div className="font-medium">{response.form_info.total_points}</div>
                    </div>
                    {response.form_info.passing_score && (
                      <div>
                        <span className="text-gray-500">Passing Score:</span>
                        <div className="font-medium">{response.form_info.passing_score}%</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Answer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Answer Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {response.answers.map((answer, index) => (
                  <div
                    key={answer.field_id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{index + 1}.</span>
                          <h3 className="font-medium">
                            {/<[^>]+>/.test(answer.label) ? (
                              <span dangerouslySetInnerHTML={{ __html: answer.label }} />
                            ) : (
                              answer.label
                            )}
                          </h3>
                          {answer.field_type && (
                            <Badge variant="outline" className="text-xs">
                              {answer.field_type}
                            </Badge>
                          )}
                          {/* Required status would need to be added to the answer type */}
                        </div>
                      </div>
                      {response.form_info.form_type === 'quiz' && (
                        <div className="flex items-center gap-2">
                          {answer.is_correct !== undefined && (
                            <>
                              {answer.is_correct ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                              <div className="text-sm text-right">
                                <div className="font-medium">
                                  {answer.points_earned}/{answer.max_points} pts
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">User Answer:</div>
                      <div className="bg-gray-50 p-3 rounded">
                        {formatAnswerValue(answer.user_answer)}
                      </div>
                    </div>

                    {response.form_info.form_type === 'quiz' && answer.is_correct === false && (
                      <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                        This answer was marked as incorrect
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Dialog>
  );
};