package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"form-api/models"
	"form-api/services"
)

type AnalyticsHandler struct {
	responseService *services.FormResponseService
}

func NewAnalyticsHandler(responseService *services.FormResponseService) *AnalyticsHandler {
	return &AnalyticsHandler{
		responseService: responseService,
	}
}

// GetFormAnalytics godoc
// @Summary Get comprehensive analytics for a form
// @Description Retrieve detailed analytics including summary statistics, score distribution, time analytics, and question performance
// @Tags analytics
// @Accept json
// @Produce json
// @Param form_id path string true "Form ID"
// @Param date_from query string false "Start date for analytics period (YYYY-MM-DD)"
// @Param date_to query string false "End date for analytics period (YYYY-MM-DD)"
// @Param group_by query string false "Group responses by time period" Enums(day,week,month)
// @Security ApiKeyAuth
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /forms/{form_id}/analytics [get]
func (h *AnalyticsHandler) GetFormAnalytics(c *gin.Context) {
	formIDStr := c.Param("form_id")
	formID, err := uuid.Parse(formIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("VALIDATION_ERROR", "Invalid form ID", map[string]interface{}{"error": err.Error()}))
		return
	}

	var req models.AnalyticsRequest
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

	analytics, err := h.responseService.GetFormAnalytics(formID, &req, userID.(uuid.UUID))
	if err != nil {
		if err.Error() == "form not found or access denied" {
			c.JSON(http.StatusNotFound, models.NewErrorResponse("NOT_FOUND", "Form not found or access denied", map[string]interface{}{"error": err.Error()}))
			return
		}
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse("INTERNAL_ERROR", "Failed to retrieve analytics", map[string]interface{}{"error": err.Error()}))
		return
	}

	c.JSON(http.StatusOK, models.NewSuccessResponse(analytics))
}

// GetQuestionAnalytics godoc
// @Summary Get question-level analytics for a form
// @Description Retrieve detailed analytics for each question including answer distribution and performance metrics
// @Tags analytics
// @Accept json
// @Produce json
// @Param form_id path string true "Form ID"
// @Security ApiKeyAuth
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /forms/{form_id}/analytics/questions [get]
func (h *AnalyticsHandler) GetQuestionAnalytics(c *gin.Context) {
	formIDStr := c.Param("form_id")
	formID, err := uuid.Parse(formIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("VALIDATION_ERROR", "Invalid form ID", map[string]interface{}{"error": err.Error()}))
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.NewErrorResponse("AUTH_ERROR", "User not authenticated", nil))
		return
	}

	req := &models.AnalyticsRequest{}
	analytics, err := h.responseService.GetFormAnalytics(formID, req, userID.(uuid.UUID))
	if err != nil {
		if err.Error() == "form not found or access denied" {
			c.JSON(http.StatusNotFound, models.NewErrorResponse("NOT_FOUND", "Form not found or access denied", map[string]interface{}{"error": err.Error()}))
			return
		}
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse("INTERNAL_ERROR", "Failed to retrieve question analytics", map[string]interface{}{"error": err.Error()}))
		return
	}

	c.JSON(http.StatusOK, models.NewSuccessResponse(analytics.QuestionAnalytics))
}

// GetSectionAnalytics godoc
// @Summary Get section-level analytics for a form
// @Description Retrieve analytics for each section including average scores and completion rates
// @Tags analytics
// @Accept json
// @Produce json
// @Param form_id path string true "Form ID"
// @Security ApiKeyAuth
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /forms/{form_id}/analytics/sections [get]
func (h *AnalyticsHandler) GetSectionAnalytics(c *gin.Context) {
	formIDStr := c.Param("form_id")
	formID, err := uuid.Parse(formIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("VALIDATION_ERROR", "Invalid form ID", map[string]interface{}{"error": err.Error()}))
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.NewErrorResponse("AUTH_ERROR", "User not authenticated", nil))
		return
	}

	req := &models.AnalyticsRequest{}
	analytics, err := h.responseService.GetFormAnalytics(formID, req, userID.(uuid.UUID))
	if err != nil {
		if err.Error() == "form not found or access denied" {
			c.JSON(http.StatusNotFound, models.NewErrorResponse("NOT_FOUND", "Form not found or access denied", map[string]interface{}{"error": err.Error()}))
			return
		}
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse("INTERNAL_ERROR", "Failed to retrieve section analytics", map[string]interface{}{"error": err.Error()}))
		return
	}

	c.JSON(http.StatusOK, models.NewSuccessResponse(analytics.SectionAnalytics))
}

// GetResponseTrends godoc
// @Summary Get response trends over time for a form
// @Description Retrieve trend data showing responses over time with grouping options
// @Tags analytics
// @Accept json
// @Produce json
// @Param form_id path string true "Form ID"
// @Param group_by query string true "Group responses by time period" Enums(day,week,month)
// @Param date_from query string false "Start date for trend analysis (YYYY-MM-DD)"
// @Param date_to query string false "End date for trend analysis (YYYY-MM-DD)"
// @Security ApiKeyAuth
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /forms/{form_id}/analytics/trends [get]
func (h *AnalyticsHandler) GetResponseTrends(c *gin.Context) {
	formIDStr := c.Param("form_id")
	formID, err := uuid.Parse(formIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("VALIDATION_ERROR", "Invalid form ID", map[string]interface{}{"error": err.Error()}))
		return
	}

	var req models.AnalyticsRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("VALIDATION_ERROR", "Invalid request parameters", map[string]interface{}{"error": err.Error()}))
		return
	}

	if req.GroupBy == "" {
		req.GroupBy = "day" // Default grouping
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.NewErrorResponse("AUTH_ERROR", "User not authenticated", nil))
		return
	}

	analytics, err := h.responseService.GetFormAnalytics(formID, &req, userID.(uuid.UUID))
	if err != nil {
		if err.Error() == "form not found or access denied" {
			c.JSON(http.StatusNotFound, models.NewErrorResponse("NOT_FOUND", "Form not found or access denied", map[string]interface{}{"error": err.Error()}))
			return
		}
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse("INTERNAL_ERROR", "Failed to retrieve response trends", map[string]interface{}{"error": err.Error()}))
		return
	}

	c.JSON(http.StatusOK, models.NewSuccessResponse(analytics.Trends))
}