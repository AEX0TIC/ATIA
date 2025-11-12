package api

import (
	"net/http"

	"github.com/AEX0TIC/ATIA/backend/internal/database"
	"github.com/AEX0TIC/ATIA/backend/internal/models"
	"github.com/AEX0TIC/ATIA/backend/internal/services"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	aggregator *services.Aggregator
	db         *database.MongoDB
}

func NewHandler(aggregator *services.Aggregator, db *database.MongoDB) *Handler {
	return &Handler{
		aggregator: aggregator,
		db:         db,
	}
}

func (h *Handler) AnalyzeIndicator(c *gin.Context) {
	var req models.AnalysisRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.AnalysisResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	threat, err := h.aggregator.AnalyzeIndicator(req.Indicator, req.Type)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.AnalysisResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, models.AnalysisResponse{
		Success: true,
		Data:    threat,
	})
}

func (h *Handler) GetThreat(c *gin.Context) {
	indicator := c.Param("indicator")

	threat, err := h.db.GetThreat(indicator)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Threat not found"})
		return
	}

	c.JSON(http.StatusOK, threat)
}

func (h *Handler) GetAllThreats(c *gin.Context) {
	threats, err := h.db.GetAllThreats(100)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, threats)
}

func (h *Handler) GetThreatHistory(c *gin.Context) {
	indicator := c.Param("indicator")

	history, err := h.db.GetThreatHistory(indicator)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.HistoricalData{
		Indicator: indicator,
		History:   history,
	})
}

func (h *Handler) DeleteThreat(c *gin.Context) {
	id := c.Param("id")

	if err := h.db.DeleteThreat(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Threat deleted successfully"})
}

func (h *Handler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "healthy",
		"service": "ATIA Backend",
	})
}
