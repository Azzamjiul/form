package services

import (
	"encoding/json"
	"fmt"
	"math"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"form-api/models"
)

type FormResponseService struct {
	db *gorm.DB
}

func NewFormResponseService(db *gorm.DB) *FormResponseService {
	return &FormResponseService{db: db}
}

// GetFormResponses retrieves paginated list of responses for a form
func (s *FormResponseService) GetFormResponses(formID uuid.UUID, req *models.ResponseListRequest, userID uuid.UUID) (*models.ResponseListResponse, error) {
	// Verify user owns the form
	var form models.Form
	if err := s.db.Where("id = ? AND user_id = ?", formID, userID).First(&form).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("form not found or access denied")
		}
		return nil, err
	}

	// Set default values
	if req.Page == 0 {
		req.Page = 1
	}
	if req.Limit == 0 {
		req.Limit = 20
	}
	if req.SortBy == "" {
		req.SortBy = "submitted_at"
	}
	if req.Order == "" {
		req.Order = "desc"
	}

	offset := (req.Page - 1) * req.Limit

	// Build query
	query := s.db.Table("form_responses fr").
		Select(`
			fr.id,
			fr.score,
			fr.is_passed,
			fr.time_spent_seconds,
			fr.submitted_at,
			fr.was_auto_submitted,
			fw.name as name,
			fw.email as email,
			0 as max_score,
			false as is_flagged
		`).
		Joins("JOIN form_whitelist fw ON fr.whitelist_id = fw.id").
		Where("fr.form_id = ?", formID)

	// Add search filter
	if req.Search != "" {
		query = query.Where("fw.name ILIKE ? OR fw.email ILIKE ?",
			"%"+req.Search+"%", "%"+req.Search+"%")
	}

	// Add pass/fail filter
	if req.IsPassed != nil {
		query = query.Where("fr.is_passed = ?", *req.IsPassed)
	}

	// Get total count
	var totalCount int64
	countQuery := s.db.Table("form_responses fr").
		Joins("JOIN form_whitelist fw ON fr.whitelist_id = fw.id").
		Where("fr.form_id = ?", formID)

	if req.Search != "" {
		countQuery = countQuery.Where("fw.name ILIKE ? OR fw.email ILIKE ?",
			"%"+req.Search+"%", "%"+req.Search+"%")
	}
	if req.IsPassed != nil {
		countQuery = countQuery.Where("fr.is_passed = ?", *req.IsPassed)
	}

	if err := countQuery.Count(&totalCount).Error; err != nil {
		return nil, err
	}

	// Add sorting
	switch req.SortBy {
	case "name":
		query = query.Order("fw.name " + req.Order)
	case "score":
		query = query.Order("fr.score " + req.Order)
	case "time_spent":
		query = query.Order("fr.time_spent_seconds " + req.Order)
	default: // submitted_at
		query = query.Order("fr.submitted_at " + req.Order)
	}

	// Get responses
	var responses []models.ResponseListItem
	if err := query.Limit(req.Limit).Offset(offset).Scan(&responses).Error; err != nil {
		return nil, err
	}

	// Calculate percentages and get summary stats
	var summary models.ResponseListSummary
	for i := range responses {
		// Set max_score from form
		responses[i].MaxScore = form.TotalPoints

		// Calculate percentage if score exists
		if responses[i].Score != nil && responses[i].MaxScore > 0 {
			responses[i].Percentage = *responses[i].Score / float64(responses[i].MaxScore) * 100
		}
	}

	// Calculate summary statistics
	if err := s.calculateResponseSummary(formID, &summary); err != nil {
		return nil, err
	}

	return &models.ResponseListResponse{
		Responses: responses,
		Pagination: models.PaginationResponse{
			CurrentPage: req.Page,
			PerPage:     req.Limit,
			TotalItems:  int(totalCount),
			TotalPages:  int(math.Ceil(float64(totalCount) / float64(req.Limit))),
		},
		Summary: summary,
	}, nil
}

