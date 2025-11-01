package models

import "gorm.io/datatypes"

// Request DTOs

type CreateFormRequest struct {
	Title              string  `json:"title" binding:"required"`
	Description        *string `json:"description"`
	FormType           string  `json:"form_type" binding:"required,oneof=survey quiz"`
	TimeLimitMinutes   int     `json:"time_limit_minutes"`
	PassingScore       *int    `json:"passing_score"`
	ShowCorrectAnswers bool    `json:"show_correct_answers"`
	ShuffleQuestions   bool    `json:"shuffle_questions"`
}

type UpdateFormRequest struct {
	Title              *string `json:"title"`
	Description        *string `json:"description"`
	TimeLimitMinutes   *int    `json:"time_limit_minutes"`
	PassingScore       *int    `json:"passing_score"`
	ShowCorrectAnswers *bool   `json:"show_correct_answers"`
	ShuffleQuestions   *bool   `json:"shuffle_questions"`
}

type DuplicateFormRequest struct {
	NewTitle string `json:"new_title" binding:"required"`
}

// Response DTOs

type FormDetailResponse struct {
	FormID             string  `json:"form_id"`
	Title              string  `json:"title"`
	Description        *string `json:"description,omitempty"`
	FormType           string  `json:"form_type"`
	CreatorID          string  `json:"creator_id"`
	TimeLimitMinutes   int     `json:"time_limit_minutes"`
	PassingScore       *int    `json:"passing_score,omitempty"`
	ShowCorrectAnswers bool    `json:"show_correct_answers"`
	ShuffleQuestions   bool    `json:"shuffle_questions"`
	IsPublished        bool    `json:"is_published"`
	TotalPoints        int     `json:"total_points"`
	CreatedAt          string  `json:"created_at"`
	UpdatedAt          string  `json:"updated_at"`
}

type FormWithSectionsResponse struct {
	FormID             string               `json:"form_id"`
	Title              string               `json:"title"`
	Description        *string              `json:"description,omitempty"`
	FormType           string               `json:"form_type"`
	CreatorID          string               `json:"creator_id"`
	TimeLimitMinutes   int                  `json:"time_limit_minutes"`
	PassingScore       *int                 `json:"passing_score,omitempty"`
	ShowCorrectAnswers bool                 `json:"show_correct_answers"`
	ShuffleQuestions   bool                 `json:"shuffle_questions"`
	IsPublished        bool                 `json:"is_published"`
	TotalPoints        int                  `json:"total_points"`
	CreatedAt          string               `json:"created_at"`
	UpdatedAt          string               `json:"updated_at"`
	Sections           []SectionResponse    `json:"sections"`
	Fields             []FieldResponse      `json:"fields"`
	ContentItems       []FormContentItem    `json:"content_items"` // Ordered list of all content
}

// FormContentItem represents a content item (section or standalone field) in global order
type FormContentItem struct {
	Type        string           `json:"type"` // "section" or "field"
	OrderGlobal int              `json:"order_global"`
	Section     *SectionResponse `json:"section,omitempty"`
	Field       *FieldResponse   `json:"field,omitempty"`
}

type SectionResponse struct {
	SectionID             string           `json:"section_id"`
	Title                 string           `json:"title"`
	Description           *string          `json:"description,omitempty"`
	OrderGlobal           int              `json:"order_global"`
	VisibilityType        string           `json:"visibility_type"`
	PrerequisiteSectionID *string          `json:"prerequisite_section_id,omitempty"`
	Fields                []FieldResponse  `json:"fields"`
}

type FieldResponse struct {
	FieldID        string          `json:"field_id"`
	ContentType    string          `json:"content_type"`
	FieldType      *string         `json:"field_type,omitempty"`
	Label          string          `json:"label"`
	Description    *string         `json:"description,omitempty"`
	OrderGlobal    int             `json:"order_global"`
	OrderInSection *int            `json:"order_in_section,omitempty"`
	SectionID      *string         `json:"section_id,omitempty"`
	IsRequired     bool            `json:"is_required"`
	Points         int             `json:"points"`
	AnswerKey      *datatypes.JSON `json:"answer_key,omitempty"`
}

type FormSummary struct {
	FormID         string  `json:"form_id"`
	Title          string  `json:"title"`
	Description    *string `json:"description,omitempty"`
	FormType       string  `json:"form_type"`
	IsPublished    bool    `json:"is_published"`
	ResponseCount  int     `json:"response_count"`
	TotalQuestions int     `json:"total_questions"`
	CreatedAt      string  `json:"created_at"`
	UpdatedAt      string  `json:"updated_at"`
}

type FormListResponse struct {
	Forms      []FormSummary      `json:"forms"`
	Pagination PaginationResponse `json:"pagination"`
}

type PaginationResponse struct {
	CurrentPage int `json:"current_page"`
	PerPage     int `json:"per_page"`
	TotalItems  int `json:"total_items"`
	TotalPages  int `json:"total_pages"`
}

type PublishFormResponse struct {
	FormID      string `json:"form_id"`
	Title       string `json:"title"`
	IsPublished bool   `json:"is_published"`
	PublishedAt string `json:"published_at"`
	Message     string `json:"message"`
}
