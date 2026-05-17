import { useEffect, useState } from 'react';
import { getTodayString, formatTime } from '../utils';

export default function FocusModal({ appState, updateState, activityId, onClose, focusState, setFocusState }) {
    const today = getTodayString();
    const activity = appState.activities.find(a => a.id === activityId);
    const [customBreakMins, setCustomBreakMins] = useState(15);
    
    // Timer Effect
    useEffect(() => {
        let interval = null;
        if (focusState.status === 'running') {
            interval = setInterval(() => {
                setFocusState(prev => ({ ...prev, time: prev.time + 1 }));
            }, 1000);
        } else if (focusState.status === 'break-running') {
            interval = setInterval(() => {
                setFocusState(prev => {
                    const newRem = (prev.breakRemaining || 0) - 1;
                    const elapsed = (prev.currentBreakElapsed || 0) + 1;
                    if (newRem <= 0) {
                        return { 
                            ...prev, 
                            status: 'break-finished', 
                            breakRemaining: 0, 
                            break: prev.break + 1,
                            currentBreakElapsed: elapsed
                        };
                    }
                    return { 
                        ...prev, 
                        breakRemaining: newRem, 
                        break: prev.break + 1, 
                        currentBreakElapsed: elapsed 
                    };
                });
            }, 1000);
        } else if (focusState.status === 'break') {
            // legacy catch
            interval = setInterval(() => {
                setFocusState(prev => ({ ...prev, break: prev.break + 1 }));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [focusState.status, setFocusState]);

    if (!activity) return null;

    const todayData = appState.records[today]?.[activityId] || { time: 0, break: 0, breaks: [], goal: 0 };
    const totalDisplayTime = todayData.time + focusState.time;
    const sessionDisplayTime = focusState.time;
    
    let mainTitle = 'Deep Focus';
    let subTitle = 'Immerse yourself in the task.';
    
    if (focusState.status.startsWith('break')) {
        mainTitle = 'Take a breather';
        subTitle = 'Let your mind rest before the next sprint.';
    }

    if (focusState.status === 'break-finished') {
        mainTitle = 'Break Finished';
        subTitle = 'Time to resume your focus!';
    }

    const handleStart = () => {
        setFocusState(prev => {
            if (prev.status === 'running') return prev;
            return { ...prev, status: 'running' };
        });
    };

    const handlePause = () => {
        setFocusState(prev => {
            if (prev.status !== 'running') return prev;
            return { ...prev, status: 'idle' };
        });
    };

    const handleBreakClick = () => {
        setFocusState(prev => ({ ...prev, status: 'break-selection' }));
    };

    const handleStartBreak = (seconds) => {
        setFocusState(prev => ({
            ...prev,
            status: 'break-running',
            breakRemaining: seconds,
            currentBreakElapsed: 0
        }));
    };

    const handleResumeFromBreak = () => {
        const thisBreak = focusState.currentBreakElapsed || 0;
        const newSessionBreaks = [...(focusState.sessionBreaks || []), thisBreak];
        
        setFocusState(prev => ({ 
            ...prev, 
            status: 'running',
            currentBreakElapsed: 0,
            sessionBreaks: newSessionBreaks
        }));
    };

    const handleStop = () => {
        if (focusState.time > 0 || focusState.break > 0) {
            const updatedRecords = { ...appState.records };
            if (!updatedRecords[today]) updatedRecords[today] = {};
            if (!updatedRecords[today][activityId]) updatedRecords[today][activityId] = { time: 0, break: 0, breaks: [], goal: 0 };

            const finalBreaks = [...(updatedRecords[today][activityId].breaks || []), ...(focusState.sessionBreaks || [])];
            if (focusState.status.startsWith('break') && focusState.currentBreakElapsed > 0) {
                finalBreaks.push(focusState.currentBreakElapsed);
            }

            updatedRecords[today][activityId] = {
                ...updatedRecords[today][activityId],
                time: updatedRecords[today][activityId].time + focusState.time,
                break: (updatedRecords[today][activityId].break || 0) + focusState.break,
                breaks: finalBreaks
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
        setFocusState({ status: 'idle', time: 0, break: 0, breakRemaining: 0, sessionBreaks: [], currentBreakElapsed: 0 });
        onClose();
    };

    // Format MM:SS for the big timer if it's less than an hour, else HH:MM:SS
    const formattedTotalTimer = formatTime(totalDisplayTime);
    const bigTimerDisplay = totalDisplayTime < 3600 ? formattedTotalTimer.substring(3) : formattedTotalTimer;

    const formattedSessionTimer = formatTime(sessionDisplayTime);
    
    // Break Remaining Timer
    const remTimer = formatTime(focusState.breakRemaining || 0);
    const breakTimerDisplay = (focusState.breakRemaining || 0) < 3600 ? remTimer.substring(3) : remTimer;

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

            {focusState.status === 'break-selection' ? (
                <div style={{ width: '400px', margin: '4rem auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '2rem', color: '#9a3412', marginBottom: '0.5rem' }}>Select Break Duration</h1>
                        <p style={{ color: '#c2410c' }}>How long do you need?</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <button className="btn outline large" style={{ background: '#fffbeb', borderColor: '#fcd34d', color: '#b45309' }} onClick={() => handleStartBreak(120)}>2 min</button>
                        <button className="btn outline large" style={{ background: '#fffbeb', borderColor: '#fcd34d', color: '#b45309' }} onClick={() => handleStartBreak(300)}>5 min</button>
                        <button className="btn outline large" style={{ background: '#fffbeb', borderColor: '#fcd34d', color: '#b45309' }} onClick={() => handleStartBreak(600)}>10 min</button>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input 
                                type="number" 
                                value={customBreakMins} 
                                onChange={(e) => setCustomBreakMins(e.target.value)} 
                                style={{ width: '60px', padding: '0.5rem', borderRadius: '8px', border: '1px solid #fcd34d' }} 
                            />
                            <button className="btn outline flex-1" style={{ background: '#fffbeb', borderColor: '#fcd34d', color: '#b45309' }} onClick={() => handleStartBreak(customBreakMins * 60)}>Start</button>
                        </div>
                    </div>
                    <button className="btn primary large w-100" onClick={handleResumeFromBreak}>Cancel Break</button>
                </div>
            ) : focusState.status === 'break-running' || focusState.status === 'break-finished' || focusState.status === 'break' ? (
                <>
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <h1 style={{ fontSize: '2rem', color: focusState.status === 'break-finished' ? '#16a34a' : '#9a3412', marginBottom: '0.5rem' }}>{mainTitle}</h1>
                        <p style={{ color: focusState.status === 'break-finished' ? '#15803d' : '#c2410c' }}>{subTitle}</p>
                    </div>
                    
                    <div className="focus-timer-circle" style={{ 
                        boxShadow: focusState.status === 'break-finished' ? '0 0 0 4px #dcfce7, 0 20px 25px -5px rgba(0, 0, 0, 0.05)' : '0 0 0 4px #ffedd5, 0 20px 25px -5px rgba(0, 0, 0, 0.05)',
                        animation: focusState.status === 'break-finished' ? 'pulse 2s infinite' : 'none'
                    }}>
                        <div className="focus-timer-text" style={{ color: focusState.status === 'break-finished' ? '#16a34a' : '#9a3412' }}>
                            {focusState.status === 'break' ? '...' : breakTimerDisplay}
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-secondary)' }}>Remaining</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px', margin: '0 auto' }}>
                        <button className="btn primary large" style={{ width: '100%', background: focusState.status === 'break-finished' ? 'var(--success)' : '' }} onClick={handleResumeFromBreak}>
                            ▶ Resume Focus
                        </button>
                        <div className="focus-controls-row">
                            <button className="btn outline large flex-1" onClick={() => handleStartBreak((focusState.breakRemaining || 0) + 300)}>
                                + Extend Break (+5m)
                            </button>
                            <button className="btn outline large flex-1" onClick={handleStop}>
                                ⏹ Stop Session
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="focus-timer-circle" style={{ boxShadow: '0 0 0 1px #e5e7eb, 0 20px 25px -5px rgba(0, 0, 0, 0.05)', marginTop: '4rem', marginBottom: '4rem', width: '350px', height: '150px', borderRadius: '100px' }}>
                        <div className="focus-timer-text" style={{ color: '#111827', fontSize: '6rem' }}>{bigTimerDisplay}</div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '400px', margin: '0 auto' }}>
                        <div className="focus-controls-row" style={{ marginTop: '0' }}>
                            <button className="btn outline large flex-1" style={{ background: '#f3f4f6', border: 'none' }} onClick={handleBreakClick}>
                                ⏸ Break
                            </button>
                            <button 
                                className="btn primary large flex-1" 
                                onClick={focusState.status === 'running' ? handlePause : handleStart}
                            >
                                {focusState.status === 'running' ? '⏸ Pause' : (focusState.status === 'idle' && sessionDisplayTime > 0 ? '▶ Resume' : '▶ Start')}
                            </button>
                            <button className="btn outline large flex-1" style={{ background: '#f3f4f6', border: 'none' }} onClick={handleStop}>
                                ⏹ Stop
                            </button>
                        </div>
                        <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem', marginTop: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Today's Total</div>
                                <div style={{ fontWeight: 500, color: 'var(--accent)' }}>{formattedTotalTimer}</div>
                            </div>
                            <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Current Session</div>
                                <div style={{ fontWeight: 500 }}>{formattedSessionTimer}</div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
