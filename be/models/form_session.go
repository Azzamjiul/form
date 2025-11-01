package models

import (
	"time"

	"github.com/google/uuid"
)

type FormSession struct {
	ID             uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	FormID         uuid.UUID `gorm:"type:uuid;not null;index:idx_form_sessions_form_id" json:"form_id"`
	WhitelistID    uuid.UUID `gorm:"type:uuid;not null;index:idx_form_sessions_whitelist_id" json:"whitelist_id"`
	SessionToken   string    `gorm:"type:varchar(255);uniqueIndex:idx_form_sessions_session_token;not null" json:"session_token"`
	StartedAt      time.Time `gorm:"not null;default:now()" json:"started_at"`
	ExpiresAt      time.Time `gorm:"not null;index:idx_form_sessions_expires_at" json:"expires_at"`
	IsActive       bool      `gorm:"not null;default:true;index:idx_form_sessions_is_active" json:"is_active"`
	LastActivityAt time.Time `gorm:"not null;default:now()" json:"last_activity_at"`
	CreatedAt      time.Time `gorm:"not null;default:now();index:idx_form_sessions_created_at" json:"created_at"`

	// Relationships
	Form        Form           `gorm:"foreignKey:FormID;references:ID;constraint:OnDelete:CASCADE" json:"form,omitempty"`
	Whitelist   FormWhitelist  `gorm:"foreignKey:WhitelistID;references:ID;constraint:OnDelete:CASCADE" json:"whitelist,omitempty"`
	Responses   []FormResponse `gorm:"foreignKey:SessionID;constraint:OnDelete:CASCADE" json:"responses,omitempty"`
	TempAnswers []TempAnswer   `gorm:"foreignKey:SessionID;constraint:OnDelete:CASCADE" json:"temp_answers,omitempty"`
}

func (FormSession) TableName() string {
	return "form_sessions"
}
