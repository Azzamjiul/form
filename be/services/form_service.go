package services

import (
	"errors"
	"fmt"
	"sort"
	"time"

	"form-api/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FormService struct {
	db *gorm.DB
}

func NewFormService(db *gorm.DB) *FormService {
	return &FormService{
		db: db,
	}
}

// CreateForm creates a new form
func (s *FormService) CreateForm(req *models.CreateFormRequest, creatorID uuid.UUID) (*models.FormDetailResponse, error) {
	form := &models.Form{
		ID:                 uuid.New(),
		CreatorID:          creatorID,
		Title:              req.Title,
		Description:        req.Description,
		FormType:           req.FormType,
		TimeLimitMinutes:   req.TimeLimitMinutes,
		PassingScore:       req.PassingScore,
		ShowCorrectAnswers: req.ShowCorrectAnswers,
		ShuffleQuestions:   req.ShuffleQuestions,
		IsPublished:        false,
		TotalPoints:        0,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	if err := s.db.Create(form).Error; err != nil {
		return nil, err
	}

	return s.buildFormDetailResponse(form), nil
}

// GetFormByID retrieves a form with all sections and fields
func (s *FormService) GetFormByID(formID uuid.UUID, userID uuid.UUID) (*models.FormWithSectionsResponse, error) {
	var form models.Form

	// Load form with all relationships
	if err := s.db.Preload("Sections", func(db *gorm.DB) *gorm.DB {
		return db.Order("order_global ASC")
	}).Preload("Sections.Fields", func(db *gorm.DB) *gorm.DB {
		return db.Order("order_in_section ASC")
	}).Preload("Fields", func(db *gorm.DB) *gorm.DB {
		return db.Where("section_id IS NULL").Order("order_global ASC")
	}).Where("id = ? AND deleted_at IS NULL", formID).First(&form).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Form not found")
		}
		return nil, err
	}

	// Check authorization - only creator can access unpublished forms
	if !form.IsPublished && form.CreatorID != userID {
		return nil, errors.New("You don't have permission to access this form")
	}

	return s.buildFormWithSectionsResponse(&form), nil
}

// UpdateForm updates form settings
func (s *FormService) UpdateForm(formID uuid.UUID, req *models.UpdateFormRequest, userID uuid.UUID) (*models.FormDetailResponse, error) {
	var form models.Form

	if err := s.db.Where("id = ? AND deleted_at IS NULL", formID).First(&form).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Form not found")
		}
		return nil, err
	}

	// Check authorization
	if form.CreatorID != userID {
		return nil, errors.New("You don't have permission to update this form")
	}

	// Update fields
	updates := make(map[string]interface{})
	if req.Title != nil {
		updates["title"] = *req.Title
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.TimeLimitMinutes != nil {
		updates["time_limit_minutes"] = *req.TimeLimitMinutes
	}
	if req.PassingScore != nil {
		updates["passing_score"] = *req.PassingScore
	}
	if req.ShowCorrectAnswers != nil {
		updates["show_correct_answers"] = *req.ShowCorrectAnswers
	}
	if req.ShuffleQuestions != nil {
		updates["shuffle_questions"] = *req.ShuffleQuestions
	}
	updates["updated_at"] = time.Now()

	if err := s.db.Model(&form).Updates(updates).Error; err != nil {
		return nil, err
	}

	// Reload the form
	if err := s.db.Where("id = ?", formID).First(&form).Error; err != nil {
		return nil, err
	}

	return s.buildFormDetailResponse(&form), nil
}

