package services

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"form-api/config"
	"form-api/models"
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type WhitelistService struct {
	db     *gorm.DB
	config *config.Config
}

func NewWhitelistService(db *gorm.DB, cfg *config.Config) *WhitelistService {
	return &WhitelistService{
		db:     db,
		config: cfg,
	}
}

// generateAccessToken generates a random access token
func (s *WhitelistService) generateAccessToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

// CreateWhitelistEntry creates a single whitelist entry
func (s *WhitelistService) CreateWhitelistEntry(formID uuid.UUID, req *models.CreateWhitelistRequest, userID uuid.UUID) (*models.WhitelistEntryResponse, error) {
	// Verify form exists and user owns it
	var form models.Form
	if err := s.db.Where("id = ? AND creator_id = ? AND deleted_at IS NULL", formID, userID).First(&form).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Form not found or you don't have permission")
		}
		return nil, err
	}

	// Parse expires_at
	expiresAt, err := time.Parse(time.RFC3339, req.ExpiresAt)
	if err != nil {
		return nil, errors.New("Invalid expires_at format, use RFC3339")
	}

	// Generate access token
	accessToken, err := s.generateAccessToken()
	if err != nil {
		return nil, errors.New("Failed to generate access token")
	}

	// Handle metadata (convert from pointer to value)
	var metadata datatypes.JSON
	if req.Metadata != nil {
		metadata = *req.Metadata
	}

	// Create whitelist entry
	whitelist := &models.FormWhitelist{
		ID:             uuid.New(),
		FormID:         formID,
		AccessToken:    accessToken,
		ExternalUserID: req.ExternalUserID,
		Email:          req.Email,
		Name:           req.Name,
		MaxAttempts:    req.MaxAttempts,
		AttemptsUsed:   0,
		ExpiresAt:      expiresAt,
		Metadata:       metadata,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if err := s.db.Create(whitelist).Error; err != nil {
		return nil, err
	}

	return s.buildWhitelistEntryResponse(whitelist), nil
}

// BatchCreateWhitelist creates multiple whitelist entries
func (s *WhitelistService) BatchCreateWhitelist(formID uuid.UUID, req *models.BatchCreateWhitelistRequest, userID uuid.UUID) (*models.WhitelistBatchResponse, error) {
	// Verify form exists and user owns it
	var form models.Form
	if err := s.db.Where("id = ? AND creator_id = ? AND deleted_at IS NULL", formID, userID).First(&form).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Form not found or you don't have permission")
		}
		return nil, err
	}

	response := &models.WhitelistBatchResponse{
		CreatedCount: 0,
		FailedCount:  0,
		Entries:      []models.WhitelistEntryResponse{},
	}

	// Create entries
	for _, entry := range req.Entries {
		entryResp, err := s.CreateWhitelistEntry(formID, &entry, userID)
		if err != nil {
			response.FailedCount++
			continue
		}
		response.Entries = append(response.Entries, *entryResp)
		response.CreatedCount++
	}

	return response, nil
}

// GetWhitelistEntry retrieves a single whitelist entry
func (s *WhitelistService) GetWhitelistEntry(formID, whitelistID uuid.UUID, userID uuid.UUID) (*models.WhitelistEntryDetailResponse, error) {
	// Verify form exists and user owns it
	var form models.Form
	if err := s.db.Where("id = ? AND creator_id = ? AND deleted_at IS NULL", formID, userID).First(&form).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Form not found or you don't have permission")
		}
		return nil, err
	}

	// Get whitelist entry
	var whitelist models.FormWhitelist
	if err := s.db.Where("id = ? AND form_id = ?", whitelistID, formID).First(&whitelist).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Whitelist entry not found")
		}
		return nil, err
	}

	return s.buildWhitelistEntryDetailResponse(&whitelist), nil
}

