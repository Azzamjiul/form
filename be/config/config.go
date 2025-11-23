package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	ServerPort          string
	DatabaseURL         string
	JWTSecret           string
	JWTRefreshSecret    string
	AccessTokenExpiry   string
	RefreshTokenExpiry  string
	FrontEndUrl string
	MinioEndpoint        string
	MinioAccessKey      string
	MinioSecretKey      string
	MinioUseSSL         bool
	MinioBucket         string
}

func LoadConfig() *Config {
	// Load .env file if exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	return &Config{
		ServerPort:         getEnv("SERVER_PORT", "8080"),
		DatabaseURL:        getEnv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/form?sslmode=disable"),
		JWTSecret:          getEnv("JWT_SECRET", "your-secret-key"),
		JWTRefreshSecret:   getEnv("JWT_REFRESH_SECRET", "your-refresh-secret-key"),
		AccessTokenExpiry:  getEnv("ACCESS_TOKEN_EXPIRY", "15m"),
		RefreshTokenExpiry: getEnv("REFRESH_TOKEN_EXPIRY", "168h"),
		FrontEndUrl:        getEnv("FRONT_END_URL", "http://localhost:5173"),
		MinioEndpoint:      getEnv("MINIO_ENDPOINT", "minio.alat.cc"),
		MinioAccessKey:     getEnv("MINIO_ACCESS_KEY", ""),
		MinioSecretKey:     getEnv("MINIO_SECRET_KEY", ""),
		MinioUseSSL:        getBoolEnv("MINIO_USE_SSL", true),
		MinioBucket:        getEnv("MINIO_BUCKET", "form-images"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getBoolEnv(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if parsed, err := strconv.ParseBool(value); err == nil {
			return parsed
		}
	}
	return defaultValue
}
