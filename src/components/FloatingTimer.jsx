import { useEffect, useState } from 'react';
import { getTodayString, formatTime } from '../utils';
import { Play, Pause, Square, Maximize2, Minimize2, Coffee } from 'lucide-react';

export default function FloatingTimer({ appState, updateState, activityId, onClose, triggerSync }) {
    const activity = appState.activities.find(a => a.id === activityId);
    const [isExpanded, setIsExpanded] = useState(true);
    const [customBreakMins, setCustomBreakMins] = useState(15);
    
    // Internal session state managed dynamically
    const [session, setSession] = useState(() => {
        const saved = localStorage.getItem('streakForge_activeSession');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.activityId === activityId) {
                    return parsed;
                }
            } catch(e) {}
        }
        return {
            activityId,
            status: 'idle', // 'idle', 'running', 'break-selection', 'break-running', 'break-finished'
            lastRunStartTime: null,
            accumulatedTime: 0,
            
            lastBreakStartTime: null,
            currentBreakTarget: 0,
            accumulatedBreakTime: 0,
            
            sessionBreaks: [],
            startDate: getTodayString()
        };
    });

    const [displayTime, setDisplayTime] = useState(session.accumulatedTime);
    const [breakRemaining, setBreakRemaining] = useState(session.currentBreakTarget - session.accumulatedBreakTime);

    // Heartbeat logic
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const today = getTodayString();
            
            setSession(prev => {
                let newState = { ...prev };
                
                // Midnight crossover auto-stop
                if (today !== newState.startDate) {
                    handleStop(newState, true); // Force stop to save yesterday's data
                    return newState; // Will unmount soon
                }

                if (newState.status === 'running' && newState.lastRunStartTime) {
                    const elapsed = Math.floor((now - newState.lastRunStartTime) / 1000);
                    setDisplayTime(newState.accumulatedTime + elapsed);
                } else if (newState.status === 'break-running' && newState.lastBreakStartTime) {
                    const elapsed = newState.accumulatedBreakTime + Math.floor((now - newState.lastBreakStartTime) / 1000);
                    const remaining = newState.currentBreakTarget - elapsed;
                    
                    if (remaining <= 0) {
                        newState = {
                            ...newState,
                            status: 'break-finished',
                            accumulatedBreakTime: newState.currentBreakTarget,
                            lastBreakStartTime: null
                        };
                        setBreakRemaining(0);
                    } else {
                        setBreakRemaining(remaining);
                    }
                }
                
                // Persist live state to local storage to survive crashes
                localStorage.setItem('streakForge_activeSession', JSON.stringify(newState));
                return newState;
            });
        }, 1000);
        
        return () => clearInterval(interval);
    }, []);

    if (!activity) return null;

    const todayData = appState.records[getTodayString()]?.[activityId] || { time: 0, break: 0, breaks: [], goal: 0 };
    const totalDisplayTime = todayData.time + displayTime;
    
    const handleStart = () => {
        setSession(prev => ({
            ...prev,
            status: 'running',
            lastRunStartTime: Date.now()
        }));
    };

    const handlePause = () => {
        setSession(prev => {
            let elapsed = 0;
            if (prev.lastRunStartTime) {
                elapsed = Math.floor((Date.now() - prev.lastRunStartTime) / 1000);
            }
            return {
                ...prev,
                status: 'idle',
                accumulatedTime: prev.accumulatedTime + elapsed,
                lastRunStartTime: null
            };
        });
    };

    const handleBreakClick = () => {
        handlePause();
        setSession(prev => ({ ...prev, status: 'break-selection' }));
    };

    const handleStartBreak = (seconds) => {
        setSession(prev => ({
            ...prev,
            status: 'break-running',
            lastBreakStartTime: Date.now(),
            currentBreakTarget: seconds,
            accumulatedBreakTime: 0
        }));
        setBreakRemaining(seconds);
    };

    const handleResumeFromBreak = () => {
        setSession(prev => {
            let elapsedBreak = prev.accumulatedBreakTime;
            if (prev.status === 'break-running' && prev.lastBreakStartTime) {
                elapsedBreak += Math.floor((Date.now() - prev.lastBreakStartTime) / 1000);
            }
            
            const newSessionBreaks = [...prev.sessionBreaks];
            if (elapsedBreak > 0) {
                newSessionBreaks.push(elapsedBreak);
            }
            
            return {
                ...prev,
                status: 'running',
                lastRunStartTime: Date.now(),
                lastBreakStartTime: null,
                currentBreakTarget: 0,
                accumulatedBreakTime: 0,
                sessionBreaks: newSessionBreaks
            };
        });
    };

    const handleStop = (forcedSession = null, isCrossover = false) => {
        const s = forcedSession || session;
        const targetDate = s.startDate; // Save to the date it started
        
        let finalFocus = s.accumulatedTime;
        if (s.status === 'running' && s.lastRunStartTime) {
            finalFocus += Math.floor((Date.now() - s.lastRunStartTime) / 1000);
        }
        
        let finalBreak = s.accumulatedBreakTime;
        if (s.status === 'break-running' && s.lastBreakStartTime) {
            finalBreak += Math.floor((Date.now() - s.lastBreakStartTime) / 1000);
        }
        
        const finalBreaksArr = [...s.sessionBreaks];
        if (finalBreak > 0) finalBreaksArr.push(finalBreak);
        const totalBreakTime = finalBreaksArr.reduce((a, b) => a + b, 0);

        if (finalFocus > 0 || totalBreakTime > 0) {
            const updatedRecords = { ...appState.records };
            if (!updatedRecords[targetDate]) updatedRecords[targetDate] = {};
            if (!updatedRecords[targetDate][activityId]) updatedRecords[targetDate][activityId] = { time: 0, break: 0, breaks: [], goal: 0 };

            const prevBreaks = updatedRecords[targetDate][activityId].breaks || [];

            updatedRecords[targetDate][activityId] = {
                ...updatedRecords[targetDate][activityId],
                time: updatedRecords[targetDate][activityId].time + finalFocus,
                break: (updatedRecords[targetDate][activityId].break || 0) + totalBreakTime,
                breaks: [...prevBreaks, ...finalBreaksArr]
            };

            let newStreak = { ...appState.streak };
            if (activity.type === 'productive' && finalFocus > 0) {
                if (newStreak.lastStreakDate !== targetDate) {
                    const yesterdayDate = new Date(targetDate);
                    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
                    const yStr = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;
                    
                    if (newStreak.lastStreakDate === yStr) {
                        newStreak.current += 1;
                    } else if (newStreak.lastStreakDate !== targetDate) {
                        newStreak.current = 1;
                    }
                    newStreak.lastStreakDate = targetDate;
                    if (newStreak.current > newStreak.best) {
                        newStreak.best = newStreak.current;
                    }
                }
            }
            updateState({ records: updatedRecords, streak: newStreak });
            if (triggerSync) triggerSync();
        }
        
        localStorage.removeItem('streakForge_activeSession');
        if (!isCrossover) {
            onClose();
        } else {
            // If crossover, we automatically start a new session for the new day
            setSession({
                activityId,
                status: 'idle',
                lastRunStartTime: null,
                accumulatedTime: 0,
                lastBreakStartTime: null,
                currentBreakTarget: 0,
                accumulatedBreakTime: 0,
                sessionBreaks: [],
                startDate: getTodayString()
            });
            setDisplayTime(0);
        }
    };

    const formattedTotalTimer = formatTime(totalDisplayTime);
    const bigTimerDisplay = totalDisplayTime < 3600 ? formattedTotalTimer.substring(3) : formattedTotalTimer;
    
    const remTimer = formatTime(breakRemaining || 0);
    const breakTimerDisplay = (breakRemaining || 0) < 3600 ? remTimer.substring(3) : remTimer;

    const isBreakMode = session.status.startsWith('break');

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

                {session.status === 'break-selection' ? (
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
                ) : session.status === 'break-running' || session.status === 'break-finished' ? (
                    <div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: session.status === 'break-finished' ? '#16a34a' : '#ea580c', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {session.status === 'break-finished' ? 'FINISHED' : 'BREAK'}
                            </div>
                            <div className="floating-timer-circle-mini" style={{ 
                                boxShadow: session.status === 'break-finished' ? '0 0 0 4px #dcfce7' : '0 0 0 4px #ffedd5',
                                color: session.status === 'break-finished' ? '#16a34a' : '#ea580c',
                                animation: session.status === 'break-finished' ? 'pulse 2s infinite' : 'none'
                            }}>
                                {breakTimerDisplay}
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button className="btn primary w-100" style={{ background: session.status === 'break-finished' ? 'var(--success)' : '' }} onClick={handleResumeFromBreak}>
                                ▶ Resume Focus
                            </button>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn outline flex-1" style={{ padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => handleStartBreak((breakRemaining || 0) + 300)}>
                                    + 5m
                                </button>
                                <button className="btn outline flex-1" style={{ padding: '0.5rem', fontSize: '0.8rem' }} onClick={() => handleStop(null, false)}>
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
                                {session.status === 'idle' && displayTime > 0 ? 'Resume' : 'Start'}
                            </button>
                            <button className="btn outline flex-1" style={{ background: '#fef2f2', color: '#dc2626', border: 'none', padding: '0.75rem' }} onClick={() => handleStop(null, false)}>
                                <Square size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