// ListUserForms retrieves all forms created by user with pagination
func (s *FormService) ListUserForms(userID uuid.UUID, page, perPage int, sortBy, order string) (*models.FormListResponse, error) {
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 10
	}

	offset := (page - 1) * perPage

	// Build query
	query := s.db.Model(&models.Form{}).Where("creator_id = ? AND deleted_at IS NULL", userID)

	// Sorting
	sortField := "updated_at"
	if sortBy == "created" {
		sortField = "created_at"
	}
	sortOrder := "DESC"
	if order == "asc" {
		sortOrder = "ASC"
	}
	query = query.Order(fmt.Sprintf("%s %s", sortField, sortOrder))

	// Get total count
	var totalItems int64
	if err := query.Count(&totalItems).Error; err != nil {
		return nil, err
	}

	// Get forms
	var forms []models.Form
	if err := query.Offset(offset).Limit(perPage).Find(&forms).Error; err != nil {
		return nil, err
	}

	// Get response counts for each form
	formSummaries := make([]models.FormSummary, 0, len(forms))
	for _, form := range forms {
		var responseCount int64
		s.db.Model(&models.FormResponse{}).Where("form_id = ?", form.ID).Count(&responseCount)

		var questionCount int64
		s.db.Model(&models.FormField{}).Where("form_id = ? AND content_type = 'input_field'", form.ID).Count(&questionCount)

		formSummaries = append(formSummaries, models.FormSummary{
			FormID:        form.ID.String(),
			Title:         form.Title,
			Description:   form.Description,
			FormType:      form.FormType,
			IsPublished:   form.IsPublished,
			ResponseCount: int(responseCount),
			TotalQuestions: int(questionCount),
			CreatedAt:     form.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			UpdatedAt:     form.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	totalPages := int((totalItems + int64(perPage) - 1) / int64(perPage))

	return &models.FormListResponse{
		Forms: formSummaries,
		Pagination: models.PaginationResponse{
			CurrentPage: page,
			PerPage:     perPage,
			TotalItems:  int(totalItems),
			TotalPages:  totalPages,
		},
	}, nil
}

// DeleteForm soft deletes a form
func (s *FormService) DeleteForm(formID uuid.UUID, userID uuid.UUID) error {
	var form models.Form

	if err := s.db.Where("id = ? AND deleted_at IS NULL", formID).First(&form).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("Form not found")
		}
		return err
	}

	// Check authorization
	if form.CreatorID != userID {
		return errors.New("You don't have permission to delete this form")
	}

	// Soft delete
	now := time.Now()
	return s.db.Model(&form).Update("deleted_at", now).Error
}

// DuplicateForm creates a copy of a form with all sections and fields
func (s *FormService) DuplicateForm(formID uuid.UUID, newTitle string, userID uuid.UUID) (*models.FormDetailResponse, error) {
	var originalForm models.Form

	// Load original form with sections and fields
	if err := s.db.Preload("Sections").Preload("Sections.Fields").Where("id = ? AND deleted_at IS NULL", formID).First(&originalForm).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Form not found")
		}
		return nil, err
	}

	// Check authorization
	if originalForm.CreatorID != userID {
		return nil, errors.New("You don't have permission to duplicate this form")
	}

	// Create new form
	newForm := models.Form{
		ID:                 uuid.New(),
		CreatorID:          userID,
		Title:              newTitle,
		Description:        originalForm.Description,
		FormType:           originalForm.FormType,
		TimeLimitMinutes:   originalForm.TimeLimitMinutes,
		PassingScore:       originalForm.PassingScore,
		ShowCorrectAnswers: originalForm.ShowCorrectAnswers,
		ShuffleQuestions:   originalForm.ShuffleQuestions,
		IsPublished:        false, // Always unpublished when duplicated
		TotalPoints:        originalForm.TotalPoints,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	// Start transaction
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}

	// Create new form
	if err := tx.Create(&newForm).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Duplicate sections and fields
	sectionIDMap := make(map[uuid.UUID]uuid.UUID) // old ID -> new ID mapping

	for _, section := range originalForm.Sections {
		newSectionID := uuid.New()
		sectionIDMap[section.ID] = newSectionID

		newSection := models.FormSection{
			ID:                    newSectionID,
			FormID:                newForm.ID,
			Title:                 section.Title,
			Description:           section.Description,
			OrderGlobal:           section.OrderGlobal,
			VisibilityType:        section.VisibilityType,
			PrerequisiteSectionID: section.PrerequisiteSectionID,
			CreatedAt:             time.Now(),
			UpdatedAt:             time.Now(),
		}

		if err := tx.Create(&newSection).Error; err != nil {
			tx.Rollback()
			return nil, err
		}

		// Duplicate fields for this section
		for _, field := range section.Fields {
			newField := models.FormField{
				ID:             uuid.New(),
				FormID:         newForm.ID,
				SectionID:      &newSectionID,
				ContentType:    field.ContentType,
				FieldType:      field.FieldType,
				Label:          field.Label,
				Description:    field.Description,
				OrderGlobal:    field.OrderGlobal,
				OrderInSection: field.OrderInSection,
				IsRequired:     field.IsRequired,
				Points:         field.Points,
				AnswerKey:      field.AnswerKey,
				CreatedAt:      time.Now(),
				UpdatedAt:      time.Now(),
			}

			if err := tx.Create(&newField).Error; err != nil {
				tx.Rollback()
				return nil, err
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return s.buildFormDetailResponse(&newForm), nil
}

// PublishForm publishes a form
func (s *FormService) PublishForm(formID uuid.UUID, userID uuid.UUID) (*models.PublishFormResponse, error) {
	var form models.Form

	if err := s.db.Where("id = ? AND deleted_at IS NULL", formID).First(&form).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Form not found")
		}
		return nil, err
	}

	// Check authorization
	if form.CreatorID != userID {
		return nil, errors.New("You don't have permission to publish this form")
	}

	// Check if form has at least one question
	var questionCount int64
	s.db.Model(&models.FormField{}).Where("form_id = ? AND content_type = 'input_field'", formID).Count(&questionCount)

	if questionCount == 0 {
		return nil, errors.New("Cannot publish form without at least one question")
	}

	// Publish form
	now := time.Now()
	updates := map[string]interface{}{
		"is_published": true,
		"updated_at":   now,
	}

	if err := s.db.Model(&form).Updates(updates).Error; err != nil {
		return nil, err
	}

	publishedAt := now.Format("2006-01-02T15:04:05Z07:00")

	return &models.PublishFormResponse{
		FormID:      form.ID.String(),
		Title:       form.Title,
		IsPublished: true,
		PublishedAt: publishedAt,
		Message:     "Form published successfully",
	}, nil
}

