package handlers

import (
	"net/http"
	"strconv"

	"form-api/models"
	"form-api/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type WhitelistHandler struct {
	whitelistService *services.WhitelistService
}

func NewWhitelistHandler(whitelistService *services.WhitelistService) *WhitelistHandler {
	return &WhitelistHandler{
		whitelistService: whitelistService,
	}
}

// CreateWhitelistEntry godoc
// @Summary Create whitelist entry
// @Description Add single respondent access (usually from CRM)
// @Tags whitelist
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Param request body models.CreateWhitelistRequest true "Create whitelist request"
// @Success 201 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Router /forms/{form_id}/whitelist [post]
func (h *WhitelistHandler) CreateWhitelistEntry(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response := models.NewErrorResponse(
			models.ErrCodeAuthentication,
			"Invalid or missing token",
			nil,
		)
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	formIDStr := c.Param("form_id")
	formID, err := uuid.Parse(formIDStr)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid form ID",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	var req models.CreateWhitelistRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	userUUID, err := uuid.Parse(userID.(string))
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid user ID",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	whitelist, err := h.whitelistService.CreateWhitelistEntry(formID, &req, userUUID)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	response := models.NewSuccessResponse(whitelist)
	c.JSON(http.StatusCreated, response)
}

// BatchCreateWhitelist godoc
// @Summary Batch create whitelist entries
// @Description Bulk add multiple respondents (CRM integration)
// @Tags whitelist
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Param request body models.BatchCreateWhitelistRequest true "Batch create whitelist request"
// @Success 201 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Router /forms/{form_id}/whitelist/batch [post]
func (h *WhitelistHandler) BatchCreateWhitelist(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response := models.NewErrorResponse(
			models.ErrCodeAuthentication,
			"Invalid or missing token",
			nil,
		)
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	formIDStr := c.Param("form_id")
	formID, err := uuid.Parse(formIDStr)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid form ID",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	var req models.BatchCreateWhitelistRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	userUUID, err := uuid.Parse(userID.(string))
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid user ID",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	result, err := h.whitelistService.BatchCreateWhitelist(formID, &req, userUUID)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	response := models.NewSuccessResponse(result)
	c.JSON(http.StatusCreated, response)
}

// GetWhitelistEntry godoc
// @Summary Get whitelist entry
// @Description Get single whitelist entry details
// @Tags whitelist
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Param whitelist_id path string true "Whitelist ID"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Router /forms/{form_id}/whitelist/{whitelist_id} [get]
func (h *WhitelistHandler) GetWhitelistEntry(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response := models.NewErrorResponse(
			models.ErrCodeAuthentication,
			"Invalid or missing token",
			nil,
		)
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	formIDStr := c.Param("form_id")
	formID, err := uuid.Parse(formIDStr)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid form ID",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	whitelistIDStr := c.Param("whitelist_id")
	whitelistID, err := uuid.Parse(whitelistIDStr)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid whitelist ID",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	userUUID, err := uuid.Parse(userID.(string))
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid user ID",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	whitelist, err := h.whitelistService.GetWhitelistEntry(formID, whitelistID, userUUID)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeNotFound,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusNotFound, response)
		return
	}

	response := models.NewSuccessResponse(whitelist)
	c.JSON(http.StatusOK, response)
}

// ListWhitelistEntries godoc
// @Summary List whitelist entries
// @Description Get all whitelist entries for form (paginated)
// @Tags whitelist
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Param page query int false "Page number" default(1)
// @Param per_page query int false "Items per page" default(20)
// @Param sort_by query string false "Sort by: 'created' or 'name'" default(created)
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Router /forms/{form_id}/whitelist [get]
func (h *WhitelistHandler) ListWhitelistEntries(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response := models.NewErrorResponse(
			models.ErrCodeAuthentication,
			"Invalid or missing token",
			nil,
		)
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	formIDStr := c.Param("form_id")
	formID, err := uuid.Parse(formIDStr)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid form ID",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))
	sortBy := c.DefaultQuery("sort_by", "created")

	userUUID, err := uuid.Parse(userID.(string))
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid user ID",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	result, err := h.whitelistService.ListWhitelistEntries(formID, page, perPage, sortBy, userUUID)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	response := models.NewSuccessResponse(result)
	c.JSON(http.StatusOK, response)
}

// UpdateWhitelistEntry godoc
// @Summary Update whitelist entry
// @Description Update whitelist entry (extend expiry, adjust attempts)
// @Tags whitelist
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Param whitelist_id path string true "Whitelist ID"
// @Param request body models.UpdateWhitelistRequest true "Update whitelist request"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Router /forms/{form_id}/whitelist/{whitelist_id} [put]
func (h *WhitelistHandler) UpdateWhitelistEntry(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response := models.NewErrorResponse(
			models.ErrCodeAuthentication,
			"Invalid or missing token",
			nil,
		)
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	formIDStr := c.Param("form_id")
	formID, err := uuid.Parse(formIDStr)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid form ID",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	whitelistIDStr := c.Param("whitelist_id")
	whitelistID, err := uuid.Parse(whitelistIDStr)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid whitelist ID",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	var req models.UpdateWhitelistRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	userUUID, err := uuid.Parse(userID.(string))
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid user ID",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	whitelist, err := h.whitelistService.UpdateWhitelistEntry(formID, whitelistID, &req, userUUID)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	response := models.NewSuccessResponse(whitelist)
	c.JSON(http.StatusOK, response)
}

// RevokeWhitelistEntry godoc
// @Summary Revoke whitelist entry
// @Description Revoke access (prevent further quiz attempts)
// @Tags whitelist
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Param whitelist_id path string true "Whitelist ID"
// @Success 204 "No Content"
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Router /forms/{form_id}/whitelist/{whitelist_id} [delete]
func (h *WhitelistHandler) RevokeWhitelistEntry(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		response := models.NewErrorResponse(
			models.ErrCodeAuthentication,
			"Invalid or missing token",
			nil,
		)
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	formIDStr := c.Param("form_id")
	formID, err := uuid.Parse(formIDStr)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid form ID",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	whitelistIDStr := c.Param("whitelist_id")
	whitelistID, err := uuid.Parse(whitelistIDStr)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid whitelist ID",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	userUUID, err := uuid.Parse(userID.(string))
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid user ID",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	if err := h.whitelistService.RevokeWhitelistEntry(formID, whitelistID, userUUID); err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeNotFound,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusNotFound, response)
		return
	}

	c.Status(http.StatusNoContent)
}

// ValidateAccessToken godoc
// @Summary Validate access token
// @Description Check if token is valid (used by quiz taker) - No authentication required
// @Tags whitelist
// @Produce json
// @Param access_token path string true "Access Token"
// @Success 200 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Router /whitelist/validate/{access_token} [get]
func (h *WhitelistHandler) ValidateAccessToken(c *gin.Context) {
	accessToken := c.Param("access_token")

	result, err := h.whitelistService.ValidateAccessToken(accessToken)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeInternal,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusInternalServerError, response)
		return
	}

	if !result.IsValid {
		response := models.NewSuccessResponse(map[string]bool{"is_valid": false})
		c.JSON(http.StatusNotFound, response)
		return
	}

	response := models.NewSuccessResponse(result)
	c.JSON(http.StatusOK, response)
}
