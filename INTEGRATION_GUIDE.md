# ATIA Full-Stack Integration Guide

## ✅ Status Summary

### Frontend
- **✅ Threats Now Display Properly** - Fixed API response parsing issue
- **✅ Real-time Data** - Auto-refreshes threat list every 60 seconds
- **✅ Interactive Dashboard** - Grid view with detailed threat cards

### Backend  
- **✅ Threat Analysis** - Aggregates data from VirusTotal, OTX, AbuseIPDB
- **✅ MongoDB Storage** - Persists all threat analysis results
- **✅ RESTful API** - Full threat management endpoints

### Integration Points

## 🔗 n8n Integration (Webhook-Based)

### What It Does
- Automatically triggers when threats are analyzed
- Sends comprehensive threat data to n8n for automated workflows
- Non-blocking - doesn't slow down API responses

### WebhookPayload Structure
```json
{
  "event_type": "threat_analyzed",
  "timestamp": "2025-11-12T...",
  "threat": { /* full threat data */ },
  "risk_severity": "critical|high|medium|low",
  "sources_count": 3,
  "malicious_vote": 2
}
```

### Risk Severity Classification
- **Critical**: risk_score > 70
- **High**: risk_score > 50
- **Medium**: risk_score > 30
- **Low**: risk_score ≤ 30

### Setting Up n8n Webhook
1. Open n8n at `http://localhost:5678`
2. Create new workflow
3. Add **Webhook** node as trigger
4. Get webhook URL: typically `http://localhost:5678/webhook/...`
5. Configure backend webhook URL via environment variable
6. Add n8n integration to backend:
   - Update `.env`: `N8N_WEBHOOK_URL=http://n8n:5678/webhook/your-path`
   - Or update docker-compose.yml to pass webhook URL

### Example n8n Actions
- Send Slack/Teams notification when critical threats found
- Log to external SIEM systems
- Create tickets in issue tracker
- Archive threat data to data warehouse
- Trigger automated IR playbooks

## 📊 Grafana Integration (Ready to Configure)

### What It Does
- Visualizes threat analytics and metrics
- Real-time dashboard of threat distribution
- Historical trend analysis

### Current Status
- **Service Running**: http://localhost:3000
- **Credentials**: admin / password
- **MongoDB Connection**: Ready (mongodb:27017)

### Setup Steps

#### 1. Add MongoDB Datasource
1. Login to Grafana (admin/password)
2. Go to **Configuration** → **Data Sources**
3. Click **Add data source** → Select **MongoDB**
4. Configure:
   - **URL**: mongodb:27017
   - **Database**: atia
   - **Username**: admin
   - **Password**: password
5. Click **Save & Test**

#### 2. Create Threat Dashboard
1. Go to **+ Create** → **Dashboard**
2. Add panels with queries:

**Panel 1: Total Threats**
```
db.threats.count()
```

**Panel 2: Risk Score Distribution**
```
db.threats.aggregate([
  { $group: { 
      _id: null,
      critical: { $sum: { $cond: [ { $gt: ["$risk_score", 70] }, 1, 0 ] } },
      high: { $sum: { $cond: [ { $gt: ["$risk_score", 50] }, 1, 0 ] } },
      medium: { $sum: { $cond: [ { $gt: ["$risk_score", 30] }, 1, 0 ] } },
      low: { $sum: { $cond: [ { $lte: ["$risk_score", 30] }, 1, 0 ] } }
  }}
])
```

**Panel 3: Threats by Source**
```
db.threats.aggregate([
  { $unwind: "$sources" },
  { $group: { 
      _id: "$sources.name",
      count: { $sum: 1 },
      avgScore: { $avg: "$sources.score" }
  }}
])
```

**Panel 4: Recent Threats**
```
db.threats.find().sort({last_updated: -1}).limit(10)
```

## 🔄 Data Flow Architecture

