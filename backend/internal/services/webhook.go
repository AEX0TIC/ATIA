package services

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"time"

	"github.com/AEX0TIC/ATIA/backend/internal/models"
)

type WebhookService struct {
	n8nWebhookURL string
	client        *http.Client
}

type WebhookPayload struct {
	EventType     string                  `json:"event_type"`
	Timestamp     time.Time               `json:"timestamp"`
	Threat        *models.ThreatIndicator `json:"threat"`
	RiskSeverity  string                  `json:"risk_severity"`
	SourcesCount  int                     `json:"sources_count"`
	MaliciousVote int                     `json:"malicious_vote"`
}

func NewWebhookService(n8nWebhookURL string) *WebhookService {
	return &WebhookService{
		n8nWebhookURL: n8nWebhookURL,
		client:        &http.Client{Timeout: 10 * time.Second},
	}
}

func (w *WebhookService) TriggerThreatAnalysis(threat *models.ThreatIndicator) error {
	if w.n8nWebhookURL == "" {
		return nil // Skip if no webhook configured
	}

	// Determine severity
	severity := "low"
	if threat.RiskScore > 70 {
		severity = "critical"
	} else if threat.RiskScore > 50 {
		severity = "high"
	} else if threat.RiskScore > 30 {
		severity = "medium"
	}

	// Count malicious verdicts
	maliciousCount := 0
	for _, source := range threat.Sources {
		if source.Verdict == "malicious" {
			maliciousCount++
		}
	}

	payload := WebhookPayload{
		EventType:     "threat_analyzed",
		Timestamp:     time.Now(),
		Threat:        threat,
		RiskSeverity:  severity,
		SourcesCount:  len(threat.Sources),
		MaliciousVote: maliciousCount,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", w.n8nWebhookURL, bytes.NewReader(body))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := w.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	// Read response to prevent resource leak
	io.ReadAll(resp.Body)

	return nil
}
