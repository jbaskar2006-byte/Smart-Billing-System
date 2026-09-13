package main

import (
	"log"

	"smart-tiffin-shop-backend/config"
	"smart-tiffin-shop-backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize Database (attempts MySQL connection with fallback)
	config.InitDB()

	r := gin.Default()

	// Enable CORS for frontend
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	r.Use(cors.New(corsConfig))

	// Register API Routes
	routes.RegisterRoutes(r)

	log.Println("[SERVER] Smart Tiffin Shop Backend starting on port http://localhost:8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
