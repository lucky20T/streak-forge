import { useState } from 'react';
import { getTodayString, generateId, getCurrentTime } from '../utils';
import TopHeader from './TopHeader';

export default function ExerciseView({ appState, updateState, openManage }) {
    const today = getTodayString();
    const todayLogs = appState.exerciseRecords[today] || [];
    
    // Exercise Stats
    const totalSets = todayLogs.reduce((acc, log) => acc + log.sets, 0);
    const totalReps = todayLogs.reduce((acc, log) => acc + (log.sets * log.reps), 0);
    
    // Most performed calculation
    let mostPerformed = '-';
    if (todayLogs.length > 0) {
        const counts = {};
        todayLogs.forEach(log => {
            counts[log.exerciseId] = (counts[log.exerciseId] || 0) + log.sets;
        });
        const topId = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
        const topEx = appState.exercises.find(e => e.id === topId);
        if (topEx) mostPerformed = topEx.name;
    }

    // Nutrition Data
    const nutritionRecords = appState.nutritionRecords[today] || { meals: [], water: [] };
    const meals = nutritionRecords.meals;
    const waterLogs = nutritionRecords.water || [];

    const HEALTHY_CATEGORIES = ["High Protein", "Balanced Meal", "Healthy Homemade", "Healthy Outside Food"];
    const JUNK_CATEGORIES = ["Junk Food", "Sugary", "Fried Food", "Fast Food", "Cheat Meal"];

    const handleLogWater = () => {
        updateState({
            nutritionRecords: {
                ...appState.nutritionRecords,
                [today]: {
                    ...nutritionRecords,
                    water: [...waterLogs, { id: generateId(), timestamp: getCurrentTime() }]
                }
            }
        });
    };

    return (
        <div className="app-container">
            <TopHeader title="Exercise & Nutrition" onManage={openManage} />
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Track your physical performance and dietary intake.</p>

            <div className="dashboard-grid">
                
                {/* LEFT COLUMN: Routine & Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    <section className="panel" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                <span style={{ color: 'var(--success)' }}>🏋️</span> Today's Routine: <span style={{ fontWeight: 400 }}>Custom</span>
                            </div>
                            <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>Edit Routine</span>
                        </div>

                        <ul className="routine-list">
                            {todayLogs.length === 0 ? (
                                <li className="routine-item" style={{ justifyContent: 'center', color: 'var(--text-secondary)', border: 'none' }}>
                                    No exercises logged today. Use "Manage" to add logs.
                                </li>
                            ) : (
                                todayLogs.map(log => {
                                    const ex = appState.exercises.find(e => e.id === log.exerciseId);
                                    return (
                                        <li className="routine-item" key={log.id}>
                                            <span style={{ fontWeight: 500 }}>{ex ? ex.name : 'Unknown'}</span>
                                            <span className="routine-tag">{log.sets} sets x {log.reps} reps</span>
                                        </li>
                                    );
                                })
                            )}
                        </ul>

                        <button className="btn primary large w-100" style={{ marginTop: '1.5rem', padding: '1rem' }}>
                            Complete Workout
                        </button>
                    </section>

                    <div className="stats-grid-clean">
                        <div className="stat-card-clean">
                            <span className="label">Total Reps</span>
                            <span className="val">{totalReps}</span>
                        </div>
                        <div className="stat-card-clean">
                            <span className="label">Total Sets</span>
                            <span className="val">{totalSets}</span>
                        </div>
                        <div className="stat-card-clean">
                            <span className="label">Most Performed</span>
                            <span className="val" style={{ fontSize: '1.1rem', marginTop: '0.5rem' }}>{mostPerformed}</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Hydration & Meals */}
                <div>
                    <section className="hydration-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#065f46' }}>
                                <span>💧</span> Hydration
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#065f46' }}>Today: {waterLogs.length} glasses</span>
                        </div>
                        
                        <button 
                            className="btn primary large w-100" 
                            style={{ background: 'var(--success)', color: 'white', marginBottom: '1.5rem', border: 'none' }}
                            onClick={handleLogWater}
                        >
                            + Water
                        </button>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {waterLogs.map(log => (
                                <div key={log.id} style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.7rem', fontWeight: 600, padding: '0.3rem 0.6rem', borderRadius: '12px' }}>
                                    {log.timestamp}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                <span>🍴</span> Meal Log
                            </div>
                            <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>Add Meal</span>
                        </div>

                        <ul className="meal-log-list">
                            {meals.length === 0 ? (
                                <li className="meal-log-item" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    No meals logged today.
                                </li>
                            ) : (
                                meals.map(log => {
                                    let badgeBg = '#f3f4f6';
                                    let badgeColor = 'var(--text-secondary)';
                                    
                                    if (HEALTHY_CATEGORIES.includes(log.category)) {
                                        badgeBg = '#ecfdf5'; badgeColor = '#059669';
                                    }
                                    if (log.category === 'High Protein') {
                                        badgeBg = '#eff6ff'; badgeColor = '#2563eb';
                                    }
                                    if (JUNK_CATEGORIES.includes(log.category)) {
                                        badgeBg = '#fef2f2'; badgeColor = '#dc2626';
                                    }

                                    return (
                                        <li className="meal-log-item" key={log.id}>
                                            <div style={{ fontWeight: 600, marginBottom: '0.5rem', paddingRight: '4rem' }}>{log.meal}</div>
                                            <span className="time">{log.timestamp}</span>
                                            <span style={{ display: 'inline-block', background: badgeBg, color: badgeColor, fontSize: '0.65rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '12px' }}>
                                                {log.category}
                                            </span>
                                        </li>
                                    );
                                })
                            )}
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}
