package routes

import (
	"smart-tiffin-shop-backend/controllers"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		// Health & Connection test
		api.GET("/health", controllers.HealthCheck)

		// Product REST APIs
		api.GET("/products", controllers.GetProducts)
		api.GET("/products/:id", controllers.GetProductByID)
		api.POST("/products", controllers.CreateProduct)
		api.PUT("/products/:id", controllers.UpdateProduct)
		api.DELETE("/products/:id", controllers.DeleteProduct)

		// Orders REST APIs
		api.POST("/orders", controllers.CreateOrder)
		api.GET("/orders", controllers.GetOrders)
		api.GET("/orders/:id", controllers.GetOrderByID)

		// Payment Gateway & Webhook Architecture APIs
		api.GET("/payments/status/:order_id", controllers.GetPaymentStatus)
		api.GET("/payments/:orderId/status", controllers.GetPaymentStatus)
		api.POST("/webhooks/payment", controllers.ProcessWebhook)
		api.POST("/payments/webhook", controllers.ProcessWebhook)
		api.POST("/payments/verify-test", controllers.VerifyTestPayment)


		// Bills REST APIs (Generated ONLY after PAYMENT_STATUS = SUCCESS)
		api.GET("/bills/:order_id", controllers.GetBillByOrderID)
		api.GET("/bills/order/:order_id", controllers.GetBillByOrderID)

		// Sales Reports REST APIs (Prompt 8, 9 & 10)
		api.GET("/reports/daily", controllers.GetDailyReport)
		api.GET("/reports/monthly", controllers.GetMonthlyReport)
		api.GET("/reports/yearly", controllers.GetYearlyReport)

		// Admin Auth & Dashboard (Prompt 11)
		api.POST("/admin/login", controllers.AdminLogin)
		api.GET("/admin/dashboard", controllers.GetDashboardStats)
		api.POST("/admin/reset-data", controllers.ResetAllData)
	}
}

