package api

import (
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	// API v1 routes
	v1 := r.Group("/api/v1")
	{
		threats := v1.Group("/threats")
		{
			threats.GET("", HandleListThreats)
			threats.GET("/:id", HandleGetThreat)
			threats.POST("", HandleCreateThreat)
			threats.PUT("/:id", HandleUpdateThreat)
			threats.DELETE("/:id", HandleDeleteThreat)
		}
	}
}
