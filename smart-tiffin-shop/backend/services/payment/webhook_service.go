package payment

import (
	"smart-tiffin-shop-backend/models"
)

type WebhookService struct {
	provider PaymentProvider
}

func NewWebhookService(provider PaymentProvider) *WebhookService {
	return &WebhookService{provider: provider}
}

func (s *WebhookService) HandleWebhook(payload []byte, signature string, targetOrder *models.Order) (*WebhookResult, error) {
	if s.provider == nil {
		s.provider = GetPaymentProvider()
	}
	return s.provider.ProcessWebhook(payload, signature, targetOrder)
}
