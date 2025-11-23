package models

import "gorm.io/datatypes"

// Request DTOs

type CreateFieldRequest struct {
	ContentType    string          `json:"content_type" binding:"required,oneof=input_field section display_text"`
	FieldType      *string         `json:"field_type"`
	Label          string          `json:"label" binding:"required"`
	Description    *string         `json:"description"`
	OrderGlobal    int             `json:"order_global" binding:"required"`
	OrderInSection *int            `json:"order_in_section"`
	SectionID      *string         `json:"section_id"`
	IsRequired     *bool           `json:"is_required"`
	Points         *int            `json:"points"`
	ImageFileID    *string         `json:"image_file_id"`
	Options        *datatypes.JSON `json:"options" swaggertype:"object"`
	AnswerKey      *datatypes.JSON `json:"answer_key" swaggertype:"object"`
}

type UpdateFieldRequest struct {
	FieldType      *string         `json:"field_type"`
	Label          *string         `json:"label"`
	Description    *string         `json:"description"`
	IsRequired     *bool           `json:"is_required"`
	Points         *int            `json:"points"`
	ImageFileID    *string         `json:"image_file_id"`
	Options        *datatypes.JSON `json:"options" swaggertype:"object"`
	AnswerKey      *datatypes.JSON `json:"answer_key" swaggertype:"object"`
	OrderGlobal    *int            `json:"order_global"`
	OrderInSection *int            `json:"order_in_section"`
	SectionID      *string         `json:"section_id"`
}

type ReorderFieldItem struct {
	FieldID        string  `json:"field_id" binding:"required"`
	OrderGlobal    int     `json:"order_global" binding:"required"`
	SectionID      *string `json:"section_id"`
	OrderInSection *int    `json:"order_in_section"`
}

type ReorderFieldsRequest struct {
	Items []ReorderFieldItem `json:"items" binding:"required,min=1"`
}

// Response DTOs

type FieldDetailResponse struct {
	FieldID        string          `json:"field_id"`
	FormID         string          `json:"form_id"`
	ContentType    string          `json:"content_type"`
	FieldType      *string         `json:"field_type,omitempty"`
	Label          string          `json:"label"`
	Description    *string         `json:"description,omitempty"`
	OrderGlobal    int             `json:"order_global"`
	OrderInSection *int            `json:"order_in_section,omitempty"`
	SectionID      *string         `json:"section_id,omitempty"`
	IsRequired     bool            `json:"is_required"`
	Points         int             `json:"points"`
	ImageFileID    *string         `json:"image_file_id,omitempty"`
	ImageURL       *string         `json:"image_url,omitempty"`
	Options        *datatypes.JSON `json:"options,omitempty"`
	AnswerKey      *datatypes.JSON `json:"answer_key,omitempty"`
	CreatedAt      string          `json:"created_at"`
	UpdatedAt      string          `json:"updated_at"`
}

type FieldListResponse struct {
	Fields []FieldResponse `json:"fields"`
}

type ReorderFieldsResponse struct {
	Items   []ReorderFieldItem `json:"items"`
	Message string             `json:"message"`
}

// Option structs for multiple choice fields with image support

type MultipleChoiceOption struct {
	ID          string  `json:"id"`
	Text        string  `json:"text"`
	ImageFileID *string `json:"image_file_id,omitempty"`
	ImageURL    *string `json:"image_url,omitempty"`
	Order       int     `json:"order"`
}

type MultipleChoiceOptions struct {
	AllowMultiple bool                    `json:"allow_multiple"`
	Options       []MultipleChoiceOption  `json:"options"`
}
