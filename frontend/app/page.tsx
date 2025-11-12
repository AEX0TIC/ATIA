'use client';

import { useEffect, useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { Settings, BarChart3, Zap, Copy, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

// Types
interface ThreatIndicator {
  id: string;
  indicator: string;
  type: 'ip' | 'domain' | 'hash' | 'url';
  risk_score: number;
  reputation: string;
  sources: SourceData[];
  first_seen: string;
  last_updated: string;
  tags: string[];
}

interface SourceData {
  name: string;
  verdict: string;
  score: number;
  details: Record<string, unknown>;
  timestamp: string;
}

interface HealthResponse {
  service: string;
  status: string;
}

// API Client
const apiBaseUrl = typeof window !== 'undefined' 
  ? process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
  : 'http://backend:8080';

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
});

async function getHealth(): Promise<HealthResponse> {
  const response = await api.get('/health');
  return response.data;
}

async function analyzeThreat(indicator: string, type: string): Promise<ThreatIndicator> {
  const response = await api.post('/api/v1/analyze', { indicator, type });
  return response.data?.data || response.data;
}

async function getAllThreats(limit: number = 50): Promise<ThreatIndicator[]> {
  const response = await api.get('/api/v1/threats', { params: { limit } });
  return Array.isArray(response.data) ? response.data : response.data?.data || [];
}

// Components
function Header({ currentTab, onTabChange }: { currentTab: string; onTabChange: (tab: string) => void }) {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await getHealth();
        setHealth(response);
      } catch (err) {
        console.error('Health check failed:', err);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = health?.status === 'healthy' ? 'text-green-600' : 'text-red-600';

  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold">ATIA</h1>
            <p className="text-gray-300 text-sm">Advanced Threat Intelligence Aggregator</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-gray-300">Service Status</p>
              <p className={`font-semibold ${statusColor}`}>
                {health?.status ? health.status.toUpperCase() : 'CHECKING...'}
              </p>
            </div>

            <div className="flex gap-4">
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm flex items-center gap-2"
              >
                <BarChart3 size={16} />
                Grafana
              </a>
              <a
                href="http://localhost:5678"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm flex items-center gap-2"
              >
                <Zap size={16} />
                n8n
              </a>
            </div>
          </div>
        </div>

        <div className="flex gap-4 border-b border-gray-700">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-4 py-3 font-medium transition-colors ${
              currentTab === 'dashboard'
                ? 'border-b-2 border-white text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
              currentTab === 'analytics'
                ? 'border-b-2 border-white text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <BarChart3 size={18} />
            Analytics
          </button>
          <button
            onClick={() => onTabChange('automation')}
            className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
              currentTab === 'automation'
                ? 'border-b-2 border-white text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Zap size={18} />
            Automation
          </button>
          <button
            onClick={() => onTabChange('settings')}
            className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
              currentTab === 'settings'
                ? 'border-b-2 border-white text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Settings size={18} />
            Settings
          </button>
        </div>
      </div>
    </header>
  );
}

