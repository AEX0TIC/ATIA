package api

import (
	"github.com/AEX0TIC/ATIA/backend/internal/database"
	"github.com/AEX0TIC/ATIA/backend/internal/services"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine, aggregator *services.Aggregator, db *database.MongoDB) {
	handler := NewHandler(aggregator, db)

	// Health check
	router.GET("/health", handler.HealthCheck)

	// API v1
	v1 := router.Group("/api/v1")
	{
		// Analysis endpoints
		v1.POST("/analyze", handler.AnalyzeIndicator)

		// Threat endpoints
		v1.GET("/threats", handler.GetAllThreats)
		v1.GET("/threats/:indicator", handler.GetThreat)
		v1.GET("/threats/:indicator/history", handler.GetThreatHistory)
		v1.DELETE("/threats/:id", handler.DeleteThreat)
	}
}
