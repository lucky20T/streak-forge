import { getTodayString, formatHoursMins } from '../utils';
import ProductivityChart from './ProductivityChart';

export default function ActivityView({ appState, openFocus, openManage }) {
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
    let balanceRatio = 0;
    if (totalTrackedTime > 0) {
        balanceRatio = Math.round((productiveTime / totalTrackedTime) * 100);
    }
    
    let feedback = "Track your time to see balance insights.";
    let feedbackClass = "";
    if (totalTrackedTime > 0) {
        if (balanceRatio >= 70) {
            feedback = `🔥 Excellent discipline! ${balanceRatio}% of your time was productive today.`;
            feedbackClass = "good";
        } else if (balanceRatio >= 50) {
            feedback = `⚖️ Good balance. ${balanceRatio}% productive, but keep an eye on distractions.`;
        } else {
            feedback = `⚠️ Distraction warning! Only ${balanceRatio}% productive. Try to focus more!`;
            feedbackClass = "warning";
        }
    }

    const activeActivities = appState.activities.filter(a => !a.archived);

    return (
        <div className="app-container">
            <header className="top-header">
                <div className="header-left">
                    <h1>Activity Dashboard</h1>
                    <div className="date-display">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div className="header-right">
                    <button className="btn outline" onClick={openManage}>
                        ⚙️ Manage Activities
                    </button>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Productive Focus (Today)</div>
                    <div className="stat-value">{formatHoursMins(productiveTime)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label" style={{ color: '#f97316' }}>Entertainment (Today)</div>
                    <div className="stat-value">{formatHoursMins(entertainmentTime)}</div>
                </div>
                <div className="stat-card highlight">
                    <div className="stat-label">Productivity Ratio</div>
                    <div className="stat-value">{totalTrackedTime > 0 ? balanceRatio + '%' : '-'}</div>
                </div>
            </div>

            <div className="analytics-row mt-4">
                <section className="panel minimal-panel flex-1">
                    <h2>🎯 Focus Sessions</h2>
                    <div className="activity-list">
                        {activeActivities.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)' }}>No activities. Click "Manage Activities" to add some.</p>
                        ) : (
                            activeActivities.map(act => {
                                const todayData = appState.records[today]?.[act.id] || { time: 0 };
                                const badgeClass = act.type === 'productive' ? 'productive' : 'entertainment';
                                return (
                                    <div key={act.id} className="activity-card" onClick={() => openFocus(act.id)}>
                                        <div className="activity-info">
                                            <div className="activity-name">
                                                <span className={`manage-item-type ${badgeClass}`} style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem' }}>
                                                    {act.type === 'productive' ? 'PROD' : 'ENT'}
                                                </span>
                                                {act.name}
                                            </div>
                                            <div className="activity-stats">
                                                Today: {formatHoursMins(todayData.time)}
                                            </div>
                                        </div>
                                        <button className="btn primary small">Start</button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                <section className="panel minimal-panel flex-2">
                    <h2>📈 Weekly Productivity</h2>
                    <ProductivityChart appState={appState} />
                    <div className={`balance-feedback mt-4 ${feedbackClass}`}>
                        {feedback}
                    </div>
                </section>
            </div>
        </div>
    );
}
