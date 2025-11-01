package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type FormField struct {
	ID              uuid.UUID       `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	FormID          uuid.UUID       `gorm:"type:uuid;not null;index:idx_form_fields_form_id;uniqueIndex:idx_form_fields_form_order,priority:1" json:"form_id"`
	SectionID       *uuid.UUID      `gorm:"type:uuid;index:idx_form_fields_section_id" json:"section_id,omitempty"`
	ContentType     string          `gorm:"type:varchar(50);not null;index:idx_form_fields_content_type" json:"content_type"`
	FieldType       *string         `gorm:"type:varchar(50)" json:"field_type,omitempty"`
	Label           string          `gorm:"type:text;not null" json:"label"`
	Description     *string         `gorm:"type:text" json:"description,omitempty"`
	OrderGlobal     int             `gorm:"not null;uniqueIndex:idx_form_fields_form_order,priority:2" json:"order_global"`
	OrderInSection  *int            `gorm:"type:integer" json:"order_in_section,omitempty"`
	IsRequired      bool            `gorm:"not null;default:false" json:"is_required"`
	Points          int             `gorm:"not null;default:0" json:"points"`
	Options         datatypes.JSON  `gorm:"type:jsonb" json:"options,omitempty"`
	AnswerKey       datatypes.JSON  `gorm:"type:jsonb" json:"answer_key,omitempty"`
	CreatedAt       time.Time       `gorm:"not null;default:now();index:idx_form_fields_created_at" json:"created_at"`
	UpdatedAt       time.Time       `gorm:"not null;default:now()" json:"updated_at"`

	// Relationships
	Form         Form          `gorm:"foreignKey:FormID;references:ID;constraint:OnDelete:CASCADE" json:"form,omitempty"`
	Section      *FormSection  `gorm:"foreignKey:SectionID;references:ID;constraint:OnDelete:SET NULL" json:"section,omitempty"`
	FieldAnswers []FieldAnswer `gorm:"foreignKey:FieldID;constraint:OnDelete:CASCADE" json:"field_answers,omitempty"`
	TempAnswers  []TempAnswer  `gorm:"foreignKey:FieldID;constraint:OnDelete:CASCADE" json:"temp_answers,omitempty"`
}

func (FormField) TableName() string {
	return "form_fields"
}
