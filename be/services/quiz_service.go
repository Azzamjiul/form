package services

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"form-api/models"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type QuizService struct {
	db *gorm.DB
}

func NewQuizService(db *gorm.DB) *QuizService {
	return &QuizService{
		db: db,
	}
}

// generateSessionToken generates a random session token
func (s *QuizService) generateSessionToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

// StartQuiz initiates a new quiz session
func (s *QuizService) StartQuiz(req *models.StartQuizRequest) (*models.StartQuizResponse, error) {
	// Find and validate whitelist entry
	var whitelist models.FormWhitelist
	if err := s.db.Preload("Form").Where("access_token = ?", req.AccessToken).First(&whitelist).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Invalid access token")
		}
		return nil, err
	}

	// Validate whitelist
	if time.Now().After(whitelist.ExpiresAt) {
		return nil, errors.New("Access token has expired")
	}

	if whitelist.AttemptsUsed >= whitelist.MaxAttempts {
		return nil, errors.New("Maximum attempts reached")
	}

	if !whitelist.Form.IsPublished {
		return nil, errors.New("Form is not published")
	}

	// Generate session token
	sessionToken, err := s.generateSessionToken()
	if err != nil {
		return nil, errors.New("Failed to generate session token")
	}

	// Calculate expiration
	now := time.Now()
	var expiresAt time.Time
	if whitelist.Form.TimeLimitMinutes > 0 {
		expiresAt = now.Add(time.Duration(whitelist.Form.TimeLimitMinutes) * time.Minute)
	} else {
		// Default 24 hours if no time limit
		expiresAt = now.Add(24 * time.Hour)
	}

	// Create session
	session := &models.FormSession{
		ID:             uuid.New(),
		FormID:         whitelist.FormID,
		WhitelistID:    whitelist.ID,
		SessionToken:   sessionToken,
		StartedAt:      now,
		ExpiresAt:      expiresAt,
		IsActive:       true,
		LastActivityAt: now,
		CreatedAt:      now,
	}

	if err := s.db.Create(session).Error; err != nil {
		return nil, err
	}

	// Increment attempts used
	if err := s.db.Model(&whitelist).Update("attempts_used", whitelist.AttemptsUsed+1).Error; err != nil {
		return nil, err
	}

	// Count total questions
	var totalQuestions int64
	s.db.Model(&models.FormField{}).Where("form_id = ? AND content_type = ?", whitelist.FormID, "input_field").Count(&totalQuestions)

	description := ""
	if whitelist.Form.Description != nil {
		description = *whitelist.Form.Description
	}

	return &models.StartQuizResponse{
		SessionID:        session.ID.String(),
		SessionToken:     sessionToken,
		FormID:           whitelist.FormID.String(),
		WhitelistID:      whitelist.ID.String(),
		StartedAt:        session.StartedAt.Format(time.RFC3339),
		ExpiresAt:        session.ExpiresAt.Format(time.RFC3339),
		TimeLimitMinutes: whitelist.Form.TimeLimitMinutes,
		Form: models.QuizFormInfo{
			Title:            whitelist.Form.Title,
			Description:      description,
			FormType:         whitelist.Form.FormType,
			ShuffleQuestions: whitelist.Form.ShuffleQuestions,
			TotalQuestions:   int(totalQuestions),
		},
	}, nil
}

