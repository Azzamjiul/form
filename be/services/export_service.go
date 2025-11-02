package services

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"form-api/models"
)

type ExportService struct {
	db             *gorm.DB
	responseService *FormResponseService
}

func NewExportService(db *gorm.DB, responseService *FormResponseService) *ExportService {
	return &ExportService{
		db:             db,
		responseService: responseService,
	}
}

// ExportFormResponses exports form responses in various formats
func (s *ExportService) ExportFormResponses(formID uuid.UUID, req *models.ExportRequest, userID uuid.UUID) (*models.ExportResponse, error) {
	// Verify user owns the form
	var form models.Form
	if err := s.db.Where("id = ? AND user_id = ?", formID, userID).First(&form).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("form not found or access denied")
		}
		return nil, err
	}

	// Get all responses based on export parameters
	responseReq := &models.ResponseListRequest{
		Page:   1,
		Limit:  10000, // Large limit for export
		SortBy: "submitted_at",
		Order:  "desc",
		Search: "",
		IsPassed: req.IsPassed,
	}

	responses, err := s.responseService.GetFormResponses(formID, responseReq, userID)
	if err != nil {
		return nil, err
	}

	jobID := uuid.New().String()
	exportResponse := &models.ExportResponse{
		JobID:       jobID,
		Status:      "processing",
		CreatedAt:   time.Now(),
		RecordCount: len(responses.Responses),
	}

	// Generate export based on format
	var data []byte

	switch req.Format {
	case "csv":
		data, err = s.generateCSVExport(&form, responses, req)
	case "excel":
		// For now, use CSV format for Excel (can be enhanced later)
		data, err = s.generateCSVExport(&form, responses, req)
	case "json":
		data, err = s.generateJSONExport(&form, responses, req)
	default:
		return nil, fmt.Errorf("unsupported export format: %s", req.Format)
	}

	if err != nil {
		exportResponse.Status = "failed"
		return exportResponse, err
	}

	// For simplicity, return data directly (in production, store to file/cloud storage)
	exportResponse.Status = "completed"
	exportResponse.CompletedAt = &[]time.Time{time.Now()}[0]
	exportResponse.FileSize = int64(len(data))

	// Store export data temporarily or return URL (simplified approach)
	exportResponse.DownloadURL = fmt.Sprintf("/api/v1/exports/%s/download", jobID)

	return exportResponse, nil
}

// generateCSVExport creates CSV export data
func (s *ExportService) generateCSVExport(form *models.Form, responses *models.ResponseListResponse, req *models.ExportRequest) ([]byte, error) {
	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)

	// Write header
	headers := []string{}

	// Basic columns
	defaultColumns := []string{
		"Response ID",
		"Respondent Name",
		"Respondent Email",
		"Score",
		"Max Score",
		"Percentage",
		"Passed",
		"Time Spent (minutes)",
		"Submitted At",
		"Auto Submitted",
	}

	if req.Columns == nil || len(req.Columns) == 0 {
		headers = defaultColumns
	} else {
		headers = req.Columns
	}

	if req.IncludeAnswers {
		// Add question columns
		if err := s.addQuestionColumns(form, &headers); err != nil {
			return nil, err
		}
	}

	// Write headers to CSV
	if err := writer.Write(headers); err != nil {
		return nil, err
	}

	// Write response data
	for _, response := range responses.Responses {
		score := "0"
		if response.Score != nil {
			score = fmt.Sprintf("%.2f", *response.Score)
		}

		isPassed := "false"
		if response.IsPassed != nil {
			isPassed = strconv.FormatBool(*response.IsPassed)
		}

		row := []string{
			response.ID,
			response.RespondentName,
			response.RespondentEmail,
			score,
			strconv.Itoa(response.MaxScore),
			fmt.Sprintf("%.2f", response.Percentage),
			isPassed,
			fmt.Sprintf("%.2f", float64(response.TimeSpentSeconds)/60.0),
			response.SubmittedAt.Format("2006-01-02 15:04:05"),
			strconv.FormatBool(response.WasAutoSubmitted),
		}

		if req.IncludeAnswers {
			// Get detailed response for answers
			responseID, _ := uuid.Parse(response.ID)
			detail, err := s.responseService.GetResponseDetails(form.ID, responseID, uuid.New()) // Temporary user ID for export
			if err == nil {
				for _, answer := range detail.Answers {
					answerStr := fmt.Sprintf("%v", answer.UserAnswer)
					row = append(row, answerStr)
				}
			}
		}

		if err := writer.Write(row); err != nil {
			return nil, err
		}
	}

	writer.Flush()
	if err := writer.Error(); err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

// generateJSONExport creates JSON export data
func (s *ExportService) generateJSONExport(form *models.Form, responses *models.ResponseListResponse, req *models.ExportRequest) ([]byte, error) {
	exportData := map[string]interface{}{
		"form": map[string]interface{}{
			"id":          form.ID,
			"title":       form.Title,
			"exported_at": time.Now(),
		},
		"responses": responses.Responses,
	}

	if req.IncludeAnalytics {
		analytics, err := s.responseService.GetFormAnalytics(form.ID, &models.AnalyticsRequest{}, form.CreatorID)
		if err == nil {
			exportData["analytics"] = analytics
		}
	}

	return json.MarshalIndent(exportData, "", "  ")
}

// addQuestionColumns adds question columns to CSV headers
func (s *ExportService) addQuestionColumns(form *models.Form, headers *[]string) error {
	// Get form sections and fields
	if err := s.db.Preload("Sections.Fields").First(form, form.ID).Error; err != nil {
		return err
	}

	for _, section := range form.Sections {
		for _, field := range section.Fields {
			columnName := field.Label
			if section.Title != "" {
				columnName = section.Title + " - " + columnName
			}
			*headers = append(*headers, columnName)
		}
	}

	return nil
}

// GetExportDownload retrieves export file data for download
func (s *ExportService) GetExportDownload(jobID string, userID uuid.UUID) ([]byte, string, error) {
	// In a real implementation, this would retrieve from storage
	// For now, return empty data
	return nil, "", fmt.Errorf("export download not implemented for job ID: %s", jobID)
}

// GetExportStatus checks the status of an export job
func (s *ExportService) GetExportStatus(jobID string, userID uuid.UUID) (*models.ExportResponse, error) {
	// In a real implementation, this would check database/queue
	// For now, return a not found error
	return nil, fmt.Errorf("export job not found: %s", jobID)
}