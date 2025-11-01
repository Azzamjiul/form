package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type FieldAnswer struct {
	ID           uuid.UUID      `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"id"`
	ResponseID   uuid.UUID      `gorm:"type:uuid;not null;index:idx_field_answers_response_id;index:idx_field_answers_response_field,priority:1" json:"response_id"`
	FieldID      uuid.UUID      `gorm:"type:uuid;not null;index:idx_field_answers_field_id;index:idx_field_answers_response_field,priority:2" json:"field_id"`
	AnswerValue  datatypes.JSON `gorm:"type:jsonb;not null" json:"answer_value"`
	IsCorrect    *bool          `gorm:"type:boolean" json:"is_correct,omitempty"`
	PointsEarned *float64       `gorm:"type:decimal(5,2)" json:"points_earned,omitempty"`
	CreatedAt    time.Time      `gorm:"not null;default:now();index:idx_field_answers_created_at" json:"created_at"`

	// Relationships
	Response FormResponse `gorm:"foreignKey:ResponseID;references:ID;constraint:OnDelete:CASCADE" json:"response,omitempty"`
	Field    FormField    `gorm:"foreignKey:FieldID;references:ID;constraint:OnDelete:CASCADE" json:"field,omitempty"`
}

func (FieldAnswer) TableName() string {
	return "field_answers"
}
