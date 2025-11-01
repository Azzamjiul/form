package models

import (
	"time"

	"github.com/google/uuid"
)

type FormResponse struct {
	ID               uuid.UUID  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	FormID           uuid.UUID  `gorm:"type:uuid;not null;index:idx_form_responses_form_id" json:"form_id"`
	SessionID        uuid.UUID  `gorm:"type:uuid;not null;index:idx_form_responses_session_id" json:"session_id"`
	WhitelistID      uuid.UUID  `gorm:"type:uuid;not null;index:idx_form_responses_whitelist_id" json:"whitelist_id"`
	Score            *float64   `gorm:"type:decimal(5,2)" json:"score,omitempty"`
	IsPassed         *bool      `gorm:"type:boolean;index:idx_form_responses_is_passed" json:"is_passed,omitempty"`
	TimeSpentSeconds int        `gorm:"not null;default:0" json:"time_spent_seconds"`
	WasAutoSubmitted bool       `gorm:"not null;default:false" json:"was_auto_submitted"`
	SubmittedAt      time.Time  `gorm:"not null;default:now();index:idx_form_responses_submitted_at" json:"submitted_at"`
	CreatedAt        time.Time  `gorm:"not null;default:now();index:idx_form_responses_created_at" json:"created_at"`

	// Relationships
	Form         Form          `gorm:"foreignKey:FormID;references:ID;constraint:OnDelete:CASCADE" json:"form,omitempty"`
	Session      FormSession   `gorm:"foreignKey:SessionID;references:ID;constraint:OnDelete:CASCADE" json:"session,omitempty"`
	Whitelist    FormWhitelist `gorm:"foreignKey:WhitelistID;references:ID;constraint:OnDelete:CASCADE" json:"whitelist,omitempty"`
	FieldAnswers []FieldAnswer `gorm:"foreignKey:ResponseID;constraint:OnDelete:CASCADE" json:"field_answers,omitempty"`
}

func (FormResponse) TableName() string {
	return "form_responses"
}
