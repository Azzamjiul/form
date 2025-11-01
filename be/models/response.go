package models

import "time"

// APIResponse is the standardized response wrapper for all API responses
type APIResponse struct {
	Success   bool        `json:"success"`
	Data      interface{} `json:"data"`
	Error     *ErrorData  `json:"error"`
	Timestamp time.Time   `json:"timestamp"`
}

// ErrorData represents error information
type ErrorData struct {
	Code    string                 `json:"code"`
	Message string                 `json:"message"`
	Details map[string]interface{} `json:"details,omitempty"`
}

// Error codes
const (
	ErrCodeValidation     = "VALIDATION_ERROR"
	ErrCodeAuthentication = "AUTHENTICATION_ERROR"
	ErrCodeNotFound       = "NOT_FOUND"
	ErrCodeInternal       = "INTERNAL_ERROR"
)

// NewSuccessResponse creates a new success response
func NewSuccessResponse(data interface{}) *APIResponse {
	return &APIResponse{
		Success:   true,
		Data:      data,
		Error:     nil,
		Timestamp: time.Now(),
	}
}

// NewErrorResponse creates a new error response
func NewErrorResponse(code, message string, details map[string]interface{}) *APIResponse {
	return &APIResponse{
		Success: false,
		Data:    nil,
		Error: &ErrorData{
			Code:    code,
			Message: message,
			Details: details,
		},
		Timestamp: time.Now(),
	}
}
