package handlers

import (
	"net/http"

	"form-api/middleware"
	"form-api/utils"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

type Router struct {
	authHandler      *AuthHandler
	formHandler      *FormHandler
	sectionHandler   *SectionHandler
	fieldHandler     *FieldHandler
	whitelistHandler *WhitelistHandler
	quizHandler      *QuizHandler
	jwtUtil          *utils.JWTUtil
}

func NewRouter(authHandler *AuthHandler, formHandler *FormHandler, sectionHandler *SectionHandler, fieldHandler *FieldHandler, whitelistHandler *WhitelistHandler, quizHandler *QuizHandler, jwtUtil *utils.JWTUtil) *Router {
	return &Router{
		authHandler:      authHandler,
		formHandler:      formHandler,
		sectionHandler:   sectionHandler,
		fieldHandler:     fieldHandler,
		whitelistHandler: whitelistHandler,
		quizHandler:      quizHandler,
		jwtUtil:          jwtUtil,
	}
}

func (r *Router) SetupRoutes(engine *gin.Engine) {
	// API routes
	api := engine.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			// Public routes
			auth.POST("/register", r.authHandler.Register)
			auth.POST("/login", r.authHandler.Login)
			auth.POST("/refresh", r.authHandler.RefreshToken)

			// Protected routes
			auth.GET("/me", middleware.AuthMiddleware(r.jwtUtil), r.authHandler.GetMe)
			auth.POST("/logout", middleware.AuthMiddleware(r.jwtUtil), r.authHandler.Logout)
		}

		// Form routes (all protected)
		forms := api.Group("/forms")
		forms.Use(middleware.AuthMiddleware(r.jwtUtil))
		{
			forms.POST("", r.formHandler.CreateForm)
			forms.GET("", r.formHandler.ListUserForms)
			forms.GET("/:form_id", r.formHandler.GetFormByID)
			forms.PUT("/:form_id", r.formHandler.UpdateForm)
			forms.DELETE("/:form_id", r.formHandler.DeleteForm)
			forms.POST("/:form_id/duplicate", r.formHandler.DuplicateForm)
			forms.PATCH("/:form_id/publish", r.formHandler.PublishForm)

			// Section routes (nested under forms)
			forms.POST("/:form_id/sections", r.sectionHandler.CreateSection)
			forms.GET("/:form_id/sections", r.sectionHandler.ListSections)
			forms.GET("/:form_id/sections/:section_id", r.sectionHandler.GetSection)
			forms.PUT("/:form_id/sections/:section_id", r.sectionHandler.UpdateSection)
			forms.DELETE("/:form_id/sections/:section_id", r.sectionHandler.DeleteSection)

			// Field routes (nested under forms)
			forms.POST("/:form_id/fields", r.fieldHandler.CreateField)
			forms.GET("/:form_id/fields", r.fieldHandler.ListFields)
			forms.GET("/:form_id/fields/:field_id", r.fieldHandler.GetField)
			forms.PUT("/:form_id/fields/:field_id", r.fieldHandler.UpdateField)
			forms.DELETE("/:form_id/fields/:field_id", r.fieldHandler.DeleteField)
			forms.PATCH("/:form_id/fields/reorder", r.fieldHandler.ReorderFields)

			// Whitelist routes (nested under forms, protected)
			forms.POST("/:form_id/whitelist", r.whitelistHandler.CreateWhitelistEntry)
			forms.POST("/:form_id/whitelist/batch", r.whitelistHandler.BatchCreateWhitelist)
			forms.GET("/:form_id/whitelist", r.whitelistHandler.ListWhitelistEntries)
			forms.GET("/:form_id/whitelist/:whitelist_id", r.whitelistHandler.GetWhitelistEntry)
			forms.PUT("/:form_id/whitelist/:whitelist_id", r.whitelistHandler.UpdateWhitelistEntry)
			forms.DELETE("/:form_id/whitelist/:whitelist_id", r.whitelistHandler.RevokeWhitelistEntry)
		}

		// Whitelist validation route (public - no auth required)
		api.GET("/whitelist/validate/:access_token", r.whitelistHandler.ValidateAccessToken)

		// Quiz routes (public - use session token for auth)
		quiz := api.Group("/quiz")
		{
			quiz.POST("/start", r.quizHandler.StartQuiz)
			quiz.GET("/:session_id/content", r.quizHandler.GetQuizContent)
			quiz.POST("/:session_id/autosave", r.quizHandler.AutoSaveAnswer)
			quiz.GET("/:session_id/status", r.quizHandler.GetSessionStatus)
			quiz.POST("/:session_id/submit", r.quizHandler.SubmitQuiz)
			quiz.GET("/result/:response_id", r.quizHandler.GetQuizResult)
			quiz.POST("/resume", r.quizHandler.ResumeQuiz)
		}
	}

	// Swagger JSON endpoint
	engine.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Scalar documentation endpoint
	engine.GET("/docs", func(c *gin.Context) {
		html := `<!doctype html>
<html>
<head>
    <title>API Documentation</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
    <script id="api-reference" data-url="/swagger/doc.json"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>`
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(html))
	})
}

func NewGinEngine() *gin.Engine {
	engine := gin.Default()

	// CORS middleware
	engine.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	return engine
}
