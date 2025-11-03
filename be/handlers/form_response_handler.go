package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"form-api/models"
	"form-api/services"
)

type FormResponseHandler struct {
	responseService *services.FormResponseService
}

func NewFormResponseHandler(responseService *services.FormResponseService) *FormResponseHandler {
	return &FormResponseHandler{
		responseService: responseService,
	}
}

// GetFormResponses godoc
// @Summary Get all responses for a form
// @Description Retrieve paginated list of all responses for a form with filtering and sorting options
// @Tags form-responses
// @Accept json
// @Produce json
// @Param form_id path string true "Form ID"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param sort_by query string false "Sort by field" Enums(submitted_at,score,time_spent,name) default(submitted_at)
// @Param order query string false "Sort order" Enums(asc,desc) default(desc)
// @Param search query string false "Search by respondent name or email"
// @Param is_passed query bool false "Filter by pass/fail status"
// @Security ApiKeyAuth
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /forms/{form_id}/responses [get]
func (h *FormResponseHandler) GetFormResponses(c *gin.Context) {
	formIDStr := c.Param("form_id")
	formID, err := uuid.Parse(formIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("VALIDATION_ERROR", "Invalid form ID", map[string]interface{}{"error": err.Error()}))
		return
	}

	var req models.ResponseListRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("VALIDATION_ERROR", "Invalid request parameters", map[string]interface{}{"error": err.Error()}))
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.NewErrorResponse("AUTH_ERROR", "User not authenticated", nil))
		return
	}

	response, err := h.responseService.GetFormResponses(formID, &req, userID.(uuid.UUID))
	if err != nil {
		if err.Error() == "form not found or access denied" {
			c.JSON(http.StatusNotFound, models.NewErrorResponse("NOT_FOUND", "Form not found or access denied", map[string]interface{}{"error": err.Error()}))
			return
		}
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse("INTERNAL_ERROR", "Failed to retrieve responses", map[string]interface{}{"error": err.Error()}))
		return
	}

	c.JSON(http.StatusOK, models.NewSuccessResponse(response))
}

// GetResponseDetails godoc
// @Summary Get detailed information for a specific response
// @Description Retrieve complete details including all answers for a specific form response
// @Tags form-responses
// @Accept json
// @Produce json
// @Param form_id path string true "Form ID"
// @Param response_id path string true "Response ID"
// @Security ApiKeyAuth
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /forms/{form_id}/responses/{response_id} [get]
func (h *FormResponseHandler) GetResponseDetails(c *gin.Context) {
	formIDStr := c.Param("form_id")
	formID, err := uuid.Parse(formIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("VALIDATION_ERROR", "Invalid form ID", map[string]interface{}{"error": err.Error()}))
		return
	}

	responseIDStr := c.Param("response_id")
	responseID, err := uuid.Parse(responseIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("VALIDATION_ERROR", "Invalid response ID", map[string]interface{}{"error": err.Error()}))
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.NewErrorResponse("AUTH_ERROR", "User not authenticated", nil))
		return
	}

	response, err := h.responseService.GetResponseDetails(formID, responseID, userID.(uuid.UUID))
	if err != nil {
		if err.Error() == "response not found or access denied" {
			c.JSON(http.StatusNotFound, models.NewErrorResponse("NOT_FOUND", "Response not found or access denied", map[string]interface{}{"error": err.Error()}))
			return
		}
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse("INTERNAL_ERROR", "Failed to retrieve response details", map[string]interface{}{"error": err.Error()}))
		return
	}

	c.JSON(http.StatusOK, models.NewSuccessResponse(response))
}

