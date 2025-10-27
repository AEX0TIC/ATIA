package services

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type VirusTotalService struct {
	apiKey string
	client *http.Client
}

func NewVirusTotalService(apiKey string) *VirusTotalService {
	return &VirusTotalService{
		apiKey: apiKey,
		client: &http.Client{},
	}
}

func (s *VirusTotalService) AnalyzeIP(ip string) (float64, error) {
	url := fmt.Sprintf("https://www.virustotal.com/api/v3/ip_addresses/%s", ip)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return 0, err
	}

	req.Header.Add("x-apikey", s.apiKey)

	resp, err := s.client.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("API request failed with status: %d", resp.StatusCode)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0, err
	}

	// Calculate reputation score (implement your scoring logic here)
	// This is a simplified example
	maliciousCount := 0.0
	totalCount := 0.0

	if data, ok := result["data"].(map[string]interface{}); ok {
		if attrs, ok := data["attributes"].(map[string]interface{}); ok {
			if stats, ok := attrs["last_analysis_stats"].(map[string]interface{}); ok {
				if mal, ok := stats["malicious"].(float64); ok {
					maliciousCount = mal
				}
				for _, v := range stats {
					if count, ok := v.(float64); ok {
						totalCount += count
					}
				}
			}
		}
	}

	if totalCount == 0 {
		return 0, nil
	}

	score := 1 - (maliciousCount / totalCount)
	return score, nil
}
