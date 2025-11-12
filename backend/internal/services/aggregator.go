package services

import (
	"backend/internal/database"
	"backend/internal/models"
	"backend/internal/scoring"
	"sync"
	"time"
)

type Aggregator struct {
	vtService    *VirusTotalService
	otxService   *OTXService
	abuseService *AbuseIPDBService
	db           *database.MongoDB
}

func NewAggregator(vt *VirusTotalService, otx *OTXService, abuse *AbuseIPDBService, db *database.MongoDB) *Aggregator {
	return &Aggregator{
		vtService:    vt,
		otxService:   otx,
		abuseService: abuse,
		db:           db,
	}
}

func (a *Aggregator) AnalyzeIndicator(indicator, indicatorType string) (*models.ThreatIndicator, error) {
	var wg sync.WaitGroup
	var mu sync.Mutex
	sources := []models.SourceData{}

	// Fetch from VirusTotal
	wg.Add(1)
	go func() {
		defer wg.Done()
		var vtData map[string]interface{}
		var err error

		switch indicatorType {
		case "ip":
			vtData, err = a.vtService.AnalyzeIP(indicator)
		case "domain":
			vtData, err = a.vtService.AnalyzeDomain(indicator)
		case "hash":
			vtData, err = a.vtService.AnalyzeHash(indicator)
		case "url":
			vtData, err = a.vtService.AnalyzeURL(indicator)
		}

		if err == nil && vtData != nil {
			mu.Lock()
			sources = append(sources, models.SourceData{
				Name:      "VirusTotal",
				Verdict:   extractVerdict(vtData, "virustotal"),
				Score:     extractScore(vtData, "virustotal"),
				Details:   vtData,
				Timestamp: time.Now(),
			})
			mu.Unlock()
		}
	}()

	// Fetch from OTX
	wg.Add(1)
	go func() {
		defer wg.Done()
		var otxData map[string]interface{}
		var err error

		switch indicatorType {
		case "ip":
			otxData, err = a.otxService.AnalyzeIP(indicator)
		case "domain":
			otxData, err = a.otxService.AnalyzeDomain(indicator)
		case "hash":
			otxData, err = a.otxService.AnalyzeHash(indicator)
		case "url":
			otxData, err = a.otxService.AnalyzeURL(indicator)
		}

		if err == nil && otxData != nil {
			mu.Lock()
			sources = append(sources, models.SourceData{
				Name:      "AlienVault OTX",
				Verdict:   extractVerdict(otxData, "otx"),
				Score:     extractScore(otxData, "otx"),
				Details:   otxData,
				Timestamp: time.Now(),
			})
			mu.Unlock()
		}
	}()

	// Fetch from AbuseIPDB (only for IPs)
	if indicatorType == "ip" {
		wg.Add(1)
		go func() {
			defer wg.Done()
			abuseData, err := a.abuseService.AnalyzeIP(indicator)
			if err == nil && abuseData != nil {
				mu.Lock()
				sources = append(sources, models.SourceData{
					Name:      "AbuseIPDB",
					Verdict:   extractVerdict(abuseData, "abuseipdb"),
					Score:     extractScore(abuseData, "abuseipdb"),
					Details:   abuseData,
					Timestamp: time.Now(),
				})
				mu.Unlock()
			}
		}()
	}

	wg.Wait()

	// Calculate risk score
	riskScore := scoring.CalculateRiskScore(sources)
	reputation := scoring.DetermineReputation(riskScore)

	threat := &models.ThreatIndicator{
		Indicator:   indicator,
		Type:        indicatorType,
		RiskScore:   riskScore,
		Reputation:  reputation,
		Sources:     sources,
		Metadata:    make(map[string]interface{}),
		FirstSeen:   time.Now(),
		LastUpdated: time.Now(),
		Tags:        extractTags(sources),
	}

	// Save to database
	if err := a.db.SaveThreat(threat); err != nil {
		return threat, err
	}

	return threat, nil
}

func extractVerdict(data map[string]interface{}, source string) string {
	// Implement verdict extraction logic based on source
	switch source {
	case "virustotal":
		if data, ok := data["data"].(map[string]interface{}); ok {
			if attrs, ok := data["attributes"].(map[string]interface{}); ok {
				if stats, ok := attrs["last_analysis_stats"].(map[string]interface{}); ok {
					malicious := stats["malicious"].(float64)
					if malicious > 0 {
						return "malicious"
					}
				}
			}
		}
	case "abuseipdb":
		if data, ok := data["data"].(map[string]interface{}); ok {
			if score, ok := data["abuseConfidenceScore"].(float64); ok {
				if score > 75 {
					return "malicious"
				} else if score > 25 {
					return "suspicious"
				}
			}
		}
	}
	return "clean"
}

func extractScore(data map[string]interface{}, source string) float64 {
	// Implement score extraction logic based on source
	switch source {
	case "virustotal":
		if data, ok := data["data"].(map[string]interface{}); ok {
			if attrs, ok := data["attributes"].(map[string]interface{}); ok {
				if stats, ok := attrs["last_analysis_stats"].(map[string]interface{}); ok {
					malicious := stats["malicious"].(float64)
					total := malicious + stats["harmless"].(float64) + stats["suspicious"].(float64)
					if total > 0 {
						return (malicious / total) * 100
					}
				}
			}
		}
	case "abuseipdb":
		if data, ok := data["data"].(map[string]interface{}); ok {
			if score, ok := data["abuseConfidenceScore"].(float64); ok {
				return score
			}
		}
	}
	return 0.0
}

func extractTags(sources []models.SourceData) []string {
	tags := make(map[string]bool)
	for _, source := range sources {
		tags[source.Verdict] = true
	}

	result := []string{}
	for tag := range tags {
		result = append(result, tag)
	}
	return result
}