// GetQuizContent retrieves the quiz questions for display
func (s *QuizService) GetQuizContent(sessionID uuid.UUID, sessionToken string) (*models.QuizContentResponse, error) {
	// Validate session
	var session models.FormSession
	if err := s.db.Preload("Form").Where("id = ? AND session_token = ?", sessionID, sessionToken).First(&session).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Invalid session")
		}
		return nil, err
	}

	if !session.IsActive {
		return nil, errors.New("Session is no longer active")
	}

	if time.Now().After(session.ExpiresAt) {
		return nil, errors.New("Session has expired")
	}

	// Get form with sections and fields
	var sections []models.FormSection
	if err := s.db.Preload("Fields", func(db *gorm.DB) *gorm.DB {
		return db.Order("order_in_section ASC")
	}).Where("form_id = ?", session.FormID).Order("order_global ASC").Find(&sections).Error; err != nil {
		return nil, err
	}

	// Build sections response
	sectionResponses := make([]models.QuizSectionContent, 0, len(sections))
	for _, section := range sections {
		fields := make([]models.QuizFieldContent, 0, len(section.Fields))
		for _, field := range section.Fields {
			fields = append(fields, models.QuizFieldContent{
				FieldID:        field.ID.String(),
				ContentType:    field.ContentType,
				FieldType:      field.FieldType,
				Label:          field.Label,
				IsRequired:     field.IsRequired,
				OrderInSection: *field.OrderInSection,
			})
		}

		sectionResponses = append(sectionResponses, models.QuizSectionContent{
			SectionID:      section.ID.String(),
			Title:          section.Title,
			OrderGlobal:    section.OrderGlobal,
			VisibilityType: section.VisibilityType,
			Fields:         fields,
		})
	}

	// Update last activity
	s.db.Model(&session).Update("last_activity_at", time.Now())

	return &models.QuizContentResponse{
		SessionID: sessionID.String(),
		Form: models.QuizFormBasicInfo{
			FormID:   session.FormID.String(),
			Title:    session.Form.Title,
			FormType: session.Form.FormType,
		},
		Sections: sectionResponses,
	}, nil
}

// AutoSaveAnswer saves an answer temporarily
func (s *QuizService) AutoSaveAnswer(sessionID uuid.UUID, sessionToken string, req *models.AutoSaveAnswerRequest) (*models.AutoSaveResponse, error) {
	// Validate session
	var session models.FormSession
	if err := s.db.Where("id = ? AND session_token = ?", sessionID, sessionToken).First(&session).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Invalid session")
		}
		return nil, err
	}

	if !session.IsActive {
		return nil, errors.New("Session is no longer active")
	}

	if time.Now().After(session.ExpiresAt) {
		return nil, errors.New("Session has expired")
	}

	// Parse field ID
	fieldID, err := uuid.Parse(req.FieldID)
	if err != nil {
		return nil, errors.New("Invalid field ID")
	}

	// Upsert temp answer
	now := time.Now()
	tempAnswer := models.TempAnswer{
		SessionID:   sessionID,
		FieldID:     fieldID,
		AnswerValue: req.AnswerValue,
		LastSavedAt: now,
		ExpiresAt:   session.ExpiresAt,
	}

	// Check if exists
	var existing models.TempAnswer
	result := s.db.Where("session_id = ? AND field_id = ?", sessionID, fieldID).First(&existing)

	if result.Error != nil && !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, result.Error
	}

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// Create new
		tempAnswer.ID = uuid.New()
		tempAnswer.CreatedAt = now
		if err := s.db.Create(&tempAnswer).Error; err != nil {
			return nil, err
		}
	} else {
		// Update existing
		if err := s.db.Model(&existing).Updates(map[string]interface{}{
			"answer_value": req.AnswerValue,
			"last_saved_at": now,
		}).Error; err != nil {
			return nil, err
		}
	}

	// Update last activity
	s.db.Model(&session).Update("last_activity_at", time.Now())

	return &models.AutoSaveResponse{
		FieldID:     req.FieldID,
		LastSavedAt: now.Format(time.RFC3339),
		Message:     "Answer saved",
	}, nil
}

