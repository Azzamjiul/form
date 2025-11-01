package handlers

import (
	"net/http"
	"strconv"

	"memotoko-api/models"
	"memotoko-api/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type FormHandler struct {
	formService *services.FormService
}

func NewFormHandler(formService *services.FormService) *FormHandler {
	return &FormHandler{
		formService: formService,
	}
}

// CreateForm godoc
// @Summary Create a new form
// @Description Create a new form (survey or quiz)
// @Tags forms
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body models.CreateFormRequest true "Create form request"
// @Success 201 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Router /forms [post]
func (h *FormHandler) CreateForm(c *gin.Context) {
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

	var req models.CreateFormRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	creatorID, err := uuid.Parse(userID.(string))
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid user ID",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	form, err := h.formService.CreateForm(&req, creatorID)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	response := models.NewSuccessResponse(form)
	c.JSON(http.StatusCreated, response)
}

// GetFormByID godoc
// @Summary Get form details
// @Description Get form details with all sections and fields
// @Tags forms
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Router /forms/{form_id} [get]
func (h *FormHandler) GetFormByID(c *gin.Context) {
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

	form, err := h.formService.GetFormByID(formID, userUUID)
	if err != nil {
		if err.Error() == "Form not found" {
			response := models.NewErrorResponse(
				models.ErrCodeNotFound,
				err.Error(),
				nil,
			)
			c.JSON(http.StatusNotFound, response)
			return
		}
		if err.Error() == "You don't have permission to access this form" {
			response := models.NewErrorResponse(
				models.ErrCodeAuthorization,
				err.Error(),
				nil,
			)
			c.JSON(http.StatusForbidden, response)
			return
		}
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	response := models.NewSuccessResponse(form)
	c.JSON(http.StatusOK, response)
}

// UpdateForm godoc
// @Summary Update form settings
// @Description Update form settings (partial update)
// @Tags forms
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Param request body models.UpdateFormRequest true "Update form request"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Router /forms/{form_id} [put]
func (h *FormHandler) UpdateForm(c *gin.Context) {
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

	var req models.UpdateFormRequest
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

	form, err := h.formService.UpdateForm(formID, &req, userUUID)
	if err != nil {
		if err.Error() == "Form not found" {
			response := models.NewErrorResponse(
				models.ErrCodeNotFound,
				err.Error(),
				nil,
			)
			c.JSON(http.StatusNotFound, response)
			return
		}
		if err.Error() == "You don't have permission to update this form" {
			response := models.NewErrorResponse(
				models.ErrCodeAuthorization,
				err.Error(),
				nil,
			)
			c.JSON(http.StatusForbidden, response)
			return
		}
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	response := models.NewSuccessResponse(form)
	c.JSON(http.StatusOK, response)
}

// ListUserForms godoc
// @Summary Get all user forms
// @Description Get all forms created by current user (paginated)
// @Tags forms
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param per_page query int false "Items per page" default(10)
// @Param sort_by query string false "Sort by (created or modified)" default(modified)
// @Param order query string false "Sort order (asc or desc)" default(desc)
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Router /forms [get]
func (h *FormHandler) ListUserForms(c *gin.Context) {
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

	// Parse query parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "10"))
	sortBy := c.DefaultQuery("sort_by", "modified")
	order := c.DefaultQuery("order", "desc")

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

	formList, err := h.formService.ListUserForms(userUUID, page, perPage, sortBy, order)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	response := models.NewSuccessResponse(formList)
	c.JSON(http.StatusOK, response)
}

// DeleteForm godoc
// @Summary Delete form
// @Description Delete form (soft delete)
// @Tags forms
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Success 204
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Router /forms/{form_id} [delete]
func (h *FormHandler) DeleteForm(c *gin.Context) {
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

	err = h.formService.DeleteForm(formID, userUUID)
	if err != nil {
		if err.Error() == "Form not found" {
			response := models.NewErrorResponse(
				models.ErrCodeNotFound,
				err.Error(),
				nil,
			)
			c.JSON(http.StatusNotFound, response)
			return
		}
		if err.Error() == "You don't have permission to delete this form" {
			response := models.NewErrorResponse(
				models.ErrCodeAuthorization,
				err.Error(),
				nil,
			)
			c.JSON(http.StatusForbidden, response)
			return
		}
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	c.Status(http.StatusNoContent)
}

// DuplicateForm godoc
// @Summary Duplicate form
// @Description Create a copy of form with all settings and questions
// @Tags forms
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Param request body models.DuplicateFormRequest true "Duplicate form request"
// @Success 201 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Router /forms/{form_id}/duplicate [post]
func (h *FormHandler) DuplicateForm(c *gin.Context) {
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

	var req models.DuplicateFormRequest
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

	form, err := h.formService.DuplicateForm(formID, req.NewTitle, userUUID)
	if err != nil {
		if err.Error() == "Form not found" {
			response := models.NewErrorResponse(
				models.ErrCodeNotFound,
				err.Error(),
				nil,
			)
			c.JSON(http.StatusNotFound, response)
			return
		}
		if err.Error() == "You don't have permission to duplicate this form" {
			response := models.NewErrorResponse(
				models.ErrCodeAuthorization,
				err.Error(),
				nil,
			)
			c.JSON(http.StatusForbidden, response)
			return
		}
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	response := models.NewSuccessResponse(form)
	c.JSON(http.StatusCreated, response)
}

// PublishForm godoc
// @Summary Publish form
// @Description Publish form (make it available for respondents)
// @Tags forms
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Router /forms/{form_id}/publish [patch]
func (h *FormHandler) PublishForm(c *gin.Context) {
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

	publishResp, err := h.formService.PublishForm(formID, userUUID)
	if err != nil {
		if err.Error() == "Form not found" {
			response := models.NewErrorResponse(
				models.ErrCodeNotFound,
				err.Error(),
				nil,
			)
			c.JSON(http.StatusNotFound, response)
			return
		}
		if err.Error() == "You don't have permission to publish this form" {
			response := models.NewErrorResponse(
				models.ErrCodeAuthorization,
				err.Error(),
				nil,
			)
			c.JSON(http.StatusForbidden, response)
			return
		}
		if err.Error() == "Cannot publish form without at least one question" {
			response := models.NewErrorResponse(
				models.ErrCodeValidation,
				err.Error(),
				nil,
			)
			c.JSON(http.StatusBadRequest, response)
			return
		}
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	response := models.NewSuccessResponse(publishResp)
	c.JSON(http.StatusOK, response)
}