function AnalyzerForm({ onResultsUpdate }: { onResultsUpdate: () => void }) {
  const [indicator, setIndicator] = useState('');
  const [type, setType] = useState('ip');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!indicator.trim()) {
      setError('Please enter an indicator');
      return;
    }

    setLoading(true);
    try {
      await analyzeThreat(indicator.trim(), type);
      setSuccess(`Analysis completed for ${indicator}`);
      setIndicator('');
      onResultsUpdate();
    } catch (err) {
      let msg = 'Failed to analyze indicator';
      
      if (axios.isAxiosError(err)) {
        const axiosErr = err as AxiosError<{error?: string}>;
        if (!axiosErr.response) {
          msg = `Network Error: Cannot connect to backend at ${apiBaseUrl}. Make sure the backend service is running.`;
        } else if (axiosErr.response.data?.error) {
          msg = `Backend Error: ${axiosErr.response.data.error}`;
        } else if (axiosErr.response.statusText) {
          msg = `HTTP ${axiosErr.response.status}: ${axiosErr.response.statusText}`;
        } else {
          msg = `Error: ${axiosErr.message}`;
        }
      } else if (err instanceof Error) {
        msg = err.message;
      }
      
      setError(msg);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Threat Analyzer</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Indicator Type</label>
            <select
              title="Indicator Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="ip">IP Address</option>
              <option value="domain">Domain</option>
              <option value="hash">File Hash</option>
              <option value="url">URL</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Indicator Value</label>
            <input
              type="text"
              value={indicator}
              onChange={(e) => setIndicator(e.target.value)}
              placeholder="Enter value (e.g., 8.8.8.8)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Analyzing...' : 'Analyze Indicator'}
        </button>
      </form>

      {error && <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3"><AlertCircle size={20} className="flex-shrink-0 mt-0.5" /><div>{error}</div></div>}
      {success && <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start gap-3"><CheckCircle size={20} className="flex-shrink-0 mt-0.5" /><div>{success}</div></div>}
    </div>
  );
}

function ThreatCard({ threat, onClick }: { threat: ThreatIndicator; onClick: () => void }) {
  const riskColor =
    threat.risk_score > 70
      ? 'text-red-600 bg-red-50'
      : threat.risk_score > 40
      ? 'text-orange-600 bg-orange-50'
      : 'text-green-600 bg-green-50';

  const badgeColor =
    threat.reputation === 'malicious'
      ? 'bg-red-100 text-red-800'
      : threat.reputation === 'suspicious'
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-green-100 text-green-800';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 break-all">{threat.indicator}</h3>
          <p className="text-sm text-gray-500 capitalize">Type: {threat.type}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColor}`}>
          {threat.reputation.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500">Risk Score</p>
          <p className={`text-2xl font-bold ${riskColor}`}>{threat.risk_score.toFixed(1)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Sources</p>
          <p className="text-2xl font-bold text-blue-600">{threat.sources.length}</p>
        </div>
      </div>
    </div>
  );
}

function ThreatDetailModal({ threat, onClose }: { threat: ThreatIndicator | null; onClose: () => void }) {
  if (!threat) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-100 border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{threat.indicator}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-xs text-blue-600 mb-1">Type</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{threat.type}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-xs text-purple-600 mb-1">Risk Score</p>
              <p className="text-lg font-semibold text-gray-900">{threat.risk_score.toFixed(1)}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-xs text-orange-600 mb-1">Reputation</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">{threat.reputation}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-xs text-green-600 mb-1">Sources</p>
              <p className="text-lg font-semibold text-gray-900">{threat.sources.length}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Intelligence Sources</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {threat.sources.map((source, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-300">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{source.name}</h4>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        source.verdict === 'malicious'
                          ? 'bg-red-100 text-red-800'
                          : source.verdict === 'suspicious'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {source.verdict.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Score: {source.score.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">{new Date(source.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {threat.tags && threat.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {threat.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnalyticsTab() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 size={28} className="text-blue-600" />
              Grafana Analytics Dashboard
            </h2>
            <p className="text-gray-600 mb-4">
              Access your threat analytics dashboard in Grafana for real-time monitoring, threat trends, and risk analysis.
            </p>
            <a
              href="http://localhost:3000/d/threat-dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              <BarChart3 size={20} />
              Open Grafana Dashboard
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Dashboard Setup Instructions</h3>
        <div className="space-y-4 text-gray-700">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <h4 className="font-semibold mb-2">1. Configure MongoDB Datasource</h4>
            <p className="text-sm mb-2">Login to Grafana (admin/password) and:</p>
            <ol className="list-decimal list-inside text-sm space-y-1">
              <li>Go to Configuration → Data Sources</li>
              <li>Click "Add data source" → Select MongoDB</li>
              <li>Set Connection String: <code className="bg-white p-1 rounded">mongodb://admin:password@localhost:27017</code></li>
              <li>Database: <code className="bg-white p-1 rounded">atia</code></li>
            </ol>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <h4 className="font-semibold mb-2">2. Sample Queries for Dashboards</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Threat Count by Type:</strong></p>
              <code className="bg-gray-100 p-2 block rounded font-mono text-xs overflow-x-auto break-words whitespace-pre-wrap">
                {`db.threats.aggregate([{$group: {_id: '$type', count: {$sum: 1}}}])`}
              </code>
              
              <p className="mt-3"><strong>Average Risk Score by Reputation:</strong></p>
              <code className="bg-gray-100 p-2 block rounded font-mono text-xs overflow-x-auto break-words whitespace-pre-wrap">
                {`db.threats.aggregate([{$group: {_id: '$reputation', avgRisk: {$avg: '$risk_score'}}}])`}
              </code>

              <p className="mt-3"><strong>Recent Threats (Last 24h):</strong></p>
              <code className="bg-gray-100 p-2 block rounded font-mono text-xs overflow-x-auto break-words whitespace-pre-wrap">
                {`db.threats.find({last_updated: {$gte: new Date(Date.now()-86400000)}})`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AutomationTab() {
  const [copied, setCopied] = useState(false);
  const webhookUrl = 'http://localhost:8080/api/v1/webhooks/n8n';
  const n8nPayloadExample = JSON.stringify({
    event_type: 'threat_analyzed',
    timestamp: new Date().toISOString(),
    threat: {
      indicator: '8.8.8.8',
      type: 'ip',
      risk_score: 75.5,
      reputation: 'malicious',
      sources_count: 3,
      malicious_vote: 2
    },
    risk_severity: 'high'
  }, null, 2);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap size={28} className="text-orange-600" />
          n8n Workflow Automation
        </h2>
        <p className="text-gray-600 mb-4">
          Configure automated workflows in n8n to respond to threat alerts and trigger actions.
        </p>
        <a
          href="http://localhost:5678"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors"
        >
          <Zap size={20} />
          Open n8n Dashboard
          <ExternalLink size={18} />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Webhook Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  title="Webhook URL"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(webhookUrl)}
                  title="Copy webhook URL"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Copy this URL to your n8n webhook node</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payload Format</label>
              <textarea
                readOnly
                title="Webhook payload format"
                value={n8nPayloadExample}
                className="w-full h-64 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Setup Steps</h3>
          <ol className="list-decimal list-inside space-y-4 text-gray-700">
            <li>
              <strong>Create a new workflow</strong>
              <p className="text-sm text-gray-600 ml-6 mt-1">Go to n8n → New Workflow</p>
            </li>
            <li>
              <strong>Add Webhook node</strong>
              <p className="text-sm text-gray-600 ml-6 mt-1">Search for "Webhook" and configure:
                <ul className="list-disc list-inside ml-2 mt-1 text-xs">
                  <li>Method: POST</li>
                  <li>Path: threat-alert</li>
                </ul>
              </p>
            </li>
            <li>
              <strong>Add action nodes</strong>
              <p className="text-sm text-gray-600 ml-6 mt-1">Email, Slack, PagerDuty, etc.</p>
            </li>
            <li>
              <strong>Test the workflow</strong>
              <p className="text-sm text-gray-600 ml-6 mt-1">Use ATIA to analyze a threat indicator</p>
            </li>
          </ol>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Update the N8N_WEBHOOK_URL in your backend .env file with your n8n webhook endpoint.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  const [config, setConfig] = useState({
    mongodbUrl: 'mongodb://admin:password@localhost:27017',
    mongodbDatabase: 'atia',
    n8nWebhookUrl: '',
    backendUrl: 'http://localhost:8080',
    grafanaUrl: 'http://localhost:3000',
    n8nUrl: 'http://localhost:5678'
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('atia-config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">System Configuration</h2>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">MongoDB Connection URL</label>
            <input
              type="text"
              title="MongoDB connection URL"
              value={config.mongodbUrl}
              onChange={(e) => setConfig({ ...config, mongodbUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="mongodb://user:password@host:port"
            />
            <p className="text-xs text-gray-500 mt-1">Default: mongodb://admin:password@localhost:27017</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">MongoDB Database</label>
            <input
              type="text"
              title="MongoDB database name"
              value={config.mongodbDatabase}
              onChange={(e) => setConfig({ ...config, mongodbDatabase: e.target.value })}
              placeholder="Database name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Default: atia</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">n8n Webhook URL</label>
            <input
              type="text"
              title="n8n webhook URL"
              value={config.n8nWebhookUrl}
              onChange={(e) => setConfig({ ...config, n8nWebhookUrl: e.target.value })}
              placeholder="http://localhost:5678/webhook/threat-alert"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to disable webhooks</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Backend API URL</label>
            <input
              type="text"
              title="Backend API URL"
              value={config.backendUrl}
              onChange={(e) => setConfig({ ...config, backendUrl: e.target.value })}
              placeholder="http://localhost:8080"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Default: http://localhost:8080</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grafana URL</label>
            <input
              type="text"
              title="Grafana URL"
              value={config.grafanaUrl}
              onChange={(e) => setConfig({ ...config, grafanaUrl: e.target.value })}
              placeholder="http://localhost:3000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Default: http://localhost:3000</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">n8n URL</label>
            <input
              type="text"
              title="n8n URL"
              value={config.n8nUrl}
              onChange={(e) => setConfig({ ...config, n8nUrl: e.target.value })}
              placeholder="http://localhost:5678"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Default: http://localhost:5678</p>
          </div>

          <button
            onClick={handleSave}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <CheckCircle size={20} />
                Configuration Saved
              </>
            ) : (
              'Save Configuration'
            )}
          </button>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Service Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Backend API</span>
              <a href={config.backendUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm">
                Check Status
              </a>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Grafana</span>
              <a href={config.grafanaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm">
                Open Grafana
              </a>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">n8n Workflows</span>
              <a href={config.n8nUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm">
                Open n8n
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Page
export default function Home() {
  const [threats, setThreats] = useState<ThreatIndicator[]>([]);
  const [selectedThreat, setSelectedThreat] = useState<ThreatIndicator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTab, setCurrentTab] = useState('dashboard');

  const loadThreats = useCallback(async () => {
    try {
      setError('');
      const data = await getAllThreats(50);
      setThreats(data);
    } catch (err) {
      console.error('Error loading threats:', err);
      setError('Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadThreats();
    const interval = setInterval(loadThreats, 60000);
    return () => clearInterval(interval);
  }, [loadThreats]);

  return (
    <>
      <Header currentTab={currentTab} onTabChange={setCurrentTab} />

      <main>
        {currentTab === 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <AnalyzerForm onResultsUpdate={loadThreats} />

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Recent Threats
                <span className="text-sm font-normal text-gray-500 ml-2">({threats.length} total)</span>
              </h2>

              {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3"><AlertCircle size={20} className="flex-shrink-0 mt-0.5" /><div>{error}</div></div>}

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading threats...</p>
                </div>
              ) : threats.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg">
                  <p className="text-gray-500">No threats found. Analyze an indicator to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {threats.map((threat) => (
                    <ThreatCard key={threat.id || threat.indicator} threat={threat} onClick={() => setSelectedThreat(threat)} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {currentTab === 'analytics' && <AnalyticsTab />}
        {currentTab === 'automation' && <AutomationTab />}
        {currentTab === 'settings' && <SettingsTab />}
      </main>

      <ThreatDetailModal threat={selectedThreat} onClose={() => setSelectedThreat(null)} />
    </>
  );
}
