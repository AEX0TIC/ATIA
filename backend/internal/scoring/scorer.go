package scoring

import (
	"atia/internal/models"
	"math"
)

func CalculateRiskScore(sources []models.SourceData) float64 {
	if len(sources) == 0 {
		return 0.0
	}

	var totalScore float64
	var weights = map[string]float64{
		"VirusTotal":     0.4,
		"AlienVault OTX": 0.3,
		"AbuseIPDB":      0.3,
	}

	for _, source := range sources {
		weight := weights[source.Name]
		if weight == 0 {
			weight = 1.0 / float64(len(sources))
		}
		totalScore += source.Score * weight
	}

	return math.Min(totalScore, 100.0)
}

func DetermineReputation(riskScore float64) string {
	if riskScore >= 70 {
		return "malicious"
	} else if riskScore >= 40 {
		return "suspicious"
	} else if riskScore >= 10 {
		return "unknown"
	}
	return "clean"
}
