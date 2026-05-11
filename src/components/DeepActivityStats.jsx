import React, { useState, useMemo } from 'react';
import { 
    Activity, 
    Calendar, 
    Clock, 
    TrendingUp, 
    Zap, 
    ChevronDown, 
    Search, 
    BarChart3,
    ArrowUpRight,
    Trophy,
    Timer
} from 'lucide-react';
import { formatHoursMins } from '../utils';
import { getDatesInRange, getDateRange } from '../utils/analyticsEngine';
import CanvasBarChart from './CanvasBarChart';

export default function DeepActivityStats({ appState }) {
    const { activities = [], records = {} } = appState;
    const [selectedActivityId, setSelectedActivityId] = useState(activities[0]?.id || '');
    const [range, setRange] = useState('Week'); // 'Week' | 'Month' | 'All Time'

    // Get active activities (not archived)
    const activeActivities = useMemo(() => activities.filter(a => !a.archived), [activities]);

    const selectedActivity = useMemo(() => 
        activities.find(a => a.id === selectedActivityId) || activeActivities[0]
    , [selectedActivityId, activities, activeActivities]);

    // Main data aggregation for the selected activity
    const deepStats = useMemo(() => {
        if (!selectedActivity) return null;

        const id = selectedActivity.id;
        let totalSeconds = 0;
        let weekSeconds = 0;
        let monthSeconds = 0;
        let longestSeconds = 0;
        let sessionCount = 0;
        const dayTotals = {}; // { 'YYYY-MM-DD': seconds }
        const weekdayTotals = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat

        const today = new Date();
        today.setHours(0,0,0,0);
        
        // Ranges
        const { startDate: currStart, endDate: currEnd } = getDateRange(range === 'Week' ? 'This Week' : range === 'Month' ? 'This Month' : 'All Time');
        
        // Previous period for growth calc
        let prevStart = new Date(currStart);
        let prevEnd = new Date(currEnd);
        if (range === 'Week') {
            prevStart.setDate(prevStart.getDate() - 7);
            prevEnd.setDate(prevEnd.getDate() - 7);
        } else if (range === 'Month') {
            prevStart.setMonth(prevStart.getMonth() - 1);
            prevEnd.setMonth(prevEnd.getMonth() - 1);
        }

        const currStartStr = currStart.toISOString().split('T')[0];
        const currEndStr = currEnd.toISOString().split('T')[0];
        const prevStartStr = prevStart.toISOString().split('T')[0];
        const prevEndStr = prevEnd.toISOString().split('T')[0];

        let currPeriodSeconds = 0;
        let prevPeriodSeconds = 0;

        Object.entries(records).forEach(([date, dayRecords]) => {
            const log = dayRecords[id];
            if (log && log.time > 0) {
                const time = log.time;
                totalSeconds += time;
                dayTotals[date] = time;

                if (date >= currStartStr && date <= currEndStr) currPeriodSeconds += time;
                if (date >= prevStartStr && date <= prevEndStr) prevPeriodSeconds += time;
                
                if (time > longestSeconds) longestSeconds = time;
                sessionCount++;
                const dayOfWeek = new Date(date).getDay();
                weekdayTotals[dayOfWeek] += time;
            }
        });

        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const mostProductiveDayIndex = weekdayTotals.indexOf(Math.max(...weekdayTotals));

        // Growth %
        let growthPercent = 0;
        if (prevPeriodSeconds > 0) {
            growthPercent = ((currPeriodSeconds - prevPeriodSeconds) / prevPeriodSeconds) * 100;
        } else if (currPeriodSeconds > 0) {
            growthPercent = 100;
        }
        
        return {
            totalSeconds,
            currPeriodSeconds,
            longestSeconds,
            avgSessionSeconds: sessionCount > 0 ? totalSeconds / sessionCount : 0,
            mostProductiveDay: dayNames[mostProductiveDayIndex],
            dayTotals,
            sessionCount,
            growthPercent
        };
    }, [selectedActivity, records, range]);

    const chartData = useMemo(() => {
        if (!selectedActivity || !deepStats) return { labels: [], datasets: [] };

        let labels = [];
        let dataPoints = [];

        if (range === 'Week') {
            const { startDate, endDate } = getDateRange('This Week');
            const dates = getDatesInRange(startDate, endDate);
            const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            labels = dates.map(d => dayNamesShort[new Date(d).getDay()]);
            dataPoints = dates.map(d => (deepStats.dayTotals[d] || 0) / 3600);
        } 
        else if (range === 'Month') {
            const { startDate, endDate } = getDateRange('This Month');
            const dates = getDatesInRange(startDate, endDate);
            // Group by week for month view
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'].slice(0, Math.ceil(dates.length / 7));
            dataPoints = labels.map((_, i) => {
                const weekDates = dates.slice(i * 7, (i + 1) * 7);
                let sum = 0;
                weekDates.forEach(d => sum += (deepStats.dayTotals[d] || 0));
                return sum / 3600;
            });
        } 
        else if (range === 'All Time') {
            const dates = Object.keys(deepStats.dayTotals).sort();
            if (dates.length === 0) return { labels: [], datasets: [] };
            
            // Group by month
            const months = {};
            dates.forEach(d => {
                const m = d.slice(0, 7); // YYYY-MM
                months[m] = (months[m] || 0) + deepStats.dayTotals[d];
            });
            labels = Object.keys(months).map(m => {
                const [y, mm] = m.split('-');
                const date = new Date(y, parseInt(mm) - 1);
                return date.toLocaleString('default', { month: 'short' });
            });
            dataPoints = Object.values(months).map(v => v / 3600);
        }

        return {
            labels,
            datasets: [
                {
                    label: 'Hours Spent',
                    data: dataPoints,
                    color: selectedActivity.color || '#2563eb'
                }
            ]
        };
    }, [selectedActivity, deepStats, range]);

    if (!selectedActivity) return null;

    return (
        <section className="panel deep-stats-panel" style={{ padding: '2.5rem', marginTop: '2rem' }}>
            <div className="deep-stats-header">
                <div className="header-info">
                    <div className="section-badge">
                        <BarChart3 size={14} />
                        <span>Deep Activity Analysis</span>
                    </div>
                    <h2>Activity Insights</h2>
                </div>

                <div className="header-controls">
                    <div className="activity-dropdown-container">
                        <select 
                            className="activity-select"
                            value={selectedActivityId}
                            onChange={(e) => setSelectedActivityId(e.target.value)}
                        >
                            {activeActivities.map(act => (
                                <option key={act.id} value={act.id}>{act.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="dropdown-icon" />
                    </div>

                    <div className="range-filters">
                        {['Week', 'Month', 'All Time'].map(r => (
                            <button 
                                key={r}
                                className={`filter-btn ${range === r ? 'active' : ''}`}
                                onClick={() => setRange(r)}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="chart-container-large">
                <div className="chart-info-overlay">
                    <div className="activity-icon-large" style={{ backgroundColor: `${selectedActivity.color}22`, color: selectedActivity.color }}>
                        <Activity size={24} />
                    </div>
                    <div>
                        <h3>{selectedActivity.name}</h3>
                        <p>Time Investment Trend ({range})</p>
                    </div>
                </div>
                <CanvasBarChart 
                    data={chartData} 
                    height={300} 
                    type="line" 
                    showLegend={false}
                    minPointWidth={range === 'All Time' ? 80 : 60}
                />
            </div>

            <div className="deep-stats-grid">
                <div className="deep-stat-card">
                    <div className="card-icon"><Clock size={20} /></div>
                    <div className="card-data">
                        <span className="label">Lifetime Total</span>
                        <span className="value">{formatHoursMins(deepStats?.totalSeconds || 0)}</span>
                    </div>
                </div>
                <div className="deep-stat-card">
                    <div className="card-icon"><Calendar size={20} /></div>
                    <div className="card-data">
                        <span className="label">This {range}</span>
                        <span className="value">{formatHoursMins(deepStats?.currPeriodSeconds || 0)}</span>
                    </div>
                </div>
                <div className="deep-stat-card">
                    <div className="card-icon"><TrendingUp size={20} /></div>
                    <div className="card-data">
                        <span className="label">Growth Trend</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="value">{Math.round(deepStats?.growthPercent || 0)}%</span>
                            {deepStats?.growthPercent > 0 && <ArrowUpRight size={16} color="#10b981" />}
                            {deepStats?.growthPercent < 0 && <ArrowUpRight size={16} color="#ef4444" style={{ transform: 'rotate(90deg)' }} />}
                        </div>
                    </div>
                </div>
                <div className="deep-stat-card">
                    <div className="card-icon"><Zap size={20} /></div>
                    <div className="card-data">
                        <span className="label">Daily Average</span>
                        <span className="value">
                            {deepStats?.currPeriodSeconds > 0 
                                ? formatHoursMins(deepStats.currPeriodSeconds / (range === 'Week' ? 7 : range === 'Month' ? 30 : (Object.keys(records).length || 1))) 
                                : '0h 0m'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="insights-footer">
                <div className="insight-item">
                    <Trophy size={18} className="insight-icon" />
                    <div>
                        <span className="insight-label">Most Productive Day</span>
                        <span className="insight-value">{deepStats?.mostProductiveDay}</span>
                    </div>
                </div>
                <div className="insight-item">
                    <Timer size={18} className="insight-icon" />
                    <div>
                        <span className="insight-label">Longest Session</span>
                        <span className="insight-value">{formatHoursMins(deepStats?.longestSeconds || 0)}</span>
                    </div>
                </div>
                <div className="insight-item">
                    <ArrowUpRight size={18} className="insight-icon" />
                    <div>
                        <span className="insight-label">Avg Session Length</span>
                        <span className="insight-value">{formatHoursMins(deepStats?.avgSessionSeconds || 0)}</span>
                    </div>
                </div>
                <div className="insight-item">
                    <Zap size={18} className="insight-icon" />
                    <div>
                        <span className="insight-label">Total Sessions</span>
                        <span className="insight-value">{deepStats?.sessionCount} focused sessions</span>
                    </div>
                </div>
            </div>

            <style>{`
                .deep-stats-panel {
                    border-radius: 24px;
                    border: 1px solid #e2e8f0;
                    background: white;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .deep-stats-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 2.5rem;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                }

                .section-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.4rem 0.8rem;
                    background: #f1f5f9;
                    color: #64748b;
                    border-radius: 10px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 0.75rem;
                }

                .deep-stats-header h2 {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: #1e293b;
                    margin: 0;
                }

                .header-controls {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .activity-dropdown-container {
                    position: relative;
                    min-width: 200px;
                }

                .activity-select {
                    width: 100%;
                    appearance: none;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    padding: 0.6rem 2.5rem 0.6rem 1rem;
                    border-radius: 12px;
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #1e293b;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .activity-select:focus {
                    outline: none;
                    border-color: var(--accent);
                    box-shadow: 0 0 0 3px var(--accent-light);
                }

                .dropdown-icon {
                    position: absolute;
                    right: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #64748b;
                    pointer-events: none;
                }

                .range-filters {
                    display: flex;
                    background: #f1f5f9;
                    padding: 0.3rem;
                    border-radius: 12px;
                }

                .filter-btn {
                    padding: 0.45rem 1rem;
                    border-radius: 9px;
                    border: none;
                    background: transparent;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .filter-btn.active {
                    background: white;
                    color: var(--accent);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                .chart-container-large {
                    position: relative;
                    background: #fcfcfd;
                    border: 1px solid #f1f5f9;
                    border-radius: 20px;
                    padding: 1.5rem;
                    margin-bottom: 2.5rem;
                }

                .chart-info-overlay {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .activity-icon-large {
                    width: 48px;
                    height: 48px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .chart-info-overlay h3 {
                    margin: 0;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #1e293b;
                }

                .chart-info-overlay p {
                    margin: 0;
                    font-size: 0.85rem;
                    color: #64748b;
                }

                .deep-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2.5rem;
                }

                .deep-stat-card {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    padding: 1.5rem;
                    background: #f8fafc;
                    border: 1px solid #f1f5f9;
                    border-radius: 20px;
                    transition: transform 0.2s;
                }

                .deep-stat-card:hover {
                    transform: translateY(-2px);
                }

                .card-icon {
                    width: 44px;
                    height: 44px;
                    background: white;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--accent);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .card-data {
                    display: flex;
                    flex-direction: column;
                }

                .card-data .label {
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .card-data .value {
                    font-size: 1.35rem;
                    font-weight: 800;
                    color: #1e293b;
                }

                .insights-footer {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 1.5rem;
                    padding-top: 2rem;
                    border-top: 1px solid #f1f5f9;
                }

                .insight-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .insight-icon {
                    color: #94a3b8;
                }

                .insight-label {
                    display: block;
                    font-size: 0.8rem;
                    color: #64748b;
                    font-weight: 500;
                }

                .insight-value {
                    display: block;
                    font-size: 1rem;
                    font-weight: 700;
                    color: #1e293b;
                }

                @media (max-width: 768px) {
                    .deep-stats-panel { padding: 1.5rem !important; }
                    .deep-stats-header h2 { font-size: 1.4rem; }
                    .header-controls { width: 100%; }
                    .activity-dropdown-container { min-width: 100%; }
                    .range-filters { width: 100%; justify-content: space-between; }
                    .filter-btn { flex: 1; padding: 0.5rem 0.5rem; font-size: 0.8rem; }
                    .deep-stats-grid { grid-template-columns: 1fr 1fr; gap: 0.75rem; }
                    .deep-stat-card { padding: 1rem; gap: 0.75rem; border-radius: 16px; }
                    .card-icon { width: 36px; height: 36px; border-radius: 10px; }
                    .card-icon svg { width: 18px; height: 18px; }
                    .card-data .value { font-size: 1.1rem; }
                    .card-data .label { font-size: 0.6rem; }
                    .insights-footer { grid-template-columns: 1fr; gap: 1rem; }
                    .chart-container-large { padding: 1rem; margin-bottom: 1.5rem; }
                    .chart-info-overlay { gap: 0.75rem; }
                    .activity-icon-large { width: 36px; height: 36px; border-radius: 10px; }
                    .activity-icon-large svg { width: 20px; height: 20px; }
                    .chart-info-overlay h3 { font-size: 1rem; }
                }

                @media (max-width: 480px) {
                    .deep-stats-grid { grid-template-columns: 1fr; }
                    .deep-stat-card { gap: 1rem; }
                    .deep-stats-header h2 { font-size: 1.25rem; }
                }
            `}</style>
        </section>
    );
}