// Helper methods

func (s *FormService) buildFormDetailResponse(form *models.Form) *models.FormDetailResponse {
	return &models.FormDetailResponse{
		FormID:             form.ID.String(),
		Title:              form.Title,
		Description:        form.Description,
		FormType:           form.FormType,
		CreatorID:          form.CreatorID.String(),
		TimeLimitMinutes:   form.TimeLimitMinutes,
		PassingScore:       form.PassingScore,
		ShowCorrectAnswers: form.ShowCorrectAnswers,
		ShuffleQuestions:   form.ShuffleQuestions,
		IsPublished:        form.IsPublished,
		TotalPoints:        form.TotalPoints,
		CreatedAt:          form.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:          form.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

func (s *FormService) buildFormWithSectionsResponse(form *models.Form) *models.FormWithSectionsResponse {
	sections := make([]models.SectionResponse, 0, len(form.Sections))
	sectionsMap := make(map[string]*models.SectionResponse)

	// Build sections with their fields
	for _, section := range form.Sections {
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

		var prerequisiteSectionID *string
		if section.PrerequisiteSectionID != nil {
			id := section.PrerequisiteSectionID.String()
			prerequisiteSectionID = &id
		}

		sectionResp := models.SectionResponse{
			SectionID:             section.ID.String(),
			Title:                 section.Title,
			Description:           section.Description,
			OrderGlobal:           section.OrderGlobal,
			VisibilityType:        section.VisibilityType,
			PrerequisiteSectionID: prerequisiteSectionID,
			Fields:                fields,
		}
		sections = append(sections, sectionResp)
		sectionsMap[section.ID.String()] = &sectionResp
	}

	// Build standalone fields (fields without section_id)
	standaloneFields := make([]models.FieldResponse, 0, len(form.Fields))
	for _, field := range form.Fields {
		standaloneFields = append(standaloneFields, models.FieldResponse{
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

	// Build content items - unified list of sections and standalone fields sorted by order_global
	contentItems := make([]models.FormContentItem, 0)

	// Add sections as content items
	for i := range sections {
		contentItems = append(contentItems, models.FormContentItem{
			Type:        "section",
			OrderGlobal: sections[i].OrderGlobal,
			Section:     &sections[i],
		})
	}

	// Add standalone fields as content items
	for i := range standaloneFields {
		contentItems = append(contentItems, models.FormContentItem{
			Type:        "field",
			OrderGlobal: standaloneFields[i].OrderGlobal,
			Field:       &standaloneFields[i],
		})
	}

	// Sort content items by order_global
	sort.Slice(contentItems, func(i, j int) bool {
		return contentItems[i].OrderGlobal < contentItems[j].OrderGlobal
	})

	return &models.FormWithSectionsResponse{
		FormID:             form.ID.String(),
		Title:              form.Title,
		Description:        form.Description,
		FormType:           form.FormType,
		CreatorID:          form.CreatorID.String(),
		TimeLimitMinutes:   form.TimeLimitMinutes,
		PassingScore:       form.PassingScore,
		ShowCorrectAnswers: form.ShowCorrectAnswers,
		ShuffleQuestions:   form.ShuffleQuestions,
		IsPublished:        form.IsPublished,
		TotalPoints:        form.TotalPoints,
		CreatedAt:          form.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:          form.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		Sections:           sections,
		Fields:             standaloneFields,
		ContentItems:       contentItems,
	}
}
