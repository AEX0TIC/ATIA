package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type AbuseIPDBService struct {
	apiKey string
	client *http.Client
}

func NewAbuseIPDBService(apiKey string) *AbuseIPDBService {
	return &AbuseIPDBService{
		apiKey: apiKey,
		client: &http.Client{Timeout: 30 * time.Second},
	}
}

func (a *AbuseIPDBService) AnalyzeIP(ip string) (map[string]interface{}, error) {
	if a.apiKey == "" {
		return map[string]interface{}{"error": "API key not configured"}, nil
	}

	url := fmt.Sprintf("https://api.abuseipdb.com/api/v2/check?ipAddress=%s&maxAgeInDays=90&verbose", ip)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Add("Key", a.apiKey)
	req.Header.Add("Accept", "application/json")

	resp, err := a.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}

	return result, nil
}
