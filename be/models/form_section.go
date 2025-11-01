package models

import (
	"time"

	"github.com/google/uuid"
)

type FormSection struct {
	ID                     uuid.UUID  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	FormID                 uuid.UUID  `gorm:"type:uuid;not null;index:idx_form_sections_form_id;uniqueIndex:idx_form_sections_form_order,priority:1" json:"form_id"`
	Title                  string     `gorm:"type:varchar(255);not null" json:"title"`
	Description            *string    `gorm:"type:text" json:"description,omitempty"`
	OrderGlobal            int        `gorm:"not null;uniqueIndex:idx_form_sections_form_order,priority:2" json:"order_global"`
	VisibilityType         string     `gorm:"type:varchar(50);not null;default:'always'" json:"visibility_type"`
	PrerequisiteSectionID  *uuid.UUID `gorm:"type:uuid;index:idx_form_sections_prerequisite_id" json:"prerequisite_section_id,omitempty"`
	CreatedAt              time.Time  `gorm:"not null;default:now();index:idx_form_sections_created_at" json:"created_at"`
	UpdatedAt              time.Time  `gorm:"not null;default:now()" json:"updated_at"`

	// Relationships
	Form               Form         `gorm:"foreignKey:FormID;references:ID;constraint:OnDelete:CASCADE" json:"form,omitempty"`
	PrerequisiteSection *FormSection `gorm:"foreignKey:PrerequisiteSectionID;references:ID;constraint:OnDelete:SET NULL" json:"prerequisite_section,omitempty"`
	Fields             []FormField  `gorm:"foreignKey:SectionID;constraint:OnDelete:SET NULL" json:"fields,omitempty"`
}

func (FormSection) TableName() string {
	return "form_sections"
}
