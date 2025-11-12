package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type VirusTotalService struct {
	apiKey string
	client *http.Client
}

func (v *VirusTotalService) AnalyzeURL(indicator string) (map[string]interface{}, error) {
	panic("unimplemented")
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
	url := fmt.Sprintf("https://www.virustotal.com/api/v3/domains/%s", domain)
	return v.makeRequest(url)
}

func (v *VirusTotalService) AnalyzeHash(hash string) (map[string]interface{}, error) {
	url := fmt.Sprintf("https://www.virustotal.com/api/v3/files/%s", hash)
	return v.makeRequest(url)
}

func (v *VirusTotalService) makeRequest(url string) (map[string]interface{}, error) {
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Add("x-apikey", v.apiKey)

	resp, err := v.client.Do(req)
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
