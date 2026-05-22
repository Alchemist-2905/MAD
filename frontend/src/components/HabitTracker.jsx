import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Plus, Trash2, CheckCircle2, Circle, Flame, Calendar, Tag, Layers, RefreshCw } from 'lucide-react';

export default function HabitTracker() {
  const { token, logBehavior } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Productivity');
  const [frequency, setFrequency] = useState('Daily');
  const [isAdding, setIsAdding] = useState(false);

  // Generate last 7 days for the tracker board
  const [pastDays, setPastDays] = useState([]);

  useEffect(() => {
    // Generate dates
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        dateStr: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
      });
    }
    setPastDays(days);
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/habits`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (!response.ok) throw new Error('Failed to load habits');
      const data = await response.json();
      setHabits(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    logBehavior('click', 'submit_new_habit_button', `${category}:${frequency}`);

    try {
      const response = await fetch(`${API_URL}/habits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, description, category, frequency }),
      });

      if (!response.ok) throw new Error('Failed to create habit');
      
      const newHabit = await response.json();
      setHabits([newHabit, ...habits]);
      setName('');
      setDescription('');
      setIsAdding(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteHabit = async (id) => {
    logBehavior('click', 'delete_habit_button', id);
    if (!window.confirm('Are you sure you want to delete this habit?')) return;

    try {
      const response = await fetch(`${API_URL}/habits/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete habit');
      setHabits(habits.filter(h => h.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleLog = async (habitId, dateStr) => {
    logBehavior('click', 'toggle_habit_day_bubble', `${habitId}:${dateStr}`);
    
    try {
      const response = await fetch(`${API_URL}/habits/${habitId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ date: dateStr }),
      });

      if (!response.ok) throw new Error('Failed to toggle completion log');
      const data = await response.json();

      // Update habits log list locally
      setHabits(prevHabits => 
        prevHabits.map(habit => {
          if (habit.id === habitId) {
            let updatedLogs = [...(habit.HabitLogs || [])];
            if (data.completed) {
              updatedLogs.push(data.log);
            } else {
              updatedLogs = updatedLogs.filter(log => log.date !== dateStr);
            }
            return { ...habit, HabitLogs: updatedLogs };
          }
          return habit;
        })
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // Helper function to check if habit is logged on specific date
  const isLogged = (habit, dateStr) => {
    if (!habit.HabitLogs) return false;
    return habit.HabitLogs.some(log => log.date === dateStr);
  };

  // Calculate longest consecutive streak of all time
  const calculateStreak = (habit) => {
    if (!habit.HabitLogs || habit.HabitLogs.length === 0) return 0;
    
    // Sort dates in ascending order
    const loggedDates = habit.HabitLogs
      .map(l => l.date)
      .sort((a, b) => new Date(a) - new Date(b));
    
    let maxStreak = 0;
    let currentStreak = 0;
    let prevDate = null;

    for (const dateStr of loggedDates) {
      const currentDate = new Date(dateStr + 'T00:00:00'); // Force midnight local parsing
      
      if (prevDate === null) {
        currentStreak = 1;
      } else {
        const diffTime = Math.abs(currentDate - prevDate);
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      }
      
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
      prevDate = currentDate;
    }

    return maxStreak;
  };

  return (
    <div className="animated-entry">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2>Your habits Tracker</h2>
          <p className="text-secondary-label">Develop healthy routines and check off completions daily.</p>
        </div>
        <button 
          id="tour-btn-build"
          onClick={() => {
            setIsAdding(!isAdding);
            logBehavior('click', 'toggle_add_habit_form_button', !isAdding);
          }} 
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>{isAdding ? 'Close Builder' : 'Build New Habit'}</span>
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {isAdding && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.25rem' }}>Habit Setup Builder</h3>
          <form onSubmit={handleCreateHabit} className="grid-2">
            <div>
              <div className="form-group">
                <label className="text-secondary-label">Habit Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Read books, Stretch, Workout"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="text-secondary-label">Description (Optional)</label>
                <textarea 
                  className="form-control" 
                  rows="3" 
                  placeholder="Why do you want to keep this habit?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <div className="form-group">
                <label className="text-secondary-label">Category</label>
                <select 
                  className="form-control" 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Productivity">Productivity</option>
                  <option value="Health">Health</option>
                  <option value="Mind">Mind</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Finance">Finance</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="form-group">
                <label className="text-secondary-label">Target Frequency</label>
                <select 
                  className="form-control" 
                  value={frequency} 
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Initialize Habit
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <RefreshCw className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading your dashboard routines...</p>
        </div>
      ) : habits.length === 0 ? (
        <div id="tour-tracker-bubbles" className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Calendar size={48} style={{ color: 'var(--color-primary-light)', marginBottom: '1.5rem' }} />
          <h3>No Habits Registered</h3>
          <p className="text-secondary-label" style={{ marginBottom: '1.5rem' }}>
            Get started by initializing your first habit above.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {habits.map((habit, index) => {
            const streak = calculateStreak(habit);
            return (
              <div key={habit.id} className="glass-card" style={{ padding: '1.25rem 1.75rem' }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1rem', 
                  justifyContent: 'space-between',
                  alignItems: 'stretch'
                }}>
                  {/* Left layout details */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{habit.name}</h3>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid var(--border-glass)',
                          color: 'var(--text-secondary)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <Tag size={10} />
                          {habit.category}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{habit.description || 'No description added.'}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.35rem', 
                        color: streak > 0 ? '#f59e0b' : 'var(--text-muted)',
                        background: streak > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.02)',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                      }}>
                        <Flame size={16} />
                        <span>{streak} Day{streak !== 1 && 's'}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem', borderRadius: '8px', color: 'var(--color-danger)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* 7-day grid bubbles */}
                  <div 
                    id={index === 0 ? "tour-tracker-bubbles" : undefined}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      background: 'rgba(255,255,255,0.02)',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid var(--border-glass)',
                      marginTop: '0.5rem',
                      overflowX: 'auto'
                    }}
                  >
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>Recent Tracker:</span>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {pastDays.map((day) => {
                        const done = isLogged(habit, day.dateStr);
                        return (
                          <button
                            key={day.dateStr}
                            onClick={() => handleToggleLog(habit.id, day.dateStr)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{day.dayName}</span>
                            <div style={{ position: 'relative' }}>
                              {done ? (
                                <CheckCircle2 size={24} style={{ color: 'var(--color-success)', fill: 'rgba(16, 185, 129, 0.1)' }} />
                              ) : (
                                <Circle size={24} style={{ color: 'var(--text-muted)' }} />
                              )}
                            </div>
                            <span style={{ fontSize: '0.7rem', color: done ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: '600' }}>
                              {day.dayNum}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
