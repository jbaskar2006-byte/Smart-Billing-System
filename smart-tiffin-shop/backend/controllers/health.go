package controllers

import (
	"net/http"
	"time"

	"smart-tiffin-shop-backend/config"

	"github.com/gin-gonic/gin"
)

func HealthCheck(c *gin.Context) {
	dbStatus := "Disconnected"
	if config.DB != nil && config.IsConnected {
		if err := config.DB.Ping(); err == nil {
			dbStatus = "Connected"
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status":      "online",
		"message":     "Smart Tiffin Shop Backend API is running smoothly!",
		"timestamp":   time.Now().Format(time.RFC3339),
		"database":    dbStatus,
		"service":     "Smart Tiffin Shop Billing API",
		"version":     "1.0.0",
		"environment": "development",
	})
}
