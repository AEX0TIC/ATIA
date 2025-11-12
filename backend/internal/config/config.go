package config

import (
	"os"

	"github.com/joho/godotenv"
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
	_ = godotenv.Load()

	cfg := &Config{
		MongoURI:      os.Getenv("MONGODB_URI"),
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
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
