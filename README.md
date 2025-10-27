# ATIA (Automated Threat Intelligence Aggregator)

ATIA is a comprehensive threat intelligence platform that aggregates and analyzes data from multiple sources including VirusTotal, OTX, and AbuseIPDB. It provides a centralized solution for threat detection, analysis, and reporting.

## Features

- Multi-source threat intelligence aggregation
- Real-time threat scoring and analysis
- RESTful API for integration
- Automated workflows with n8n
- Interactive dashboards with Grafana
- MongoDB for efficient data storage

## Technology Stack

- **Backend**: Go 1.24+
- **Database**: MongoDB
- **Workflow Automation**: n8n
- **Visualization**: Grafana
- **Containerization**: Docker & Docker Compose

## Prerequisites

- Docker and Docker Compose
- Go 1.24 or later (for local development)
- Git

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/AEX0TIC/ATIA.git
cd ATIA
```

2. Configure environment variables:
```bash
cp backend/.env.example backend/.env
# Edit .env file with your API keys and configurations
```

3. Start the services:
```bash
docker-compose up -d
```

4. Access the services:
- Backend API: http://localhost:8080
- n8n Dashboard: http://localhost:5678
- Grafana Dashboard: http://localhost:3000
- MongoDB: localhost:27017

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/v1/threats` - List all threats
- `GET /api/v1/threats/:id` - Get threat details
- `POST /api/v1/threats` - Submit new threat
- `PUT /api/v1/threats/:id` - Update threat
- `DELETE /api/v1/threats/:id` - Delete threat

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

## Docker Commands

- Start services: `docker-compose up -d`
- Stop services: `docker-compose down`
- View logs: `docker-compose logs`
- Rebuild services: `docker-compose up -d --build`

## Configuration

### Backend Configuration
- MongoDB connection settings
- API keys for threat intelligence sources
- Server port and host settings
- Logging configuration

### n8n Configuration
- Authentication settings
- Workflow automation settings
- API integration settings

### Grafana Configuration
- Dashboard provisioning
- Data source configuration
- Alert settings

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.