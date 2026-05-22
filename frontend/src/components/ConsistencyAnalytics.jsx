import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { 
  TrendingUp, Award, Flame, PieChart, RefreshCw, 
  CheckCircle, Calendar, Zap, Sparkles, AlertCircle 
} from 'lucide-react';

export default function ConsistencyAnalytics() {
  const { token, logBehavior } = useAuth();
  const [habits, setHabits] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState('line'); // 'line' or 'bar'
  const [hoveredData, setHoveredData] = useState(null);

  // Generate last 7 days for trend calculations
  const [pastDays, setPastDays] = useState([]);

  useEffect(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    setPastDays(days);
    fetchData();
    logBehavior('page_view', 'consistency_analytics_screen', 'view');
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch habits and metrics in parallel
      const [habitsRes, metricsRes] = await Promise.all([
        fetch(`${API_URL}/habits`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }),
        fetch(`${API_URL}/analytics/metrics`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
      ]);

      if (!habitsRes.ok || !metricsRes.ok) {
        throw new Error('Failed to load performance metrics from core');
      }

      const habitsData = await habitsRes.json();
      const metricsData = await metricsRes.json();

      setHabits(habitsData);
      setMetrics(metricsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 1. Calculate stats & streaks
  const calculateStreak = (habit) => {
    if (!habit.HabitLogs || habit.HabitLogs.length === 0) return 0;
    const loggedDates = habit.HabitLogs
      .map(l => l.date)
      .sort((a, b) => new Date(a) - new Date(b));
    
    let maxStreak = 0;
    let currentStreak = 0;
    let prevDate = null;

    for (const dateStr of loggedDates) {
      const currentDate = new Date(dateStr + 'T00:00:00');
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
      if (currentStreak > maxStreak) maxStreak = currentStreak;
      prevDate = currentDate;
    }
    return maxStreak;
  };

  // Find overall longest streak
  const getOverallLongestStreak = () => {
    if (habits.length === 0) return 0;
    return Math.max(...habits.map(calculateStreak), 0);
  };

  // Calculate habit-specific completion rate (%) over the last 7 days
  const getHabitWeeklyRate = (habit) => {
    if (!habit.HabitLogs || habit.HabitLogs.length === 0) return 0;
    const completions = habit.HabitLogs.filter(log => pastDays.includes(log.date) && log.completed).length;
    return Math.round((completions / 7) * 100);
  };

  // Calculate global completion rate for all habits this week
  const getGlobalWeeklyRate = () => {
    if (habits.length === 0) return 0;
    const totalPossible = habits.length * 7;
    let totalDone = 0;
    habits.forEach(habit => {
      if (habit.HabitLogs) {
        totalDone += habit.HabitLogs.filter(log => pastDays.includes(log.date) && log.completed).length;
      }
    });
    return Math.round((totalDone / totalPossible) * 100);
  };

  // Get total logged checkins this week
  const getWeeklyCompletionsCount = () => {
    let count = 0;
    habits.forEach(habit => {
      if (habit.HabitLogs) {
        count += habit.HabitLogs.filter(log => pastDays.includes(log.date) && log.completed).length;
      }
    });
    return count;
  };

  // 2. Prepare Data for Daily line chart (Last 7 days)
  const getDailyCompletionsTrend = () => {
    return pastDays.map(dateStr => {
      const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const shortDay = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
      let count = 0;
      habits.forEach(habit => {
        if (habit.HabitLogs && habit.HabitLogs.some(log => log.date === dateStr && log.completed)) {
          count++;
        }
      });
      return { dateStr, label: formattedDate, shortDay, count };
    });
  };

  // 3. Prepare Data for Category Donut Chart
  const getCategoryConsistencyData = () => {
    const categories = ['Productivity', 'Health', 'Mind', 'Fitness', 'Finance', 'General'];
    const data = categories.map(cat => {
      const catHabits = habits.filter(h => h.category === cat);
      if (catHabits.length === 0) return { category: cat, rate: 0, count: 0 };
      
      let logsCount = 0;
      catHabits.forEach(h => {
        if (h.HabitLogs) {
          logsCount += h.HabitLogs.filter(log => pastDays.includes(log.date) && log.completed).length;
        }
      });
      const totalPossible = catHabits.length * 7;
      const rate = Math.round((logsCount / totalPossible) * 100);
      return { category: cat, rate, count: catHabits.length };
    }).filter(item => item.count > 0); // Only show categories with habits
    return data;
  };

  // 4. Behavior-Habit Correlation Calculations
  const getCorrelationInsights = () => {
    if (habits.length === 0) return [];
    const insights = [];
    
    // Calculate click velocity
    const clickEvents = metrics.filter(m => m.eventType === 'click');
    const totalClicks = clickEvents.length;
    const sessionDurationEvents = metrics.filter(m => m.eventType === 'session_duration');
    const totalDurationSeconds = sessionDurationEvents.reduce((acc, m) => acc + parseInt(m.value || 0, 10), 0);
    const durationMins = totalDurationSeconds / 60 || 1;
    const clickVelocity = (totalClicks / durationMins).toFixed(1);

    // Consistency Rate
    const consistency = getGlobalWeeklyRate();

    // Insight 1: Velocity & Consistency Correlation
    if (clickVelocity > 3 && consistency >= 70) {
      insights.push({
        title: "Proactive Flow State Detectable",
        description: `Your telemetry speed is active (${clickVelocity} clicks/min), coinciding with a strong weekly compliance of ${consistency}%. This demonstrates high engagement.`,
        type: 'success'
      });
    } else if (clickVelocity > 0 && consistency < 40) {
      insights.push({
        title: "Interface Friction or Routine Decay",
        description: `Frequent navigational interactions (${clickVelocity} clicks/min) logged, but habit compliance remains low (${consistency}%). Focus on setting simplified targets.`,
        type: 'warning'
      });
    } else {
      insights.push({
        title: "Baseline Rhythm Maintained",
        description: `Navigational frequency matches expected session limits (${clickVelocity || 0.8} clicks/min). Habit updates are updating securely.`,
        type: 'info'
      });
    }

    // Insight 2: Peak Hours
    if (metrics.length > 0) {
      const hours = metrics.map(m => new Date(m.createdAt).getHours());
      const hourCounts = {};
      hours.forEach(h => { hourCounts[h] = (hourCounts[h] || 0) + 1; });
      const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
      
      if (peakHour !== undefined) {
        const timeLabel = peakHour >= 12 ? `${peakHour - 12 || 12} PM` : `${peakHour || 12} AM`;
        insights.push({
          title: `Peak Application Focus at ${timeLabel}`,
          description: `Analytics show your highest interaction density occurs around ${timeLabel}. Consider aligning difficult habit completions with this window.`,
          type: 'info'
        });
      }
    }

    // Insight 3: Category Strength
    const catData = getCategoryConsistencyData();
    if (catData.length > 0) {
      const bestCat = [...catData].sort((a, b) => b.rate - a.rate)[0];
      const worstCat = [...catData].sort((a, b) => a.rate - b.rate)[0];
      
      if (bestCat && bestCat.rate >= 70) {
        insights.push({
          title: `Strong Suit: ${bestCat.category}`,
          description: `Your consistency in ${bestCat.category} is outstanding at ${bestCat.rate}%. Capitalize on this momentum!`,
          type: 'success'
        });
      }
      if (worstCat && worstCat.rate < 40 && worstCat.category !== bestCat.category) {
        insights.push({
          title: `Focus Required: ${worstCat.category}`,
          description: `Completions in ${worstCat.category} are low (${worstCat.rate}%). Consider scaling down frequency to daily increments.`,
          type: 'warning'
        });
      }
    }

    return insights;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <RefreshCw className="animate-spin" style={{ animation: 'spin 1.5s linear infinite', color: 'var(--color-primary-light)' }} />
        <p style={{ marginTop: '1.25rem', color: 'var(--text-secondary)' }}>Compiling habit consistency dimensions...</p>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (habits.length === 0) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <Calendar size={48} style={{ color: 'var(--color-primary-light)', marginBottom: '1.5rem' }} />
        <h3>No Analytics Available</h3>
        <p className="text-secondary-label">
          Create habits and check off some logs in the Routine Tracker to view performance insights.
          </p>
      </div>
    );
  }

  const globalRate = getGlobalWeeklyRate();
  const longestStreak = getOverallLongestStreak();
  const totalCompletions = getWeeklyCompletionsCount();
  const dailyTrend = getDailyCompletionsTrend();
  const categoryData = getCategoryConsistencyData();
  const correlationInsights = getCorrelationInsights();

  // SVG Chart Dimensions
  const svgWidth = 600;
  const svgHeight = 260;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Max value for line chart Y-axis (at least 3 or maximum daily completions)
  const maxDailyCount = Math.max(...dailyTrend.map(d => d.count), 3);

  return (
    <div className="animated-entry" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Habit Consistency Analytics</h2>
          <p className="text-secondary-label">Evaluate routine compliance and correlate behavior metrics.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
          <button 
            className={`btn ${chartType === 'line' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', borderRadius: '6px' }}
            onClick={() => {
              setChartType('line');
              logBehavior('click', 'toggle_consistency_chart_line', 'line');
            }}
          >
            <TrendingUp size={14} style={{ marginRight: '0.35rem' }} />
            <span>Activity Trend</span>
          </button>
          <button 
            className={`btn ${chartType === 'bar' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', borderRadius: '6px' }}
            onClick={() => {
              setChartType('bar');
              logBehavior('click', 'toggle_consistency_chart_bar', 'bar');
            }}
          >
            <CheckCircle size={14} style={{ marginRight: '0.35rem' }} />
            <span>Completion Rate</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        
        {/* Radial weekly compliance ring */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem' }}>
          <div style={{ position: 'relative', width: '70px', height: '70px' }}>
            <svg width="70" height="70" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="3.5"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--color-primary-light)"
                strokeDasharray={`${globalRate}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s ease-out' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '0.95rem',
              fontWeight: '800',
              color: 'var(--text-primary)'
            }}>
              {globalRate}%
            </div>
          </div>
          <div>
            <span className="text-secondary-label" style={{ fontSize: '0.8rem' }}>Weekly Rate</span>
            <h4 style={{ margin: '0.15rem 0 0 0', fontSize: '1.15rem' }}>Global Target</h4>
          </div>
        </div>

        {/* Streak card */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem' }}>
          <div style={{
            background: 'rgba(245, 158, 11, 0.1)',
            color: '#f59e0b',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Flame size={24} />
          </div>
          <div>
            <span className="text-secondary-label" style={{ fontSize: '0.8rem' }}>Longest Streak</span>
            <h4 style={{ margin: '0.15rem 0 0 0', fontSize: '1.15rem' }}>{longestStreak} Day{longestStreak !== 1 && 's'}</h4>
          </div>
        </div>

        {/* Total completions logged */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--color-success)',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <span className="text-secondary-label" style={{ fontSize: '0.8rem' }}>Logs (7d)</span>
            <h4 style={{ margin: '0.15rem 0 0 0', fontSize: '1.15rem' }}>{totalCompletions} Checkins</h4>
          </div>
        </div>

        {/* Milestone badge */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem' }}>
          <div style={{
            background: globalRate >= 70 ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255,255,255,0.03)',
            color: globalRate >= 70 ? 'var(--color-secondary)' : 'var(--text-muted)',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={24} />
          </div>
          <div>
            <span className="text-secondary-label" style={{ fontSize: '0.8rem' }}>Achievement Badge</span>
            <h4 style={{ margin: '0.15rem 0 0 0', fontSize: '1.05rem', fontWeight: '700' }}>
              {globalRate >= 80 ? 'Master' : globalRate >= 50 ? 'Achiever' : 'Apprentice'}
            </h4>
          </div>
        </div>
      </div>

      {/* Main Graph Content */}
      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'stretch' }}>
        
        {/* SVG Graph Container */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {chartType === 'line' ? <TrendingUp size={18} style={{ color: 'var(--color-primary-light)' }} /> : <CheckCircle size={18} style={{ color: 'var(--color-secondary)' }} />}
            <span>{chartType === 'line' ? 'Daily Activity completions (Last 7 Days)' : 'Habit Completion Rates'}</span>
          </h3>

          {/* SVG Canvas */}
          <div style={{ flex: 1, position: 'relative', overflowX: 'auto' }}>
            <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="xMidYMid meet">
              
              {/* SVG Definitions for Gradients & Filters */}
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary-light)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--color-primary-light)" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-secondary)" />
                  <stop offset="100%" stopColor="var(--color-primary)" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const y = paddingTop + chartHeight * (1 - ratio);
                const valueLabel = chartType === 'line' 
                  ? Math.round(maxDailyCount * ratio) 
                  : `${Math.round(100 * ratio)}%`;
                return (
                  <g key={index}>
                    <line 
                      x1={paddingLeft} 
                      y1={y} 
                      x2={svgWidth - paddingRight} 
                      y2={y} 
                      stroke="rgba(255,255,255,0.04)" 
                      strokeWidth="1"
                    />
                    <text 
                      x={paddingLeft - 10} 
                      y={y + 4} 
                      fill="var(--text-muted)" 
                      fontSize="9" 
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {valueLabel}
                    </text>
                  </g>
                );
              })}

              {/* LINE CHART RENDER */}
              {chartType === 'line' && (
                <>
                  {/* Generate path and fill coordinate arrays */}
                  {(() => {
                    const points = dailyTrend.map((d, index) => {
                      const x = paddingLeft + (chartWidth / (dailyTrend.length - 1)) * index;
                      const y = paddingTop + chartHeight * (1 - d.count / maxDailyCount);
                      return { x, y, count: d.count, label: d.label, day: d.shortDay };
                    });

                    // Build path coordinates string
                    const pathString = points.reduce((acc, p, index) => {
                      return acc + `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
                    }, '');

                    // Build closed polygon for gradient fill
                    const fillString = pathString + `L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

                    return (
                      <g>
                        {/* Area gradient fill */}
                        <path d={fillString} fill="url(#lineGrad)" />

                        {/* Smooth Line */}
                        <path 
                          d={pathString} 
                          fill="none" 
                          stroke="var(--color-primary-light)" 
                          strokeWidth="3.5" 
                          strokeLinecap="round"
                          filter="url(#glow)"
                        />

                        {/* Interaction Node circles */}
                        {points.map((p, index) => (
                          <g key={index}>
                            <circle 
                              cx={p.x} 
                              cy={p.y} 
                              r="5" 
                              fill="var(--bg-dark)" 
                              stroke="var(--color-primary-light)" 
                              strokeWidth="2.5"
                              style={{ cursor: 'pointer', transition: 'r 0.2s' }}
                              onMouseEnter={(e) => {
                                setHoveredData({
                                  x: p.x,
                                  y: p.y - 12,
                                  title: p.day,
                                  value: `${p.count} task${p.count !== 1 ? 's' : ''}`
                                });
                              }}
                              onMouseLeave={() => setHoveredData(null)}
                            />
                            {/* X-axis labels */}
                            <text 
                              x={p.x} 
                              y={paddingTop + chartHeight + 20} 
                              fill="var(--text-muted)" 
                              fontSize="10" 
                              textAnchor="middle"
                              fontWeight="600"
                            >
                              {p.day}
                            </text>
                            <text 
                              x={p.x} 
                              y={paddingTop + chartHeight + 32} 
                              fill="rgba(255,255,255,0.2)" 
                              fontSize="8" 
                              textAnchor="middle"
                            >
                              {p.label.split(' ')[1]}
                            </text>
                          </g>
                        ))}
                      </g>
                    );
                  })()}
                </>
              )}

              {/* BAR CHART RENDER */}
              {chartType === 'bar' && (
                <>
                  {(() => {
                    const barWidth = Math.min(45, chartWidth / habits.length - 20);
                    const spacing = (chartWidth - barWidth * habits.length) / (habits.length + 1);

                    return habits.map((habit, index) => {
                      const rate = getHabitWeeklyRate(habit);
                      const x = paddingLeft + spacing + (barWidth + spacing) * index;
                      const barHeight = chartHeight * (rate / 100);
                      const y = paddingTop + chartHeight - barHeight;

                      return (
                        <g key={habit.id}>
                          {/* Animated SVG bar */}
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={Math.max(barHeight, 4)} // at least minor height to draw
                            rx="6"
                            fill="url(#barGrad)"
                            style={{ 
                              cursor: 'pointer',
                              transition: 'y 0.5s ease-out, height 0.5s ease-out, opacity 0.2s',
                              opacity: hoveredData?.index === index ? 0.9 : 0.75 
                            }}
                            onMouseEnter={() => {
                              setHoveredData({
                                x: x + barWidth / 2,
                                y: y - 10,
                                index,
                                title: habit.name,
                                value: `${rate}% compliance`
                              });
                            }}
                            onMouseLeave={() => setHoveredData(null)}
                          />

                          {/* X-axis labels */}
                          <text
                            x={x + barWidth / 2}
                            y={paddingTop + chartHeight + 18}
                            fill="var(--text-muted)"
                            fontSize="9"
                            textAnchor="middle"
                            fontWeight="500"
                          >
                            {habit.name.length > 10 ? `${habit.name.slice(0, 8)}…` : habit.name}
                          </text>
                        </g>
                      );
                    });
                  })()}
                </>
              )}

              {/* Interactive Tooltip Card inside SVG */}
              {hoveredData && (
                <g transform={`translate(${hoveredData.x}, ${hoveredData.y})`}>
                  <rect
                    x="-65"
                    y="-38"
                    width="130"
                    height="32"
                    rx="6"
                    fill="rgba(15, 23, 42, 0.95)"
                    stroke="var(--border-glass)"
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="-24"
                    fill="var(--text-primary)"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {hoveredData.title}
                  </text>
                  <text
                    x="0"
                    y="-12"
                    fill="var(--color-primary-light)"
                    fontSize="9"
                    fontWeight="800"
                    textAnchor="middle"
                  >
                    {hoveredData.value}
                  </text>
                </g>
              )}

            </svg>
          </div>
        </div>

        {/* Donut Category Chart */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={18} style={{ color: 'var(--color-accent)' }} />
            <span>Category Consistency</span>
          </h3>

          {categoryData.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No categories mapped.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '1.5rem' }}>
              
              {/* Nested Activity Rings representation (Apple Watch Style) */}
              <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="130" height="130" viewBox="0 0 36 36">
                  {categoryData.map((item, idx) => {
                    // Draw rings concentrically
                    const radius = 16 - idx * 2.5;
                    const circumference = 2 * Math.PI * radius;
                    const strokeDash = (item.rate / 100) * circumference;
                    const colors = ['#818cf8', '#67e8f9', '#f472b6', '#34d399', '#fbbf24', '#f87171'];
                    const ringColor = colors[idx % colors.length];

                    return (
                      <g key={item.category}>
                        {/* Background track */}
                        <circle
                          cx="18"
                          cy="18"
                          r={radius}
                          fill="none"
                          stroke="rgba(255,255,255,0.03)"
                          strokeWidth="2"
                        />
                        {/* Interactive Arc Ring */}
                        <circle
                          cx="18"
                          cy="18"
                          r={radius}
                          fill="none"
                          stroke={ringColor}
                          strokeWidth="2"
                          strokeDasharray={`${strokeDash} ${circumference}`}
                          strokeLinecap="round"
                          transform="rotate(-90 18 18)"
                          style={{ transition: 'stroke-dasharray 1s ease-out' }}
                        />
                      </g>
                    );
                  })}
                </svg>
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>METRICS</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--color-accent)' }}>RINGS</span>
                </div>
              </div>

              {/* Custom Legend details with compliance rates */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {categoryData.map((item, idx) => {
                  const colors = ['#818cf8', '#67e8f9', '#f472b6', '#34d399', '#fbbf24', '#f87171'];
                  const ringColor = colors[idx % colors.length];
                  return (
                    <div key={item.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ringColor }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{item.category}</span>
                      </div>
                      <span style={{ fontWeight: '700' }}>{item.rate}%</span>
                    </div>
                  );
                })}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Correlation Insights Section */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--color-accent)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Sparkles size={20} style={{ color: 'var(--color-accent)' }} />
          <span>Behavior-Habit Correlation Insights</span>
        </h3>
        
        {correlationInsights.length === 0 ? (
          <p className="text-secondary-label">Gathering enough telemetry inputs to map analytics...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {correlationInsights.map((insight, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                gap: '1rem', 
                alignItems: 'flex-start',
                background: 'rgba(255, 255, 255, 0.01)',
                padding: '0.8rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-glass)'
              }}>
                <div style={{
                  color: insight.type === 'success' ? 'var(--color-success)' : insight.type === 'warning' ? '#fbbf24' : 'var(--color-accent)',
                  paddingTop: '0.15rem'
                }}>
                  {insight.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: 'var(--text-primary)' }}>{insight.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {insight.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
