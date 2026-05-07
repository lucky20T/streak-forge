import { getTodayString, formatHoursMins } from '../utils';
import ProductivityChart from './ProductivityChart';
import TopHeader from './TopHeader';
import { Code, Languages, Gamepad2, Play } from 'lucide-react';

export default function ActivityView({ appState, updateState, openFocus, openManage }) {
    const today = getTodayString();
    
    // Balance Insights Calculations
    let productiveTime = 0;
    let entertainmentTime = 0;
    
    if (appState.records[today]) {
        for (const actId in appState.records[today]) {
            const act = appState.activities.find(a => a.id === actId);
            if (act) {
                if (act.type === 'productive') productiveTime += appState.records[today][actId].time;
                if (act.type === 'entertainment') entertainmentTime += appState.records[today][actId].time;
            }
        }
    }

    const totalTrackedTime = productiveTime + entertainmentTime;
    let prodPercent = 0;
    let entPercent = 0;
    if (totalTrackedTime > 0) {
        prodPercent = Math.round((productiveTime / totalTrackedTime) * 100);
        entPercent = Math.round((entertainmentTime / totalTrackedTime) * 100);
    }

    const activeActivities = appState.activities.filter(a => !a.archived);

    // Helper to get an icon based on name
    const getIconForActivity = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('unreal') || lower.includes('code')) return <Code size={20} />;
        if (lower.includes('japanese') || lower.includes('language')) return <Languages size={20} />;
        if (lower.includes('chess') || lower.includes('game')) return <Gamepad2 size={20} />;
        return <Play size={20} />;
    };

    return (
        <div className="app-container">
            <TopHeader title="Activity" onManage={openManage} />

            <div className="analytics-row">
                <section className="panel flex-2" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px' }}>Weekly Focus</h2>
                    <ProductivityChart appState={appState} />
                </section>

                <section className="panel flex-1" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px' }}>Time Allocation</h2>
                    
                    <div style={{ marginTop: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 500 }}>
                            <span>Productive</span>
                            <span style={{ color: 'var(--accent)' }}>{formatHoursMins(productiveTime)}</span>
                        </div>
                        <div className="time-allocation-bar">
                            <div className="time-allocation-fill" style={{ width: `${prodPercent}%`, background: 'var(--accent)' }}></div>
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 500 }}>
                            <span>Entertainment</span>
                            <span style={{ color: 'var(--text-primary)' }}>{formatHoursMins(entertainmentTime)}</span>
                        </div>
                        <div className="time-allocation-bar">
                            <div className="time-allocation-fill" style={{ width: `${entPercent}%`, background: 'var(--text-secondary)' }}></div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Most focused activity</p>
                        <h3 style={{ fontSize: '1rem', marginTop: '0.25rem' }}>
                            {activeActivities.length > 0 ? activeActivities[0].name : '-'}
                        </h3>
                    </div>
                </section>
            </div>

            <h2 style={{ fontSize: '1.1rem', marginTop: '1rem', marginBottom: '1.5rem' }}>Current Activities</h2>
            <div className="activity-grid">
                {activeActivities.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No activities. Click "Manage" to add some.</p>
                ) : (
                    activeActivities.map(act => {
                        const todayData = appState.records[today]?.[act.id] || { time: 0 };
                        const isProd = act.type === 'productive';
                        const badgeClass = isProd ? 'productive' : 'recreation';
                        const tagText = isProd ? 'PRODUCTIVE' : 'RECREATION';
                        
                        // Mock goal calculation for UI
                        const mockGoal = 14400; // 4 hours in seconds
                        const progressPercent = Math.min((todayData.time / mockGoal) * 100, 100);

                        return (
                            <div key={act.id} className="activity-card" onClick={() => openFocus(act.id)}>
                                <div className="activity-card-header">
                                    <div className="activity-icon-box">
                                        {getIconForActivity(act.name)}
                                    </div>
                                    <span className={`activity-tag ${badgeClass}`}>{tagText}</span>
                                </div>
                                
                                <h3 className="activity-title">{act.name}</h3>
                                
                                <div className="activity-progress-info">
                                    <span>Today</span>
                                    <span><strong style={{color: 'var(--text-primary)'}}>{formatHoursMins(todayData.time)}</strong> / 4h</span>
                                </div>
                                
                                <div className="activity-progress-bar">
                                    <div className="time-allocation-fill" style={{ width: `${progressPercent}%`, background: isProd ? 'var(--accent)' : '#ef4444' }}></div>
                                </div>
                                
                                <div className={`activity-streak ${appState.streak.current === 0 ? 'zero' : ''}`}>
                                    <span>🔥</span> {appState.streak.current} days streak
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