// GetSessionStatus retrieves the current session status
func (s *QuizService) GetSessionStatus(sessionID uuid.UUID, sessionToken string) (*models.SessionStatusResponse, error) {
	// Validate session
	var session models.FormSession
	if err := s.db.Where("id = ? AND session_token = ?", sessionID, sessionToken).First(&session).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Invalid session")
		}
		return nil, err
	}

	// Count saved answers
	var answersSaved int64
	s.db.Model(&models.TempAnswer{}).Where("session_id = ?", sessionID).Count(&answersSaved)

	// Count total fields
	var totalFields int64
	s.db.Model(&models.FormField{}).Where("form_id = ? AND content_type = ?", session.FormID, "input_field").Count(&totalFields)

	// Calculate time remaining
	timeRemaining := 0
	if session.IsActive && time.Now().Before(session.ExpiresAt) {
		timeRemaining = int(time.Until(session.ExpiresAt).Seconds())
	}

	// Update last activity
	s.db.Model(&session).Update("last_activity_at", time.Now())

	return &models.SessionStatusResponse{
		SessionID:            sessionID.String(),
		IsActive:             session.IsActive,
		StartedAt:            session.StartedAt.Format(time.RFC3339),
		ExpiresAt:            session.ExpiresAt.Format(time.RFC3339),
		TimeRemainingSeconds: timeRemaining,
		AnswersSaved:         int(answersSaved),
		TotalFields:          int(totalFields),
	}, nil
}

// SubmitQuiz submits the quiz and calculates score
func (s *QuizService) SubmitQuiz(sessionID uuid.UUID, sessionToken string, req *models.SubmitQuizRequest) (*models.SubmitQuizResponse, error) {
	// Validate session
	var session models.FormSession
	if err := s.db.Preload("Form").Where("id = ? AND session_token = ?", sessionID, sessionToken).First(&session).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Invalid session")
		}
		return nil, err
	}

	if !session.IsActive {
		return nil, errors.New("Session is no longer active")
	}

	wasAutoSubmitted := false
	if time.Now().After(session.ExpiresAt) {
		wasAutoSubmitted = true
	}

	// Calculate time spent
	timeSpent := int(time.Since(session.StartedAt).Seconds())

	// Create response
	response := &models.FormResponse{
		ID:               uuid.New(),
		FormID:           session.FormID,
		SessionID:        sessionID,
		WhitelistID:      session.WhitelistID,
		TimeSpentSeconds: timeSpent,
		WasAutoSubmitted: wasAutoSubmitted,
		SubmittedAt:      time.Now(),
		CreatedAt:        time.Now(),
	}

	// Calculate score if quiz type
	if session.Form.FormType == "quiz" {
		score, isPassed, err := s.calculateScore(session.FormID, req.Answers)
		if err != nil {
			return nil, err
		}
		response.Score = &score
		response.IsPassed = &isPassed
	}

	// Start transaction
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Save response
	if err := tx.Create(response).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Save field answers
	for _, answer := range req.Answers {
		fieldID, err := uuid.Parse(answer.FieldID)
		if err != nil {
			tx.Rollback()
			return nil, errors.New("Invalid field ID: " + answer.FieldID)
		}

		fieldAnswer := &models.FieldAnswer{
			ID:          uuid.New(),
			ResponseID:  response.ID,
			FieldID:     fieldID,
			AnswerValue: answer.AnswerValue,
			CreatedAt:   time.Now(),
		}

		// If quiz, calculate correctness
		if session.Form.FormType == "quiz" {
			isCorrect, pointsEarned := s.checkAnswerCorrectness(fieldID, answer.AnswerValue)
			fieldAnswer.IsCorrect = &isCorrect
			fieldAnswer.PointsEarned = &pointsEarned
		}

		if err := tx.Create(fieldAnswer).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	// Mark session as inactive
	if err := tx.Model(&session).Update("is_active", false).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Delete temp answers
	if err := tx.Where("session_id = ?", sessionID).Delete(&models.TempAnswer{}).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	message := "Survey submitted successfully"
	if session.Form.FormType == "quiz" {
		message = "Quiz submitted successfully"
	}

	return &models.SubmitQuizResponse{
		ResponseID:       response.ID.String(),
		FormID:           response.FormID.String(),
		SessionID:        sessionID.String(),
		SubmittedAt:      response.SubmittedAt.Format(time.RFC3339),
		TimeSpentSeconds: response.TimeSpentSeconds,
		WasAutoSubmitted: response.WasAutoSubmitted,
		Score:            response.Score,
		IsPassed:         response.IsPassed,
		Message:          message,
	}, nil
}

