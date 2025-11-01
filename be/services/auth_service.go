package services

import (
	"errors"

	"form-api/config"
	"form-api/models"
	"form-api/utils"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService struct {
	db      *gorm.DB
	config  *config.Config
	jwtUtil *utils.JWTUtil
}

func NewAuthService(db *gorm.DB, cfg *config.Config, jwtUtil *utils.JWTUtil) *AuthService {
	return &AuthService{
		db:      db,
		config:  cfg,
		jwtUtil: jwtUtil,
	}
}

func (s *AuthService) Register(req *models.RegisterRequest) (*models.AuthResponse, error) {
	// Check if user already exists
	var existingUser models.User
	if err := s.db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		return nil, errors.New("Email already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Create new user
	user := &models.User{
		ID:           uuid.New(),
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		Name:         req.Name,
		Role:         "creator",
		IsActive:     true,
	}

	// Save user to database
	if err := s.db.Create(user).Error; err != nil {
		return nil, err
	}

	// Generate tokens
	accessExpiry, _ := utils.ParseDuration(s.config.AccessTokenExpiry)
	refreshExpiry, _ := utils.ParseDuration(s.config.RefreshTokenExpiry)

	accessToken, err := s.jwtUtil.GenerateAccessToken(user.ID.String(), user.Email, accessExpiry)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.jwtUtil.GenerateRefreshToken(user.ID.String(), user.Email, refreshExpiry)
	if err != nil {
		return nil, err
	}

	// Format timestamps
	createdAt := user.CreatedAt.Format("2006-01-02T15:04:05Z07:00")

	return &models.AuthResponse{
		UserID:       user.ID.String(),
		Email:        user.Email,
		Name:         user.Name,
		Role:         user.Role,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		CreatedAt:    &createdAt,
	}, nil
}

func (s *AuthService) Login(req *models.LoginRequest) (*models.AuthResponse, error) {
	// Find user by email
	var user models.User
	if err := s.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Invalid email or password")
		}
		return nil, err
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("Invalid email or password")
	}

	// Update last login timestamp
	now := utils.TimeNow()
	user.LastLoginAt = &now
	if err := s.db.Save(&user).Error; err != nil {
		return nil, err
	}

	// Generate tokens
	accessExpiry, _ := utils.ParseDuration(s.config.AccessTokenExpiry)
	refreshExpiry, _ := utils.ParseDuration(s.config.RefreshTokenExpiry)

	accessToken, err := s.jwtUtil.GenerateAccessToken(user.ID.String(), user.Email, accessExpiry)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.jwtUtil.GenerateRefreshToken(user.ID.String(), user.Email, refreshExpiry)
	if err != nil {
		return nil, err
	}

	// Format timestamps
	lastLoginAt := user.LastLoginAt.Format("2006-01-02T15:04:05Z07:00")

	return &models.AuthResponse{
		UserID:       user.ID.String(),
		Email:        user.Email,
		Name:         user.Name,
		Role:         user.Role,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		LastLoginAt:  &lastLoginAt,
	}, nil
}

func (s *AuthService) RefreshToken(req *models.RefreshTokenRequest) (*models.AuthResponse, error) {
	// Validate refresh token
	claims, err := s.jwtUtil.ValidateRefreshToken(req.RefreshToken)
	if err != nil {
		return nil, errors.New("Refresh token expired or invalid")
	}

	// Find user
	var user models.User
	if err := s.db.Where("id = ?", claims.UserID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Refresh token expired or invalid")
		}
		return nil, err
	}

	// Generate new tokens
	accessExpiry, _ := utils.ParseDuration(s.config.AccessTokenExpiry)
	refreshExpiry, _ := utils.ParseDuration(s.config.RefreshTokenExpiry)

	accessToken, err := s.jwtUtil.GenerateAccessToken(user.ID.String(), user.Email, accessExpiry)
	if err != nil {
		return nil, err
	}

	newRefreshToken, err := s.jwtUtil.GenerateRefreshToken(user.ID.String(), user.Email, refreshExpiry)
	if err != nil {
		return nil, err
	}

	return &models.AuthResponse{
		UserID:       user.ID.String(),
		Email:        user.Email,
		Name:         user.Name,
		Role:         user.Role,
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
	}, nil
}

func (s *AuthService) GetMe(userID string) (*models.UserResponse, error) {
	var user models.User
	if err := s.db.Where("id = ?", userID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Invalid or expired token")
		}
		return nil, err
	}

	// Format timestamps
	createdAt := user.CreatedAt.Format("2006-01-02T15:04:05Z07:00")
	var lastLoginAt *string
	if user.LastLoginAt != nil {
		formatted := user.LastLoginAt.Format("2006-01-02T15:04:05Z07:00")
		lastLoginAt = &formatted
	}

	return &models.UserResponse{
		UserID:      user.ID.String(),
		Email:       user.Email,
		Name:        user.Name,
		Role:        user.Role,
		CreatedAt:   createdAt,
		LastLoginAt: lastLoginAt,
	}, nil
}
