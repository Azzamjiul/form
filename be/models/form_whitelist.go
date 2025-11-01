package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type FormWhitelist struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	FormID         uuid.UUID      `gorm:"type:uuid;not null;index:idx_form_whitelist_form_id" json:"form_id"`
	AccessToken    string         `gorm:"type:varchar(255);uniqueIndex:idx_form_whitelist_access_token;not null" json:"access_token"`
	ExternalUserID string         `gorm:"type:varchar(255);not null;index:idx_form_whitelist_external_user_id" json:"external_user_id"`
	Email          string         `gorm:"type:varchar(255);not null;index:idx_form_whitelist_email" json:"email"`
	Name           string         `gorm:"type:varchar(255);not null" json:"name"`
	MaxAttempts    int            `gorm:"not null;default:1" json:"max_attempts"`
	AttemptsUsed   int            `gorm:"not null;default:0" json:"attempts_used"`
	ExpiresAt      time.Time      `gorm:"not null;index:idx_form_whitelist_expires_at" json:"expires_at"`
	Metadata       datatypes.JSON `gorm:"type:jsonb" json:"metadata,omitempty"`
	CreatedAt      time.Time      `gorm:"not null;default:now();index:idx_form_whitelist_created_at" json:"created_at"`
	UpdatedAt      time.Time      `gorm:"not null;default:now()" json:"updated_at"`

	// Relationships
	Form      Form           `gorm:"foreignKey:FormID;references:ID;constraint:OnDelete:CASCADE" json:"form,omitempty"`
	Sessions  []FormSession  `gorm:"foreignKey:WhitelistID;constraint:OnDelete:CASCADE" json:"sessions,omitempty"`
	Responses []FormResponse `gorm:"foreignKey:WhitelistID;constraint:OnDelete:CASCADE" json:"responses,omitempty"`
}

func (FormWhitelist) TableName() string {
	return "form_whitelist"
}
