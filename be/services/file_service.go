package services

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"form-api/config"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"golang.org/x/image/webp"
)

type FileService struct {
	minioClient *minio.Client
	config      *config.Config
	bucket      string
}

type FileInfo struct {
	ID          string `json:"id"`
	Filename    string `json:"filename"`
	Size        int64  `json:"size"`
	ContentType string `json:"content_type"`
	Width       int    `json:"width,omitempty"`
	Height      int    `json:"height,omitempty"`
	URL         string `json:"url"`
}

func NewFileService(cfg *config.Config) (*FileService, error) {
	// Validate required MinIO configuration
	if cfg.MinioAccessKey == "" {
		return nil, fmt.Errorf("MINIO_ACCESS_KEY environment variable is required")
	}
	if cfg.MinioSecretKey == "" {
		return nil, fmt.Errorf("MINIO_SECRET_KEY environment variable is required")
	}
	if cfg.MinioEndpoint == "" {
		return nil, fmt.Errorf("MINIO_ENDPOINT environment variable is required")
	}
	if cfg.MinioBucket == "" {
		return nil, fmt.Errorf("MINIO_BUCKET environment variable is required")
	}

	// Initialize MinIO client
	client, err := minio.New(cfg.MinioEndpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.MinioAccessKey, cfg.MinioSecretKey, ""),
		Secure: cfg.MinioUseSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create MinIO client with endpoint '%s': %w", cfg.MinioEndpoint, err)
	}

	// Test connection with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Create bucket if it doesn't exist
	exists, err := client.BucketExists(ctx, cfg.MinioBucket)
	if err != nil {
		// Check if the error is related to HTML response (wrong endpoint/service)
		if strings.Contains(err.Error(), "XML syntax error") || strings.Contains(err.Error(), "<") {
			return nil, fmt.Errorf("MinIO endpoint '%s' is returning HTML instead of XML. Please check:\n"+
				"1. MinIO service is running at %s\n"+
				"2. Endpoint URL is correct (try http vs https)\n"+
				"3. MinIO port is accessible\n"+
				"Original error: %w", cfg.MinioEndpoint, cfg.MinioEndpoint, err)
		}
		return nil, fmt.Errorf("failed to check bucket existence on MinIO endpoint '%s': %w", cfg.MinioEndpoint, err)
	}

	if !exists {
		err = client.MakeBucket(ctx, cfg.MinioBucket, minio.MakeBucketOptions{})
		if err != nil {
			return nil, fmt.Errorf("failed to create bucket '%s' on MinIO endpoint '%s': %w", cfg.MinioBucket, cfg.MinioEndpoint, err)
		}
	}

	return &FileService{
		minioClient: client,
		config:      cfg,
		bucket:      cfg.MinioBucket,
	}, nil
}

func (s *FileService) UploadImage(file multipart.File, header *multipart.FileHeader) (*FileInfo, error) {
	defer file.Close()

	// Validate file size (10MB max)
	const maxSize = 10 * 1024 * 1024
	if header.Size > maxSize {
		return nil, errors.New("file size exceeds 10MB limit")
	}

	// Validate file type
	contentType := header.Header.Get("Content-Type")
	if !s.isAllowedImageType(contentType) {
		return nil, errors.New("invalid file type. Only JPG, PNG, and WebP are allowed")
	}

	// Read file content
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	// Get image dimensions
	width, height, err := s.getImageDimensions(fileBytes, contentType)
	if err != nil {
		return nil, fmt.Errorf("failed to get image dimensions: %w", err)
	}

	// Generate unique file ID with extension
	ext := filepath.Ext(header.Filename)
	fileID := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	objectName := fileID

	// Upload to MinIO
	ctx := context.Background()
	_, err = s.minioClient.PutObject(ctx, s.bucket, objectName, bytes.NewReader(fileBytes), header.Size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to upload file to MinIO: %w", err)
	}

	// Generate file info
	fileInfo := &FileInfo{
		ID:          fileID,
		Filename:    header.Filename,
		Size:        header.Size,
		ContentType: contentType,
		Width:       width,
		Height:      height,
		URL:         objectName,
	}

	return fileInfo, nil
}

func (s *FileService) GetImageURL(objectName string) (string, error) {
	ctx := context.Background()

	// Check if object exists
	_, err := s.minioClient.StatObject(ctx, s.bucket, objectName, minio.StatObjectOptions{})
	if err != nil {
		return "", fmt.Errorf("image not found: %w", err)
	}

	// Generate presigned URL valid for 1 hour
	presignedURL, err := s.minioClient.PresignedGetObject(ctx, s.bucket, objectName, time.Hour, nil)
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned URL: %w", err)
	}

	return presignedURL.String(), nil
}

func (s *FileService) GetImage(objectName string) ([]byte, string, error) {
	ctx := context.Background()

	// Get object from MinIO
	object, err := s.minioClient.GetObject(ctx, s.bucket, objectName, minio.GetObjectOptions{})
	if err != nil {
		return nil, "", fmt.Errorf("failed to get object: %w", err)
	}
	defer object.Close()

	// Get object info to determine content type
	stat, err := object.Stat()
	if err != nil {
		return nil, "", fmt.Errorf("failed to get object stats: %w", err)
	}

	// Read object content
	data, err := io.ReadAll(object)
	if err != nil {
		return nil, "", fmt.Errorf("failed to read object content: %w", err)
	}

	return data, stat.ContentType, nil
}

func (s *FileService) DeleteImage(objectName string) error {
	ctx := context.Background()

	err := s.minioClient.RemoveObject(ctx, s.bucket, objectName, minio.RemoveObjectOptions{})
	if err != nil {
		return fmt.Errorf("failed to delete object: %w", err)
	}

	return nil
}

func (s *FileService) isAllowedImageType(contentType string) bool {
	allowedTypes := []string{
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/webp",
	}

	for _, allowedType := range allowedTypes {
		if contentType == allowedType {
			return true
		}
	}
	return false
}

func (s *FileService) getImageDimensions(fileBytes []byte, contentType string) (int, int, error) {
	reader := bytes.NewReader(fileBytes)

	var img image.Config
	var err error

	switch contentType {
	case "image/jpeg", "image/jpg":
		img, err = jpeg.DecodeConfig(reader)
	case "image/png":
		img, err = png.DecodeConfig(reader)
	case "image/webp":
		img, err = webp.DecodeConfig(reader)
	default:
		return 0, 0, errors.New("unsupported image format")
	}

	if err != nil {
		return 0, 0, err
	}

	return img.Width, img.Height, nil
}

func (s *FileService) GenerateServeURL(fileID string) string {
	return fmt.Sprintf("/api/v1/images/%s", fileID)
}

func (s *FileService) ExtractObjectIDFromURL(serveURL string) string {
	// Extract file ID from serve URL like "/api/v1/images/file-id"
	parts := strings.Split(serveURL, "/")
	if len(parts) >= 4 && parts[1] == "api" && parts[2] == "v1" && parts[3] == "images" {
		return parts[4]
	}
	return ""
}
