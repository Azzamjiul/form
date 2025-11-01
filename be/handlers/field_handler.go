package handlers

import (
	"net/http"

	"form-api/models"
	"form-api/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type FieldHandler struct {
	fieldService *services.FieldService
}

func NewFieldHandler(fieldService *services.FieldService) *FieldHandler {
	return &FieldHandler{
		fieldService: fieldService,
	}
}

// CreateField godoc
// @Summary Create a new field
// @Description Add question or content to form
// @Tags fields
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Param request body models.CreateFieldRequest true "Create field request"
// @Success 201 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Router /forms/{form_id}/fields [post]
func (h *FieldHandler) CreateField(c *gin.Context) {
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

	var req models.CreateFieldRequest
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

	field, err := h.fieldService.CreateField(formID, &req, userUUID)
	if err != nil {
		statusCode := http.StatusBadRequest
		errorCode := models.ErrCodeValidation

		if err.Error() == "Form not found" {
			statusCode = http.StatusNotFound
			errorCode = models.ErrCodeNotFound
		} else if err.Error() == "You don't have permission to add fields to this form" {
			statusCode = http.StatusForbidden
			errorCode = models.ErrCodeAuthorization
		}

		response := models.NewErrorResponse(errorCode, err.Error(), nil)
		c.JSON(statusCode, response)
		return
	}

	response := models.NewSuccessResponse(field)
	c.JSON(http.StatusCreated, response)
}

// GetField godoc
// @Summary Get field details
// @Description Get single field details
// @Tags fields
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Param field_id path string true "Field ID"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Router /forms/{form_id}/fields/{field_id} [get]
func (h *FieldHandler) GetField(c *gin.Context) {
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

	fieldIDStr := c.Param("field_id")
	fieldID, err := uuid.Parse(fieldIDStr)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid field ID",
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

	field, err := h.fieldService.GetField(formID, fieldID, userUUID)
	if err != nil {
		statusCode := http.StatusBadRequest
		errorCode := models.ErrCodeValidation

		if err.Error() == "Form not found" || err.Error() == "Field not found" {
			statusCode = http.StatusNotFound
			errorCode = models.ErrCodeNotFound
		} else if err.Error() == "You don't have permission to access this form" {
			statusCode = http.StatusForbidden
			errorCode = models.ErrCodeAuthorization
		}

		response := models.NewErrorResponse(errorCode, err.Error(), nil)
		c.JSON(statusCode, response)
		return
	}

	response := models.NewSuccessResponse(field)
	c.JSON(http.StatusOK, response)
}

// UpdateField godoc
// @Summary Update field
// @Description Update field/question details
// @Tags fields
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Param field_id path string true "Field ID"
// @Param request body models.UpdateFieldRequest true "Update field request"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Router /forms/{form_id}/fields/{field_id} [put]
func (h *FieldHandler) UpdateField(c *gin.Context) {
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

	fieldIDStr := c.Param("field_id")
	fieldID, err := uuid.Parse(fieldIDStr)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid field ID",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	var req models.UpdateFieldRequest
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

	field, err := h.fieldService.UpdateField(formID, fieldID, &req, userUUID)
	if err != nil {
		statusCode := http.StatusBadRequest
		errorCode := models.ErrCodeValidation

		if err.Error() == "Form not found" || err.Error() == "Field not found" {
			statusCode = http.StatusNotFound
			errorCode = models.ErrCodeNotFound
		} else if err.Error() == "You don't have permission to update this field" {
			statusCode = http.StatusForbidden
			errorCode = models.ErrCodeAuthorization
		}

		response := models.NewErrorResponse(errorCode, err.Error(), nil)
		c.JSON(statusCode, response)
		return
	}

	response := models.NewSuccessResponse(field)
	c.JSON(http.StatusOK, response)
}

// DeleteField godoc
// @Summary Delete field
// @Description Delete field (associated answers also deleted)
// @Tags fields
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Param field_id path string true "Field ID"
// @Success 204 "No Content"
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Router /forms/{form_id}/fields/{field_id} [delete]
func (h *FieldHandler) DeleteField(c *gin.Context) {
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

	fieldIDStr := c.Param("field_id")
	fieldID, err := uuid.Parse(fieldIDStr)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid field ID",
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

	err = h.fieldService.DeleteField(formID, fieldID, userUUID)
	if err != nil {
		statusCode := http.StatusBadRequest
		errorCode := models.ErrCodeValidation

		if err.Error() == "Form not found" || err.Error() == "Field not found" {
			statusCode = http.StatusNotFound
			errorCode = models.ErrCodeNotFound
		} else if err.Error() == "You don't have permission to delete this field" {
			statusCode = http.StatusForbidden
			errorCode = models.ErrCodeAuthorization
		}

		response := models.NewErrorResponse(errorCode, err.Error(), nil)
		c.JSON(statusCode, response)
		return
	}

	c.Status(http.StatusNoContent)
}

// ListFields godoc
// @Summary List all fields
// @Description Get all fields in form (ordered by order_global)
// @Tags fields
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Router /forms/{form_id}/fields [get]
func (h *FieldHandler) ListFields(c *gin.Context) {
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

	fields, err := h.fieldService.ListFields(formID, userUUID)
	if err != nil {
		statusCode := http.StatusBadRequest
		errorCode := models.ErrCodeValidation

		if err.Error() == "Form not found" {
			statusCode = http.StatusNotFound
			errorCode = models.ErrCodeNotFound
		} else if err.Error() == "You don't have permission to access this form" {
			statusCode = http.StatusForbidden
			errorCode = models.ErrCodeAuthorization
		}

		response := models.NewErrorResponse(errorCode, err.Error(), nil)
		c.JSON(statusCode, response)
		return
	}

	response := models.NewSuccessResponse(fields)
	c.JSON(http.StatusOK, response)
}

// ReorderFields godoc
// @Summary Reorder fields
// @Description Reorder fields (change order_global and section assignments)
// @Tags fields
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Param request body models.ReorderFieldsRequest true "Reorder fields request"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Router /forms/{form_id}/fields/reorder [patch]
func (h *FieldHandler) ReorderFields(c *gin.Context) {
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

	var req models.ReorderFieldsRequest
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

	result, err := h.fieldService.ReorderFields(formID, &req, userUUID)
	if err != nil {
		statusCode := http.StatusBadRequest
		errorCode := models.ErrCodeValidation

		if err.Error() == "Form not found" {
			statusCode = http.StatusNotFound
			errorCode = models.ErrCodeNotFound
		} else if err.Error() == "You don't have permission to reorder fields in this form" {
			statusCode = http.StatusForbidden
			errorCode = models.ErrCodeAuthorization
		}

		response := models.NewErrorResponse(errorCode, err.Error(), nil)
		c.JSON(statusCode, response)
		return
	}

	response := models.NewSuccessResponse(result)
	c.JSON(http.StatusOK, response)
}
