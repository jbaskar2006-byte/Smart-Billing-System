package controllers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"sync"
	"time"

	"smart-tiffin-shop-backend/config"
	"smart-tiffin-shop-backend/models"
	"smart-tiffin-shop-backend/services/payment"

	"github.com/gin-gonic/gin"
)

var processedTransactions sync.Map

// GET /api/payments/:order_id/status OR /api/payments/status/:order_id
func GetPaymentStatus(c *gin.Context) {
	orderIDStr := c.Param("order_id")
	if orderIDStr == "" {
		orderIDStr = c.Param("orderId")
	}
	orderID, err := strconv.Atoi(orderIDStr)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid order ID"})
		return
	}

	if config.DB != nil && config.IsConnected {
		var paymentStatus, orderNum string
		var totalAmount float64
		err := config.DB.QueryRow("SELECT order_number, total_amount, payment_status FROM orders WHERE id = ?", orderID).
			Scan(&orderNum, &totalAmount, &paymentStatus)

		if err == nil {
			var billNum, txnID string
			_ = config.DB.QueryRow("SELECT bill_number, payment_transaction_id FROM bills WHERE order_id = ?", orderID).Scan(&billNum, &txnID)

			c.JSON(http.StatusOK, gin.H{
				"success":        true,
				"order_id":       orderID,
				"order_number":   orderNum,
				"total_amount":   totalAmount,
				"payment_status": paymentStatus,
				"bill_number":    billNum,
				"transaction_id": txnID,
			})
			return
		}
	}

	for _, o := range inMemoryOrders {
		if o.ID == orderID || o.OrderNumber == orderIDStr {
			c.JSON(http.StatusOK, gin.H{
				"success":        true,
				"order_id":       o.ID,
				"order_number":   o.OrderNumber,
				"total_amount":   o.TotalAmount,
				"payment_status": o.PaymentStatus,
				"bill_number":    o.BillNumber,
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success":        true,
		"order_id":       orderID,
		"payment_status": "PENDING",
	})
}

// POST /api/webhooks/payment OR /api/payments/webhook
func ProcessWebhook(c *gin.Context) {
	signature := c.GetHeader("X-Webhook-Signature")
	if signature == "" {
		signature = c.GetHeader("X-Razorpay-Signature")
	}
	if signature == "" {
		signature = c.GetHeader("X-VERIFY")
	}

	bodyBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Failed to read webhook request body"})
		return
	}
	c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))

	var rawPayload struct {
		OrderID       int     `json:"order_id"`
		OrderNumber   string  `json:"order_number"`
		Amount        float64 `json:"amount"`
		Status        string  `json:"status"`
		TransactionID string  `json:"transaction_id"`
		PaymentID     string  `json:"payment_id"`
	}
	if err := json.Unmarshal(bodyBytes, &rawPayload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid JSON webhook payload"})
		return
	}

	var targetOrder models.Order
	found := false

	if config.DB != nil && config.IsConnected {
		err := config.DB.QueryRow("SELECT id, order_number, total_amount, payment_status FROM orders WHERE id = ? OR order_number = ?", rawPayload.OrderID, rawPayload.OrderNumber).
			Scan(&targetOrder.ID, &targetOrder.OrderNumber, &targetOrder.TotalAmount, &targetOrder.PaymentStatus)
		if err == nil {
			found = true
		}
	}

	if !found {
		for _, o := range inMemoryOrders {
			if o.ID == rawPayload.OrderID || o.OrderNumber == rawPayload.OrderNumber {
				targetOrder = o
				found = true
				break
			}
		}
	}

	if !found {
		targetOrder = models.Order{
			ID:            rawPayload.OrderID,
			OrderNumber:   rawPayload.OrderNumber,
			TotalAmount:   rawPayload.Amount,
			PaymentStatus: "PENDING",
		}
	}

	provider := payment.GetPaymentProvider()
	result, err := provider.ProcessWebhook(bodyBytes, signature, &targetOrder)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	txnID := result.TransactionID
	if txnID == "" {
		txnID = rawPayload.PaymentID
	}
	if txnID == "" {
		txnID = fmt.Sprintf("TXN-WEBHOOK-%d", time.Now().Unix())
	}

	// Idempotency Check: Prevent duplicate webhook processing
	if result.IsIdempotent {
		c.JSON(http.StatusOK, gin.H{
			"success":       true,
			"is_idempotent": true,
			"message":       "Payment already processed idempotently.",
			"order_id":      result.OrderID,
			"status":        "SUCCESS",
		})
		return
	}

	if _, loaded := processedTransactions.LoadOrStore(txnID, true); loaded {
		c.JSON(http.StatusOK, gin.H{
			"success":       true,
			"is_idempotent": true,
			"message":       "Duplicate transaction ID detected. Ignored safely.",
			"order_id":      result.OrderID,
			"status":        "SUCCESS",
		})
		return
	}

	now := time.Now()
	billNum := fmt.Sprintf("BILL-%s-%03d", now.Format("20060102"), result.OrderID)

	// Database Transaction Update
	if config.DB != nil && config.IsConnected {
		tx, err := config.DB.Begin()
		if err == nil {
			tx.Exec("UPDATE orders SET payment_status = 'SUCCESS', order_status = 'Completed' WHERE id = ?", result.OrderID)
			tx.Exec("INSERT INTO payments (order_id, amount, payment_method, payment_status, transaction_id, created_at) VALUES (?, ?, 'UPI/QR', 'Success', ?, ?)",
				result.OrderID, result.Amount, txnID, now)
			tx.Exec("INSERT INTO bills (order_id, bill_number, total_amount, payment_transaction_id, generated_at, created_at) VALUES (?, ?, ?, ?, ?, ?)",
				result.OrderID, billNum, result.Amount, txnID, now, now)
			_ = tx.Commit()
		}
	}

	// Update Memory State
	for i, o := range inMemoryOrders {
		if o.ID == result.OrderID || o.OrderNumber == result.OrderNumber {
			inMemoryOrders[i].PaymentStatus = "SUCCESS"
			inMemoryOrders[i].OrderStatus = "Completed"
			if inMemoryOrders[i].BillNumber == "" {
				inMemoryOrders[i].BillNumber = billNum
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success":        true,
		"message":        "Merchant Webhook Verified & Processed Successfully",
		"order_id":       result.OrderID,
		"order_number":   result.OrderNumber,
		"bill_number":    billNum,
		"payment_status": "SUCCESS",
		"transaction_id": txnID,
	})
}

