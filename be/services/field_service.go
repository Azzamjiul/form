package services

import (
	"errors"
	"time"

	"memotoko-api/models"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type FieldService struct {
	db *gorm.DB
}

func NewFieldService(db *gorm.DB) *FieldService {
	return &FieldService{
		db: db,
	}
}

// CreateField creates a new field for a form
func (s *FieldService) CreateField(formID uuid.UUID, req *models.CreateFieldRequest, userID uuid.UUID) (*models.FieldDetailResponse, error) {
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
		return nil, errors.New("You don't have permission to add fields to this form")
	}

	// Validate field based on content_type
	if err := s.validateFieldRequest(req, formID); err != nil {
		return nil, err
	}

	// Check for duplicate order_global in the same form
	var existingField models.FormField
	if err := s.db.Where("form_id = ? AND order_global = ?", formID, req.OrderGlobal).First(&existingField).Error; err == nil {
		return nil, errors.New("A field with this order_global already exists in the form")
	}

	// Set defaults based on content_type
	isRequired := false
	points := 0
	if req.IsRequired != nil {
		isRequired = *req.IsRequired
	}
	if req.Points != nil {
		points = *req.Points
	}

	// For section and display_text, force defaults
	if req.ContentType == "section" || req.ContentType == "display_text" {
		isRequired = false
		points = 0
	}

	// Create field
	field := &models.FormField{
		ID:             uuid.New(),
		FormID:         formID,
		SectionID:      s.stringToUUIDPtr(req.SectionID),
		ContentType:    req.ContentType,
		FieldType:      req.FieldType,
		Label:          req.Label,
		Description:    req.Description,
		OrderGlobal:    req.OrderGlobal,
		OrderInSection: req.OrderInSection,
		IsRequired:     isRequired,
		Points:         points,
		AnswerKey:      s.getAnswerKey(req.AnswerKey),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if err := s.db.Create(field).Error; err != nil {
		return nil, err
	}

	return s.buildFieldDetailResponse(field), nil
}

// GetField retrieves a single field details
func (s *FieldService) GetField(formID uuid.UUID, fieldID uuid.UUID, userID uuid.UUID) (*models.FieldDetailResponse, error) {
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

	// Get field
	var field models.FormField
	if err := s.db.Where("id = ? AND form_id = ?", fieldID, formID).First(&field).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Field not found")
		}
		return nil, err
	}

	return s.buildFieldDetailResponse(&field), nil
}

// UpdateField updates field details
func (s *FieldService) UpdateField(formID uuid.UUID, fieldID uuid.UUID, req *models.UpdateFieldRequest, userID uuid.UUID) (*models.FieldDetailResponse, error) {
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
		return nil, errors.New("You don't have permission to update this field")
	}

	// Get field
	var field models.FormField
	if err := s.db.Where("id = ? AND form_id = ?", fieldID, formID).First(&field).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Field not found")
		}
		return nil, err
	}

	// Build updates
	updates := make(map[string]interface{})
	if req.Label != nil {
		updates["label"] = *req.Label
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.IsRequired != nil {
		// Don't allow setting is_required for section or display_text
		if field.ContentType != "section" && field.ContentType != "display_text" {
			updates["is_required"] = *req.IsRequired
		}
	}
	if req.Points != nil {
		// Don't allow setting points for section or display_text
		if field.ContentType != "section" && field.ContentType != "display_text" {
			updates["points"] = *req.Points
		}
	}
	if req.AnswerKey != nil {
		updates["answer_key"] = *req.AnswerKey
	}
	if req.OrderGlobal != nil {
		// Check for duplicate order_global
		var existingField models.FormField
		if err := s.db.Where("form_id = ? AND order_global = ? AND id != ?", formID, *req.OrderGlobal, fieldID).First(&existingField).Error; err == nil {
			return nil, errors.New("A field with this order_global already exists in the form")
		}
		updates["order_global"] = *req.OrderGlobal
	}
	if req.OrderInSection != nil {
		updates["order_in_section"] = *req.OrderInSection
	}
	if req.SectionID != nil {
		updates["section_id"] = s.stringToUUIDPtr(req.SectionID)
	}
	updates["updated_at"] = time.Now()

	if err := s.db.Model(&field).Updates(updates).Error; err != nil {
		return nil, err
	}

	// Reload field
	if err := s.db.Where("id = ?", fieldID).First(&field).Error; err != nil {
		return nil, err
	}

	return s.buildFieldDetailResponse(&field), nil
}

