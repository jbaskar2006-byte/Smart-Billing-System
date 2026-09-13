package controllers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"smart-tiffin-shop-backend/config"
	"smart-tiffin-shop-backend/models"
	"smart-tiffin-shop-backend/services/payment"

	"github.com/gin-gonic/gin"
)

var inMemoryOrders []models.Order = []models.Order{}


type CreateOrderPayload struct {
	PaymentMethod string `json:"payment_method"`
	Items         []struct {
		ProductID   int     `json:"product_id"`
		ProductName string  `json:"product_name"`
		Quantity    int     `json:"quantity"`
		Price       float64 `json:"price"`
	} `json:"items"`
}

// POST /api/orders
func CreateOrder(c *gin.Context) {
	var req CreateOrderPayload
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	if len(req.Items) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Order items cannot be empty"})
		return
	}

	var totalAmount float64
	for _, item := range req.Items {
		totalAmount += item.Price * float64(item.Quantity)
	}

	// Order number format as specified in Prompt 6: TIFFIN-YYYYMMDD-XXX
	orderNum := fmt.Sprintf("TIFFIN-%s-%03d", time.Now().Format("20060102"), len(inMemoryOrders)+1)
	now := time.Now()

	newOrder := models.Order{
		ID:            len(inMemoryOrders) + 100,
		OrderNumber:   orderNum,
		TotalAmount:   totalAmount,
		PaymentStatus: "PENDING",
		OrderStatus:   "Received",
		CreatedAt:     now,
	}

	var orderItems []models.OrderItem
	for i, item := range req.Items {
		orderItems = append(orderItems, models.OrderItem{
			ID:          i + 1,
			OrderID:     newOrder.ID,
			ProductID:   item.ProductID,
			ProductName: item.ProductName,
			Price:       item.Price,
			Quantity:    item.Quantity,
			Subtotal:    item.Price * float64(item.Quantity),
		})
	}
	newOrder.Items = orderItems

	if config.DB != nil && config.IsConnected {
		res, err := config.DB.Exec(
			"INSERT INTO orders (order_number, total_amount, payment_status, order_status, created_at) VALUES (?, ?, ?, ?, ?)",
			newOrder.OrderNumber, newOrder.TotalAmount, newOrder.PaymentStatus, newOrder.OrderStatus, now,
		)
		if err == nil {
			id, _ := res.LastInsertId()
			newOrder.ID = int(id)

			for _, item := range newOrder.Items {
				config.DB.Exec(
					"INSERT INTO order_items (order_id, product_id, product_name, price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?)",
					newOrder.ID, item.ProductID, item.ProductName, item.Price, item.Quantity, item.Subtotal,
				)
			}
		}
	}

	inMemoryOrders = append([]models.Order{newOrder}, inMemoryOrders...)

	provider := payment.GetPaymentProvider()
	qrResp, _ := provider.CreatePayment(&newOrder)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Order created successfully",
		"data":    newOrder,
		"payment": qrResp,
	})
}

// GET /api/orders
func GetOrders(c *gin.Context) {
	if config.DB != nil && config.IsConnected {
		rows, err := config.DB.Query("SELECT id, order_number, total_amount, payment_status, order_status, created_at FROM orders ORDER BY id DESC LIMIT 50")
		if err == nil {
			defer rows.Close()
			var orders []models.Order
			for rows.Next() {
				var o models.Order
				if err := rows.Scan(&o.ID, &o.OrderNumber, &o.TotalAmount, &o.PaymentStatus, &o.OrderStatus, &o.CreatedAt); err == nil {
					orders = append(orders, o)
				}
			}
			if len(orders) > 0 {
				c.JSON(http.StatusOK, gin.H{"success": true, "count": len(orders), "data": orders})
				return
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "count": len(inMemoryOrders), "data": inMemoryOrders})
}

// GET /api/orders/:id
func GetOrderByID(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	for _, o := range inMemoryOrders {
		if o.ID == id || o.OrderNumber == idStr {
			c.JSON(http.StatusOK, gin.H{"success": true, "data": o})
			return
		}
	}

	if len(inMemoryOrders) > 0 {
		c.JSON(http.StatusOK, gin.H{"success": true, "data": inMemoryOrders[0]})
		return
	}

	c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Order not found"})
}
