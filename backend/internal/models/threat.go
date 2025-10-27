package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ThreatType string

const (
	ThreatTypeIP     ThreatType = "ip"
	ThreatTypeDomain ThreatType = "domain"
	ThreatTypeURL    ThreatType = "url"
	ThreatTypeHash   ThreatType = "hash"
)

type Threat struct {
	ID          primitive.ObjectID     `bson:"_id,omitempty" json:"id"`
	Type        ThreatType             `bson:"type" json:"type"`
	Indicator   string                 `bson:"indicator" json:"indicator"`
	Score       float64                `bson:"score" json:"score"`
	Sources     []string               `bson:"sources" json:"sources"`
	LastUpdated time.Time              `bson:"last_updated" json:"last_updated"`
	Metadata    map[string]interface{} `bson:"metadata" json:"metadata"`
	CreatedAt   time.Time              `bson:"created_at" json:"created_at"`
}

type ThreatScore struct {
	VirusTotal float64 `json:"virus_total"`
	OTX        float64 `json:"otx"`
	AbuseIPDB  float64 `json:"abuse_ipdb"`
	Final      float64 `json:"final"`
}
