.PHONY: migrate-up migrate-down migrate-create migrate-force migrate-version migrate-drop migrate-goto swag dev run build help

# Load environment variables from .env file if it exists
ifneq (,$(wildcard .env))
    include .env
    export
endif

# Default DATABASE_URL if not set
DATABASE_URL ?= postgres://postgres:postgres@localhost:5432/form?sslmode=disable
MIGRATIONS_DIR = ./migrations

help:
	@echo "Development Commands:"
	@echo "  make dev                - Run development server with hot reload (requires air)"
	@echo "  make run                - Run the application"
	@echo "  make build              - Build the application"
	@echo "  make swag               - Generate Swagger documentation"
	@echo ""
	@echo "Migration Commands:"
	@echo "  make migrate-up         - Apply all pending migrations"
	@echo "  make migrate-down       - Rollback the last migration"
	@echo "  make migrate-create     - Create a new migration (usage: make migrate-create name=migration_name)"
	@echo "  make migrate-force      - Force set migration version (usage: make migrate-force version=N)"
	@echo "  make migrate-version    - Show current migration version"
	@echo "  make migrate-drop       - Drop everything in the database"
	@echo "  make migrate-goto       - Migrate to a specific version (usage: make migrate-goto version=N)"

migrate-up:
	@echo "Running migrations..."
	migrate -path $(MIGRATIONS_DIR) -database "$(DATABASE_URL)" up

migrate-down:
	@echo "Rolling back last migration..."
	migrate -path $(MIGRATIONS_DIR) -database "$(DATABASE_URL)" down 1

migrate-create:
	@if [ -z "$(name)" ]; then \
		echo "Error: name parameter is required. Usage: make migrate-create name=migration_name"; \
		exit 1; \
	fi
	@echo "Creating new migration: $(name)"
	migrate create -ext sql -dir $(MIGRATIONS_DIR) -seq $(name)

migrate-force:
	@if [ -z "$(version)" ]; then \
		echo "Error: version parameter is required. Usage: make migrate-force version=N"; \
		exit 1; \
	fi
	@echo "Forcing migration version to $(version)..."
	migrate -path $(MIGRATIONS_DIR) -database "$(DATABASE_URL)" force $(version)

migrate-version:
	@echo "Current migration version:"
	migrate -path $(MIGRATIONS_DIR) -database "$(DATABASE_URL)" version

migrate-drop:
	@echo "WARNING: This will drop all tables in the database!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		migrate -path $(MIGRATIONS_DIR) -database "$(DATABASE_URL)" drop; \
	else \
		echo "Aborted."; \
	fi

migrate-goto:
	@if [ -z "$(version)" ]; then \
		echo "Error: version parameter is required. Usage: make migrate-goto version=N"; \
		exit 1; \
	fi
	@echo "Migrating to version $(version)..."
	migrate -path $(MIGRATIONS_DIR) -database "$(DATABASE_URL)" goto $(version)

swag:
	@echo "Generating Swagger documentation..."
	swag init

dev:
	@echo "Starting development server with hot reload..."
	@if ! command -v air > /dev/null; then \
		echo "Error: air is not installed. Install with:"; \
		echo "  go install github.com/air-verse/air@latest"; \
		exit 1; \
	fi
	air

run:
	@echo "Running application..."
	go run main.go

build:
	@echo "Building application..."
	go build -o form-api
