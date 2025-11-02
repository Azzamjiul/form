package models

import "gorm.io/datatypes"

// Request DTOs

type CreateWhitelistRequest struct {
	ExternalUserID string          `json:"external_user_id" binding:"required"`
	Email          string          `json:"email" binding:"required,email"`
	Name           string          `json:"name" binding:"required"`
	MaxAttempts    int             `json:"max_attempts" binding:"required,min=1"`
	ExpiresAt      string          `json:"expires_at" binding:"required"` // RFC3339 format
	Metadata       *datatypes.JSON `json:"metadata,omitempty" swaggertype:"object"`
}

type BatchCreateWhitelistRequest struct {
	Entries []CreateWhitelistRequest `json:"entries" binding:"required,min=1,dive"`
}

type UpdateWhitelistRequest struct {
	MaxAttempts *int            `json:"max_attempts,omitempty" binding:"omitempty,min=1"`
	ExpiresAt   *string         `json:"expires_at,omitempty"` // RFC3339 format
	Metadata    *datatypes.JSON `json:"metadata,omitempty" swaggertype:"object"`
}

// Response DTOs

type WhitelistEntryResponse struct {
	WhitelistID    string          `json:"whitelist_id"`
	FormID         string          `json:"form_id"`
	AccessToken    string          `json:"access_token"`
	ExternalUserID string          `json:"external_user_id"`
	Email          string          `json:"email"`
	Name           string          `json:"name"`
	MaxAttempts    int             `json:"max_attempts"`
	AttemptsUsed   int             `json:"attempts_used"`
	ExpiresAt      string          `json:"expires_at"`
	Metadata       *datatypes.JSON `json:"metadata,omitempty"`
	CreatedAt      string          `json:"created_at"`
	UpdatedAt      string          `json:"updated_at"`
	QuizURL        string          `json:"quiz_url"`
}

type WhitelistEntryDetailResponse struct {
	WhitelistID    string          `json:"whitelist_id"`
	FormID         string          `json:"form_id"`
	AccessToken    string          `json:"access_token"`
	ExternalUserID string          `json:"external_user_id"`
	Email          string          `json:"email"`
	Name           string          `json:"name"`
	MaxAttempts    int             `json:"max_attempts"`
	AttemptsUsed   int             `json:"attempts_used"`
	ExpiresAt      string          `json:"expires_at"`
	IsExpired      bool            `json:"is_expired"`
	CanAttempt     bool            `json:"can_attempt"`
	Metadata       *datatypes.JSON `json:"metadata,omitempty"`
	CreatedAt      string          `json:"created_at"`
	UpdatedAt      string          `json:"updated_at"`
}

type WhitelistBatchResponse struct {
	CreatedCount int                      `json:"created_count"`
	FailedCount  int                      `json:"failed_count"`
	Entries      []WhitelistEntryResponse `json:"entries"`
}

type WhitelistEntryListItem struct {
	WhitelistID    string `json:"whitelist_id"`
	ExternalUserID string `json:"external_user_id"`
	Email          string `json:"email"`
	Name           string `json:"name"`
	MaxAttempts    int    `json:"max_attempts"`
	AttemptsUsed   int    `json:"attempts_used"`
	ExpiresAt      string `json:"expires_at"`
	IsExpired      bool   `json:"is_expired"`
	CanAttempt     bool   `json:"can_attempt"`
	CreatedAt      string `json:"created_at"`
	AccessToken    string `json:"access_token"`
	QuizURL        string `json:"quiz_url"`
}

type WhitelistListResponse struct {
	Entries    []WhitelistEntryListItem `json:"entries"`
	Pagination PaginationResponse       `json:"pagination"`
}

type ValidateTokenResponse struct {
	IsValid           bool    `json:"is_valid"`
	WhitelistID       string  `json:"whitelist_id,omitempty"`
	FormID            string  `json:"form_id,omitempty"`
	ExternalUserID    string  `json:"external_user_id,omitempty"`
	Email             string  `json:"email,omitempty"`
	Name              string  `json:"name,omitempty"`
	CanAttempt        bool    `json:"can_attempt,omitempty"`
	AttemptsRemaining int     `json:"attempts_remaining,omitempty"`
	ExpiresAt         string  `json:"expires_at,omitempty"`
	Form              *FormValidationInfo `json:"form,omitempty"`
}

type FormValidationInfo struct {
	FormID           string `json:"form_id"`
	Title            string `json:"title"`
	FormType         string `json:"form_type"`
	TimeLimitMinutes int    `json:"time_limit_minutes"`
}