// POST /api/payments/verify-test
func VerifyTestPayment(c *gin.Context) {
	var payload struct {
		OrderID int     `json:"order_id"`
		Amount  float64 `json:"amount"`
		Status  string  `json:"status"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	if payload.OrderID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid order_id"})
		return
	}

	txnID := fmt.Sprintf("TXN-UPI-%d", time.Now().Unix())
	now := time.Now()
	billNum := fmt.Sprintf("BILL-%s-%03d", now.Format("20060102"), payload.OrderID)

	// Update Database Transaction
	if config.DB != nil && config.IsConnected {
		tx, err := config.DB.Begin()
		if err == nil {
			tx.Exec("UPDATE orders SET payment_status = 'SUCCESS', order_status = 'Completed' WHERE id = ?", payload.OrderID)
			tx.Exec("INSERT INTO payments (order_id, amount, payment_method, payment_status, transaction_id, created_at) VALUES (?, ?, 'UPI/QR', 'Success', ?, ?)",
				payload.OrderID, payload.Amount, txnID, now)
			tx.Exec("INSERT INTO bills (order_id, bill_number, total_amount, payment_transaction_id, generated_at, created_at) VALUES (?, ?, ?, ?, ?, ?)",
				payload.OrderID, billNum, payload.Amount, txnID, now, now)
			_ = tx.Commit()
		}
	}

	// Update In-Memory Cache
	for i, o := range inMemoryOrders {
		if o.ID == payload.OrderID {
			inMemoryOrders[i].PaymentStatus = "SUCCESS"
			inMemoryOrders[i].OrderStatus = "Completed"
			inMemoryOrders[i].BillNumber = billNum
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success":        true,
		"message":        "Payment verified and bill generated successfully",
		"order_id":       payload.OrderID,
		"bill_number":    billNum,
		"payment_status": "SUCCESS",
		"transaction_id": txnID,
	})
}

// GET /api/bills/:order_id OR /api/bills/order/:order_id
func GetBillByOrderID(c *gin.Context) {
	orderIDStr := c.Param("order_id")
	if orderIDStr == "" {
		orderIDStr = c.Param("orderId")
	}
	orderID, _ := strconv.Atoi(orderIDStr)

	// Check DB if connected
	if config.DB != nil && config.IsConnected {
		var b models.Bill
		var paymentStatus string
		err := config.DB.QueryRow(`
			SELECT b.id, b.order_id, b.bill_number, b.total_amount, b.payment_transaction_id, b.generated_at, o.payment_status
			FROM bills b
			JOIN orders o ON b.order_id = o.id
			WHERE b.order_id = ? OR o.order_number = ?
		`, orderID, orderIDStr).Scan(&b.ID, &b.OrderID, &b.BillNumber, &b.TotalAmount, &b.PaymentTransactionID, &b.GeneratedAt, &paymentStatus)

		if err == nil {
			if paymentStatus != "SUCCESS" && paymentStatus != "Completed" {
				c.JSON(http.StatusBadRequest, gin.H{
					"success": false,
					"error":   "Payment Not Verified. Bills are generated ONLY after PAYMENT_STATUS = SUCCESS",
				})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"data":    b,
			})
			return
		}
	}

	// Memory fallback
	for _, o := range inMemoryOrders {
		if o.ID == orderID || o.OrderNumber == orderIDStr {
			if o.PaymentStatus != "SUCCESS" && o.PaymentStatus != "Completed" {
				c.JSON(http.StatusBadRequest, gin.H{
					"success": false,
					"error":   "Payment Not Verified. Bills are generated ONLY after PAYMENT_STATUS = SUCCESS",
				})
				return
			}

			billNum := o.BillNumber
			if billNum == "" {
				billNum = fmt.Sprintf("BILL-%s-%03d", time.Now().Format("20060102"), o.ID)
			}

			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"data": models.Bill{
					ID:                   o.ID,
					OrderID:              o.ID,
					BillNumber:           billNum,
					TotalAmount:          o.TotalAmount,
					PaymentTransactionID: fmt.Sprintf("TXN-UPI-%d", o.CreatedAt.Unix()),
					GeneratedAt:          o.CreatedAt,
					CreatedAt:            o.CreatedAt,
				},
			})
			return
		}
	}

	c.JSON(http.StatusNotFound, gin.H{
		"success": false,
		"error":   "Bill not found for order",
	})
}


