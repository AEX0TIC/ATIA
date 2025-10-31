package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ThreatIndicator struct {

 ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    Indicator   string             `bson:"indicator" json:"indicator"`
    Type        string             `bson:"type" json:"type"` // "ip", "domain", "hash", "url"
    RiskScore   float64            `bson:"risk_score" json:"risk_score"`
    Reputation  string             `bson:"reputation" json:"reputation"` // "malicious", "suspicious", "clean"
    Sources     []SourceData       `bson:"sources" json:"sources"`
    Metadata    map[string]interface{} `bson:"metadata" json:"metadata"`
    FirstSeen   time.Time          `bson:"first_seen" json:"first_seen"`
    LastUpdated time.Time          `bson:"last_updated" json:"last_updated"`
    Tags        []string           `bson:"tags" json:"tags"`

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