// GetQuizResult retrieves the quiz result
func (s *QuizService) GetQuizResult(responseID uuid.UUID, sessionToken string) (*models.QuizResultResponse, error) {
	// Get response with relationships
	var response models.FormResponse
	if err := s.db.Preload("Form").Preload("FieldAnswers.Field").Preload("Session").
		Where("id = ?", responseID).First(&response).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Response not found")
		}
		return nil, err
	}

	// Verify session token matches
	if response.Session.SessionToken != sessionToken {
		return nil, errors.New("Unauthorized access")
	}

	// Build answer details
	answers := make([]models.QuizAnswerDetail, 0, len(response.FieldAnswers))
	for _, fa := range response.FieldAnswers {
		answerDetail := models.QuizAnswerDetail{
			FieldID:    fa.FieldID.String(),
			Label:      fa.Field.Label,
			UserAnswer: fa.AnswerValue,
		}

		if response.Form.FormType == "quiz" {
			answerDetail.IsCorrect = fa.IsCorrect
			answerDetail.PointsEarned = fa.PointsEarned
			points := fa.Field.Points
			answerDetail.MaxPoints = &points
		}

		answers = append(answers, answerDetail)
	}

	return &models.QuizResultResponse{
		ResponseID: responseID.String(),
		Form: models.QuizResultFormInfo{
			FormID:             response.FormID.String(),
			Title:              response.Form.Title,
			FormType:           response.Form.FormType,
			PassingScore:       response.Form.PassingScore,
			TotalPoints:        response.Form.TotalPoints,
			ShowCorrectAnswers: response.Form.ShowCorrectAnswers,
		},
		Result: models.QuizResultDetail{
			Score:            response.Score,
			IsPassed:         response.IsPassed,
			TimeSpentSeconds: response.TimeSpentSeconds,
			SubmittedAt:      response.SubmittedAt.Format(time.RFC3339),
			Answers:          answers,
		},
	}, nil
}

// ResumeQuiz resumes an incomplete quiz session
func (s *QuizService) ResumeQuiz(req *models.ResumeQuizRequest) (*models.ResumeQuizResponse, error) {
	// Find session
	var session models.FormSession
	if err := s.db.Where("session_token = ?", req.SessionToken).First(&session).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("Session not found")
		}
		return nil, err
	}

	if !session.IsActive {
		return nil, errors.New("Session is no longer active")
	}

	if time.Now().After(session.ExpiresAt) {
		return nil, errors.New("Session has expired")
	}

	// Get saved answers
	var tempAnswers []models.TempAnswer
	if err := s.db.Where("session_id = ?", session.ID).Find(&tempAnswers).Error; err != nil {
		return nil, err
	}

	savedAnswers := make(map[string]datatypes.JSON)
	for _, ta := range tempAnswers {
		savedAnswers[ta.FieldID.String()] = ta.AnswerValue
	}

	timeRemaining := int(time.Until(session.ExpiresAt).Seconds())

	// Update last activity
	s.db.Model(&session).Update("last_activity_at", time.Now())

	return &models.ResumeQuizResponse{
		SessionID:            session.ID.String(),
		IsResumed:            true,
		TimeRemainingSeconds: timeRemaining,
		SavedAnswers:         savedAnswers,
		Message:              "Quiz session resumed",
	}, nil
}

// Helper functions

func (s *QuizService) calculateScore(formID uuid.UUID, answers []models.SubmitAnswerItem) (float64, bool, error) {
	var totalScore float64 = 0
	var maxScore float64 = 0

	// Get all quiz fields
	var fields []models.FormField
	if err := s.db.Where("form_id = ? AND content_type = ?", formID, "input_field").Find(&fields).Error; err != nil {
		return 0, false, err
	}

	// Calculate score
	for _, field := range fields {
		maxScore += float64(field.Points)

		// Find user's answer
		for _, answer := range answers {
			fieldID, _ := uuid.Parse(answer.FieldID)
			if fieldID == field.ID {
				isCorrect, pointsEarned := s.checkAnswerCorrectness(field.ID, answer.AnswerValue)
				if isCorrect {
					totalScore += pointsEarned
				}
				break
			}
		}
	}

	// Calculate percentage
	scorePercentage := float64(0)
	if maxScore > 0 {
		scorePercentage = (totalScore / maxScore) * 100
	}

	// Check if passed
	var form models.Form
	s.db.Where("id = ?", formID).First(&form)

	isPassed := false
	if form.PassingScore != nil {
		isPassed = scorePercentage >= float64(*form.PassingScore)
	}

	return scorePercentage, isPassed, nil
}

