package main

import (
	"log"
	"os"

	"github.com/AEX0TIC/ATIA/backend/internal/api"
	"github.com/AEX0TIC/ATIA/backend/internal/config"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found")
	}

	// Initialize configuration
	if _, err := config.Load(); err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize Gin router
	r := gin.Default()

	// Setup API routes
	api.SetupRoutes(r)

	// Get port from environment or use default
	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}

	// Start the server
	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
