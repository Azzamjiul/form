package services

import (
	"errors"
	"time"

	"form-api/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SectionService struct {
	db *gorm.DB
}

func NewSectionService(db *gorm.DB) *SectionService {
	return &SectionService{
		db: db,
	}
}

// CreateSection creates a new section for a form
func (s *SectionService) CreateSection(formID uuid.UUID, req *models.CreateSectionRequest, userID uuid.UUID) (*models.SectionDetailResponse, error) {
	// Check if form exists and user has permission
	var form models.Form
	if err := s.db.Where("id = ? AND deleted_at IS NULL", formID).First(&form).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Form not found")
		}
		return nil, err
	}

	// Check authorization
	if form.CreatorID != userID {
		return nil, errors.New("You don't have permission to add sections to this form")
	}

	// Validate visibility rules
	if err := s.validateVisibilityRules(req.VisibilityType, req.PrerequisiteSectionID, formID); err != nil {
		return nil, err
	}

	// Check for duplicate order_global in the same form
	var existingSection models.FormSection
	if err := s.db.Where("form_id = ? AND order_global = ?", formID, req.OrderGlobal).First(&existingSection).Error; err == nil {
		return nil, errors.New("A section with this order_global already exists in the form")
	}

	// Create section
	section := &models.FormSection{
		ID:                    uuid.New(),
		FormID:                formID,
		Title:                 req.Title,
		Description:           req.Description,
		OrderGlobal:           req.OrderGlobal,
		VisibilityType:        req.VisibilityType,
		PrerequisiteSectionID: s.stringToUUIDPtr(req.PrerequisiteSectionID),
		CreatedAt:             time.Now(),
		UpdatedAt:             time.Now(),
	}

	if err := s.db.Create(section).Error; err != nil {
		return nil, err
	}

	return s.buildSectionDetailResponse(section), nil
}

// GetSection retrieves a section with all its fields
func (s *SectionService) GetSection(formID uuid.UUID, sectionID uuid.UUID, userID uuid.UUID) (*models.SectionDetailResponse, error) {
	// Check if form exists and user has permission
	var form models.Form
	if err := s.db.Where("id = ? AND deleted_at IS NULL", formID).First(&form).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Form not found")
		}
		return nil, err
	}

	// Check authorization - only creator can access unpublished forms
	if !form.IsPublished && form.CreatorID != userID {
		return nil, errors.New("You don't have permission to access this form")
	}

	// Get section with fields
	var section models.FormSection
	if err := s.db.Preload("Fields", func(db *gorm.DB) *gorm.DB {
		return db.Order("order_in_section ASC")
	}).Where("id = ? AND form_id = ?", sectionID, formID).First(&section).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Section not found")
		}
		return nil, err
	}

	return s.buildSectionDetailResponseWithFields(&section), nil
}

// UpdateSection updates section details
func (s *SectionService) UpdateSection(formID uuid.UUID, sectionID uuid.UUID, req *models.UpdateSectionRequest, userID uuid.UUID) (*models.SectionDetailResponse, error) {
	// Check if form exists and user has permission
	var form models.Form
	if err := s.db.Where("id = ? AND deleted_at IS NULL", formID).First(&form).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Form not found")
		}
		return nil, err
	}

	// Check authorization
	if form.CreatorID != userID {
		return nil, errors.New("You don't have permission to update this section")
	}

	// Get section
	var section models.FormSection
	if err := s.db.Where("id = ? AND form_id = ?", sectionID, formID).First(&section).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Section not found")
		}
		return nil, err
	}

	// Build updates
	updates := make(map[string]interface{})
	if req.Title != nil {
		updates["title"] = *req.Title
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.OrderGlobal != nil {
		// Check for duplicate order_global
		var existingSection models.FormSection
		if err := s.db.Where("form_id = ? AND order_global = ? AND id != ?", formID, *req.OrderGlobal, sectionID).First(&existingSection).Error; err == nil {
			return nil, errors.New("A section with this order_global already exists in the form")
		}
		updates["order_global"] = *req.OrderGlobal
	}
	if req.VisibilityType != nil {
		// Determine prerequisite for validation
		prerequisiteID := req.PrerequisiteSectionID
		if prerequisiteID == nil && req.VisibilityType == nil {
			// Use existing prerequisite if not being updated
			if section.PrerequisiteSectionID != nil {
				id := section.PrerequisiteSectionID.String()
				prerequisiteID = &id
			}
		}

		if err := s.validateVisibilityRules(*req.VisibilityType, prerequisiteID, formID); err != nil {
			return nil, err
		}
		updates["visibility_type"] = *req.VisibilityType
	}
	if req.PrerequisiteSectionID != nil {
		prerequisiteUUID := s.stringToUUIDPtr(req.PrerequisiteSectionID)
		updates["prerequisite_section_id"] = prerequisiteUUID
	}
	updates["updated_at"] = time.Now()

	if err := s.db.Model(&section).Updates(updates).Error; err != nil {
		return nil, err
	}

	// Reload section
	if err := s.db.Where("id = ?", sectionID).First(&section).Error; err != nil {
		return nil, err
	}

	return s.buildSectionDetailResponse(&section), nil
}

