import React, { useState } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { LogIn, UserPlus, Mail, Lock, ShieldCheck, Activity } from 'lucide-react';

export default function Auth() {
  const { login, logBehavior } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const payload = isRegister 
      ? { username, email, password }
      : { email, password };

    // Log tracking metric
    logBehavior('submit_form', isRegister ? 'register_form' : 'login_form', email);

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      login(data.token, data.user);
    } catch (err) {
      setError(err.message);
      logBehavior('error_alert', isRegister ? 'register_error' : 'login_error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    logBehavior('click', 'toggle_auth_mode_button', isRegister ? 'to_login' : 'to_register');
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '1rem'
    }}>
      <div className="glass-card animated-entry" style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8',
            marginBottom: '1rem'
          }}>
            <Activity size={32} />
          </div>
          <h2><span className="text-gradient">HabitAI</span> Portal</h2>
          <p className="text-secondary-label">
            {isRegister ? 'Create your smart account to get started' : 'Sign in to access your behavior board'}
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="text-secondary-label">Username</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ width: '100%' }}
                  placeholder="e.g. JohnDoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="text-secondary-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-control"
                style={{ width: '100%' }}
                placeholder="e.g. john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="text-secondary-label">Password</label>
            <input
              type="password"
              className="form-control"
              style={{ width: '100%' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', gap: '0.75rem', marginBottom: '1.25rem' }}
            disabled={loading}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : isRegister ? (
              <>
                <UserPlus size={18} />
                <span>Create Account</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            onClick={handleToggleMode}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
          </button>
        </div>

        <div style={{ 
          marginTop: '2rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.5rem', 
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}>
          <ShieldCheck size={14} />
          <span>Secured with JWT and Hashed Cryptography</span>
        </div>
      </div>
    </div>
  );
}
