package services

import (
	"errors"

	"memotoko-api/config"
	"memotoko-api/models"
	"memotoko-api/utils"

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
		return nil, errors.New("user with this email already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Create new user
	user := &models.User{
		ID:       uuid.New().String(),
		Email:    req.Email,
		Password: string(hashedPassword),
		Name:     req.Name,
	}

	// Save user to database
	if err := s.db.Create(user).Error; err != nil {
		return nil, err
	}

	// Generate tokens
	accessExpiry, _ := utils.ParseDuration(s.config.AccessTokenExpiry)
	refreshExpiry, _ := utils.ParseDuration(s.config.RefreshTokenExpiry)

	accessToken, err := s.jwtUtil.GenerateAccessToken(user.ID, user.Email, accessExpiry)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.jwtUtil.GenerateRefreshToken(user.ID, user.Email, refreshExpiry)
	if err != nil {
		return nil, err
	}

	// Update user with refresh token
	user.RefreshToken = refreshToken
	s.db.Save(user)

	return &models.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         *user,
	}, nil
}

func (s *AuthService) Login(req *models.LoginRequest) (*models.AuthResponse, error) {
	// Find user by email
	var user models.User
	if err := s.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("invalid email or password")
		}
		return nil, err
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Generate tokens
	accessExpiry, _ := utils.ParseDuration(s.config.AccessTokenExpiry)
	refreshExpiry, _ := utils.ParseDuration(s.config.RefreshTokenExpiry)

	accessToken, err := s.jwtUtil.GenerateAccessToken(user.ID, user.Email, accessExpiry)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.jwtUtil.GenerateRefreshToken(user.ID, user.Email, refreshExpiry)
	if err != nil {
		return nil, err
	}

	// Update user with new refresh token
	user.RefreshToken = refreshToken
	s.db.Save(&user)

	return &models.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user,
	}, nil
}

func (s *AuthService) RefreshToken(req *models.RefreshTokenRequest) (*models.AuthResponse, error) {
	// Validate refresh token
	claims, err := s.jwtUtil.ValidateRefreshToken(req.RefreshToken)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	// Find user
	var user models.User
	if err := s.db.Where("id = ?", claims.UserID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	// Verify stored refresh token matches
	if user.RefreshToken != req.RefreshToken {
		return nil, errors.New("invalid refresh token")
	}

	// Generate new tokens
	accessExpiry, _ := utils.ParseDuration(s.config.AccessTokenExpiry)
	refreshExpiry, _ := utils.ParseDuration(s.config.RefreshTokenExpiry)

	accessToken, err := s.jwtUtil.GenerateAccessToken(user.ID, user.Email, accessExpiry)
	if err != nil {
		return nil, err
	}

	newRefreshToken, err := s.jwtUtil.GenerateRefreshToken(user.ID, user.Email, refreshExpiry)
	if err != nil {
		return nil, err
	}

	// Update user with new refresh token
	user.RefreshToken = newRefreshToken
	s.db.Save(&user)

	return &models.AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		User:         user,
	}, nil
}

func (s *AuthService) GetMe(userID string) (*models.User, error) {
	var user models.User
	if err := s.db.Where("id = ?", userID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	return &user, nil
}