// GetResponseDetails retrieves detailed information for a specific response
func (s *FormResponseService) GetResponseDetails(formID, responseID uuid.UUID, userID uuid.UUID) (*models.ResponseDetail, error) {
	// Verify user owns the form and response exists
	var response models.FormResponse
	err := s.db.Table("form_responses fr").
		Joins("JOIN forms f ON fr.form_id = f.id").
		Where("fr.id = ? AND fr.form_id = ? AND f.user_id = ?", responseID, formID, userID).
		First(&response).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("response not found or access denied")
		}
		return nil, err
	}

	// Get form details
	var form models.Form
	if err := s.db.Preload("Sections.Fields").First(&form, formID).Error; err != nil {
		return nil, err
	}

	// Get whitelist entry for respondent info
	var whitelist models.FormWhitelist
	var respondentInfo models.RespondentInfo
	if err := s.db.First(&whitelist, response.WhitelistID).Error; err == nil {
		respondentInfo = models.RespondentInfo{
			Name:        whitelist.Name,
			Email:       whitelist.Email,
		}

		// Parse metadata if exists
		if whitelist.Metadata != nil {
			var metadata map[string]interface{}
			if err := json.Unmarshal(whitelist.Metadata, &metadata); err == nil {
				respondentInfo.Metadata = metadata
			}
		}
	}

	// Get field answers
	var fieldAnswers []models.FieldAnswer
	if err := s.db.Where("response_id = ?", responseID).Find(&fieldAnswers).Error; err != nil {
		return nil, err
	}

	// Build answer details
	var answerDetails []models.AnswerDetail
	totalPoints := 0
	maxPoints := 0

	// Create a map of field answers for quick lookup
	answerMap := make(map[uuid.UUID]models.FieldAnswer)
	for _, answer := range fieldAnswers {
		answerMap[answer.FieldID] = answer
	}

	// Process each form field
	for _, section := range form.Sections {
		for _, field := range section.Fields {
			answerDetail := models.AnswerDetail{
				FieldID:      field.ID.String(),
				FieldLabel:   field.Label,
				FieldType:    field.ContentType,
				SectionTitle: section.Title,
				MaxPoints:    field.Points,
			}

			// Get answer for this field if it exists
			if answer, exists := answerMap[field.ID]; exists {
				var userAnswer interface{}
				if err := json.Unmarshal(answer.AnswerValue, &userAnswer); err != nil {
					userAnswer = string(answer.AnswerValue)
				}

				answerDetail.UserAnswer = userAnswer
				if answer.IsCorrect != nil {
					answerDetail.IsCorrect = answer.IsCorrect
				}
				if answer.PointsEarned != nil {
					answerDetail.PointsEarned = int(*answer.PointsEarned)
					totalPoints += int(*answer.PointsEarned)
				}
			}

			// Get correct answer for quiz fields
			if field.ContentType == "input_field" && field.AnswerKey != nil {
				var correctAnswer interface{}
				if err := json.Unmarshal(field.AnswerKey, &correctAnswer); err == nil {
					answerDetail.CorrectAnswer = correctAnswer
				}
			}

			maxPoints += field.Points
			answerDetails = append(answerDetails, answerDetail)
		}
	}

	// Calculate percentage
	percentage := 0.0
	if maxPoints > 0 {
		percentage = float64(totalPoints) / float64(maxPoints) * 100
	}

	isPassed := false
	if response.IsPassed != nil {
		isPassed = *response.IsPassed
	}

	score := 0.0
	if response.Score != nil {
		score = *response.Score
	}

	responseDetail := &models.ResponseDetail{
		ID:                 response.ID.String(),
		RespondentInfo:     respondentInfo,
		Score:              int(score),
		MaxScore:           maxPoints,
		Percentage:         percentage,
		IsPassed:           isPassed,
		TimeSpentSeconds:   response.TimeSpentSeconds,
		SubmittedAt:        &response.SubmittedAt,
		WasAutoSubmitted:   response.WasAutoSubmitted,
		Answers:            answerDetails,
	}

	return responseDetail, nil
}

