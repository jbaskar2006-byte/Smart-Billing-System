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

type RazorpayProvider struct {
	KeyID         string
	KeySecret     string
	WebhookSecret string
	MerchantVPA   string
}

func NewRazorpayProvider(keyID, keySecret, webhookSecret, merchantVPA string) *RazorpayProvider {
	if merchantVPA == "" {
		merchantVPA = "sandhiyasri1531996@okaxis"
	}
	return &RazorpayProvider{
		KeyID:         keyID,
		KeySecret:     keySecret,
		WebhookSecret: webhookSecret,
		MerchantVPA:   merchantVPA,
	}
}

func (r *RazorpayProvider) GetProviderName() string {
	return "Razorpay Merchant Payment Gateway"
}

func (r *RazorpayProvider) CreatePayment(order *models.Order) (*PaymentOrderResponseHelper, error) {
	merchantName := "SRI LAKSHMI TIFFIN CENTER"
	formattedAmount := fmt.Sprintf("%.2f", order.TotalAmount)
	
	upiIntent := fmt.Sprintf("upi://pay?pa=%s&pn=%s&am=%s&cu=INR&tn=%s",
		r.MerchantVPA,
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
		ProviderName:  r.GetProviderName(),
	}, nil
}

func (r *RazorpayProvider) GetPaymentStatus(orderID string) (*PaymentStatusResponseHelper, error) {
	return &PaymentStatusResponseHelper{
		Success:       true,
		OrderNumber:   orderID,
		PaymentStatus: "PENDING",
		Message:       "Razorpay status query initialized",
	}, nil
}

func (r *RazorpayProvider) ProcessWebhook(payload []byte, signature string, order *models.Order) (*WebhookResultHelper, error) {
	if r.WebhookSecret != "" && signature != "" {
		mac := hmac.New(sha256.New, []byte(r.WebhookSecret))
		mac.Write(payload)
		expectedSig := hex.EncodeToString(mac.Sum(nil))

		if !hmac.Equal([]byte(signature), []byte(expectedSig)) {
			return nil, fmt.Errorf("Razorpay HMAC signature verification failed")
		}
	}

	var data WebhookPayloadHelper
	if err := json.Unmarshal(payload, &data); err != nil {
		return nil, fmt.Errorf("invalid Razorpay JSON webhook payload: %v", err)
	}

	if order.PaymentStatus == "SUCCESS" || order.PaymentStatus == "Completed" {
		return &WebhookResultHelper{
			Success:      true,
			OrderID:      order.ID,
			OrderNumber:  order.OrderNumber,
			Amount:       order.TotalAmount,
			Status:       "SUCCESS",
			IsIdempotent: true,
			Message:      "Idempotent: Razorpay payment already processed.",
		}, nil
	}

	if data.Amount <= 0 || (order.TotalAmount > 0 && data.Amount != order.TotalAmount) {
		return nil, fmt.Errorf("Razorpay amount mismatch: received %.2f, expected %.2f", data.Amount, order.TotalAmount)
	}

	return &WebhookResultHelper{
		Success:       true,
		OrderID:       order.ID,
		OrderNumber:   order.OrderNumber,
		Amount:        data.Amount,
		TransactionID: data.TransactionID,
		Status:        "SUCCESS",
		IsIdempotent:  false,
		Message:       "Razorpay payment verified successfully",
	}, nil
}