// DeleteResponse godoc
// @Summary Delete a specific response
// @Description Permanently delete a form response and all associated answers
// @Tags form-responses
// @Accept json
// @Produce json
// @Param form_id path string true "Form ID"
// @Param response_id path string true "Response ID"
// @Security ApiKeyAuth
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /forms/{form_id}/responses/{response_id} [delete]
func (h *FormResponseHandler) DeleteResponse(c *gin.Context) {
	formIDStr := c.Param("form_id")
	formID, err := uuid.Parse(formIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("VALIDATION_ERROR", "Invalid form ID", map[string]interface{}{"error": err.Error()}))
		return
	}

	responseIDStr := c.Param("response_id")
	responseID, err := uuid.Parse(responseIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("VALIDATION_ERROR", "Invalid response ID", map[string]interface{}{"error": err.Error()}))
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.NewErrorResponse("AUTH_ERROR", "User not authenticated", nil))
		return
	}

	err = h.responseService.DeleteResponse(formID, responseID, userID.(uuid.UUID))
	if err != nil {
		if err.Error() == "response not found or access denied" {
			c.JSON(http.StatusNotFound, models.NewErrorResponse("NOT_FOUND", "Response not found or access denied", map[string]interface{}{"error": err.Error()}))
			return
		}
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse("INTERNAL_ERROR", "Failed to delete response", map[string]interface{}{"error": err.Error()}))
		return
	}

	c.JSON(http.StatusOK, models.NewSuccessResponse(nil))
}

// GetResponseSummary godoc
// @Summary Get response summary statistics for a form
// @Description Retrieve summary statistics including total responses, average score, and pass rate
// @Tags form-responses
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
// @Router /forms/{form_id}/responses/summary [get]
func (h *FormResponseHandler) GetResponseSummary(c *gin.Context) {
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

	// Get basic list request to extract summary
	req := &models.ResponseListRequest{
		Page:   1,
		Limit:  1, // Only need summary, not actual responses
		SortBy: "submitted_at",
		Order:  "desc",
	}

	response, err := h.responseService.GetFormResponses(formID, req, userID.(uuid.UUID))
	if err != nil {
		if err.Error() == "form not found or access denied" {
			c.JSON(http.StatusNotFound, models.NewErrorResponse("NOT_FOUND", "Form not found or access denied", map[string]interface{}{"error": err.Error()}))
			return
		}
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse("INTERNAL_ERROR", "Failed to retrieve response summary", map[string]interface{}{"error": err.Error()}))
		return
	}

	c.JSON(http.StatusOK, models.NewSuccessResponse(response.Summary))
}

// FlagResponse godoc
// @Summary Flag or unflag a response
// @Description Mark a response as flagged for review or remove flag
// @Tags form-responses
// @Accept json
// @Produce json
// @Param form_id path string true "Form ID"
// @Param response_id path string true "Response ID"
// @Param request body models.FlagRequest true "Flag request with is_flagged and optional notes"
// @Security ApiKeyAuth
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /forms/{form_id}/responses/{response_id}/flag [put]
func (h *FormResponseHandler) FlagResponse(c *gin.Context) {
	formIDStr := c.Param("form_id")
	formID, err := uuid.Parse(formIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("VALIDATION_ERROR", "Invalid form ID", map[string]interface{}{"error": err.Error()}))
		return
	}

	responseIDStr := c.Param("response_id")
	responseID, err := uuid.Parse(responseIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("VALIDATION_ERROR", "Invalid response ID", map[string]interface{}{"error": err.Error()}))
		return
	}

	var req models.FlagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.NewErrorResponse("VALIDATION_ERROR", "Invalid request body", map[string]interface{}{"error": err.Error()}))
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, models.NewErrorResponse("AUTH_ERROR", "User not authenticated", nil))
		return
	}

	err = h.responseService.FlagResponse(formID, responseID, userID.(uuid.UUID), &req)
	if err != nil {
		if err.Error() == "response not found or access denied" {
			c.JSON(http.StatusNotFound, models.NewErrorResponse("NOT_FOUND", "Response not found or access denied", map[string]interface{}{"error": err.Error()}))
			return
		}
		c.JSON(http.StatusInternalServerError, models.NewErrorResponse("INTERNAL_ERROR", "Failed to flag response", map[string]interface{}{"error": err.Error()}))
		return
	}

	status := "flagged"
	if !req.IsFlagged {
		status = "unflagged"
	}

	c.JSON(http.StatusOK, models.NewSuccessResponse(map[string]interface{}{"status": status}))
}