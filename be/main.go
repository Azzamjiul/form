package main

import (
	"context"
	"log"
	"net/http"

	"memotoko-api/config"
	_ "memotoko-api/docs"
	"memotoko-api/handlers"
	"memotoko-api/services"
	"memotoko-api/utils"

	"github.com/gin-gonic/gin"
	"go.uber.org/fx"
	"gorm.io/gorm"
)

// @title MemoToko API
// @version 1.0
// @description API for MemoToko application with JWT authentication
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.email support@memotoko.com

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /api
// @schemes http https

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

func main() {
	app := fx.New(
		// Provide dependencies
		fx.Provide(
			config.LoadConfig,
			config.NewDatabase,
			newJWTUtil,
			services.NewAuthService,
			services.NewFormService,
			services.NewSectionService,
			handlers.NewAuthHandler,
			handlers.NewFormHandler,
			handlers.NewSectionHandler,
			handlers.NewRouter,
			handlers.NewGinEngine,
		),
		// Invoke lifecycle hooks
		fx.Invoke(registerHooks),
	)

	app.Run()
}

func registerHooks(
	lc fx.Lifecycle,
	cfg *config.Config,
	db *gorm.DB,
	engine *gin.Engine,
	router *handlers.Router,
) {
	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			// Setup routes
			router.SetupRoutes(engine)

			// Start HTTP server
			addr := ":" + cfg.ServerPort
			go func() {
				log.Printf("Starting server on %s", addr)
				if err := engine.Run(addr); err != nil && err != http.ErrServerClosed {
					log.Fatalf("Failed to start server: %v", err)
				}
			}()

			return nil
		},
		OnStop: func(ctx context.Context) error {
			log.Println("Shutting down server...")
			return nil
		},
	})
}

func newJWTUtil(cfg *config.Config) *utils.JWTUtil {
	return utils.NewJWTUtil(cfg.JWTSecret, cfg.JWTRefreshSecret)
}