```
User Input (Frontend)
    ↓
/api/v1/analyze Endpoint
    ↓
Aggregator Service
    ├→ VirusTotal Service
    ├→ OTX Service
    └→ AbuseIPDB Service (IPs only)
    ↓
Threat Model with Aggregated Sources
    ↓
MongoDB SaveThreat()
    ├→ Store complete threat record
    └→ Update/create index on indicator
    ↓
WebhookService.TriggerThreatAnalysis() [Non-blocking]
    ↓
n8n Webhook (Optional, if configured)
    ├→ Send Notifications
    ├→ Create Tickets
    └→ Update SIEM
    ↓
Response to Frontend
    ↓
Frontend Updates Threat List
    ├→ Grid display
    ├→ Details modal
    └→ Auto-refresh every 60s
    ↓
Grafana Dashboards (Real-time queries)
    ├→ Risk distribution
    ├→ Source analysis
    └→ Historical trends
```

## 🚀 Service Endpoints

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3001 | None |
| Backend API | http://localhost:8080 | None |
| Grafana | http://localhost:3000 | admin/password |
| n8n | http://localhost:5678 | admin/password |
| MongoDB | localhost:27017 | admin/password |

## 📝 API Endpoints

### Analyze Threat
```
POST /api/v1/analyze
Content-Type: application/json

{
  "indicator": "8.8.8.8",
  "type": "ip"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "indicator": "8.8.8.8",
    "type": "ip",
    "risk_score": 0,
    "reputation": "clean",
    "sources": [
      {
        "name": "VirusTotal",
        "verdict": "clean",
        "score": 0,
        "details": {},
        "timestamp": "..."
      }
    ],
    "tags": ["clean"]
  }
}
```

### Get All Threats
```
GET /api/v1/threats?limit=50
```

### Get Single Threat
```
GET /api/v1/threats/{indicator}
```

### Get Threat History
```
GET /api/v1/threats/{indicator}/history
```

### Delete Threat
```
DELETE /api/v1/threats/{id}
```

## 🔧 Configuration

### Backend Environment Variables
```
MONGODB_URI=mongodb://admin:password@mongodb:27017
MONGODB_DATABASE=atia
VIRUSTOTAL_API_KEY=YOUR_KEY
OTX_API_KEY=YOUR_KEY
ABUSEIPDB_API_KEY=YOUR_KEY
SERVER_PORT=8080
SERVER_HOST=0.0.0.0
LOG_LEVEL=info
N8N_WEBHOOK_URL=http://n8n:5678/webhook/threats (optional)
```

### Frontend Environment Variables
```
NEXT_PUBLIC_API_BASE_URL=http://backend:8080
```

## 📈 Next Steps

1. **Add Real API Keys**
   - Get VirusTotal API key from https://www.virustotal.com/gui/my-apikey
   - Get OTX API key from https://otx.alienvault.com/
   - Get AbuseIPDB API key from https://www.abuseipdb.com/register
   - Update `backend/.env`

2. **Configure n8n Workflows**
   - Open http://localhost:5678
   - Create workflow for alerts/notifications
   - Set webhook URL in backend `.env`

3. **Build Grafana Dashboards**
   - Add MongoDB datasource
   - Create threat analytics panels
   - Set up alert conditions

4. **Test End-to-End**
   - Analyze threats from frontend
   - Verify data in MongoDB
   - Check n8n webhook events
   - Review Grafana metrics

## 🐛 Troubleshooting

### Threats Not Displaying
- Check frontend console for errors
- Verify backend is running: `docker compose ps`
- Test API: `curl http://localhost:8080/api/v1/threats`

### Webhooks Not Triggering
- Verify n8n webhook URL is configured
- Check backend logs: `docker compose logs backend`
- Ensure n8n is running: `docker compose ps`

### Grafana Connection Issues
- Verify MongoDB credentials
- Check MongoDB is accessible: `docker compose logs mongodb`
- Ensure datasource URL is correct (internal DNS: mongodb:27017)

## 💡 Best Practices

1. **Monitor Webhook Failures** - Set up alerts in n8n for failed requests
2. **Archive Old Data** - Consider archiving threats older than 30 days
3. **Set Rate Limits** - Prevent API abuse on analyze endpoint
4. **Use HTTPS** - Configure TLS in production
5. **Backup MongoDB** - Regular snapshots of threat database
6. **Monitor Resource Usage** - Watch Docker container memory/CPU

---

**Last Updated**: November 12, 2025  
**System Status**: ✅ All Services Running