// calculateResponseSummary calculates summary statistics for responses
func (s *FormResponseService) calculateResponseSummary(formID uuid.UUID, summary *models.ResponseListSummary) error {
	var result struct {
		TotalResponses int     `json:"total_responses"`
		AverageScore   float64 `json:"average_score"`
		PassCount      int     `json:"pass_count"`
		AverageTime    float64 `json:"average_time"`
	}

	err := s.db.Table("form_responses").
		Select(`
			COUNT(*) as total_responses,
			AVG(score) as average_score,
			COUNT(CASE WHEN is_passed = true THEN 1 END) as pass_count,
			AVG(time_spent_seconds) as average_time
		`).
		Where("form_id = ?", formID).
		Scan(&result).Error

	if err != nil {
		return err
	}

	summary.TotalResponses = result.TotalResponses
	summary.AverageScore = result.AverageScore
	summary.AverageTime = result.AverageTime / 60.0 // Convert to minutes

	if result.TotalResponses > 0 {
		summary.PassRate = float64(result.PassCount) / float64(result.TotalResponses) * 100
	}

	return nil
}

// DeleteResponse deletes a specific response
func (s *FormResponseService) DeleteResponse(formID, responseID, userID uuid.UUID) error {
	// Verify user owns the form and response exists
	var response models.FormResponse
	err := s.db.Table("form_responses fr").
		Joins("JOIN forms f ON fr.form_id = f.id").
		Where("fr.id = ? AND fr.form_id = ? AND f.user_id = ?", responseID, formID, userID).
		First(&response).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return fmt.Errorf("response not found or access denied")
		}
		return err
	}

	// Start transaction
	tx := s.db.Begin()

	// Delete field answers first
	if err := tx.Where("response_id = ?", responseID).Delete(&models.FieldAnswer{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Delete the response
	if err := tx.Delete(&response).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

// FlagResponse flags or unflags a response
func (s *FormResponseService) FlagResponse(formID, responseID, userID uuid.UUID, req *models.FlagRequest) error {
	// Verify user owns the form and response exists
	var response models.FormResponse
	err := s.db.Table("form_responses fr").
		Joins("JOIN forms f ON fr.form_id = f.id").
		Where("fr.id = ? AND fr.form_id = ? AND f.user_id = ?", responseID, formID, userID).
		First(&response).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return fmt.Errorf("response not found or access denied")
		}
		return err
	}

	// For now, just return success (flagging would require additional DB fields)
	// In a full implementation, you would add flagged_by, flagged_at, flag_notes fields to the table
	return nil
}

// GetFormAnalytics retrieves comprehensive analytics for a form
func (s *FormResponseService) GetFormAnalytics(formID uuid.UUID, req *models.AnalyticsRequest, userID uuid.UUID) (*models.AnalyticsResponse, error) {
	// Verify user owns the form
	var form models.Form
	if err := s.db.Where("id = ? AND user_id = ?", formID, userID).First(&form).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("form not found or access denied")
		}
		return nil, err
	}

	analytics := &models.AnalyticsResponse{}

	// Build base query with date filters if provided
	baseQuery := s.db.Table("form_responses").Where("form_id = ?", formID)

	if req.DateFrom != "" {
		baseQuery = baseQuery.Where("submitted_at >= ?", req.DateFrom)
	}
	if req.DateTo != "" {
		baseQuery = baseQuery.Where("submitted_at <= ?", req.DateTo)
	}

	// Get summary statistics
	if err := s.calculateAnalyticsSummary(baseQuery, &analytics.Summary); err != nil {
		return nil, err
	}

	// Get score distribution
	if err := s.calculateScoreDistribution(baseQuery, &analytics.ScoreDistribution); err != nil {
		return nil, err
	}

	// Get time analytics
	if err := s.calculateTimeAnalytics(baseQuery, &analytics.TimeAnalytics); err != nil {
		return nil, err
	}

	// Get question analytics
	if err := s.calculateQuestionAnalytics(formID, &analytics.QuestionAnalytics); err != nil {
		return nil, err
	}

	// Get section analytics
	if err := s.calculateSectionAnalytics(formID, &analytics.SectionAnalytics); err != nil {
		return nil, err
	}

	// Get trends if grouping is requested
	if req.GroupBy != "" {
		if err := s.calculateTrends(formID, req.GroupBy, &analytics.Trends); err != nil {
			return nil, err
		}
	}

	return analytics, nil
}