// ListWhitelistEntries retrieves all whitelist entries for a form with pagination
func (s *WhitelistService) ListWhitelistEntries(formID uuid.UUID, page, perPage int, sortBy string, userID uuid.UUID) (*models.WhitelistListResponse, error) {
	// Verify form exists and user owns it
	var form models.Form
	if err := s.db.Where("id = ? AND creator_id = ? AND deleted_at IS NULL", formID, userID).First(&form).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Form not found or you don't have permission")
		}
		return nil, err
	}

	// Default pagination
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	// Default sort
	orderBy := "created_at DESC"
	if sortBy == "name" {
		orderBy = "name ASC"
	}

	// Get total count
	var total int64
	if err := s.db.Model(&models.FormWhitelist{}).Where("form_id = ?", formID).Count(&total).Error; err != nil {
		return nil, err
	}

	// Get entries
	var whitelists []models.FormWhitelist
	offset := (page - 1) * perPage
	if err := s.db.Where("form_id = ?", formID).
		Order(orderBy).
		Limit(perPage).
		Offset(offset).
		Find(&whitelists).Error; err != nil {
		return nil, err
	}

	// Build response
	entries := make([]models.WhitelistEntryListItem, 0, len(whitelists))
	for _, w := range whitelists {
		entries = append(entries, s.buildWhitelistEntryListItem(&w))
	}

	totalPages := int((total + int64(perPage) - 1) / int64(perPage))

	return &models.WhitelistListResponse{
		Entries: entries,
		Pagination: models.PaginationResponse{
			CurrentPage: page,
			PerPage:     perPage,
			TotalItems:  int(total),
			TotalPages:  totalPages,
		},
	}, nil
}

// UpdateWhitelistEntry updates a whitelist entry
func (s *WhitelistService) UpdateWhitelistEntry(formID, whitelistID uuid.UUID, req *models.UpdateWhitelistRequest, userID uuid.UUID) (*models.WhitelistEntryDetailResponse, error) {
	// Verify form exists and user owns it
	var form models.Form
	if err := s.db.Where("id = ? AND creator_id = ? AND deleted_at IS NULL", formID, userID).First(&form).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Form not found or you don't have permission")
		}
		return nil, err
	}

	// Get whitelist entry
	var whitelist models.FormWhitelist
	if err := s.db.Where("id = ? AND form_id = ?", whitelistID, formID).First(&whitelist).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Whitelist entry not found")
		}
		return nil, err
	}

	// Update fields
	updates := make(map[string]interface{})
	if req.MaxAttempts != nil {
		updates["max_attempts"] = *req.MaxAttempts
	}
	if req.ExpiresAt != nil {
		expiresAt, err := time.Parse(time.RFC3339, *req.ExpiresAt)
		if err != nil {
			return nil, errors.New("Invalid expires_at format, use RFC3339")
		}
		updates["expires_at"] = expiresAt
	}
	if req.Metadata != nil {
		updates["metadata"] = req.Metadata
	}
	updates["updated_at"] = time.Now()

	if err := s.db.Model(&whitelist).Updates(updates).Error; err != nil {
		return nil, err
	}

	// Reload to get updated values
	if err := s.db.Where("id = ?", whitelistID).First(&whitelist).Error; err != nil {
		return nil, err
	}

	return s.buildWhitelistEntryDetailResponse(&whitelist), nil
}

// RevokeWhitelistEntry revokes a whitelist entry
func (s *WhitelistService) RevokeWhitelistEntry(formID, whitelistID uuid.UUID, userID uuid.UUID) error {
	// Verify form exists and user owns it
	var form models.Form
	if err := s.db.Where("id = ? AND creator_id = ? AND deleted_at IS NULL", formID, userID).First(&form).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("Form not found or you don't have permission")
		}
		return err
	}

	// Delete whitelist entry
	result := s.db.Where("id = ? AND form_id = ?", whitelistID, formID).Delete(&models.FormWhitelist{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("Whitelist entry not found")
	}

	return nil
}

