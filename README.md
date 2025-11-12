# ATIA - Advanced Threat Intelligence Aggregator

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Go](https://img.shields.io/badge/Go-1.25+-00ADD8?logo=go)
![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-13AA52?logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Latest-2496ED?logo=docker)

A comprehensive, production-ready threat intelligence aggregation platform that collects, analyzes, and correlates threat data from multiple sources in real-time.

## 🎯 Overview

ATIA aggregates threat intelligence from **3 major sources**:
- **VirusTotal** - File, URL, IP, and domain analysis
- **AlienVault OTX** - Open threat intelligence pulse data
- **AbuseIPDB** - IP reputation and abuse scoring

The platform calculates a **unified risk score** (0-100) and categorizes threats as **Clean**, **Unknown**, **Suspicious**, or **Malicious** using weighted algorithms.

---

## ✨ Key Features

### 🔍 **Threat Analysis**
- Analyze IPs, domains, file hashes, and URLs
- Parallel multi-source queries (async/await)
- Real-time risk scoring with weighted calculations
- Automatic threat categorization
- Source verdict aggregation

### 📊 **Analytics & Visualization**
- Pre-built Grafana dashboards
- MongoDB-backed analytics
- Threat trend analysis
- Source reliability metrics
- Risk distribution charts

### ⚡ **Automation**
- n8n webhook integration
- Automatic threat event triggering
- Custom workflow support
- Email, Slack, PagerDuty alerts
- Real-time notifications

### 🌐 **Web Dashboard**
- Modern Next.js 14 frontend
- Real-time threat grid
- Detailed threat modals
- Multi-tab interface
- Configuration management
- Service health monitoring

### 🔗 **Integration**
- RESTful API for all operations
- Webhook support for n8n
- MongoDB aggregation pipeline ready
- Docker compose for easy deployment
- Environment-based configuration

---

## 🏗️ Architecture

### **System Components**

```
┌─────────────────────────────────────────────────────────────┐
│                    ATIA Architecture                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │   Frontend       │         │   Grafana        │        │
│  │ (Next.js + React)│         │  (Analytics)     │        │
│  │  Port: 3001      │         │  Port: 3000      │        │
│  └────────┬─────────┘         └──────────────────┘        │
│           │                                                │
│           │ HTTP(S)                                        │
│           ▼                                                │
│  ┌─────────────────────────────────────┐                  │
│  │      Backend API (Go + Gin)         │                  │
│  │           Port: 8080                 │                  │
│  │  ┌──────────────────────────────┐   │                  │
│  │  │ Handler Layer (HTTP)         │   │                  │
│  │  ├──────────────────────────────┤   │                  │
│  │  │ Aggregator Service (Parallel)│   │                  │
│  │  ├──────────────────────────────┤   │                  │
│  │  │ Threat Sources:              │   │                  │
│  │  │ • VirusTotal                 │   │                  │
│  │  │ • AlienVault OTX             │   │                  │
│  │  │ • AbuseIPDB                  │   │                  │
│  │  ├──────────────────────────────┤   │                  │
│  │  │ Scoring Engine               │   │                  │
│  │  ├──────────────────────────────┤   │                  │
│  │  │ Webhook Service (n8n)        │   │                  │
│  │  └──────────────────────────────┘   │                  │
│  └────┬──────────────────────────────┬─┘                  │
│       │                              │                     │
│       │ HTTP                         │ POST/Webhook       │
│       ▼                              ▼                     │
│  ┌─────────────────┐          ┌─────────────────┐        │
│  │    MongoDB      │          │     n8n         │        │
│  │  Port: 27017    │          │  Port: 5678     │        │
│  │   (Data)        │          │ (Automation)    │        │
│  └─────────────────┘          └─────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **Data Flow**

```
User Input (IP/Domain/URL/Hash)
         │
         ▼
  ┌─────────────────┐
  │ Frontend Form   │
  └────────┬────────┘
           │
           │ POST /api/v1/analyze
           ▼
  ┌──────────────────────────┐
  │ Backend Aggregator       │
  │ (Parallel Goroutines)    │
  └──┬──┬──┬────────────────┘
     │  │  │
  ┌──▼┐ │  │
  │VT │ │  │
  └──┼┐ │  │
     ││ │  │
  ┌──▼▼─▼──▼────────┐
  │  Scorer Engine   │
  │ Risk Calculation │
  └────────┬────────┘
           │
     ┌─────┴──────┐
     ▼            ▼
┌─────────┐  ┌──────────┐
│ MongoDB │  │ Webhook  │
│  Save   │  │   n8n    │
└─────────┘  └──────────┘
```

---

## 🛠️ Technology Stack

### **Backend**
| Component | Version | Purpose |
|-----------|---------|---------|
| Go | 1.25+ | Core backend runtime |
| Gin Framework | Latest | HTTP web framework |
| MongoDB Driver | Latest | Database client |
| sync.WaitGroup | - | Goroutine coordination |

### **Frontend**
| Component | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14.2.33 | React framework |
| React | 18+ | UI library |
| TypeScript | Latest | Type safety |
| Tailwind CSS | Latest | Styling |
| Axios | Latest | HTTP client |
| Lucide React | Latest | Icons |

### **Infrastructure**
| Component | Version | Purpose |
|-----------|---------|---------|
| MongoDB | Latest | Data persistence |
| Grafana | Latest | Analytics/dashboards |
| n8n | Latest | Workflow automation |
| Docker | Latest | Containerization |

---

## 📋 API Endpoints

### **Health Check**
```http
GET /health
Response: { "service": "ATIA Backend", "status": "healthy" }
```

### **Analyze Indicator**
```http
POST /api/v1/analyze
Content-Type: application/json

{
  "indicator": "8.8.8.8",
  "type": "ip"
}

Response: {
  "threat_object": "8.8.8.8",
  "threat_type": "ip",
  "risk_score": 15,
  "verdict": "clean",
  "sources": [
    {
      "source": "virustotal",
      "score": 12,
      "verdict": "clean",
      "details": {...}
    },
    {
      "source": "otx",
      "score": 20,
      "verdict": "unknown",
      "details": {...}
    }
  ],
  "timestamp": "2025-11-12T10:30:00Z",
  "analyzed_at": "2025-11-12T10:30:00Z"
}
```

### **Get All Threats**
```http
GET /api/v1/threats?limit=50&offset=0
Response: [ { threat_object }, ... ]
```

### **Get Threat Details**
```http
GET /api/v1/threats/:id
Response: { threat_object }
```

---

## 🚀 Quick Start

### **Prerequisites**
- Docker 20.10+
- Docker Compose 1.29+
- Git
- API Keys (optional, uses placeholders if not provided)

### **Setup & Run**

```bash
# Clone repository
git clone https://github.com/AEX0TIC/ATIA.git
cd ATIA

# Configure environment (optional)
cat > backend/.env << 'EOF'
MONGODB_URI=mongodb://admin:password@mongodb:27017
MONGODB_DATABASE=atia
VIRUSTOTAL_API_KEY=REPLACE_WITH_YOUR_API_KEY
OTX_API_KEY=REPLACE_WITH_YOUR_API_KEY
ABUSEIPDB_API_KEY=REPLACE_WITH_YOUR_API_KEY
SERVER_PORT=8080
SERVER_HOST=0.0.0.0
LOG_LEVEL=info
EOF

# Start all services
docker compose up -d

# Verify services are running
docker compose ps
```

### **Access Services**
```
Frontend:   http://localhost:3001
Backend:    http://localhost:8080
Grafana:    http://localhost:3000 (admin/password)
n8n:        http://localhost:5678 (admin/password)
MongoDB:    localhost:27017 (admin:password)
```

---

## 📖 Documentation

- **[STARTUP_GUIDE.md](./STARTUP_GUIDE.md)** - Getting started, troubleshooting, common commands
- **[FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)** - Dashboard features, tab descriptions, how-tos
- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - n8n webhook setup, Grafana datasource configuration
- **[RISK_SCORE_GUIDE.md](./RISK_SCORE_GUIDE.md)** - API key acquisition, risk score formula, interpretation

---

## 🔌 Integration Examples

### **Analyze with cURL**

```bash
# IP Analysis
curl -X POST http://localhost:8080/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"indicator": "192.168.1.1", "type": "ip"}'

# Domain Analysis
curl -X POST http://localhost:8080/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"indicator": "example.com", "type": "domain"}'

# URL Analysis
curl -X POST http://localhost:8080/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"indicator": "https://example.com/path", "type": "url"}'

# File Hash Analysis
curl -X POST http://localhost:8080/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"indicator": "a64a6e7917ce0e4983e2d5afa09276a1", "type": "hash"}'

# Get All Threats
curl http://localhost:8080/api/v1/threats
```

### **Python Integration**

```python
import requests
import json

BASE_URL = "http://localhost:8080"

# Analyze an IP
response = requests.post(f"{BASE_URL}/api/v1/analyze", json={
    "indicator": "8.8.8.8",
    "type": "ip"
})
threat_data = response.json()
print(f"Risk Score: {threat_data['risk_score']}")
print(f"Verdict: {threat_data['verdict']}")

# Get all threats
threats = requests.get(f"{BASE_URL}/api/v1/threats?limit=50").json()
print(f"Total threats: {len(threats)}")
```

---

## 📊 Risk Score Calculation

### **Formula**
```
Risk Score = (VirusTotal_Score × 0.40) + 
             (OTX_Score × 0.30) + 
             (AbuseIPDB_Score × 0.30)
```

### **Verdict Categories**
| Score Range | Verdict | Color | Interpretation |
|-------------|---------|-------|-----------------|
| 0-10 | Clean | 🟢 Green | Low/no threat |
| 10-40 | Unknown | 🟡 Yellow | Insufficient data |
| 40-70 | Suspicious | 🟠 Orange | Potential threat |
| 70-100 | Malicious | 🔴 Red | High threat level |

### **Weighted Source Importance**
1. **VirusTotal (40%)** - Most authoritative antivirus engine consensus
2. **OTX (30%)** - Community threat intelligence
3. **AbuseIPDB (30%)** - IP abuse history and reports

---

## 🔐 Security Best Practices

### **Environment Variables**
Always use environment variables for sensitive data:
```bash
MONGODB_URI=mongodb://admin:password@mongodb:27017
VIRUSTOTAL_API_KEY=your_api_key_here
OTX_API_KEY=your_api_key_here
ABUSEIPDB_API_KEY=your_api_key_here
```

### **Production Deployment**
- [ ] Enable HTTPS/TLS on all endpoints
- [ ] Implement JWT or OAuth2 authentication
- [ ] Enable MongoDB access control and encryption
- [ ] Use secrets management (HashiCorp Vault, AWS Secrets Manager)
- [ ] Implement rate limiting on API endpoints
- [ ] Enable CORS restrictions for frontend domains
- [ ] Set up comprehensive logging and monitoring
- [ ] Enable MongoDB encryption at rest and in transit
- [ ] Regular security audits and penetration testing
- [ ] Keep all dependencies up-to-date

### **Container Security**
- Use specific image versions (no `latest` tags in production)
- Scan images with Trivy or similar tools
- Run containers as non-root users
- Use resource limits (CPU, memory)
- Enable container security options

---

## 📦 Docker Commands Reference

```bash
# Start services in background
docker compose up -d

# Stop services
docker compose down

# Stop and remove volumes
docker compose down -v

# View logs (all services)
docker compose logs

# Follow logs (specific service)
docker compose logs -f backend

# Rebuild and restart
docker compose up -d --build

# Full reset (dangerous!)
docker compose down -v && docker compose up -d --build

# Check service status
docker compose ps

# Execute command in container
docker compose exec backend /bin/bash
```

---

## 🧪 Testing

### **Backend Health Check**
```bash
curl http://localhost:8080/health
```

### **Frontend Smoke Test**
```bash
curl http://localhost:3001
```

### **API Endpoint Testing**
```bash
# Test analyze endpoint
curl -X POST http://localhost:8080/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"indicator": "8.8.8.8", "type": "ip"}'

# Check response includes required fields
# - threat_object
# - risk_score
# - verdict
# - sources
```

---

## 🤝 Contributing

### **Development Workflow**
```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and test locally
docker compose up -d --build

# Verify changes
# - Run API tests
# - Test frontend in browser
# - Check logs for errors

# Commit with conventional commits
git commit -m "feat: Add my feature"
git commit -m "fix: Bug in threat analysis"

# Push changes
git push origin feature/my-feature

# Create pull request on GitHub
```

### **Conventional Commit Types**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Test additions/changes
- `ci:` - CI/CD changes
- `chore:` - Build, dependencies, etc.

---

## 📋 Project Roadmap

### **v1.0** (Current)
- ✅ Multi-source threat aggregation
- ✅ Risk scoring engine
- ✅ Web dashboard
- ✅ n8n integration
- ✅ Grafana analytics

### **v1.1** (Planned)
- [ ] Machine learning threat prediction
- [ ] Advanced filtering and search
- [ ] Threat timeline visualization
- [ ] Custom alert rules
- [ ] API rate limiting

### **v2.0** (Future)
- [ ] Multi-tenant support
- [ ] SIEM integration
- [ ] Threat correlation engine
- [ ] Machine learning anomaly detection
- [ ] Enterprise authentication (SAML/OIDC)

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) for details.

---

## 👥 Authors & Contributors

- **AEX0TIC** - Initial development and architecture
- Community contributors welcome!

### **How to Contribute**
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🆘 Support & Troubleshooting

For detailed troubleshooting guides, see:
- **[STARTUP_GUIDE.md](./STARTUP_GUIDE.md)** - Common issues and solutions
- **[FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)** - UI-related troubleshooting
- **[RISK_SCORE_GUIDE.md](./RISK_SCORE_GUIDE.md)** - Risk score and API key issues

---

**Last Updated:** November 12, 2025 | **Version:** 1.0.0 | **Status:** Production Ready ✅