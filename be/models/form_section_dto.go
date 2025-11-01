package models

// Request DTOs

type CreateSectionRequest struct {
	Title                 string  `json:"title" binding:"required"`
	Description           *string `json:"description"`
	OrderGlobal           int     `json:"order_global" binding:"required"`
	VisibilityType        string  `json:"visibility_type" binding:"required,oneof=always after_section"`
	PrerequisiteSectionID *string `json:"prerequisite_section_id"`
}

type UpdateSectionRequest struct {
	Title                 *string `json:"title"`
	Description           *string `json:"description"`
	OrderGlobal           *int    `json:"order_global"`
	VisibilityType        *string `json:"visibility_type" binding:"omitempty,oneof=always after_section"`
	PrerequisiteSectionID *string `json:"prerequisite_section_id"`
}

// Response DTOs

type SectionDetailResponse struct {
	SectionID             string          `json:"section_id"`
	FormID                string          `json:"form_id"`
	Title                 string          `json:"title"`
	Description           *string         `json:"description,omitempty"`
	OrderGlobal           int             `json:"order_global"`
	VisibilityType        string          `json:"visibility_type"`
	PrerequisiteSectionID *string         `json:"prerequisite_section_id,omitempty"`
	CreatedAt             string          `json:"created_at"`
	UpdatedAt             string          `json:"updated_at"`
	Fields                []FieldResponse `json:"fields,omitempty"`
}

type SectionSummary struct {
	SectionID             string  `json:"section_id"`
	Title                 string  `json:"title"`
	Description           *string `json:"description,omitempty"`
	OrderGlobal           int     `json:"order_global"`
	VisibilityType        string  `json:"visibility_type"`
	PrerequisiteSectionID *string `json:"prerequisite_section_id,omitempty"`
	FieldsCount           int     `json:"fields_count"`
}

type SectionListResponse struct {
	Sections []SectionSummary `json:"sections"`
}
