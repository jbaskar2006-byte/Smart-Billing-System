package models

import "time"

// Product represents a menu food item
type Product struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Price     float64   `json:"price"`
	Category  string    `json:"category"`
	Available bool      `json:"available"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateProductRequest struct {
	Name      string  `json:"name" binding:"required"`
	Price     float64 `json:"price" binding:"required"`
	Category  string  `json:"category"`
	Available *bool   `json:"available"`
}

// Order represents a shop customer bill order
type Order struct {
	ID            int         `json:"id"`
	OrderNumber   string      `json:"order_number"`
	BillNumber    string      `json:"bill_number,omitempty"`
	TotalAmount   float64     `json:"total_amount"`
	PaymentStatus string      `json:"payment_status"` // PENDING, PROCESSING, SUCCESS, FAILED, EXPIRED
	OrderStatus   string      `json:"order_status"`   // Received, Preparing, Served, Completed
	CreatedAt     time.Time   `json:"created_at"`
	Items         []OrderItem `json:"items,omitempty"`
}

// OrderItem represents individual items inside an order
type OrderItem struct {
	ID          int     `json:"id"`
	OrderID     int     `json:"order_id"`
	ProductID   int     `json:"product_id"`
	ProductName string  `json:"product_name"`
	Price       float64 `json:"price"`
	Quantity    int     `json:"quantity"`
	Subtotal    float64 `json:"subtotal"`
}

// Payment represents transaction payments
type Payment struct {
	ID            int       `json:"id"`
	OrderID       int       `json:"order_id"`
	Amount        float64   `json:"amount"`
	PaymentMethod string    `json:"payment_method"`
	PaymentStatus string    `json:"payment_status"`
	TransactionID string    `json:"transaction_id"`
	CreatedAt     time.Time `json:"created_at"`
}

// Bill represents a generated shop bill record
type Bill struct {
	ID                   int       `json:"id"`
	OrderID              int       `json:"order_id"`
	BillNumber           string    `json:"bill_number"`
	TotalAmount          float64   `json:"total_amount"`
	PaymentTransactionID string    `json:"payment_transaction_id"`
	GeneratedAt          time.Time `json:"generated_at"`
	CreatedAt            time.Time `json:"created_at"`
}

// Admin represents admin users
type Admin struct {
	ID           int       `json:"id"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
