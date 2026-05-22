import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Activity, BarChart3, Clock, Eye, AlertCircle, RefreshCw } from 'lucide-react';

export default function IoBAnalytics() {
  const { token, logBehavior } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMetrics();
    logBehavior('page_view', 'iob_analytics_screen', 'view');
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/analytics/metrics`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to load metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatLogTime = (dateStr) => {
    if (!dateStr) return '';
    let date = new Date(dateStr);
    
    // SQLite dates are stored in UTC format. If the backend fails to specify UTC (Z)
    // in the JSON date string, this forces the browser to parse it as UTC rather than local time.
    if (typeof dateStr === 'string' && !dateStr.endsWith('Z') && !dateStr.includes('+') && !/[-+]\d{2}:?\d{2}$/.test(dateStr)) {
      const isoStr = dateStr.replace(' ', 'T') + 'Z';
      const parsed = new Date(isoStr);
      if (!isNaN(parsed.getTime())) {
        date = parsed;
      }
    }
    
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Group and count metrics
  const getEventBreakdown = () => {
    const counts = {};
    metrics.forEach(m => {
      counts[m.eventType] = (counts[m.eventType] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / metrics.length) * 100) || 0
    }));
  };

  // Group and count clicks on element IDs
  const getClickBreakdown = () => {
    const clicks = metrics.filter(m => m.eventType === 'click');
    const counts = {};
    clicks.forEach(m => {
      counts[m.elementId] = (counts[m.elementId] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([element, count]) => ({ element, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const eventBreakdown = getEventBreakdown();
  const clickBreakdown = getClickBreakdown();

  return (
    <div className="animated-entry">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Internet of Behavior (IoB) Telemetry</h2>
          <p className="text-secondary-label">
            We securely trace active usage, button clicks, and application interaction loops to optimize behaviors.
          </p>
        </div>
        <button onClick={fetchMetrics} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
          <RefreshCw size={16} />
          <span>Sync Telemetry</span>
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <RefreshCw className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Gathering behavioral data streams...</p>
        </div>
      ) : metrics.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Activity size={40} style={{ color: 'var(--color-primary-light)', marginBottom: '1rem' }} />
          <h3>No Telemetry Generated Yet</h3>
          <p className="text-secondary-label">Complete some routines and change screens to generate activity logs.</p>
        </div>
      ) : (
        <div className="grid-2">
          {/* Chart Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.15rem' }}>
                <BarChart3 size={18} style={{ color: 'var(--color-primary-light)' }} />
                <span>Interaction Types Distribution</span>
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {eventBreakdown.map(item => (
                  <div key={item.type}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>
                        {item.type.replace('_', ' ')}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.count} logs ({item.percentage}%)</span>
                    </div>
                    {/* Glowing custom CSS bar */}
                    <div style={{
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${item.percentage}%`,
                        background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                        boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)',
                        borderRadius: '4px',
                        transition: 'width 1s ease-out'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.15rem' }}>
                <Clock size={18} style={{ color: 'var(--color-accent)' }} />
                <span>Top User Navigation Actions</span>
              </h3>

              {clickBreakdown.length === 0 ? (
                <p className="text-secondary-label">No click metrics recorded.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {clickBreakdown.map((item, index) => (
                    <div key={item.element} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      background: 'rgba(255, 255, 255, 0.02)',
                      padding: '0.6rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-glass)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ 
                          fontSize: '0.8rem', 
                          color: 'var(--color-accent)', 
                          fontWeight: '700',
                          background: 'rgba(6, 182, 212, 0.1)',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%'
                        }}>{index + 1}</span>
                        <code style={{ fontSize: '0.85rem' }}>{item.element}</code>
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{item.count} clicks</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Raw Log Telemetry Feeds */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.15rem' }}>
              <Eye size={18} style={{ color: 'var(--color-secondary)' }} />
              <span>Real-Time Behavior Logs</span>
            </h3>
            <p className="text-secondary-label" style={{ marginBottom: '1.25rem' }}>
              Tracked parameters sent to database for analysis:
            </p>

            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              maxHeight: '360px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.5rem',
              paddingRight: '0.25rem'
            }}>
              {metrics.map(m => (
                <div key={m.id} style={{
                  fontSize: '0.75rem',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.01)',
                  borderLeft: `3px solid ${
                    m.eventType === 'click' ? 'var(--color-primary-light)' : 
                    m.eventType === 'error_alert' ? 'var(--color-danger)' : 'var(--color-accent)'
                  }`,
                  fontFamily: 'monospace',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>{m.eventType.toUpperCase()}</span>
                    <span style={{ color: 'var(--text-muted)' }}> | id: </span>
                    <span style={{ color: 'var(--text-primary)' }}>{m.elementId || 'null'}</span>
                    {m.value && (
                      <>
                        <span style={{ color: 'var(--text-muted)' }}> val: </span>
                        <span style={{ color: '#fb7185' }}>{m.value}</span>
                      </>
                    )}
                  </div>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {formatLogTime(m.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
