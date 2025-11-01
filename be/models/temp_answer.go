package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type TempAnswer struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	SessionID   uuid.UUID      `gorm:"type:uuid;not null;uniqueIndex:idx_temp_answers_session_field,priority:1;index:idx_temp_answers_session_id" json:"session_id"`
	FieldID     uuid.UUID      `gorm:"type:uuid;not null;uniqueIndex:idx_temp_answers_session_field,priority:2;index:idx_temp_answers_field_id" json:"field_id"`
	AnswerValue datatypes.JSON `gorm:"type:jsonb;not null" json:"answer_value"`
	LastSavedAt time.Time      `gorm:"not null;default:now()" json:"last_saved_at"`
	ExpiresAt   time.Time      `gorm:"not null;index:idx_temp_answers_expires_at" json:"expires_at"`
	CreatedAt   time.Time      `gorm:"not null;default:now();index:idx_temp_answers_created_at" json:"created_at"`

	// Relationships
	Session FormSession `gorm:"foreignKey:SessionID;references:ID;constraint:OnDelete:CASCADE" json:"session,omitempty"`
	Field   FormField   `gorm:"foreignKey:FieldID;references:ID;constraint:OnDelete:CASCADE" json:"field,omitempty"`
}

func (TempAnswer) TableName() string {
	return "temp_answers"
}
