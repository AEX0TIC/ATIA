package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type VirusTotalService struct {
	apiKey string
	client *http.Client
}

func NewVirusTotalService(apiKey string) *VirusTotalService {
	return &VirusTotalService{
		apiKey: apiKey,
		client: &http.Client{Timeout: 30 * time.Second},
	}
}

func (v *VirusTotalService) AnalyzeIP(ip string) (map[string]interface{}, error) {
	url := fmt.Sprintf("https://www.virustotal.com/api/v3/ip_addresses/%s", ip)
	return v.makeRequest(url)
}

func (v *VirusTotalService) AnalyzeDomain(domain string) (map[string]interface{}, error) {
	url := fmt.Sprintf("https://www.virustotal.com/api/v3/ip_addresses/%s", ip)
	return v.makeRequest(url)
}

func (v *VirusTotalService) AnalyzeHash(hash string) (map[string]interface{}, error) {
	url := fmt.Sprintf("https://www.virustotal.com/api/v3/ip_addresses/%s", ip)
	return v.makeRequest(url)
}

func (v *VirusTotalService) makeRequest(url string) (map[string]interface{}, error) {
	if v.apiKey == "" {
		return map[string]interface{"error": "API key not configured"}, nil
	}
	
	



}