// ValidateAccessToken validates an access token and returns whitelist details
func (s *WhitelistService) ValidateAccessToken(accessToken string) (*models.ValidateTokenResponse, error) {
	var whitelist models.FormWhitelist

	// Find whitelist entry and preload form
	if err := s.db.Preload("Form").Where("access_token = ?", accessToken).First(&whitelist).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return &models.ValidateTokenResponse{
				IsValid: false,
			}, nil
		}
		return nil, err
	}

	// Check if expired
	if time.Now().After(whitelist.ExpiresAt) {
		return &models.ValidateTokenResponse{
			IsValid: false,
		}, nil
	}

	// Check if attempts exhausted
	canAttempt := whitelist.AttemptsUsed < whitelist.MaxAttempts

	// Check if form is published
	if !whitelist.Form.IsPublished {
		return &models.ValidateTokenResponse{
			IsValid: false,
		}, nil
	}

	attemptsRemaining := whitelist.MaxAttempts - whitelist.AttemptsUsed

	return &models.ValidateTokenResponse{
		IsValid:           true,
		WhitelistID:       whitelist.ID.String(),
		FormID:            whitelist.FormID.String(),
		ExternalUserID:    whitelist.ExternalUserID,
		Email:             whitelist.Email,
		Name:              whitelist.Name,
		CanAttempt:        canAttempt,
		AttemptsRemaining: attemptsRemaining,
		ExpiresAt:         whitelist.ExpiresAt.Format(time.RFC3339),
		Form: &models.FormValidationInfo{
			FormID:           whitelist.Form.ID.String(),
			Title:            whitelist.Form.Title,
			FormType:         whitelist.Form.FormType,
			TimeLimitMinutes: whitelist.Form.TimeLimitMinutes,
		},
	}, nil
}

// Helper functions to build responses

func (s *WhitelistService) buildWhitelistEntryResponse(w *models.FormWhitelist) *models.WhitelistEntryResponse {
	quizURL := fmt.Sprintf("%s/quiz/%s", s.config.FrontEndUrl, w.AccessToken)

	return &models.WhitelistEntryResponse{
		WhitelistID:    w.ID.String(),
		FormID:         w.FormID.String(),
		AccessToken:    w.AccessToken,
		ExternalUserID: w.ExternalUserID,
		Email:          w.Email,
		Name:           w.Name,
		MaxAttempts:    w.MaxAttempts,
		AttemptsUsed:   w.AttemptsUsed,
		ExpiresAt:      w.ExpiresAt.Format(time.RFC3339),
		Metadata:       &w.Metadata,
		CreatedAt:      w.CreatedAt.Format(time.RFC3339),
		UpdatedAt:      w.UpdatedAt.Format(time.RFC3339),
		QuizURL:        quizURL,
	}
}

func (s *WhitelistService) buildWhitelistEntryDetailResponse(w *models.FormWhitelist) *models.WhitelistEntryDetailResponse {
	isExpired := time.Now().After(w.ExpiresAt)
	canAttempt := !isExpired && w.AttemptsUsed < w.MaxAttempts

	return &models.WhitelistEntryDetailResponse{
		WhitelistID:    w.ID.String(),
		FormID:         w.FormID.String(),
		AccessToken:    w.AccessToken,
		ExternalUserID: w.ExternalUserID,
		Email:          w.Email,
		Name:           w.Name,
		MaxAttempts:    w.MaxAttempts,
		AttemptsUsed:   w.AttemptsUsed,
		ExpiresAt:      w.ExpiresAt.Format(time.RFC3339),
		IsExpired:      isExpired,
		CanAttempt:     canAttempt,
		Metadata:       &w.Metadata,
		CreatedAt:      w.CreatedAt.Format(time.RFC3339),
		UpdatedAt:      w.UpdatedAt.Format(time.RFC3339),
	}
}

func (s *WhitelistService) buildWhitelistEntryListItem(w *models.FormWhitelist) models.WhitelistEntryListItem {
	isExpired := time.Now().After(w.ExpiresAt)
	canAttempt := !isExpired && w.AttemptsUsed < w.MaxAttempts
	quizURL := fmt.Sprintf("%s/quiz/%s", s.config.FrontEndUrl, w.AccessToken)

	return models.WhitelistEntryListItem{
		WhitelistID:    w.ID.String(),
		ExternalUserID: w.ExternalUserID,
		Email:          w.Email,
		Name:           w.Name,
		MaxAttempts:    w.MaxAttempts,
		AttemptsUsed:   w.AttemptsUsed,
		ExpiresAt:      w.ExpiresAt.Format(time.RFC3339),
		IsExpired:      isExpired,
		CanAttempt:     canAttempt,
		CreatedAt:      w.CreatedAt.Format(time.RFC3339),
		AccessToken:    w.AccessToken,
		QuizURL:        quizURL,
	}
}
