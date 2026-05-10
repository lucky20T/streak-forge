import { useState, useMemo } from 'react';
import TopHeader from './TopHeader';
import CanvasBarChart from './CanvasBarChart';
import { formatHoursMins } from '../utils';
import { 
    getDateRange, 
    getDatesInRange, 
    aggregateActivityData, 
    aggregateExerciseData, 
    aggregateNutritionData, 
    aggregateFinanceData, 
    generateSmartInsights 
} from '../utils/analyticsEngine';

export default function AnalyticsView({ appState }) {
    const [filter, setFilter] = useState('Week');

    const actData = useMemo(() => aggregateActivityData(appState, filter), [appState, filter]);
    const exData = useMemo(() => aggregateExerciseData(appState, filter), [appState, filter]);
    const nutData = useMemo(() => aggregateNutritionData(appState, filter), [appState, filter]);
    const finData = useMemo(() => aggregateFinanceData(appState, filter), [appState, filter]);
    const insights = useMemo(() => generateSmartInsights(actData, exData, nutData, filter), [actData, exData, nutData, filter]);

    // Chart Data Generation
    const chartDataActivity = useMemo(() => {
        const { startDate, endDate } = getDateRange(filter);
        const dates = getDatesInRange(startDate, endDate);
        
        let labels = dates.map(d => d.slice(5)); // 'MM-DD'
        if (filter === 'Week') {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            labels = dates.map(d => dayNames[new Date(d).getDay()]);
        }

        const prodData = dates.map(d => {
            let sum = 0;
            if (appState.records[d]) {
                Object.entries(appState.records[d]).forEach(([actId, log]) => {
                    const act = appState.activities.find(a => a.id === actId);
                    if (act && act.type === 'productive') sum += (log.time || 0);
                });
            }
            return sum / 3600; // in hours
        });

        const entData = dates.map(d => {
            let sum = 0;
            if (appState.records[d]) {
                Object.entries(appState.records[d]).forEach(([actId, log]) => {
                    const act = appState.activities.find(a => a.id === actId);
                    if (act && act.type === 'entertainment') sum += (log.time || 0);
                });
            }
            return sum / 3600;
        });

        return {
            labels,
            datasets: [
                { label: 'Productive (hrs)', data: prodData, color: '#2563eb' },
                { label: 'Entertainment (hrs)', data: entData, color: '#8b5cf6' }
            ]
        };
    }, [appState, filter]);



    const chartDataIncomeExpense = useMemo(() => {
        const { startDate, endDate } = getDateRange(filter);
        const dates = getDatesInRange(startDate, endDate);
        
        let labels = dates.map(d => d.slice(5)); // 'MM-DD'
        if (filter === 'Week') {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            labels = dates.map(d => dayNames[new Date(d).getDay()]);
        }

        const incData = dates.map(d => {
            let sum = 0;
            finData.filteredTransactions.forEach(tx => {
                if (tx.type === 'income' && tx.date.startsWith(d)) {
                    sum += tx.amount;
                }
            });
            return sum;
        });

        const expData = dates.map(d => {
            let sum = 0;
            finData.filteredTransactions.forEach(tx => {
                if (tx.type === 'expense' && tx.date.startsWith(d)) {
                    sum += tx.amount;
                }
            });
            return sum;
        });

        return {
            labels,
            datasets: [
                { label: 'Income (₹)', data: incData, color: '#10b981' },
                { label: 'Expenses (₹)', data: expData, color: '#ef4444' }
            ]
        };
    }, [finData.filteredTransactions, filter]);



    const FilterButton = ({ label }) => (
        <button 
            className={`btn ${filter === label ? 'primary' : 'outline'}`}
            style={{ borderRadius: '20px', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
            onClick={() => setFilter(label)}
        >
            {label}
        </button>
    );

    return (
        <div className="app-container">
            <TopHeader title="Analytics" />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Deep dive into your personal data and trends.</p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <FilterButton label="Week" />
                    <FilterButton label="Month" />
                    <FilterButton label="Year" />
                    <FilterButton label="All Time" />
                </div>
            </div>

            {/* Smart Insights Panel */}
            <div className="panel" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '2rem', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#1e3a8a', fontWeight: 600, fontSize: '1rem', marginBottom: '1.25rem' }}>
                    <span>🧠</span> Smart Insights
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#1e40af', fontSize: '0.9rem', lineHeight: 1.7 }}>
                    {insights.map((insight, i) => (
                        <li key={i} style={{ marginBottom: '0.75rem' }}>{insight}</li>
                    ))}
                </ul>
            </div>

            {/* High Level Stats */}
            <div className="dashboard-grid" style={{ marginBottom: '2.5rem', gap: '2rem' }}>
                <div className="panel stat-card" style={{ padding: '2rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>Total Focus</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{formatHoursMins(actData.totalFocus)}</div>
                </div>
                <div className="panel stat-card" style={{ padding: '2rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>Current Streak</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f59e0b' }}>🔥 {appState.streak.current} Days</div>
                </div>
                <div className="panel stat-card" style={{ padding: '2rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>Total Reps</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>{exData.totalReps}</div>
                </div>
                <div className="panel stat-card" style={{ padding: '2rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>Income Spent</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: finData.spentPercent > 80 ? 'var(--danger)' : 'inherit' }}>{finData.spentPercent}%</div>
                </div>
            </div>

            <div className="dashboard-grid" style={{ gap: '2rem' }}>
                {/* Activity Analytics */}
                <section className="panel" style={{ padding: '2.5rem', gridColumn: 'span 2' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Activity & Focus Trend</h2>
                    <CanvasBarChart 
                        data={chartDataActivity} 
                        height={250} 
                        isStacked={true} 
                        type={filter === 'Week' ? 'bar' : 'line'}
                        minPointWidth={40}
                    />
                    
                    <div style={{ display: 'flex', gap: '3rem', marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Most Focused</div>
                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{actData.mostFocused}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Daily Avg</div>
                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{formatHoursMins(actData.dailyAverage)}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Longest Session</div>
                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{formatHoursMins(actData.longestSession)}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Avg Break</div>
                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{Math.round(actData.averageBreak / 60)} min</div>
                        </div>
                    </div>
                </section>

                {/* Exercise & Nutrition Analytics */}
                <section className="panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Exercise & Health</h2>
                    
                    <div style={{ marginBottom: '2rem', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Reps</span>
                            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{exData.totalReps}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Healthy Meals</span>
                            <span style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--success)' }}>{nutData.healthyCount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Junk Food</span>
                            <span style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--danger)' }}>{nutData.junkCount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Water Intake</span>
                            <span style={{ fontWeight: 600, fontSize: '1.1rem', color: '#3b82f6' }}>{nutData.totalWater} Glasses</span>
                        </div>
                    </div>
                </section>

                {/* Finance Analytics */}
                <section className="panel" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Financial Overview</h2>
                    
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ flex: 1, background: '#ecfdf5', padding: '1.5rem', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                            <div style={{ fontSize: '0.8rem', color: '#047857', marginBottom: '0.5rem' }}>Income</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#065f46' }}>₹{finData.totalIncome.toLocaleString()}</div>
                        </div>
                        <div style={{ flex: 1, background: '#fef2f2', padding: '1.5rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
                            <div style={{ fontSize: '0.8rem', color: '#b91c1c', marginBottom: '0.5rem' }}>Expenses</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#991b1b' }}>₹{finData.totalExpenses.toLocaleString()}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Remaining Balance</span>
                        <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>₹{finData.remaining.toLocaleString()}</span>
                    </div>

                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', marginTop: '1.5rem' }}>Income vs Expense Trend</h3>
                    <CanvasBarChart 
                        data={chartDataIncomeExpense} 
                        height={160} 
                        isStacked={false} 
                        type={filter === 'Week' ? 'bar' : 'line'}
                        minPointWidth={40}
                    />
                </section>
            </div>
        </div>
    );
}
