import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import HabitTracker from './components/HabitTracker';
import IoBAnalytics from './components/IoBAnalytics';
import AiAdvisor from './components/AiAdvisor';
import ConsistencyAnalytics from './components/ConsistencyAnalytics';
import TutorialTour from './components/TutorialTour';
import { LayoutDashboard, BrainCircuit, Activity, LogOut, CheckSquare, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';

function AppContent() {
  const { user, loading, logout, logBehavior } = useAuth();
  const [activeTab, setActiveTab] = useState('tracker');
  const [isTourActive, setIsTourActive] = useState(false);

  // Track session duration (IoB telemetry)
  useEffect(() => {
    if (!user) return;
    
    const startTime = Date.now();
    logBehavior('page_view', 'dashboard_main', 'session_start');

    return () => {
      const activeDurationSeconds = Math.round((Date.now() - startTime) / 1000);
      logBehavior('session_duration', 'dashboard_main', activeDurationSeconds);
    };
  }, [user]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    logBehavior('click', `nav_tab_${tabName}`, 'transition');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-dark)'
      }}>
        <Activity size={40} className="animate-spin" style={{ animation: 'spin 1.5s linear infinite', color: 'var(--color-primary-light)' }} />
        <p style={{ marginTop: '1.25rem', color: 'var(--text-secondary)' }}>Syncing with HabitAI cloud core...</p>
      </div>
    );
  }

  // If not logged in, render authentication wall
  if (!user) {
    return (
      <div className="glass-container">
        <Auth />
      </div>
    );
  }

  return (
    <div className="glass-container">
      {/* Header / Navbar */}
      <header className="glass-card" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '1.25rem 2rem',
        marginBottom: '2rem',
        borderRadius: '16px'
      }}>
        <div id="tour-header-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Activity size={28} style={{ color: 'var(--color-primary-light)' }} />
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
            <span className="text-gradient">HabitAI</span>
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ textAlign: 'right', display: 'none', sm: 'block' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>Hello, {user.username}</p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Status: Active tracking</span>
          </div>
          
          <button 
            onClick={() => {
              setIsTourActive(true);
              logBehavior('click', 'start_tutorial_button', 'open');
            }} 
            className="btn btn-secondary" 
            style={{ 
              padding: '0.5rem 1rem', 
              fontSize: '0.85rem', 
              display: 'flex', 
              gap: '0.35rem', 
              background: 'rgba(99, 102, 241, 0.1)', 
              borderColor: 'rgba(99, 102, 241, 0.25)', 
              color: 'var(--color-primary-light)' 
            }}
          >
            <HelpCircle size={16} />
            <span>Interactive Tour</span>
          </button>
          
          <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', gap: '0.35rem' }}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* View Selectors */}
      <div id="tour-tab-container" className="tab-container">
        <button 
          id="tour-tab-tracker"
          onClick={() => handleTabChange('tracker')} 
          className={`tab-btn ${activeTab === 'tracker' ? 'active' : ''}`}
        >
          <CheckSquare size={16} />
          <span>Routine Tracker</span>
        </button>
        
        <button 
          id="tour-tab-consistency"
          onClick={() => handleTabChange('consistency')} 
          className={`tab-btn ${activeTab === 'consistency' ? 'active' : ''}`}
        >
          <TrendingUp size={16} />
          <span>Consistency Charts</span>
        </button>
        
        <button 
          id="tour-tab-ai"
          onClick={() => handleTabChange('ai-advisor')} 
          className={`tab-btn ${activeTab === 'ai-advisor' ? 'active' : ''}`}
        >
          <BrainCircuit size={16} />
          <span>AI Habit Advisor</span>
        </button>
        
        <button 
          id="tour-tab-iob"
          onClick={() => handleTabChange('iob-analytics')} 
          className={`tab-btn ${activeTab === 'iob-analytics' ? 'active' : ''}`}
        >
          <Activity size={16} />
          <span>Behavior Telemetry</span>
        </button>
      </div>

      {/* Main active layout */}
      <main style={{ minHeight: '60vh' }}>
        {activeTab === 'tracker' && <HabitTracker />}
        {activeTab === 'consistency' && <ConsistencyAnalytics />}
        {activeTab === 'ai-advisor' && <AiAdvisor />}
        {activeTab === 'iob-analytics' && <IoBAnalytics />}
      </main>

      {isTourActive && (
        <TutorialTour 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onClose={() => setIsTourActive(false)} 
        />
      )}

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        marginTop: '4rem', 
        padding: '2rem 0 1rem', 
        borderTop: '1px solid var(--border-glass)',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <p>© 2026 HabitAI Technologies. Built for responsive PWA and secure behavioral tracking assignment.</p>
      </footer>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media(max-width: 500px) {
          header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
