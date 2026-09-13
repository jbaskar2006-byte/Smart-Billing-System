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

type PhonePeProvider struct {
	MerchantID    string
	SaltKey       string
	SaltIndex     string
	WebhookSecret string
	MerchantVPA   string
}

func NewPhonePeProvider(merchantID, saltKey, saltIndex, webhookSecret, merchantVPA string) *PhonePeProvider {
	if merchantVPA == "" {
		merchantVPA = "sandhiyasri1531996@okaxis"
	}
	return &PhonePeProvider{
		MerchantID:    merchantID,
		SaltKey:       saltKey,
		SaltIndex:     saltIndex,
		WebhookSecret: webhookSecret,
		MerchantVPA:   merchantVPA,
	}
}

func (p *PhonePeProvider) GetProviderName() string {
	return "PhonePe Merchant Payment Gateway"
}

func (p *PhonePeProvider) CreatePayment(order *models.Order) (*PaymentOrderResponseHelper, error) {
	merchantName := "SRI LAKSHMI TIFFIN CENTER"
	formattedAmount := fmt.Sprintf("%.2f", order.TotalAmount)
	
	upiIntent := fmt.Sprintf("upi://pay?pa=%s&pn=%s&am=%s&cu=INR&tn=%s",
		p.MerchantVPA,
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
		ProviderName:  p.GetProviderName(),
	}, nil
}

func (p *PhonePeProvider) GetPaymentStatus(orderID string) (*PaymentStatusResponseHelper, error) {
	return &PaymentStatusResponseHelper{
		Success:       true,
		OrderNumber:   orderID,
		PaymentStatus: "PENDING",
		Message:       "PhonePe status query initialized",
	}, nil
}

func (p *PhonePeProvider) ProcessWebhook(payload []byte, signature string, order *models.Order) (*WebhookResultHelper, error) {
	if p.WebhookSecret != "" && signature != "" {
		mac := hmac.New(sha256.New, []byte(p.WebhookSecret))
		mac.Write(payload)
		expectedSig := hex.EncodeToString(mac.Sum(nil))

		if !hmac.Equal([]byte(signature), []byte(expectedSig)) {
			return nil, fmt.Errorf("PhonePe X-VERIFY signature verification failed")
		}
	}

	var data WebhookPayloadHelper
	if err := json.Unmarshal(payload, &data); err != nil {
		return nil, fmt.Errorf("invalid PhonePe JSON webhook payload: %v", err)
	}

	if order.PaymentStatus == "SUCCESS" || order.PaymentStatus == "Completed" {
		return &WebhookResultHelper{
			Success:      true,
			OrderID:      order.ID,
			OrderNumber:  order.OrderNumber,
			Amount:       order.TotalAmount,
			Status:       "SUCCESS",
			IsIdempotent: true,
			Message:      "Idempotent: PhonePe payment already processed.",
		}, nil
	}

	if data.Amount <= 0 || (order.TotalAmount > 0 && data.Amount != order.TotalAmount) {
		return nil, fmt.Errorf("PhonePe amount mismatch: received %.2f, expected %.2f", data.Amount, order.TotalAmount)
	}

	return &WebhookResultHelper{
		Success:       true,
		OrderID:       order.ID,
		OrderNumber:   order.OrderNumber,
		Amount:        data.Amount,
		TransactionID: data.TransactionID,
		Status:        "SUCCESS",
		IsIdempotent:  false,
		Message:       "PhonePe payment verified successfully",
	}, nil
}
