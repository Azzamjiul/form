package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()" json:"user_id"`
	Email        string     `gorm:"type:varchar(255);uniqueIndex:idx_users_email;not null" json:"email"`
	PasswordHash string     `gorm:"type:varchar(255);column:password_hash;not null" json:"-"`
	Name         string     `gorm:"type:varchar(255);not null" json:"name"`
	Role         string     `gorm:"type:varchar(50);not null;default:'creator';index:idx_users_role" json:"role"`
	IsActive     bool       `gorm:"not null;default:true" json:"-"`
	CreatedAt    time.Time  `gorm:"not null;default:now();index:idx_users_created_at" json:"created_at"`
	UpdatedAt    time.Time  `gorm:"not null;default:now()" json:"-"`
	LastLoginAt  *time.Time `gorm:"type:timestamp" json:"last_login_at,omitempty"`
}

func (User) TableName() string {
	return "users"
}

// UserResponse is the user data returned in auth responses
type UserResponse struct {
	UserID      string  `json:"user_id"`
	Email       string  `json:"email"`
	Name        string  `json:"name"`
	Role        string  `json:"role"`
	CreatedAt   string  `json:"created_at,omitempty"`
	LastLoginAt *string `json:"last_login_at,omitempty"`
}

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name" binding:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

type AuthResponse struct {
	UserID       string  `json:"user_id"`
	Email        string  `json:"email"`
	Name         string  `json:"name"`
	Role         string  `json:"role"`
	AccessToken  string  `json:"access_token"`
	RefreshToken string  `json:"refresh_token"`
	CreatedAt    *string `json:"created_at,omitempty"`
	LastLoginAt  *string `json:"last_login_at,omitempty"`
}

type LogoutResponse struct {
	Message string `json:"message"`
}
