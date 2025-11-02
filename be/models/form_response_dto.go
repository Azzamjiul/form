package models

import (
	"time"
)

// ResponseListRequest represents request parameters for listing responses
type ResponseListRequest struct {
	Page    int    `form:"page" binding:"min=1"`
	Limit   int    `form:"limit" binding:"min=1,max=100"`
	SortBy  string `form:"sort_by" binding:"omitempty,oneof=submitted_at score time_spent respondent_name"`
	Order   string `form:"order" binding:"omitempty,oneof=asc desc"`
	Search  string `form:"search"`
	IsPassed *bool `form:"is_passed"` // Optional filter for pass/fail status
}

// ResponseListItem represents a single response in the list view
type ResponseListItem struct {
	ID               string     `json:"id"`
	RespondentName   string     `json:"respondent_name"`
	RespondentEmail  string     `json:"respondent_email"`
	Score            *float64   `json:"score"`
	MaxScore         int        `json:"max_score"`
	Percentage       float64    `json:"percentage"`
	IsPassed         *bool      `json:"is_passed"`
	TimeSpentSeconds int        `json:"time_spent_seconds"`
	SubmittedAt      time.Time  `json:"submitted_at"`
	WasAutoSubmitted bool       `json:"was_auto_submitted"`
}

// ResponseListResponse represents the response list API response
type ResponseListResponse struct {
	Responses []ResponseListItem    `json:"responses"`
	Pagination PaginationResponse   `json:"pagination"`
	Summary   ResponseListSummary   `json:"summary"`
}

// ResponseListSummary represents summary statistics for the response list
type ResponseListSummary struct {
	TotalResponses int     `json:"total_responses"`
	AverageScore   float64 `json:"average_score"`
	PassRate       float64 `json:"pass_rate"`
	AverageTime    float64 `json:"average_time_minutes"`
}

// ResponseDetail represents detailed response information
type ResponseDetail struct {
	ID                 string              `json:"id"`
	Form               Form                `json:"form"`
	RespondentInfo     RespondentInfo      `json:"respondent_info"`
	Score              int                 `json:"score"`
	MaxScore           int                 `json:"max_score"`
	Percentage         float64             `json:"percentage"`
	IsPassed           bool                `json:"is_passed"`
	TimeSpentSeconds   int                 `json:"time_spent_seconds"`
	StartedAt          *time.Time          `json:"started_at,omitempty"`
	SubmittedAt        *time.Time          `json:"submitted_at,omitempty"`
	WasAutoSubmitted   bool                `json:"was_auto_submitted"`
	IPAddress          string              `json:"ip_address,omitempty"`
	UserAgent          string              `json:"user_agent,omitempty"`
	Answers            []AnswerDetail      `json:"answers"`
	SectionBreakdown   []SectionBreakdown  `json:"section_breakdown,omitempty"`
}

// RespondentInfo contains information about the respondent
type RespondentInfo struct {
	Name         string                 `json:"name"`
	Email        string                 `json:"email,omitempty"`
	Phone        string                 `json:"phone,omitempty"`
	CompanyName  string                 `json:"company_name,omitempty"`
	Metadata     map[string]interface{} `json:"metadata,omitempty"`
}

// AnswerDetail represents a detailed answer view
type AnswerDetail struct {
	FieldID       string                 `json:"field_id"`
	FieldLabel    string                 `json:"field_label"`
	FieldType     string                 `json:"field_type"`
	SectionTitle  string                 `json:"section_title,omitempty"`
	UserAnswer    interface{}            `json:"user_answer"`
	CorrectAnswer interface{}            `json:"correct_answer,omitempty"`
	IsCorrect     *bool                  `json:"is_correct,omitempty"`
	PointsEarned  int                    `json:"points_earned"`
	MaxPoints     int                    `json:"max_points"`
	TimeSpent     int                    `json:"time_spent_seconds,omitempty"`
	IsFlagged     bool                   `json:"is_flagged,omitempty"`
	Notes         string                 `json:"notes,omitempty"`
}

// SectionBreakdown represents performance by form section
type SectionBreakdown struct {
	SectionID     string  `json:"section_id"`
	SectionTitle  string  `json:"section_title"`
	Score         int     `json:"score"`
	MaxScore      int     `json:"max_score"`
	Percentage    float64 `json:"percentage"`
	QuestionCount int     `json:"question_count"`
}

// AnalyticsRequest represents request parameters for analytics
type AnalyticsRequest struct {
	DateFrom      string `form:"date_from"`
	DateTo        string `form:"date_to"`
	GroupBy       string `form:"group_by" binding:"omitempty,oneof=day week month"`
}

