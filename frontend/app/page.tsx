'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

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
  return response.data?.data || [];
}

// Components
function Header() {
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
        <div className="flex justify-between items-center">
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
              >
                Grafana
              </a>
              <a
                href="http://localhost:5678"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm"
              >
                n8n
              </a>
            </div>
          </div>
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

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze indicator';
      setError(msg);
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

      {error && <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}
      {success && <div className="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">{success}</div>}
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

// Main Page
export default function Home() {
  const [threats, setThreats] = useState<ThreatIndicator[]>([]);
  const [selectedThreat, setSelectedThreat] = useState<ThreatIndicator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <AnalyzerForm onResultsUpdate={loadThreats} />

        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Recent Threats
            <span className="text-sm font-normal text-gray-500 ml-2">({threats.length} total)</span>
          </h2>

          {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

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
      </main>

      <ThreatDetailModal threat={selectedThreat} onClose={() => setSelectedThreat(null)} />
    </>
  );
}