// DeleteSection deletes a section (fields will have section_id set to NULL)
func (s *SectionService) DeleteSection(formID uuid.UUID, sectionID uuid.UUID, userID uuid.UUID) error {
	// Check if form exists and user has permission
	var form models.Form
	if err := s.db.Where("id = ? AND deleted_at IS NULL", formID).First(&form).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("Form not found")
		}
		return err
	}

	// Check authorization
	if form.CreatorID != userID {
		return errors.New("You don't have permission to delete this section")
	}

	// Get section
	var section models.FormSection
	if err := s.db.Where("id = ? AND form_id = ?", sectionID, formID).First(&section).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("Section not found")
		}
		return err
	}

	// Delete section (ON DELETE SET NULL will orphan the fields)
	if err := s.db.Delete(&section).Error; err != nil {
		return err
	}

	return nil
}

// ListSections retrieves all sections in a form (ordered by order_global)
func (s *SectionService) ListSections(formID uuid.UUID, userID uuid.UUID) (*models.SectionListResponse, error) {
	// Check if form exists and user has permission
	var form models.Form
	if err := s.db.Where("id = ? AND deleted_at IS NULL", formID).First(&form).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Form not found")
		}
		return nil, err
	}

	// Check authorization - only creator can access unpublished forms
	if !form.IsPublished && form.CreatorID != userID {
		return nil, errors.New("You don't have permission to access this form")
	}

	// Get sections ordered by order_global
	var sections []models.FormSection
	if err := s.db.Where("form_id = ?", formID).Order("order_global ASC").Find(&sections).Error; err != nil {
		return nil, err
	}

	// Build response with field counts
	sectionSummaries := make([]models.SectionSummary, 0, len(sections))
	for _, section := range sections {
		var fieldsCount int64
		s.db.Model(&models.FormField{}).Where("section_id = ?", section.ID).Count(&fieldsCount)

		var prerequisiteSectionID *string
		if section.PrerequisiteSectionID != nil {
			id := section.PrerequisiteSectionID.String()
			prerequisiteSectionID = &id
		}

		sectionSummaries = append(sectionSummaries, models.SectionSummary{
			SectionID:             section.ID.String(),
			Title:                 section.Title,
			Description:           section.Description,
			OrderGlobal:           section.OrderGlobal,
			VisibilityType:        section.VisibilityType,
			PrerequisiteSectionID: prerequisiteSectionID,
			FieldsCount:           int(fieldsCount),
		})
	}

	return &models.SectionListResponse{
		Sections: sectionSummaries,
	}, nil
}

// Helper methods

func (s *SectionService) validateVisibilityRules(visibilityType string, prerequisiteSectionID *string, formID uuid.UUID) error {
	if visibilityType == "always" {
		if prerequisiteSectionID != nil && *prerequisiteSectionID != "" {
			return errors.New("Sections with visibility_type 'always' must not have a prerequisite_section_id")
		}
	} else if visibilityType == "after_section" {
		if prerequisiteSectionID == nil || *prerequisiteSectionID == "" {
			return errors.New("Sections with visibility_type 'after_section' must have a prerequisite_section_id")
		}

		// Verify prerequisite section exists and belongs to same form
		prerequisiteUUID, err := uuid.Parse(*prerequisiteSectionID)
		if err != nil {
			return errors.New("Invalid prerequisite_section_id format")
		}

		var prerequisiteSection models.FormSection
		if err := s.db.Where("id = ? AND form_id = ?", prerequisiteUUID, formID).First(&prerequisiteSection).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("Prerequisite section not found in this form")
			}
			return err
		}
	}

	return nil
}

func (s *SectionService) stringToUUIDPtr(str *string) *uuid.UUID {
	if str == nil || *str == "" {
		return nil
	}
	parsed, err := uuid.Parse(*str)
	if err != nil {
		return nil
	}
	return &parsed
}

func (s *SectionService) buildSectionDetailResponse(section *models.FormSection) *models.SectionDetailResponse {
	var prerequisiteSectionID *string
	if section.PrerequisiteSectionID != nil {
		id := section.PrerequisiteSectionID.String()
		prerequisiteSectionID = &id
	}

	return &models.SectionDetailResponse{
		SectionID:             section.ID.String(),
		FormID:                section.FormID.String(),
		Title:                 section.Title,
		Description:           section.Description,
		OrderGlobal:           section.OrderGlobal,
		VisibilityType:        section.VisibilityType,
		PrerequisiteSectionID: prerequisiteSectionID,
		CreatedAt:             section.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:             section.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

func (s *SectionService) buildSectionDetailResponseWithFields(section *models.FormSection) *models.SectionDetailResponse {
	response := s.buildSectionDetailResponse(section)

	// Add fields
	fields := make([]models.FieldResponse, 0, len(section.Fields))
	for _, field := range section.Fields {
		fields = append(fields, models.FieldResponse{
			FieldID:        field.ID.String(),
			ContentType:    field.ContentType,
			FieldType:      field.FieldType,
			Label:          field.Label,
			Description:    field.Description,
			OrderGlobal:    field.OrderGlobal,
			OrderInSection: field.OrderInSection,
			IsRequired:     field.IsRequired,
			Points:         field.Points,
		})
	}
	response.Fields = fields

	return response
}
