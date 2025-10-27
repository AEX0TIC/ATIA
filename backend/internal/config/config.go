package config

import (
	"errors"
	"os"
)

type Config struct {
	MongoURI      string
	MongoDatabase string
	APIKeys       APIKeys
	Server        ServerConfig
}

type APIKeys struct {
	VirusTotal string
	OTX        string
	AbuseIPDB  string
}

type ServerConfig struct {
	Port string
	Host string
}

func Load() (*Config, error) {
	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		return nil, errors.New("MONGODB_URI environment variable is required")
	}

	cfg := &Config{
		MongoURI:      mongoURI,
		MongoDatabase: getEnvOrDefault("MONGODB_DATABASE", "atia"),
		APIKeys: APIKeys{
			VirusTotal: os.Getenv("VIRUSTOTAL_API_KEY"),
			OTX:        os.Getenv("OTX_API_KEY"),
			AbuseIPDB:  os.Getenv("ABUSEIPDB_API_KEY"),
		},
		Server: ServerConfig{
			Port: getEnvOrDefault("SERVER_PORT", "8080"),
			Host: getEnvOrDefault("SERVER_HOST", "0.0.0.0"),
		},
	}

	return cfg, nil
}

func getEnvOrDefault(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