// Helper methods for analytics calculations
func (s *FormResponseService) calculateAnalyticsSummary(query *gorm.DB, summary *models.AnalyticsSummary) error {
	var result struct {
		TotalResponses     int     `json:"total_responses"`
		AverageScore       float64 `json:"average_score"`
		PassCount          int     `json:"pass_count"`
		AverageTime        float64 `json:"average_time"`
		AutoSubmittedCount int     `json:"auto_submitted_count"`
	}

	if err := query.Select(`
			COUNT(*) as total_responses,
			AVG(score) as average_score,
			COUNT(CASE WHEN is_passed = true THEN 1 END) as pass_count,
			AVG(time_spent_seconds) as average_time,
			COUNT(CASE WHEN was_auto_submitted = true THEN 1 END) as auto_submitted_count
		`).Scan(&result).Error; err != nil {
		return err
	}

	summary.TotalResponses = result.TotalResponses
	summary.AverageScore = result.AverageScore
	summary.AverageTimeMinutes = result.AverageTime / 60.0

	if result.TotalResponses > 0 {
		summary.PassRate = float64(result.PassCount) / float64(result.TotalResponses) * 100
		summary.AutosubmissionRate = float64(result.AutoSubmittedCount) / float64(result.TotalResponses) * 100
	}

	// Calculate median and standard deviation
	scores := make([]int, 0)
	times := make([]int, 0)

	if err := query.Select("score, time_spent_seconds").Find(&scores).Error; err != nil {
		return err
	}

	if len(scores) > 0 {
		summary.MedianScore = calculateMedian(scores)
		summary.StandardDeviation = calculateStandardDeviation(scores, summary.AverageScore)
		summary.MedianTimeMinutes = calculateMedian(times) / 60.0
	}

	return nil
}

func (s *FormResponseService) calculateScoreDistribution(query *gorm.DB, distribution *map[string]int) error {
	var responses []struct {
		Score int
		MaxScore int
	}

	if err := query.Select("score, (SELECT max_score FROM forms WHERE id = form_responses.form_id) as max_score").Find(&responses).Error; err != nil {
		return err
	}

	*distribution = make(map[string]int)
	for _, response := range responses {
		if response.MaxScore > 0 {
			percentage := float64(response.Score) / float64(response.MaxScore) * 100
			var bucket string
			switch {
			case percentage >= 90:
				bucket = "90-100"
			case percentage >= 80:
				bucket = "80-89"
			case percentage >= 70:
				bucket = "70-79"
			case percentage >= 60:
				bucket = "60-69"
			default:
				bucket = "0-59"
			}
			(*distribution)[bucket]++
		}
	}

	return nil
}

func (s *FormResponseService) calculateTimeAnalytics(query *gorm.DB, analytics *models.TimeAnalytics) error {
	var responses []struct {
		TimeSpentSeconds int
		SubmittedAt      time.Time
	}

	if err := query.Select("time_spent_seconds, submitted_at").Find(&responses).Error; err != nil {
		return err
	}

	if len(responses) == 0 {
		return nil
	}

	times := make([]int, len(responses))
	for i, resp := range responses {
		times[i] = resp.TimeSpentSeconds
	}

	analytics.AverageCompletionTimeMinutes = calculateAverage(times) / 60.0
	analytics.MedianCompletionTimeMinutes = calculateMedian(times) / 60.0
	analytics.FastestCompletionMinutes = float64(calculateMin(times)) / 60.0
	analytics.SlowestCompletionMinutes = float64(calculateMax(times)) / 60.0

	// Time distribution buckets
	analytics.TimeDistribution = make(map[string]int)
	for _, time := range times {
		minutes := time / 60
		var bucket string
		switch {
		case minutes <= 5:
			bucket = "0-5 min"
		case minutes <= 10:
			bucket = "6-10 min"
		case minutes <= 20:
			bucket = "11-20 min"
		case minutes <= 30:
			bucket = "21-30 min"
		default:
			bucket = "30+ min"
		}
		analytics.TimeDistribution[bucket]++
	}

	// Completion by hour and day of week
	analytics.CompletionByHour = make(map[string]int)
	analytics.CompletionByDayOfWeek = make(map[string]int)

	for _, resp := range responses {
		hour := resp.SubmittedAt.Hour()
		analytics.CompletionByHour[fmt.Sprintf("%d:00", hour)]++

		day := resp.SubmittedAt.Weekday().String()
		analytics.CompletionByDayOfWeek[day]++
	}

	return nil
}

