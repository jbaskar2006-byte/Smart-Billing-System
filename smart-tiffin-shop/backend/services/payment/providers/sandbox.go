package providers

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/url"
	"smart-tiffin-shop-backend/models"
)

type SandboxProvider struct {
	MerchantID    string
	MerchantVPA   string
	WebhookSecret string
}

func NewSandboxProvider(merchantID, merchantVPA, webhookSecret string) *SandboxProvider {
	if merchantVPA == "" {
		merchantVPA = "sandhiyasri1531996@okaxis"
	}
	return &SandboxProvider{
		MerchantID:    merchantID,
		MerchantVPA:   merchantVPA,
		WebhookSecret: webhookSecret,
	}
}

func (s *SandboxProvider) GetProviderName() string {
	return "Sandbox Merchant Payment Gateway"
}

func (s *SandboxProvider) CreatePayment(order *models.Order) (*PaymentOrderResponseHelper, error) {
	merchantName := "SRI LAKSHMI TIFFIN CENTER"
	formattedAmount := fmt.Sprintf("%.2f", order.TotalAmount)
	
	upiIntent := fmt.Sprintf("upi://pay?pa=%s&pn=%s&am=%s&cu=INR&tn=%s",
		s.MerchantVPA,
		url.QueryEscape(merchantName),
		formattedAmount,
		url.QueryEscape(order.OrderNumber),
	)

	qrImageURL := fmt.Sprintf("https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=10&data=%s",
		url.QueryEscape(upiIntent),
	)

	return &PaymentOrderResponseHelper{
		OrderID:       order.ID,
		OrderNumber:   order.OrderNumber,
		Amount:        order.TotalAmount,
		Currency:      "INR",
		DynamicQRUrl:  qrImageURL,
		UPIIntentURI:  upiIntent,
		PaymentStatus: "PENDING",
		ProviderName:  s.GetProviderName(),
	}, nil
}

func (s *SandboxProvider) GetPaymentStatus(orderID string) (*PaymentStatusResponseHelper, error) {
	return &PaymentStatusResponseHelper{
		Success:       true,
		OrderID:       0,
		OrderNumber:   orderID,
		PaymentStatus: "PENDING",
		Message:       "Sandbox polling payment status",
	}, nil
}

func (s *SandboxProvider) ProcessWebhook(payload []byte, signature string, order *models.Order) (*WebhookResultHelper, error) {
	// 1. Verify HMAC-SHA256 signature if secret is present
	if s.WebhookSecret != "" && signature != "" {
		mac := hmac.New(sha256.New, []byte(s.WebhookSecret))
		mac.Write(payload)
		expectedSig := hex.EncodeToString(mac.Sum(nil))

		if !hmac.Equal([]byte(signature), []byte(expectedSig)) {
			return nil, fmt.Errorf("invalid HMAC signature validation failed")
		}
	}

	var data WebhookPayloadHelper
	if err := json.Unmarshal(payload, &data); err != nil {
		return nil, fmt.Errorf("invalid JSON webhook payload: %v", err)
	}

	// 2. Check Idempotency (Prevent duplicate payment processing & duplicate bills)
	if order.PaymentStatus == "SUCCESS" || order.PaymentStatus == "Completed" {
		return &WebhookResultHelper{
			Success:      true,
			OrderID:      order.ID,
			OrderNumber:  order.OrderNumber,
			Amount:       order.TotalAmount,
			Status:       "SUCCESS",
			IsIdempotent: true,
			Message:      "Idempotent: Order payment is already completed. Duplicate processing ignored.",
		}, nil
	}

	// 3. Amount matching check
	if data.Amount <= 0 || (order.TotalAmount > 0 && data.Amount != order.TotalAmount) {
		return nil, fmt.Errorf("payment amount mismatch: received %.2f, expected %.2f", data.Amount, order.TotalAmount)
	}

	// 4. Status check
	if data.Status != "SUCCESS" && data.Status != "Completed" {
		return nil, fmt.Errorf("payment status is not SUCCESS (received %s)", data.Status)
	}

	return &WebhookResultHelper{
		Success:       true,
		OrderID:       order.ID,
		OrderNumber:   order.OrderNumber,
		Amount:        data.Amount,
		TransactionID: data.TransactionID,
		Status:        "SUCCESS",
		IsIdempotent:  false,
		Message:       "Sandbox payment webhook validated successfully",
	}, nil
}

// Helpers for providers package
type PaymentOrderResponseHelper struct {
	OrderID       int     `json:"order_id"`
	OrderNumber   string  `json:"order_number"`
	Amount        float64 `json:"amount"`
	Currency      string  `json:"currency"`
	DynamicQRUrl  string  `json:"dynamic_qr_url"`
	UPIIntentURI  string  `json:"upi_intent_uri"`
	PaymentStatus string  `json:"payment_status"`
	ProviderName  string  `json:"provider_name"`
}

type PaymentStatusResponseHelper struct {
	Success       bool    `json:"success"`
	OrderID       int     `json:"order_id"`
	OrderNumber   string  `json:"order_number"`
	Amount        float64 `json:"amount"`
	PaymentStatus string  `json:"payment_status"`
	TransactionID string  `json:"transaction_id"`
	BillNumber    string  `json:"bill_number,omitempty"`
	Message       string  `json:"message"`
}

type WebhookResultHelper struct {
	Success       bool    `json:"success"`
	OrderID       int     `json:"order_id"`
	OrderNumber   string  `json:"order_number"`
	Amount        float64 `json:"amount"`
	TransactionID string  `json:"transaction_id"`
	Status        string  `json:"status"`
	IsIdempotent  bool    `json:"is_idempotent"`
	Message       string  `json:"message"`
}

type WebhookPayloadHelper struct {
	OrderID       int     `json:"order_id"`
	OrderNumber   string  `json:"order_number"`
	Amount        float64 `json:"amount"`
	TransactionID string  `json:"transaction_id"`
	PaymentID     string  `json:"payment_id"`
	Status        string  `json:"status"`
}
