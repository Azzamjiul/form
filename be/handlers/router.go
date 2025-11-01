package handlers

import (
	"net/http"

	"memotoko-api/middleware"
	"memotoko-api/utils"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

type Router struct {
	authHandler *AuthHandler
	jwtUtil     *utils.JWTUtil
}

func NewRouter(authHandler *AuthHandler, jwtUtil *utils.JWTUtil) *Router {
	return &Router{
		authHandler: authHandler,
		jwtUtil:     jwtUtil,
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