// DeleteField deletes a field (associated answers will be deleted via CASCADE)
func (s *FieldService) DeleteField(formID uuid.UUID, fieldID uuid.UUID, userID uuid.UUID) error {
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
		return errors.New("You don't have permission to delete this field")
	}

	// Get field
	var field models.FormField
	if err := s.db.Where("id = ? AND form_id = ?", fieldID, formID).First(&field).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("Field not found")
		}
		return err
	}

	// Delete field (CASCADE will delete associated answers)
	if err := s.db.Delete(&field).Error; err != nil {
		return err
	}

	return nil
}

// ListFields retrieves all fields in a form (ordered by order_global)
func (s *FieldService) ListFields(formID uuid.UUID, userID uuid.UUID) (*models.FieldListResponse, error) {
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

	// Get fields ordered by order_global
	var fields []models.FormField
	if err := s.db.Where("form_id = ?", formID).Order("order_global ASC").Find(&fields).Error; err != nil {
		return nil, err
	}

	// Build response
	fieldResponses := make([]models.FieldResponse, 0, len(fields))
	for _, field := range fields {
		fieldResponses = append(fieldResponses, s.buildFieldResponse(&field))
	}

	return &models.FieldListResponse{
		Fields: fieldResponses,
	}, nil
}

// ReorderFields reorders fields (change order_global and section assignments)
func (s *FieldService) ReorderFields(formID uuid.UUID, req *models.ReorderFieldsRequest, userID uuid.UUID) (*models.ReorderFieldsResponse, error) {
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
		return nil, errors.New("You don't have permission to reorder fields in this form")
	}

	// Validate all field IDs belong to this form
	fieldIDs := make([]uuid.UUID, 0, len(req.Items))
	for _, item := range req.Items {
		fieldID, err := uuid.Parse(item.FieldID)
		if err != nil {
			return nil, errors.New("Invalid field_id format: " + item.FieldID)
		}
		fieldIDs = append(fieldIDs, fieldID)
	}

	// Check all fields exist and belong to this form
	var existingFields []models.FormField
	if err := s.db.Where("id IN ? AND form_id = ?", fieldIDs, formID).Find(&existingFields).Error; err != nil {
		return nil, err
	}

	if len(existingFields) != len(fieldIDs) {
		return nil, errors.New("One or more field IDs do not belong to this form")
	}

	// Perform update in transaction
	err := s.db.Transaction(func(tx *gorm.DB) error {
		for _, item := range req.Items {
			fieldID, _ := uuid.Parse(item.FieldID)
			updates := map[string]interface{}{
				"order_global": item.OrderGlobal,
				"updated_at":   time.Now(),
			}

			// Update section_id
			if item.SectionID != nil && *item.SectionID != "" {
				sectionUUID, err := uuid.Parse(*item.SectionID)
				if err != nil {
					return errors.New("Invalid section_id format: " + *item.SectionID)
				}
				updates["section_id"] = sectionUUID
			} else {
				updates["section_id"] = nil
			}

			// Update order_in_section
			if item.OrderInSection != nil {
				updates["order_in_section"] = *item.OrderInSection
			} else {
				updates["order_in_section"] = nil
			}

			if err := tx.Model(&models.FormField{}).Where("id = ?", fieldID).Updates(updates).Error; err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	return &models.ReorderFieldsResponse{
		Items:   req.Items,
		Message: "Fields reordered successfully",
	}, nil
}

// Helper methods

func (s *FieldService) validateFieldRequest(req *models.CreateFieldRequest, formID uuid.UUID) error {
	// Validate based on content_type
	switch req.ContentType {
	case "input_field":
		// Must have field_type
		if req.FieldType == nil || *req.FieldType == "" {
			return errors.New("Input fields must specify field_type")
		}
		// Validate field_type
		validFieldTypes := []string{"text", "multiple_choice", "paragraph", "checkbox", "dropdown", "date", "time", "file_upload", "linear_scale", "grid"}
		isValid := false
		for _, validType := range validFieldTypes {
			if *req.FieldType == validType {
				isValid = true
				break
			}
		}
		if !isValid {
			return errors.New("Invalid field_type for input_field")
		}
		// Must have order_in_section if section_id is provided
		if req.SectionID != nil && *req.SectionID != "" && req.OrderInSection == nil {
			return errors.New("order_in_section is required when section_id is provided")
		}
	case "section":
		// field_type must be null
		if req.FieldType != nil && *req.FieldType != "" {
			return errors.New("Section fields must not have field_type")
		}
		// section_id must be null
		if req.SectionID != nil && *req.SectionID != "" {
			return errors.New("Section fields must not have section_id")
		}
		// order_in_section must be null
		if req.OrderInSection != nil {
			return errors.New("Section fields must not have order_in_section")
		}
	case "display_text":
		// field_type must be null
		if req.FieldType != nil && *req.FieldType != "" {
			return errors.New("Display text fields must not have field_type")
		}
		// Must have order_in_section if section_id is provided
		if req.SectionID != nil && *req.SectionID != "" && req.OrderInSection == nil {
			return errors.New("order_in_section is required when section_id is provided")
		}
	default:
		return errors.New("Invalid content_type")
	}

	// Validate section_id if provided
	if req.SectionID != nil && *req.SectionID != "" {
		sectionID, err := uuid.Parse(*req.SectionID)
		if err != nil {
			return errors.New("Invalid section_id format")
		}

		// Check section exists and belongs to this form
		var section models.FormSection
		if err := s.db.Where("id = ? AND form_id = ?", sectionID, formID).First(&section).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return errors.New("Section not found in this form")
			}
			return err
		}
	}

	return nil
}

