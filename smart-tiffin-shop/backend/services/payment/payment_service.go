package payment

import (
	"log"
	"os"
	"smart-tiffin-shop-backend/models"
	"smart-tiffin-shop-backend/services/payment/providers"
)

var activeProvider PaymentProvider

type ProviderWrapper struct {
	Name     string
	Provider interface {
		GetProviderName() string
		CreatePayment(order *models.Order) (*providers.PaymentOrderResponseHelper, error)
		GetPaymentStatus(orderID string) (*providers.PaymentStatusResponseHelper, error)
		ProcessWebhook(payload []byte, signature string, order *models.Order) (*providers.WebhookResultHelper, error)
	}
}

func (w *ProviderWrapper) GetProviderName() string {
	return w.Provider.GetProviderName()
}

func (w *ProviderWrapper) CreatePayment(order *models.Order) (*PaymentOrderResponse, error) {
	res, err := w.Provider.CreatePayment(order)
	if err != nil {
		return nil, err
	}
	return &PaymentOrderResponse{
		OrderID:       res.OrderID,
		OrderNumber:   res.OrderNumber,
		Amount:        res.Amount,
		Currency:      res.Currency,
		DynamicQRUrl:  res.DynamicQRUrl,
		UPIIntentURI:  res.UPIIntentURI,
		PaymentStatus: res.PaymentStatus,
		ProviderName:  res.ProviderName,
	}, nil
}

func (w *ProviderWrapper) GetPaymentStatus(orderID string) (*PaymentStatusResponse, error) {
	res, err := w.Provider.GetPaymentStatus(orderID)
	if err != nil {
		return nil, err
	}
	return &PaymentStatusResponse{
		Success:       res.Success,
		OrderID:       res.OrderID,
		OrderNumber:   res.OrderNumber,
		Amount:        res.Amount,
		PaymentStatus: res.PaymentStatus,
		TransactionID: res.TransactionID,
		BillNumber:    res.BillNumber,
		Message:       res.Message,
	}, nil
}

func (w *ProviderWrapper) ProcessWebhook(payload []byte, signature string, targetOrder *models.Order) (*WebhookResult, error) {
	res, err := w.Provider.ProcessWebhook(payload, signature, targetOrder)
	if err != nil {
		return nil, err
	}
	return &WebhookResult{
		Success:       res.Success,
		OrderID:       res.OrderID,
		OrderNumber:   res.OrderNumber,
		Amount:        res.Amount,
		TransactionID: res.TransactionID,
		Status:        res.Status,
		IsIdempotent:  res.IsIdempotent,
		Message:       res.Message,
	}, nil
}

func InitPaymentService() PaymentProvider {
	providerType := getEnv("PAYMENT_PROVIDER", "sandbox")
	keyID := getEnv("PAYMENT_KEY_ID", getEnv("MERCHANT_KEY", "test_key_123"))
	keySecret := getEnv("PAYMENT_KEY_SECRET", "test_secret_456")
	webhookSecret := getEnv("WEBHOOK_SECRET", "test_webhook_secret_789")
	merchantID := getEnv("MERCHANT_ID", "test_merchant_123")
	merchantVPA := getEnv("MERCHANT_VPA", "sandhiyasri1531996@okaxis")

	log.Printf("[PAYMENT SERVICE] Initializing Payment Provider: %s (Merchant: %s)", providerType, merchantID)

	switch providerType {
	case "razorpay":
		rzp := providers.NewRazorpayProvider(keyID, keySecret, webhookSecret, merchantVPA)
		activeProvider = &ProviderWrapper{Name: "razorpay", Provider: rzp}
	case "phonepe":
		ppe := providers.NewPhonePeProvider(merchantID, keyID, "1", webhookSecret, merchantVPA)
		activeProvider = &ProviderWrapper{Name: "phonepe", Provider: ppe}
	default:
		sb := providers.NewSandboxProvider(merchantID, merchantVPA, webhookSecret)
		activeProvider = &ProviderWrapper{Name: "sandbox", Provider: sb}
	}

	return activeProvider
}

func GetPaymentProvider() PaymentProvider {
	if activeProvider == nil {
		return InitPaymentService()
	}
	return activeProvider
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return fallback
}
