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
    
    let mainTitle = 'Deep Focus';
    let subTitle = 'Immerse yourself in the task.';
    
    if (focusState.status === 'break') {
        mainTitle = 'Take a breather';
        subTitle = 'Let your mind rest before the next sprint.';
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

    // Format MM:SS for the big timer if it's less than an hour, else HH:MM:SS
    const formattedTimer = formatTime(displayTime);
    const bigTimerDisplay = displayTime < 3600 ? formattedTimer.substring(3) : formattedTimer;

    return (
        <div className="focus-fullscreen">
            <div className="focus-header-bar">
                <button className="btn outline" style={{ border: 'none' }} onClick={handleStop}>
                    ← Exit Session
                </button>
                <div style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                    🔥 CURRENT STREAK: {appState.streak.current} DAYS
                </div>
            </div>

            <div style={{ textAlign: 'center' }}>
                <div style={{ background: '#e5e7eb', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 1rem', borderRadius: '20px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }}></div>
                    Focusing on
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>{activity.name}</div>
            </div>

            {/* The aesthetic circle changes based on break vs focus */}
            {focusState.status === 'break' ? (
                <>
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <h1 style={{ fontSize: '2rem', color: '#9a3412', marginBottom: '0.5rem' }}>{mainTitle}</h1>
                        <p style={{ color: '#c2410c' }}>{subTitle}</p>
                    </div>
                    <div className="focus-timer-circle" style={{ boxShadow: '0 0 0 4px #ffedd5, 0 20px 25px -5px rgba(0, 0, 0, 0.05)' }}>
                        <div className="focus-timer-text" style={{ color: '#9a3412' }}>{bigTimerDisplay}</div>
                    </div>
                </>
            ) : (
                <div className="focus-timer-circle" style={{ boxShadow: '0 0 0 1px #e5e7eb, 0 20px 25px -5px rgba(0, 0, 0, 0.05)', marginTop: '4rem', marginBottom: '4rem', width: '350px', height: '150px', borderRadius: '100px' }}>
                    <div className="focus-timer-text" style={{ color: '#111827', fontSize: '6rem' }}>{bigTimerDisplay}</div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px' }}>
                {focusState.status === 'break' ? (
                    <>
                        <button className="btn primary large" style={{ width: '100%' }} onClick={handleStart}>
                            ▶ Resume Focus
                        </button>
                        <div className="focus-controls-row">
                            <button className="btn outline large flex-1" onClick={() => setFocusState(prev => ({...prev, break: prev.break + 300}))}>
                                + Extend Break (+5m)
                            </button>
                            <button className="btn outline large flex-1" onClick={handleStop}>
                                ⏹ Stop Session
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="focus-controls-row" style={{ marginTop: '0' }}>
                            <button className="btn outline large flex-1" style={{ background: '#f3f4f6', border: 'none' }} onClick={handleBreak}>
                                ⏸ Break
                            </button>
                            <button className="btn primary large flex-1" onClick={handleStart}>
                                ▶ Start
                            </button>
                            <button className="btn outline large flex-1" style={{ background: '#f3f4f6', border: 'none' }} onClick={handleStop}>
                                ⏹ Stop
                            </button>
                        </div>
                        <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem', marginTop: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Today's Goal</div>
                                <div style={{ fontWeight: 500 }}>60 Minutes</div>
                            </div>
                            <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Completed</div>
                                <div style={{ fontWeight: 500 }}>{Math.floor(displayTime / 60)} Minutes</div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
