package models

import (
	"time"

	"github.com/google/uuid"
)

type Form struct {
	ID                 uuid.UUID  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	CreatorID          uuid.UUID  `gorm:"type:uuid;not null;index:idx_forms_creator_id" json:"creator_id"`
	Title              string     `gorm:"type:varchar(255);not null" json:"title"`
	Description        *string    `gorm:"type:text" json:"description,omitempty"`
	FormType           string     `gorm:"type:varchar(50);not null" json:"form_type"`
	TimeLimitMinutes   int        `gorm:"not null;default:0" json:"time_limit_minutes"`
	PassingScore       *int       `gorm:"type:integer" json:"passing_score,omitempty"`
	ShowCorrectAnswers bool       `gorm:"not null;default:false" json:"show_correct_answers"`
	ShuffleQuestions   bool       `gorm:"not null;default:false" json:"shuffle_questions"`
	IsPublished        bool       `gorm:"not null;default:false;index:idx_forms_is_published" json:"is_published"`
	TotalPoints        int        `gorm:"not null;default:0" json:"total_points"`
	CreatedAt          time.Time  `gorm:"not null;default:now();index:idx_forms_created_at" json:"created_at"`
	UpdatedAt          time.Time  `gorm:"not null;default:now()" json:"updated_at"`
	DeletedAt          *time.Time `gorm:"type:timestamp;index:idx_forms_deleted_at" json:"deleted_at,omitempty"`

	// Relationships
	Creator      User           `gorm:"foreignKey:CreatorID;references:ID;constraint:OnDelete:CASCADE" json:"creator,omitempty"`
	Sections     []FormSection  `gorm:"foreignKey:FormID;constraint:OnDelete:CASCADE" json:"sections,omitempty"`
	Fields       []FormField    `gorm:"foreignKey:FormID;constraint:OnDelete:CASCADE" json:"fields,omitempty"`
	Whitelist    []FormWhitelist `gorm:"foreignKey:FormID;constraint:OnDelete:CASCADE" json:"whitelist,omitempty"`
	Sessions     []FormSession  `gorm:"foreignKey:FormID;constraint:OnDelete:CASCADE" json:"sessions,omitempty"`
	Responses    []FormResponse `gorm:"foreignKey:FormID;constraint:OnDelete:CASCADE" json:"responses,omitempty"`
}

func (Form) TableName() string {
	return "forms"
}