func (s *FieldService) stringToUUIDPtr(str *string) *uuid.UUID {
	if str == nil || *str == "" {
		return nil
	}
	parsed, err := uuid.Parse(*str)
	if err != nil {
		return nil
	}
	return &parsed
}

func (s *FieldService) getAnswerKey(key *datatypes.JSON) datatypes.JSON {
	if key == nil {
		return nil
	}
	return *key
}

func (s *FieldService) buildFieldResponse(field *models.FormField) models.FieldResponse {
	var sectionID *string
	if field.SectionID != nil {
		id := field.SectionID.String()
		sectionID = &id
	}

	var answerKey *datatypes.JSON
	if field.AnswerKey != nil {
		answerKey = &field.AnswerKey
	}

	return models.FieldResponse{
		FieldID:        field.ID.String(),
		ContentType:    field.ContentType,
		FieldType:      field.FieldType,
		Label:          field.Label,
		Description:    field.Description,
		OrderGlobal:    field.OrderGlobal,
		OrderInSection: field.OrderInSection,
		SectionID:      sectionID,
		IsRequired:     field.IsRequired,
		Points:         field.Points,
		AnswerKey:      answerKey,
	}
}

func (s *FieldService) buildFieldDetailResponse(field *models.FormField) *models.FieldDetailResponse {
	var sectionID *string
	if field.SectionID != nil {
		id := field.SectionID.String()
		sectionID = &id
	}

	var answerKey *datatypes.JSON
	if field.AnswerKey != nil {
		answerKey = &field.AnswerKey
	}

	return &models.FieldDetailResponse{
		FieldID:        field.ID.String(),
		FormID:         field.FormID.String(),
		ContentType:    field.ContentType,
		FieldType:      field.FieldType,
		Label:          field.Label,
		Description:    field.Description,
		OrderGlobal:    field.OrderGlobal,
		OrderInSection: field.OrderInSection,
		SectionID:      sectionID,
		IsRequired:     field.IsRequired,
		Points:         field.Points,
		AnswerKey:      answerKey,
		CreatedAt:      field.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:      field.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