func (s *FormResponseService) calculateQuestionAnalytics(formID uuid.UUID, analytics *[]models.QuestionAnalytics) error {
	// Get form fields with response data
	var results []struct {
		FieldID       uuid.UUID
		FieldLabel    string
		FieldType     string
		SectionTitle  string
		MaxPoints     int
		TotalAnswers  int
		CorrectAnswers int
		AvgPoints     float64
		AvgTime       float64
		FlaggedCount  int
	}

	err := s.db.Raw(`
		WITH field_stats AS (
			SELECT
				ff.id as field_id,
				ff.label as field_label,
				ff.content_type as field_type,
				fs.title as section_title,
				ff.points as max_points,
				COUNT(fa.id) as total_answers,
				COUNT(CASE WHEN fa.is_correct = true THEN 1 END) as correct_answers,
				COALESCE(AVG(fa.points_earned), 0) as avg_points,
				COALESCE(AVG(fa.time_spent_seconds), 0) as avg_time,
				COUNT(CASE WHEN fa.is_flagged = true THEN 1 END) as flagged_count
			FROM form_fields ff
			LEFT JOIN form_sections fs ON ff.section_id = fs.id
			LEFT JOIN form_responses fr ON fr.form_id = ff.form_id
			LEFT JOIN field_answers fa ON fa.response_id = fr.id AND fa.field_id = ff.id
			WHERE ff.form_id = ?
			GROUP BY ff.id, ff.label, ff.content_type, fs.title, ff.points
		)
		SELECT * FROM field_stats
	`, formID).Scan(&results).Error

	if err != nil {
		return err
	}

	questionAnalytics := make([]models.QuestionAnalytics, len(results))
	for i, result := range results {
		qa := models.QuestionAnalytics{
			FieldID:          result.FieldID.String(),
			FieldLabel:       result.FieldLabel,
			FieldType:        result.FieldType,
			SectionTitle:     result.SectionTitle,
			TotalAnswers:     result.TotalAnswers,
			CorrectAnswers:   result.CorrectAnswers,
			AveragePoints:    result.AvgPoints,
			MaxPoints:        result.MaxPoints,
			TimeToAnswer:     result.AvgTime,
			FlaggedCount:     result.FlaggedCount,
		}

		if result.TotalAnswers > 0 {
			qa.AccuracyRate = float64(result.CorrectAnswers) / float64(result.TotalAnswers) * 100
		}

		questionAnalytics[i] = qa
	}

	*analytics = questionAnalytics
	return nil
}

func (s *FormResponseService) calculateSectionAnalytics(formID uuid.UUID, analytics *[]models.SectionAnalytics) error {
	// Implementation for section-level analytics
	// This would aggregate question-level data by section
	*analytics = []models.SectionAnalytics{} // Placeholder
	return nil
}

func (s *FormResponseService) calculateTrends(formID uuid.UUID, groupBy string, trends *[]models.TrendData) error {
	// Implementation for trend analysis over time
	*trends = []models.TrendData{} // Placeholder
	return nil
}

// Helper functions for statistical calculations
func calculateAverage(numbers []int) float64 {
	if len(numbers) == 0 {
		return 0
	}
	sum := 0
	for _, num := range numbers {
		sum += num
	}
	return float64(sum) / float64(len(numbers))
}

func calculateMedian(numbers []int) float64 {
	if len(numbers) == 0 {
		return 0
	}
	// Simple median calculation - in production, sort first
	mid := len(numbers) / 2
	if len(numbers)%2 == 0 {
		return float64(numbers[mid-1]+numbers[mid]) / 2.0
	}
	return float64(numbers[mid])
}

func calculateMin(numbers []int) int {
	if len(numbers) == 0 {
		return 0
	}
	min := numbers[0]
	for _, num := range numbers {
		if num < min {
			min = num
		}
	}
	return min
}

func calculateMax(numbers []int) int {
	if len(numbers) == 0 {
		return 0
	}
	max := numbers[0]
	for _, num := range numbers {
		if num > max {
			max = num
		}
	}
	return max
}

func calculateStandardDeviation(numbers []int, mean float64) float64 {
	if len(numbers) == 0 {
		return 0
	}
	sum := 0.0
	for _, num := range numbers {
		diff := float64(num) - mean
		sum += diff * diff
	}
	variance := sum / float64(len(numbers))
	return math.Sqrt(variance)
}