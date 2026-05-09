import { useEffect, useState } from 'react';
import { getTodayString, formatTime } from '../utils';
import { Play, Pause, Square, Maximize2, Minimize2, Coffee } from 'lucide-react';

export default function FloatingTimer({ appState, updateState, activityId, onClose, focusState, setFocusState }) {
    const today = getTodayString();
    const activity = appState.activities.find(a => a.id === activityId);
    
    const [isExpanded, setIsExpanded] = useState(true);
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
            interval = setInterval(() => {
                setFocusState(prev => ({ ...prev, break: prev.break + 1 }));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [focusState.status, setFocusState]);

    if (!activity) return null;

    const todayData = appState.records[today]?.[activityId] || { time: 0, break: 0, breaks: [], goal: 0 };
    const totalDisplayTime = todayData.time + focusState.time;
    
    const handleStart = () => setFocusState(prev => ({ ...prev, status: 'running' }));
    const handleBreakClick = () => setFocusState(prev => ({ ...prev, status: 'break-selection' }));
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

    const formattedTotalTimer = formatTime(totalDisplayTime);
    const bigTimerDisplay = totalDisplayTime < 3600 ? formattedTotalTimer.substring(3) : formattedTotalTimer;
    
    const remTimer = formatTime(focusState.breakRemaining || 0);
    const breakTimerDisplay = (focusState.breakRemaining || 0) < 3600 ? remTimer.substring(3) : remTimer;

    const isBreakMode = focusState.status.startsWith('break');

    if (!isExpanded) {
        return (
            <div className="floating-timer-wrapper">
                <div 
                    className={`floating-timer-minimized ${isBreakMode ? 'break-mode' : ''}`}
                    onClick={() => setIsExpanded(true)}
                >
                    {isBreakMode ? <Coffee size={18} /> : <Play size={18} />}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.8, textTransform: 'uppercase' }}>
                            {isBreakMode ? 'Break' : 'Focusing'}
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                            {isBreakMode ? breakTimerDisplay : bigTimerDisplay}
                        </span>
                    </div>
                    <Maximize2 size={16} style={{ marginLeft: '0.5rem', opacity: 0.6 }} />
                </div>
            </div>
        );
    }

    return (
        <div className="floating-timer-wrapper">
            <div className="floating-timer-expanded">
                
                <div className="floating-timer-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isBreakMode ? '#ea580c' : 'var(--accent)' }}></div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {activity.name}
                        </span>
                    </div>
                    <button className="icon-btn" style={{ padding: '0.25rem' }} onClick={() => setIsExpanded(false)}>
                        <Minimize2 size={16} />
                    </button>
                </div>

                {focusState.status === 'break-selection' ? (
                    <div>
                        <h3 style={{ fontSize: '1rem', color: '#9a3412', marginBottom: '1rem', textAlign: 'center' }}>Select Duration</h3>
                        <div className="floating-break-grid">
                            <button className="btn outline" style={{ background: '#fffbeb', borderColor: '#fcd34d', color: '#b45309', padding: '0.5rem' }} onClick={() => handleStartBreak(120)}>2 min</button>
                            <button className="btn outline" style={{ background: '#fffbeb', borderColor: '#fcd34d', color: '#b45309', padding: '0.5rem' }} onClick={() => handleStartBreak(300)}>5 min</button>
                            <button className="btn outline" style={{ background: '#fffbeb', borderColor: '#fcd34d', color: '#b45309', padding: '0.5rem' }} onClick={() => handleStartBreak(600)}>10 min</button>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                <input 
                                    type="number" 
                                    value={customBreakMins} 
                                    onChange={(e) => setCustomBreakMins(e.target.value)} 
                                    style={{ width: '40px', padding: '0.25rem', borderRadius: '4px', border: '1px solid #fcd34d', fontSize: '0.8rem' }} 
                                />
                                <button className="btn outline flex-1" style={{ background: '#fffbeb', borderColor: '#fcd34d', color: '#b45309', padding: '0.5rem 0.25rem' }} onClick={() => handleStartBreak(customBreakMins * 60)}>Start</button>
                            </div>
                        </div>
                        <button className="btn primary w-100" style={{ padding: '0.5rem' }} onClick={handleResumeFromBreak}>Cancel</button>
                    </div>
                ) : focusState.status === 'break-running' || focusState.status === 'break-finished' ? (
                    <div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: focusState.status === 'break-finished' ? '#16a34a' : '#ea580c', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {focusState.status === 'break-finished' ? 'FINISHED' : 'BREAK'}
                            </div>
                            <div className="floating-timer-circle-mini" style={{ 
                                boxShadow: focusState.status === 'break-finished' ? '0 0 0 4px #dcfce7' : '0 0 0 4px #ffedd5',
                                color: focusState.status === 'break-finished' ? '#16a34a' : '#ea580c',
                                animation: focusState.status === 'break-finished' ? 'pulse 2s infinite' : 'none'
                            }}>
                                {breakTimerDisplay}
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button className="btn primary w-100" style={{ background: focusState.status === 'break-finished' ? 'var(--success)' : '' }} onClick={handleResumeFromBreak}>
                                ▶ Resume Focus
                            </button>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn outline flex-1" style={{ padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => handleStartBreak((focusState.breakRemaining || 0) + 300)}>
                                    + 5m
                                </button>
                                <button className="btn outline flex-1" style={{ padding: '0.5rem', fontSize: '0.8rem' }} onClick={handleStop}>
                                    <Square size={14} style={{ marginRight: '0.25rem' }} /> Stop
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                FOCUS
                            </div>
                            <div className="floating-timer-circle-mini" style={{ boxShadow: '0 0 0 2px #e5e7eb', color: '#111827' }}>
                                {bigTimerDisplay}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn outline flex-1" style={{ background: '#f3f4f6', border: 'none', padding: '0.75rem' }} onClick={handleBreakClick}>
                                <Pause size={16} />
                            </button>
                            <button className="btn primary flex-2" style={{ padding: '0.75rem' }} onClick={handleStart}>
                                {focusState.status === 'idle' && focusState.time > 0 ? 'Resume' : 'Start'}
                            </button>
                            <button className="btn outline flex-1" style={{ background: '#fef2f2', color: '#dc2626', border: 'none', padding: '0.75rem' }} onClick={handleStop}>
                                <Square size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
