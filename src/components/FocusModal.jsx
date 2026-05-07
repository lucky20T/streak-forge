import { useEffect } from 'react';
import { getTodayString, formatTime } from '../utils';

export default function FocusModal({ appState, updateState, activityId, onClose, focusState, setFocusState }) {
    const today = getTodayString();
    const activity = appState.activities.find(a => a.id === activityId);
    
    // Timer Effect
    useEffect(() => {
        let interval = null;
        if (focusState.status === 'running') {
            interval = setInterval(() => {
                setFocusState(prev => ({ ...prev, time: prev.time + 1 }));
            }, 1000);
        } else if (focusState.status === 'break') {
            interval = setInterval(() => {
                setFocusState(prev => ({ ...prev, break: prev.break + 1 }));
            }, 1000);
        } else if (focusState.status === 'idle') {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [focusState.status, setFocusState]);

    if (!activity) return null;

    const todayData = appState.records[today]?.[activityId] || { time: 0, break: 0, goal: 0 };
    const displayTime = focusState.time > 0 ? focusState.time : todayData.time;
    
    // Dynamic text logic
    let statusText = 'Ready to focus?';
    let statusColor = 'var(--text-secondary)';
    
    if (focusState.status === 'running') {
        statusText = '🔥 Deep work in progress...';
        statusColor = 'var(--accent)';
    } else if (focusState.status === 'break') {
        statusText = '☕ Taking a break...';
        statusColor = '#f97316';
    }

    const handleStart = () => {
        setFocusState(prev => ({ ...prev, status: 'running' }));
    };

    const handleBreak = () => {
        setFocusState(prev => ({ ...prev, status: 'break' }));
    };

    const handleStop = () => {
        if (focusState.time > 0 || focusState.break > 0) {
            const updatedRecords = { ...appState.records };
            updatedRecords[today][activityId] = {
                ...updatedRecords[today][activityId],
                time: updatedRecords[today][activityId].time + focusState.time,
                break: (updatedRecords[today][activityId].break || 0) + focusState.break
            };

            // Update streaks for productive activities
            let newStreak = { ...appState.streak };
            if (activity.type === 'productive' && focusState.time > 0) {
                if (newStreak.lastStreakDate !== today) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
                    
                    if (newStreak.lastStreakDate === yStr) {
                        newStreak.current += 1;
                    } else if (newStreak.lastStreakDate !== today) {
                        newStreak.current = 1;
                    }
                    newStreak.lastStreakDate = today;
                    if (newStreak.current > newStreak.best) {
                        newStreak.best = newStreak.current;
                    }
                }
            }

            updateState({ records: updatedRecords, streak: newStreak });
        }

        setFocusState({ status: 'idle', time: 0, break: 0 });
        onClose();
    };

    return (
        <div className="overlay overlay-active">
            <div className="overlay-content focus-mode-panel">
                <button className="icon-btn" style={{ position: 'absolute', top: '1rem', right: '1rem' }} onClick={handleStop}>✖</button>
                
                <h2 style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{activity.name}</h2>
                <div style={{ fontSize: '4rem', fontWeight: 800, margin: '2rem 0', fontFamily: 'monospace', letterSpacing: '2px', color: 'var(--text-primary)' }}>
                    {formatTime(displayTime)}
                </div>
                
                <div style={{ fontSize: '0.9rem', color: statusColor, marginBottom: '2rem', height: '20px' }}>
                    {statusText}
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    {focusState.status !== 'running' && (
                        <button className="btn primary large" onClick={handleStart}>
                            {focusState.status === 'break' ? 'Resume Focus' : 'Start Focus'}
                        </button>
                    )}
                    {focusState.status === 'running' && (
                        <button className="btn outline large" onClick={handleBreak}>Take Break</button>
                    )}
                    {(focusState.status === 'running' || focusState.status === 'break') && (
                        <button className="btn danger large" onClick={handleStop}>Stop & Save</button>
                    )}
                </div>
            </div>
        </div>
    );
}
