package handlers

import (
	"net/http"

	"memotoko-api/models"
	"memotoko-api/services"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// Register godoc
// @Summary Register a new user
// @Description Register a new user with email, password, and name
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.RegisterRequest true "Register request"
// @Success 201 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	authResp, err := h.authService.Register(&req)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			map[string]interface{}{"field": "email"},
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	response := models.NewSuccessResponse(authResp)
	c.JSON(http.StatusCreated, response)
}

// Login godoc
// @Summary Login user
// @Description Authenticate user and return access and refresh tokens
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.LoginRequest true "Login request"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	authResp, err := h.authService.Login(&req)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeAuthentication,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	response := models.NewSuccessResponse(authResp)
	c.JSON(http.StatusOK, response)
}

// RefreshToken godoc
// @Summary Refresh access token
// @Description Get new access and refresh tokens using a valid refresh token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.RefreshTokenRequest true "Refresh token request"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Router /auth/refresh [post]
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req models.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	authResp, err := h.authService.RefreshToken(&req)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeAuthentication,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	response := models.NewSuccessResponse(authResp)
	c.JSON(http.StatusOK, response)
}

// GetMe godoc
// @Summary Get current user
// @Description Get the current authenticated user's information
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Router /auth/me [get]
func (h *AuthHandler) GetMe(c *gin.Context) {
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

	user, err := h.authService.GetMe(userID.(string))
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeAuthentication,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	response := models.NewSuccessResponse(user)
	c.JSON(http.StatusOK, response)
}

// Logout godoc
// @Summary Logout user
// @Description Invalidate tokens (client-side mainly)
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Router /auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	_, exists := c.Get("user_id")
	if !exists {
		response := models.NewErrorResponse(
			models.ErrCodeAuthentication,
			"Invalid or missing token",
			nil,
		)
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	// For stateless JWT, logout is primarily handled on client-side
	// by removing the tokens. Server just confirms the request was authenticated.
	logoutResp := &models.LogoutResponse{
		Message: "Logged out successfully",
	}

	response := models.NewSuccessResponse(logoutResp)
	c.JSON(http.StatusOK, response)
}
