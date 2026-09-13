package payment

import "smart-tiffin-shop-backend/models"

type PaymentOrderResponse struct {
	OrderID       int     `json:"order_id"`
	OrderNumber   string  `json:"order_number"`
	Amount        float64 `json:"amount"`
	Currency      string  `json:"currency"`
	DynamicQRUrl  string  `json:"dynamic_qr_url"`
	UPIIntentURI  string  `json:"upi_intent_uri"`
	PaymentStatus string  `json:"payment_status"`
	ProviderName  string  `json:"provider_name"`
}

type PaymentStatusResponse struct {
	Success       bool    `json:"success"`
	OrderID       int     `json:"order_id"`
	OrderNumber   string  `json:"order_number"`
	Amount        float64 `json:"amount"`
	PaymentStatus string  `json:"payment_status"`
	TransactionID string  `json:"transaction_id"`
	BillNumber    string  `json:"bill_number,omitempty"`
	Message       string  `json:"message"`
}

type WebhookResult struct {
	Success       bool    `json:"success"`
	OrderID       int     `json:"order_id"`
	OrderNumber   string  `json:"order_number"`
	Amount        float64 `json:"amount"`
	TransactionID string  `json:"transaction_id"`
	Status        string  `json:"status"`
	IsIdempotent  bool    `json:"is_idempotent"`
	Message       string  `json:"message"`
}

type WebhookPayload struct {
	OrderID       int     `json:"order_id"`
	OrderNumber   string  `json:"order_number"`
	Amount        float64 `json:"amount"`
	TransactionID string  `json:"transaction_id"`
	PaymentID     string  `json:"payment_id"`
	Status        string  `json:"status"`
}

// PaymentProvider is the clean interface abstraction for Merchant Payment Gateways
type PaymentProvider interface {
	GetProviderName() string
	CreatePayment(order *models.Order) (*PaymentOrderResponse, error)
	GetPaymentStatus(orderID string) (*PaymentStatusResponse, error)
	ProcessWebhook(payload []byte, signature string, targetOrder *models.Order) (*WebhookResult, error)
}
