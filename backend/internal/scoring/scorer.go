package scoring

import (
	"github.com/AEX0TIC/ATIA/backend/internal/models"
)

type Scorer struct {
	weights map[string]float64
}

func NewScorer() *Scorer {
	return &Scorer{
		weights: map[string]float64{
			"virustotal": 0.4,
			"otx":        0.3,
			"abuseipdb":  0.3,
		},
	}
}

func (s *Scorer) CalculateFinalScore(scores models.ThreatScore) float64 {
	finalScore := (scores.VirusTotal * s.weights["virustotal"]) +
		(scores.OTX * s.weights["otx"]) +
		(scores.AbuseIPDB * s.weights["abuseipdb"])

	return finalScore
}

func (s *Scorer) SetWeights(weights map[string]float64) {
	s.weights = weights
}
