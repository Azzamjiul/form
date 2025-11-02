package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"form-api/models"
	"form-api/services"
)

type ExportHandler struct {
	exportService *services.ExportService
}

func NewExportHandler(exportService *services.ExportService) *ExportHandler {
	return &ExportHandler{
		exportService: exportService,
	}
}

// ExportFormResponses godoc
// @Summary Export form responses in various formats
// @Description Export form responses as CSV, Excel, or JSON with customizable columns and data inclusion
// @Tags export
// @Accept json
// @Produce application/octet-stream
// @Param form_id path string true "Form ID"
// @Param format query string true "Export format" Enums(csv,excel,json)
// @Param columns query []string false "Specific columns to include"
// @Param from_date query string false "Start date filter (YYYY-MM-DD)"
// @Param to_date query string false "End date filter (YYYY-MM-DD)"
// @Param include_answers query bool false "Include detailed answers" default(true)
// @Param include_analytics query bool false "Include analytics summary" default(false)
// @Param is_passed query bool false "Filter by pass/fail status"
// @Security ApiKeyAuth
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /forms/{form_id}/export [get]
func (h *ExportHandler) ExportFormResponses(c *gin.Context) {
	formIDStr := c.Param("form_id")
	formID, err := uuid.Parse(formIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("VALIDATION_ERROR", "Invalid form ID", map[string]interface{}{"error": err.Error()}))
		return
	}

	var req models.ExportRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("VALIDATION_ERROR", "Invalid request parameters", map[string]interface{}{"error": err.Error()}))
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.NewErrorResponse("AUTH_ERROR", "User not authenticated", nil))
		return
	}

	exportResponse, err := h.exportService.ExportFormResponses(formID, &req, userID.(uuid.UUID))
	if err != nil {
		if err.Error() == "form not found or access denied" {
			c.JSON(http.StatusNotFound, models.NewErrorResponse("NOT_FOUND", "Form not found or access denied", map[string]interface{}{"error": err.Error()}))
			return
		}
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse("INTERNAL_ERROR", "Failed to export responses", map[string]interface{}{"error": err.Error()}))
		return
	}

	// For immediate export (simplified approach)
	if exportResponse.Status == "completed" {
		// In a real implementation, would stream file from storage
		c.JSON(http.StatusOK, models.NewSuccessResponse(exportResponse))
		return
	}

	// Return job info for async export
	c.JSON(http.StatusOK, models.NewSuccessResponse(exportResponse))
}

// GetExportStatus godoc
// @Summary Get export job status
// @Description Check the status of an export job and get download URL when ready
// @Tags export
// @Accept json
// @Produce json
// @Param job_id path string true "Export job ID"
// @Security ApiKeyAuth
// @Success 200 {object} models.APIResponse{data=models.ExportResponse}
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /exports/{job_id}/status [get]
func (h *ExportHandler) GetExportStatus(c *gin.Context) {
	jobID := c.Param("job_id")

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.NewErrorResponse("AUTH_ERROR", "User not authenticated", nil))
		return
	}

	exportResponse, err := h.exportService.GetExportStatus(jobID, userID.(uuid.UUID))
	if err != nil {
		if err.Error() == "export job not found" {
			c.JSON(http.StatusNotFound, models.NewErrorResponse("NOT_FOUND", "Export job not found", map[string]interface{}{"error": err.Error()}))
			return
		}
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse("INTERNAL_ERROR", "Failed to get export status", map[string]interface{}{"error": err.Error()}))
		return
	}

	c.JSON(http.StatusOK, models.NewSuccessResponse(exportResponse))
}

// DownloadExport godoc
// @Summary Download exported file
// @Description Download the exported file when the job is completed
// @Tags export
// @Accept json
// @Produce application/octet-stream
// @Param job_id path string true "Export job ID"
// @Security ApiKeyAuth
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /exports/{job_id}/download [get]
func (h *ExportHandler) DownloadExport(c *gin.Context) {
	jobID := c.Param("job_id")

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.NewErrorResponse("AUTH_ERROR", "User not authenticated", nil))
		return
	}

	data, contentType, err := h.exportService.GetExportDownload(jobID, userID.(uuid.UUID))
	if err != nil {
		if err.Error() == "export job not found" {
			c.JSON(http.StatusNotFound, models.NewErrorResponse("NOT_FOUND", "Export file not found", map[string]interface{}{"error": err.Error()}))
			return
		}
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse("INTERNAL_ERROR", "Failed to download export", map[string]interface{}{"error": err.Error()}))
		return
	}

	if data == nil {
		c.JSON(http.StatusNotFound, models.NewErrorResponse("NOT_FOUND", "Export file not available", nil))
		return
	}

	// Set appropriate headers for file download
	c.Header("Content-Disposition", "attachment; filename=export."+getFileExtension(contentType))
	c.Header("Content-Type", contentType)
	c.Data(http.StatusOK, contentType, data)
}

// getFileExtension determines file extension from content type
func getFileExtension(contentType string) string {
	switch contentType {
	case "text/csv":
		return "csv"
	case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
		return "xlsx"
	case "application/json":
		return "json"
	default:
		return "bin"
	}
}