// AnalyticsResponse represents comprehensive form analytics
type AnalyticsResponse struct {
	Summary         AnalyticsSummary           `json:"summary"`
	ScoreDistribution map[string]int           `json:"score_distribution"`
	TimeAnalytics   TimeAnalytics              `json:"time_analytics"`
	QuestionAnalytics []QuestionAnalytics       `json:"question_analytics"`
	SectionAnalytics []SectionAnalytics        `json:"section_analytics"`
	Trends          []TrendData               `json:"trends,omitempty"`
}

// AnalyticsSummary represents overall analytics summary
type AnalyticsSummary struct {
	TotalResponses      int     `json:"total_responses"`
	CompletionRate      float64 `json:"completion_rate"`
	AverageScore        float64 `json:"average_score"`
	MedianScore         float64 `json:"median_score"`
	StandardDeviation   float64 `json:"standard_deviation"`
	PassRate            float64 `json:"pass_rate"`
	AverageTimeMinutes  float64 `json:"average_time_minutes"`
	MedianTimeMinutes   float64 `json:"median_time_minutes"`
	SubmissionRate      float64 `json:"submission_rate"`
	AutosubmissionRate  float64 `json:"autosubmission_rate"`
}

// TimeAnalytics represents time-based analytics
type TimeAnalytics struct {
	AverageCompletionTimeMinutes float64 `json:"average_completion_time_minutes"`
	MedianCompletionTimeMinutes  float64 `json:"median_completion_time_minutes"`
	FastestCompletionMinutes     float64 `json:"fastest_completion_minutes"`
	SlowestCompletionMinutes     float64 `json:"slowest_completion_minutes"`
	TimeDistribution             map[string]int `json:"time_distribution"`
	CompletionByHour             map[string]int `json:"completion_by_hour"`
	CompletionByDayOfWeek        map[string]int `json:"completion_by_day_of_week"`
}

// QuestionAnalytics represents per-question analytics
type QuestionAnalytics struct {
	FieldID          string                 `json:"field_id"`
	FieldLabel       string                 `json:"field_label"`
	FieldType        string                 `json:"field_type"`
	SectionTitle     string                 `json:"section_title,omitempty"`
	TotalAnswers     int                    `json:"total_answers"`
	CorrectAnswers   int                    `json:"correct_answers,omitempty"`
	AccuracyRate     float64                `json:"accuracy_rate,omitempty"`
	AveragePoints    float64                `json:"average_points,omitempty"`
	MaxPoints        int                    `json:"max_points"`
	TimeToAnswer     float64                `json:"average_time_to_answer_seconds,omitempty"`
	AnswerDistribution map[string]int      `json:"answer_distribution,omitempty"`
	MostCommonAnswer interface{}            `json:"most_common_answer,omitempty"`
	LeastCommonAnswer interface{}           `json:"least_common_answer,omitempty"`
	FlaggedCount     int                    `json:"flagged_count,omitempty"`
}

// SectionAnalytics represents per-section analytics
type SectionAnalytics struct {
	SectionID         string  `json:"section_id"`
	SectionTitle      string  `json:"section_title"`
	QuestionCount     int     `json:"question_count"`
	TotalResponses    int     `json:"total_responses"`
	AverageScore      float64 `json:"average_score"`
	MaxScore          int     `json:"max_score"`
	PassRate          float64 `json:"pass_rate"`
	AverageTime       float64 `json:"average_time_minutes"`
	Difficulty        string  `json:"difficulty"` // "easy", "medium", "hard"
}

// TrendData represents trend analytics over time
type TrendData struct {
	Date        string  `json:"date"`
	Responses   int     `json:"responses"`
	AverageScore float64 `json:"average_score"`
	PassRate    float64 `json:"pass_rate"`
}

// ExportRequest represents export parameters
type ExportRequest struct {
	Format      string `form:"format" binding:"required,oneof=csv excel json"`
	Columns     []string `form:"columns"`
	FromDate    string `form:"from_date"`
	ToDate      string `form:"to_date"`
	IncludeAnswers bool `form:"include_answers"`
	IncludeAnalytics bool `form:"include_analytics"`
	IsPassed    *bool  `form:"is_passed"`
}

// ExportResponse represents export job information
type ExportResponse struct {
	JobID       string    `json:"job_id"`
	Status      string    `json:"status"` // "pending", "processing", "completed", "failed"
	DownloadURL string    `json:"download_url,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
	RecordCount int       `json:"record_count,omitempty"`
	FileSize    int64     `json:"file_size,omitempty"`
}

// FlagRequest represents request to flag/unflag a response
type FlagRequest struct {
	IsFlagged bool   `json:"is_flagged"`
	Notes     string `json:"notes,omitempty"`
}