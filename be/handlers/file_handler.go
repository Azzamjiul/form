package handlers

import (
	"fmt"
	"log"
	"net/http"

	"form-api/models"
	"form-api/services"

	"github.com/gin-gonic/gin"
)

type FileHandler struct {
	fileService *services.FileService
}

func NewFileHandler(fileService *services.FileService) *FileHandler {
	return &FileHandler{
		fileService: fileService,
	}
}

// UploadImage godoc
// @Summary Upload an image
// @Description Upload an image file (JPG, PNG, WebP) for use in form questions and options
// @Tags files
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Image file (max 10MB)"
// @Security BearerAuth
// @Success 201 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /upload [post]
func (h *FileHandler) UploadImage(c *gin.Context) {
	// Log request details for debugging
	log.Printf("Upload request - Content-Type: %s, Content-Length: %s",
		c.GetHeader("Content-Type"), c.GetHeader("Content-Length"))

	// Check authentication
	_, exists := c.Get("user_id")
	if !exists {
		log.Printf("Authentication failed for upload request")
		response := models.NewErrorResponse(
			models.ErrCodeAuthentication,
			"Authentication required",
			nil,
		)
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	log.Printf("Authentication successful, processing file upload")

	// Get uploaded file
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		log.Printf("Failed to get file from request: %v", err)
		log.Printf("Request method: %s", c.Request.Method)
		log.Printf("Request headers: %+v", c.Request.Header)
		log.Printf("Content-Type: %s", c.GetHeader("Content-Type"))

		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			fmt.Sprintf("No file provided or invalid file format: %v", err),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	log.Printf("File received successfully - Filename: %s, Size: %d", header.Filename, header.Size)

	// Upload image using file service
	fileInfo, err := h.fileService.UploadImage(file, header)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	// Create response with serve URL
	responseData := map[string]interface{}{
		"id":           fileInfo.ID,
		"filename":     fileInfo.Filename,
		"size":         fileInfo.Size,
		"content_type": fileInfo.ContentType,
		"width":        fileInfo.Width,
		"height":       fileInfo.Height,
		"url":          h.fileService.GenerateServeURL(fileInfo.ID),
	}

	response := models.NewSuccessResponse(responseData)
	c.JSON(http.StatusCreated, response)
}

// GetImage godoc
// @Summary Get an image
// @Description Serve an image file by ID (proxied through backend to hide MinIO details)
// @Tags files
// @Accept json
// @Produce image/jpeg,image/png,image/webp
// @Param id path string true "File ID"
// @Success 200 {file} binary
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /images/{id} [get]
func (h *FileHandler) GetImage(c *gin.Context) {
	fileID := c.Param("id")
	if fileID == "" {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"File ID is required",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	// Get image data from MinIO using fileID directly (includes extension)
	data, contentType, err := h.fileService.GetImage(fileID)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeNotFound,
			"Image not found",
			nil,
		)
		c.JSON(http.StatusNotFound, response)
		return
	}

	// Set appropriate headers
	c.Header("Content-Type", contentType)
	c.Header("Cache-Control", "public, max-age=3600") // Cache for 1 hour
	c.Data(http.StatusOK, contentType, data)
}

// DeleteImage godoc
// @Summary Delete an image
// @Description Delete an image file by ID (for form creators only)
// @Tags files
// @Accept json
// @Produce json
// @Param id path string true "File ID"
// @Security BearerAuth
// @Success 200 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Failure 500 {object} models.APIResponse
// @Router /images/{id} [delete]
func (h *FileHandler) DeleteImage(c *gin.Context) {
	// Check authentication
	_, exists := c.Get("user_id")
	if !exists {
		response := models.NewErrorResponse(
			models.ErrCodeAuthentication,
			"Authentication required",
			nil,
		)
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	fileID := c.Param("id")
	if fileID == "" {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"File ID is required",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	// Delete image from MinIO using fileID directly (includes extension)
	err := h.fileService.DeleteImage(fileID)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeInternal,
			"Failed to delete image",
			nil,
		)
		c.JSON(http.StatusInternalServerError, response)
		return
	}

	response := models.NewSuccessResponse(map[string]string{
		"message": "Image deleted successfully",
	})
	c.JSON(http.StatusOK, response)
}

