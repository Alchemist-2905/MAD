import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { BrainCircuit, Sparkles, AlertCircle, RefreshCw, Cpu, Activity } from 'lucide-react';

export default function AiAdvisor() {
  const { token, logBehavior } = useAuth();
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdvice();
    logBehavior('page_view', 'ai_advisor_screen', 'view');
  }, []);

  const fetchAdvice = async (isManual = false) => {
    if (isManual) {
      logBehavior('click', 'request_ai_advice_button', 're-eval');
      setAnalyzing(true);
      // Simulate real machine learning pattern matching delay for immersion
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/analytics/ai-advice`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to load analytical recommendations');
      const data = await response.json();
      setAdvice(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="animated-entry">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Cognitive AI Habit Advisor</h2>
          <p className="text-secondary-label">
            AI evaluates tracking logs and click-telemetry to suggest corrective behaviors.
          </p>
        </div>
        <button 
          onClick={() => fetchAdvice(true)} 
          className="btn btn-primary"
          style={{ gap: '0.5rem' }}
          disabled={loading || analyzing}
        >
          {analyzing ? <Cpu className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} size={16} /> : <Sparkles size={16} />}
          <span>{analyzing ? 'Recalculating...' : 'Ask AI to Analyze'}</span>
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {analyzing ? (
        <div className="glass-card" style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: '1rem'
        }}>
          <BrainCircuit size={48} style={{ color: 'var(--color-secondary)', animation: 'pulse 2s infinite' }} />
          <h3>Processing Behavioral Metrics...</h3>
          <p className="text-secondary-label" style={{ maxWidth: '450px' }}>
            HabitAI is scanning your habit completion histories, tracking click frequencies, and evaluating streak consistency weights...
          </p>
          <div style={{
            width: '100%',
            maxWidth: '300px',
            height: '4px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '2px',
            overflow: 'hidden',
            marginTop: '1rem'
          }}>
            <div style={{
              height: '100%',
              width: '80%',
              background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
              animation: 'loadingProgress 1.5s ease-in-out infinite',
              borderRadius: '2px'
            }} />
          </div>
          
          <style>{`
            @keyframes pulse {
              0% { transform: scale(1); opacity: 0.7; }
              50% { transform: scale(1.1); opacity: 1; filter: drop-shadow(0 0 15px rgba(168, 85, 247, 0.6)); }
              100% { transform: scale(1); opacity: 0.7; }
            }
            @keyframes loadingProgress {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(120%); }
            }
          `}</style>
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <RefreshCw className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Retrieving smart suggestions...</p>
        </div>
      ) : advice ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Key Metrics Cards */}
          <div className="grid-3">
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <span className="text-secondary-label">Streak Compliance</span>
              <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0', color: advice.metrics.completionRate >= 70 ? 'var(--color-success)' : advice.metrics.completionRate >= 30 ? 'var(--color-accent)' : 'var(--color-danger)' }}>
                {advice.metrics.completionRate}%
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: &gt;70% weekly logs</span>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <span className="text-secondary-label">IoB Engagement Index</span>
              <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', color: 'var(--color-primary-light)' }}>
                {advice.metrics.engagementLevel}
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Based on telemetry count</span>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <span className="text-secondary-label">Active Tracked Habits</span>
              <h2 style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>
                {advice.metrics.totalHabits}
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active monitoring list</span>
            </div>
          </div>

          {/* AI Analysis Summary */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--color-primary-light)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <BrainCircuit size={20} style={{ color: 'var(--color-primary-light)' }} />
              <span>Behavior Analysis Summary</span>
            </h3>
            <p style={{ fontSize: '1rem', lineHeight: '1.6' }}>{advice.summary}</p>
          </div>

          {/* Detailed Suggestions */}
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Sparkles size={20} style={{ color: 'var(--color-secondary)' }} />
              <span>Personalized Recommendations</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {advice.recommendations.map((rec, index) => (
                <div key={index} className="glass-card" style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  alignItems: 'flex-start',
                  background: 'rgba(255,255,255,0.02)'
                }}>
                  <div style={{
                    background: 'rgba(168, 85, 247, 0.1)',
                    color: 'var(--color-secondary)',
                    fontWeight: 'bold',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}>
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>{rec}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
