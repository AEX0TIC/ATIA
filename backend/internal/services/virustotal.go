package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"io"
	"time"
)

type VirusTotalService struct {
	apiKey string 
	client *http.Client
}

func NewVirusTotalService