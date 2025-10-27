# ATIA - Automated Threat Intelligence Aggregator

ATIA is a comprehensive threat intelligence platform that aggregates and analyzes data from multiple sources including VirusTotal, OTX, and AbuseIPDB.

## Project Structure

```
atia/
├── backend/          # Go backend service
├── n8n/             # Workflow automation
└── grafana/         # Dashboards and visualization
```

## Prerequisites

- Go 1.19 or later
- Docker and Docker Compose
- MongoDB (run via Docker)
- n8n (run via Docker)
- Grafana (run via Docker)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/AEX0TIC/ATIA.git
cd ATIA
```

2. Copy the environment file:
```bash
cp backend/.env.example backend/.env
```

3. Update the environment variables in `backend/.env` with your API keys.

4. Start the services:
```bash
docker-compose up -d
```

## Services

- Backend API: http://localhost:8080
- n8n Dashboard: http://localhost:5678
- Grafana Dashboard: http://localhost:3000
- MongoDB: localhost:27017

## Development

1. Install Go dependencies:
```bash
cd backend
go mod download
```

2. Run the backend locally:
```bash
go run cmd/server/main.go
```

## License

MIT License