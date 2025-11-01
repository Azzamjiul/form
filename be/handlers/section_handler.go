package handlers

import (
	"net/http"

	"memotoko-api/models"
	"memotoko-api/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type SectionHandler struct {
	sectionService *services.SectionService
}

func NewSectionHandler(sectionService *services.SectionService) *SectionHandler {
	return &SectionHandler{
		sectionService: sectionService,
	}
}

// CreateSection godoc
// @Summary Create a new section
// @Description Add a new section to a form
// @Tags sections
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Param request body models.CreateSectionRequest true "Create section request"
// @Success 201 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Router /forms/{form_id}/sections [post]
func (h *SectionHandler) CreateSection(c *gin.Context) {
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

	var req models.CreateSectionRequest
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

	section, err := h.sectionService.CreateSection(formID, &req, userUUID)
	if err != nil {
		statusCode := http.StatusBadRequest
		errorCode := models.ErrCodeValidation

		if err.Error() == "Form not found" {
			statusCode = http.StatusNotFound
			errorCode = models.ErrCodeNotFound
		} else if err.Error() == "You don't have permission to add sections to this form" {
			statusCode = http.StatusForbidden
			errorCode = models.ErrCodeAuthorization
		}

		response := models.NewErrorResponse(errorCode, err.Error(), nil)
		c.JSON(statusCode, response)
		return
	}

	response := models.NewSuccessResponse(section)
	c.JSON(http.StatusCreated, response)
}

// GetSection godoc
// @Summary Get section details
// @Description Get section details with all its fields
// @Tags sections
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Param section_id path string true "Section ID"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Router /forms/{form_id}/sections/{section_id} [get]
func (h *SectionHandler) GetSection(c *gin.Context) {
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

	sectionIDStr := c.Param("section_id")
	sectionID, err := uuid.Parse(sectionIDStr)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid section ID",
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

	section, err := h.sectionService.GetSection(formID, sectionID, userUUID)
	if err != nil {
		statusCode := http.StatusBadRequest
		errorCode := models.ErrCodeValidation

		if err.Error() == "Form not found" || err.Error() == "Section not found" {
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

	response := models.NewSuccessResponse(section)
	c.JSON(http.StatusOK, response)
}

// UpdateSection godoc
// @Summary Update section
// @Description Update section details
// @Tags sections
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Param section_id path string true "Section ID"
// @Param request body models.UpdateSectionRequest true "Update section request"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Router /forms/{form_id}/sections/{section_id} [put]
func (h *SectionHandler) UpdateSection(c *gin.Context) {
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

	sectionIDStr := c.Param("section_id")
	sectionID, err := uuid.Parse(sectionIDStr)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid section ID",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	var req models.UpdateSectionRequest
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

	section, err := h.sectionService.UpdateSection(formID, sectionID, &req, userUUID)
	if err != nil {
		statusCode := http.StatusBadRequest
		errorCode := models.ErrCodeValidation

		if err.Error() == "Form not found" || err.Error() == "Section not found" {
			statusCode = http.StatusNotFound
			errorCode = models.ErrCodeNotFound
		} else if err.Error() == "You don't have permission to update this section" {
			statusCode = http.StatusForbidden
			errorCode = models.ErrCodeAuthorization
		}

		response := models.NewErrorResponse(errorCode, err.Error(), nil)
		c.JSON(statusCode, response)
		return
	}

	response := models.NewSuccessResponse(section)
	c.JSON(http.StatusOK, response)
}

// DeleteSection godoc
// @Summary Delete section
// @Description Delete section (fields will have section_id set to NULL)
// @Tags sections
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Param section_id path string true "Section ID"
// @Success 204 "No Content"
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Router /forms/{form_id}/sections/{section_id} [delete]
func (h *SectionHandler) DeleteSection(c *gin.Context) {
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

	sectionIDStr := c.Param("section_id")
	sectionID, err := uuid.Parse(sectionIDStr)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid section ID",
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

	err = h.sectionService.DeleteSection(formID, sectionID, userUUID)
	if err != nil {
		statusCode := http.StatusBadRequest
		errorCode := models.ErrCodeValidation

		if err.Error() == "Form not found" || err.Error() == "Section not found" {
			statusCode = http.StatusNotFound
			errorCode = models.ErrCodeNotFound
		} else if err.Error() == "You don't have permission to delete this section" {
			statusCode = http.StatusForbidden
			errorCode = models.ErrCodeAuthorization
		}

		response := models.NewErrorResponse(errorCode, err.Error(), nil)
		c.JSON(statusCode, response)
		return
	}

	c.Status(http.StatusNoContent)
}

// ListSections godoc
// @Summary List all sections
// @Description Get all sections in a form (ordered by order_global)
// @Tags sections
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 403 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Router /forms/{form_id}/sections [get]
func (h *SectionHandler) ListSections(c *gin.Context) {
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

	sections, err := h.sectionService.ListSections(formID, userUUID)
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

	response := models.NewSuccessResponse(sections)
	c.JSON(http.StatusOK, response)
}
