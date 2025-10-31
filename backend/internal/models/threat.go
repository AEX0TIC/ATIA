package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ThreatIndicator struct {
	ID          primitive.ObjectID     `bson:"_id,omitempty" json:"id"`
	Indicator   string                 `bson:"indicator" json:"indicator"`
	Type        string                 `bson:"type" json:"type"` // "ip", "domain", "hash", "url"
	RiskScore   float64                `bson:"risk_score" json:"risk_score"`
	Reputation  string                 `bson:"reputation" json:"reputation"` // "malicious", "suspicious", "clean"
	Sources     []SourceData           `bson:"sources" json:"sources"`
	Metadata    map[string]interface{} `bson:"metadata" json:"metadata"`
	FirstSeen   time.Time              `bson:"first_seen" json:"first_seen"`
	LastUpdated time.Time              `bson:"last_updated" json:"last_updated"`
	Tags        []string               `bson:"tags" json:"tags"`
}

type SourceData struct {
	Name      string                 `bson:"name" json:"name"`
	Verdict   string                 `bson:"verdict" json:"verdict"`
	Score     float64                `bson:"score" json:"score"`
	Details   map[string]interface{} `bson:"details" json:"details"`
	Timestamp time.Time              `bson:"timestamp" json:"timestamp"`
}

type AnalysisRequest struct {
	Indicator string `json:"indicator" binding:"required"`
	Type      string `json:"type" binding:"required"`
}

type AnalysisResponse struct {
	Success bool             `json:"success"`
	Data    *ThreatIndicator `json:"data,omitempty"`
	Error   string           `json:"error,omitempty"`
}

type HistoricalData struct {
	Indicator string            `json:"indicator"`
	History   []ThreatIndicator `json:"history"`
}
