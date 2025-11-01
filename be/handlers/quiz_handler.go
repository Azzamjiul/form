package handlers

import (
	"net/http"

	"memotoko-api/models"
	"memotoko-api/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type QuizHandler struct {
	quizService *services.QuizService
}

func NewQuizHandler(quizService *services.QuizService) *QuizHandler {
	return &QuizHandler{
		quizService: quizService,
	}
}

// StartQuiz godoc
// @Summary Start quiz session
// @Description Initiate quiz session with whitelist token - No authentication required
// @Tags quiz
// @Accept json
// @Produce json
// @Param request body models.StartQuizRequest true "Start quiz request"
// @Success 201 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Router /quiz/start [post]
func (h *QuizHandler) StartQuiz(c *gin.Context) {
	var req models.StartQuizRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	result, err := h.quizService.StartQuiz(&req)
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

// GetQuizContent godoc
// @Summary Get quiz content
// @Description Get quiz questions for display
// @Tags quiz
// @Produce json
// @Param session_id path string true "Session ID"
// @Security BearerAuth
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Router /quiz/{session_id}/content [get]
func (h *QuizHandler) GetQuizContent(c *gin.Context) {
	// Get session token from Authorization header
	sessionToken := c.GetHeader("Authorization")
	if sessionToken == "" {
		response := models.NewErrorResponse(
			models.ErrCodeAuthentication,
			"Session token required",
			nil,
		)
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	// Remove "Bearer " prefix if present
	if len(sessionToken) > 7 && sessionToken[:7] == "Bearer " {
		sessionToken = sessionToken[7:]
	}

	sessionIDStr := c.Param("session_id")
	sessionID, err := uuid.Parse(sessionIDStr)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid session ID",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	result, err := h.quizService.GetQuizContent(sessionID, sessionToken)
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

// AutoSaveAnswer godoc
// @Summary Auto-save answer
// @Description Save in-progress answer (debounced)
// @Tags quiz
// @Accept json
// @Produce json
// @Param session_id path string true "Session ID"
// @Security BearerAuth
// @Param request body models.AutoSaveAnswerRequest true "Auto-save answer request"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Router /quiz/{session_id}/autosave [post]
func (h *QuizHandler) AutoSaveAnswer(c *gin.Context) {
	// Get session token from Authorization header
	sessionToken := c.GetHeader("Authorization")
	if sessionToken == "" {
		response := models.NewErrorResponse(
			models.ErrCodeAuthentication,
			"Session token required",
			nil,
		)
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	// Remove "Bearer " prefix if present
	if len(sessionToken) > 7 && sessionToken[:7] == "Bearer " {
		sessionToken = sessionToken[7:]
	}

	sessionIDStr := c.Param("session_id")
	sessionID, err := uuid.Parse(sessionIDStr)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid session ID",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	var req models.AutoSaveAnswerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	result, err := h.quizService.AutoSaveAnswer(sessionID, sessionToken, &req)
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

// GetSessionStatus godoc
// @Summary Get session status
// @Description Check session status (time remaining, saved answers)
// @Tags quiz
// @Produce json
// @Param session_id path string true "Session ID"
// @Security BearerAuth
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Router /quiz/{session_id}/status [get]
func (h *QuizHandler) GetSessionStatus(c *gin.Context) {
	// Get session token from Authorization header
	sessionToken := c.GetHeader("Authorization")
	if sessionToken == "" {
		response := models.NewErrorResponse(
			models.ErrCodeAuthentication,
			"Session token required",
			nil,
		)
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	// Remove "Bearer " prefix if present
	if len(sessionToken) > 7 && sessionToken[:7] == "Bearer " {
		sessionToken = sessionToken[7:]
	}

	sessionIDStr := c.Param("session_id")
	sessionID, err := uuid.Parse(sessionIDStr)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid session ID",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	result, err := h.quizService.GetSessionStatus(sessionID, sessionToken)
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

// SubmitQuiz godoc
// @Summary Submit quiz
// @Description Submit completed quiz/survey
// @Tags quiz
// @Accept json
// @Produce json
// @Param session_id path string true "Session ID"
// @Security BearerAuth
// @Param request body models.SubmitQuizRequest true "Submit quiz request"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Router /quiz/{session_id}/submit [post]
func (h *QuizHandler) SubmitQuiz(c *gin.Context) {
	// Get session token from Authorization header
	sessionToken := c.GetHeader("Authorization")
	if sessionToken == "" {
		response := models.NewErrorResponse(
			models.ErrCodeAuthentication,
			"Session token required",
			nil,
		)
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	// Remove "Bearer " prefix if present
	if len(sessionToken) > 7 && sessionToken[:7] == "Bearer " {
		sessionToken = sessionToken[7:]
	}

	sessionIDStr := c.Param("session_id")
	sessionID, err := uuid.Parse(sessionIDStr)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid session ID",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	var req models.SubmitQuizRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	result, err := h.quizService.SubmitQuiz(sessionID, sessionToken, &req)
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

// GetQuizResult godoc
// @Summary Get quiz result
// @Description Get quiz result and score (if quiz mode)
// @Tags quiz
// @Produce json
// @Param response_id path string true "Response ID"
// @Security BearerAuth
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Failure 401 {object} models.APIResponse
// @Failure 404 {object} models.APIResponse
// @Router /quiz/result/{response_id} [get]
func (h *QuizHandler) GetQuizResult(c *gin.Context) {
	// Get session token from Authorization header
	sessionToken := c.GetHeader("Authorization")
	if sessionToken == "" {
		response := models.NewErrorResponse(
			models.ErrCodeAuthentication,
			"Session token required",
			nil,
		)
		c.JSON(http.StatusUnauthorized, response)
		return
	}

	// Remove "Bearer " prefix if present
	if len(sessionToken) > 7 && sessionToken[:7] == "Bearer " {
		sessionToken = sessionToken[7:]
	}

	responseIDStr := c.Param("response_id")
	responseID, err := uuid.Parse(responseIDStr)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			"Invalid response ID",
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	result, err := h.quizService.GetQuizResult(responseID, sessionToken)
	if err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeNotFound,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusNotFound, response)
		return
	}

	response := models.NewSuccessResponse(result)
	c.JSON(http.StatusOK, response)
}

// ResumeQuiz godoc
// @Summary Resume quiz session
// @Description Resume incomplete quiz (after disconnect)
// @Tags quiz
// @Accept json
// @Produce json
// @Param request body models.ResumeQuizRequest true "Resume quiz request"
// @Success 200 {object} models.APIResponse
// @Failure 400 {object} models.APIResponse
// @Router /quiz/resume [post]
func (h *QuizHandler) ResumeQuiz(c *gin.Context) {
	var req models.ResumeQuizRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response := models.NewErrorResponse(
			models.ErrCodeValidation,
			err.Error(),
			nil,
		)
		c.JSON(http.StatusBadRequest, response)
		return
	}

	result, err := h.quizService.ResumeQuiz(&req)
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
