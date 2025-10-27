package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func HandleGetThreat(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"message": "GetThreat endpoint",
		"id":      id,
	})
}

func HandleListThreats(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "ListThreats endpoint",
	})
}

func HandleCreateThreat(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "CreateThreat endpoint",
	})
}

func HandleUpdateThreat(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"message": "UpdateThreat endpoint",
		"id":      id,
	})
}

func HandleDeleteThreat(c *gin.Context) {
	id := c.Param("id")
	c.JSON(http.StatusOK, gin.H{
		"message": "DeleteThreat endpoint",
		"id":      id,
	})
}
