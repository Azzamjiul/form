package models

import "gorm.io/datatypes"

// Request DTOs

type StartQuizRequest struct {
	AccessToken string `json:"access_token" binding:"required"`
}

type AutoSaveAnswerRequest struct {
	FieldID     string         `json:"field_id" binding:"required"`
	AnswerValue datatypes.JSON `json:"answer_value" binding:"required" swaggertype:"object"`
}

type SubmitQuizRequest struct {
	Answers []SubmitAnswerItem `json:"answers" binding:"required,dive"`
}

type SubmitAnswerItem struct {
	FieldID     string         `json:"field_id" binding:"required"`
	AnswerValue datatypes.JSON `json:"answer_value" binding:"required" swaggertype:"object"`
}

type ResumeQuizRequest struct {
	SessionToken string `json:"session_token" binding:"required"`
}

// Response DTOs

type StartQuizResponse struct {
	SessionID        string          `json:"session_id"`
	SessionToken     string          `json:"session_token"`
	FormID           string          `json:"form_id"`
	WhitelistID      string          `json:"whitelist_id"`
	StartedAt        string          `json:"started_at"`
	ExpiresAt        string          `json:"expires_at"`
	TimeLimitMinutes int             `json:"time_limit_minutes"`
	Form             QuizFormInfo    `json:"form"`
}

type QuizFormInfo struct {
	Title            string `json:"title"`
	Description      string `json:"description,omitempty"`
	FormType         string `json:"form_type"`
	ShuffleQuestions bool   `json:"shuffle_questions"`
	TotalQuestions   int    `json:"total_questions"`
}

type QuizContentResponse struct {
	SessionID string               `json:"session_id"`
	Form      QuizFormBasicInfo    `json:"form"`
	Sections  []QuizSectionContent `json:"sections"`
}

type QuizFormBasicInfo struct {
	FormID   string `json:"form_id"`
	Title    string `json:"title"`
	FormType string `json:"form_type"`
}

type QuizSectionContent struct {
	SectionID      string           `json:"section_id"`
	Title          string           `json:"title"`
	OrderGlobal    int              `json:"order_global"`
	VisibilityType string           `json:"visibility_type"`
	Fields         []QuizFieldContent `json:"fields"`
}

type QuizFieldContent struct {
	FieldID        string                   `json:"field_id"`
	ContentType    string                   `json:"content_type"`
	FieldType      *string                  `json:"field_type,omitempty"`
	Label          string                   `json:"label"`
	Description    *string                  `json:"description,omitempty"`
	IsRequired     bool                     `json:"is_required"`
	OrderInSection int                      `json:"order_in_section"`
	Options        []map[string]interface{} `json:"options,omitempty"`
	MinValue       *int                     `json:"min_value,omitempty"`
	MaxValue       *int                     `json:"max_value,omitempty"`
	Step           *int                     `json:"step,omitempty"`
}

type AutoSaveResponse struct {
	FieldID     string `json:"field_id"`
	LastSavedAt string `json:"last_saved_at"`
	Message     string `json:"message"`
}

type SessionStatusResponse struct {
	SessionID            string `json:"session_id"`
	IsActive             bool   `json:"is_active"`
	StartedAt            string `json:"started_at"`
	ExpiresAt            string `json:"expires_at"`
	TimeRemainingSeconds int    `json:"time_remaining_seconds"`
	AnswersSaved         int    `json:"answers_saved"`
	TotalFields          int    `json:"total_fields"`
}

type SubmitQuizResponse struct {
	ResponseID       string   `json:"response_id"`
	FormID           string   `json:"form_id"`
	SessionID        string   `json:"session_id"`
	SubmittedAt      string   `json:"submitted_at"`
	TimeSpentSeconds int      `json:"time_spent_seconds"`
	WasAutoSubmitted bool     `json:"was_auto_submitted"`
	Score            *float64 `json:"score,omitempty"`
	IsPassed         *bool    `json:"is_passed,omitempty"`
	Message          string   `json:"message"`
}

type QuizResultResponse struct {
	ResponseID string               `json:"response_id"`
	Form       QuizResultFormInfo   `json:"form"`
	Result     QuizResultDetail     `json:"result"`
}

type QuizResultFormInfo struct {
	FormID             string  `json:"form_id"`
	Title              string  `json:"title"`
	FormType           string  `json:"form_type"`
	PassingScore       *int    `json:"passing_score,omitempty"`
	TotalPoints        int     `json:"total_points"`
	ShowCorrectAnswers bool    `json:"show_correct_answers"`
}

type QuizResultDetail struct {
	Score            *float64              `json:"score,omitempty"`
	IsPassed         *bool                 `json:"is_passed,omitempty"`
	TimeSpentSeconds int                   `json:"time_spent_seconds"`
	SubmittedAt      string                `json:"submitted_at"`
	Answers          []QuizAnswerDetail    `json:"answers"`
}

type QuizAnswerDetail struct {
	FieldID       string          `json:"field_id"`
	Label         string          `json:"label"`
	UserAnswer    datatypes.JSON  `json:"user_answer"`
	IsCorrect     *bool           `json:"is_correct,omitempty"`
	PointsEarned  *float64        `json:"points_earned,omitempty"`
	MaxPoints     *int            `json:"max_points,omitempty"`
}

type ResumeQuizResponse struct {
	SessionID            string                    `json:"session_id"`
	IsResumed            bool                      `json:"is_resumed"`
	TimeRemainingSeconds int                       `json:"time_remaining_seconds"`
	SavedAnswers         map[string]datatypes.JSON `json:"saved_answers"`
	Message              string                    `json:"message"`
}
