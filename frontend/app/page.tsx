'use client';

import { useEffect, useState } from 'react';

interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
}

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/health');
        if (!response.ok) {
          throw new Error('Health check failed');
        }
        const data = await response.json();
        setHealth(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>Guess.io</h1>

      <div
        style={{
          padding: '2rem',
          border: '2px solid #333',
          borderRadius: '8px',
          minWidth: '300px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ marginBottom: '1rem' }}>Backend Health Check</h2>

        {loading && <p>Loading...</p>}

        {error && (
          <div style={{ color: 'red' }}>
            <p>❌ Error: {error}</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Make sure the backend is running on port 8080
            </p>
          </div>
        )}

        {health && (
          <div style={{ color: 'green' }}>
            <p>✅ Status: {health.status}</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Service: {health.service}
            </p>
            <p style={{ fontSize: '0.8rem', color: '#666' }}>
              {new Date(health.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <p style={{ marginTop: '2rem', color: '#666' }}>
        Frontend → Backend communication working! 🎉
      </p>
    </div>
  );
}
