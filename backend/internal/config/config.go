package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port          		string
	MongoURI      		string
	DatabaseName  		string
	VirusTotalAPIKey	string 
	OTXAPIKey 			string
	AbuseIPDBAPIKey		string 
}

func Loadconfig() (*Config, error) {
	_ = godotenv.Load()

	cfg := &Config{
		Port: 				getEnv("PORT", "8080"),
		MongoURI: 			getEnv("MONGO_URI","mongodb://localhost:27017")
		DatabaseName: 		getEnv("DATABASE_NAME", "atia")
		VirusTotalAPIKey: 	getEnv("VIRUSTOTAL_API_KEY", " ")
		OTXAPIKey: 			getEnv("OTX_API_KEY", " ")
		AbuseIPDBAPIKey:   	getEnv("ABUSEIPDB", " ")
	}

	return cfg, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value!= "" {
		return value 
	}
	return defaultValue	
}