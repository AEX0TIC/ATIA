package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type OTXService struct {
	apiKey string
	client *http.Client
}

func NewOTXService(apiKey string) *OTXService {
	return &OTXService{
		apiKey: apiKey,
		client: &http.Client{Timeout: 30 * time.Second},
	}
}

func (o *OTXService) AnalyzeIP(ip string) (map[string]interface{}, error) {
	url := fmt.Sprintf("https://otx.alienvault.com/api/v1/indicators/IPv4/%s/general", ip)
	return o.makeRequest(url)
}

func (o *OTXService) AnalyzeDomain(domain string) (map[string]interface{}, error) {
	url := fmt.Sprintf("https://otx.alienvault.com/api/v1/indicators/domain/%s/general", domain)
	return o.makeRequest(url)
}

func (o *OTXService) AnalyzeHash(hash string) (map[string]interface{}, error) {
	url := fmt.Sprintf("https://otx.alienvault.com/api/v1/indicators/file/%s/general", hash)
	return o.makeRequest(url)
}

func (o *OTXService) AnalyzeURL(urlToCheck string) (map[string]interface{}, error) {
	url := fmt.Sprintf("https://otx.alienvault.com/api/v1/indicators/url/%s/general", urlToCheck)
	return o.makeRequest(url)
}

func (o *OTXService) makeRequest(url string) (map[string]interface{}, error) {
	if o.apiKey == "" {
		return map[string]interface{}{"error": "API key not configured"}, nil
	}

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Add("X-OTX-API-KEY", o.apiKey)

	resp, err := o.client.Do(req)
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
