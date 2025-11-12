package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/AEX0TIC/ATIA/backend/internal/api"
	"github.com/AEX0TIC/ATIA/backend/internal/config"
	"github.com/AEX0TIC/ATIA/backend/internal/database"
	"github.com/AEX0TIC/ATIA/backend/internal/services"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Initialize MongoDB
	db, err := database.NewMongoDB(cfg.MongoURI, cfg.MongoDatabase)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer func() {
		if err := db.Close(); err != nil {
			log.Printf("Error closing DB: %v", err)
		}
	}()

	// Create indexes
	if err := db.CreateIndexes(); err != nil {
		log.Printf("Warning: failed to create indexes: %v", err)
	}

	// Initialize services
	vtService := services.NewVirusTotalService(cfg.APIKeys.VirusTotal)
	otxService := services.NewOTXService(cfg.APIKeys.OTX)
	abuseService := services.NewAbuseIPDBService(cfg.APIKeys.AbuseIPDB)

	// Create aggregator with services and database
	aggregator := services.NewAggregator(vtService, otxService, abuseService, db)

	// Initialize Gin router and routes
	router := gin.Default()
	router.Use(corsMiddleware())
	api.SetupRoutes(router, aggregator, db)

	// HTTP server with timeouts
	srv := &http.Server{
		Addr:         ":" + cfg.Server.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		log.Printf("Server starting on port %s", cfg.Server.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	log.Println("Server exiting")
}

// corsMiddleware provides permissive CORS for development. Remove or restrict in production.
func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
