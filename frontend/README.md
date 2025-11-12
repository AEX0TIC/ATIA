# ATIA Frontend

A modern React-based web frontend for the Advanced Threat Intelligence Aggregator (ATIA).

## Features

- **Real-time threat analysis**: Analyze IPs, domains, URLs, and file hashes
- **Threat dashboard**: View and filter analyzed threats with risk scores
- **Intelligence aggregation**: Data from VirusTotal, OTX, and AbuseIPDB
- **Detailed threat reports**: View source-by-source analysis
- **Service status monitoring**: Real-time backend health checks
- **Integration with Grafana**: Embedded dashboards for monitoring
- **n8n workflow automation**: Links to n8n automation platform

## Setup

### Prerequisites

- Node.js 20+ (or use Docker)
- Frontend communicates with backend at `http://localhost:8080` (configurable)

### Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

### Docker

The frontend is included in the main `docker-compose.yml`:

```bash
docker compose up -d --build
```

Frontend will be available at http://localhost:3001

## Environment Variables

- `NEXT_PUBLIC_API_BASE_URL`: Backend API base URL (default: http://localhost:8080)

## API Integration

The frontend communicates with the backend API:

- `GET /health` - Service health check
- `POST /api/v1/analyze` - Analyze an indicator
- `GET /api/v1/threats` - Get threat list
- `GET /api/v1/threats/:indicator` - Get specific threat
- `GET /api/v1/threats/:indicator/history` - Get threat history

## Components

- **Header**: Navigation and service status
- **AnalyzerForm**: Input form for threat analysis
- **ThreatCard**: Display individual threat summary
- **ThreatDetailModal**: Detailed threat view with all sources
- **Dashboard**: Main page with threat list and analyzer

## Building for Production

```bash
npm run build
npm start
```

## License

MIT