func (s *QuizService) checkAnswerCorrectness(fieldID uuid.UUID, userAnswer datatypes.JSON) (bool, float64) {
	var field models.FormField
	if err := s.db.Where("id = ?", fieldID).First(&field).Error; err != nil {
		return false, 0
	}

	if field.AnswerKey == nil {
		return false, 0
	}

	// Parse answer key
	var answerKey map[string]interface{}
	if err := json.Unmarshal(field.AnswerKey, &answerKey); err != nil {
		return false, 0
	}

	// Parse user answer
	var userAns map[string]interface{}
	if err := json.Unmarshal(userAnswer, &userAns); err != nil {
		return false, 0
	}

	answerType, ok := answerKey["type"].(string)
	if !ok {
		return false, 0
	}

	var isCorrect bool

	switch answerType {
	case "multiple_choice", "checkbox":
		// Check if user's selected options match correct options
		correctOptions, ok := answerKey["correct_options"].([]interface{})
		if !ok {
			return false, 0
		}

		userValue, ok := userAns["value"]
		if !ok {
			return false, 0
		}

		// Convert to comparable format
		correctSet := make(map[string]bool)
		for _, opt := range correctOptions {
			if optStr, ok := opt.(string); ok {
				correctSet[optStr] = true
			}
		}

		// Handle both single value (multiple_choice) and array (checkbox)
		var userOptions []string
		switch v := userValue.(type) {
		case string:
			userOptions = []string{v}
		case []interface{}:
			for _, opt := range v {
				if optStr, ok := opt.(string); ok {
					userOptions = append(userOptions, optStr)
				}
			}
		}

		// Check if user options match correct options exactly
		if len(userOptions) != len(correctSet) {
			isCorrect = false
		} else {
			isCorrect = true
			for _, opt := range userOptions {
				if !correctSet[opt] {
					isCorrect = false
					break
				}
			}
		}

	case "text":
		// Text answer with case sensitivity and multiple acceptable answers
		caseSensitive, _ := answerKey["case_sensitive"].(bool)
		trimWhitespace, _ := answerKey["trim_whitespace"].(bool)
		if trimWhitespace {
			trimWhitespace = true // Default to true
		}

		acceptableAnswers, ok := answerKey["acceptable_answers"].([]interface{})
		if !ok || len(acceptableAnswers) == 0 {
			return false, 0
		}

		userValue, ok := userAns["value"].(string)
		if !ok {
			return false, 0
		}

		if trimWhitespace {
			userValue = strings.TrimSpace(userValue)
		}

		isCorrect = false
		for _, acceptable := range acceptableAnswers {
			acceptableStr, ok := acceptable.(string)
			if !ok {
				continue
			}

			if trimWhitespace {
				acceptableStr = strings.TrimSpace(acceptableStr)
			}

			if caseSensitive {
				if userValue == acceptableStr {
					isCorrect = true
					break
				}
			} else {
				if strings.EqualFold(userValue, acceptableStr) {
					isCorrect = true
					break
				}
			}
		}

	case "linear_scale", "rating":
		// Numeric comparison
		correctValue, ok := answerKey["correct_value"].(float64)
		if !ok {
			// Try int conversion
			if correctInt, ok := answerKey["correct_value"].(int); ok {
				correctValue = float64(correctInt)
			} else {
				return false, 0
			}
		}

		userValue, ok := userAns["value"].(float64)
		if !ok {
			// Try int conversion
			if userInt, ok := userAns["value"].(int); ok {
				userValue = float64(userInt)
			} else {
				return false, 0
			}
		}

		isCorrect = correctValue == userValue

	default:
		return false, 0
	}

	if isCorrect {
		return true, float64(field.Points)
	}

	return false, 0
}
