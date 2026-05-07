import { useState } from 'react';
import { getTodayString, generateId, getCurrentTime } from '../utils';
import ExerciseWeeklyChart from './ExerciseWeeklyChart';

export default function ExerciseView({ appState, updateState, openManage }) {
    const today = getTodayString();
    const todayLogs = appState.exerciseRecords[today] || [];
    
    // Exercise Stats
    const totalSets = todayLogs.reduce((acc, log) => acc + log.sets, 0);
    const totalReps = todayLogs.reduce((acc, log) => acc + (log.sets * log.reps), 0);
    const distinctExercises = new Set(todayLogs.map(log => log.exerciseId)).size;

    // Log Workout State
    const [selectedExercise, setSelectedExercise] = useState('');
    const [sets, setSets] = useState('');
    const [reps, setReps] = useState('');

    const handleLogWorkout = () => {
        if (selectedExercise && sets > 0 && reps > 0) {
            const newLog = {
                id: generateId(),
                exerciseId: selectedExercise,
                sets: parseInt(sets),
                reps: parseInt(reps)
            };
            
            const updatedLogs = [...todayLogs, newLog];
            updateState({
                exerciseRecords: {
                    ...appState.exerciseRecords,
                    [today]: updatedLogs
                }
            });
            setSets('');
            setReps('');
        } else {
            alert("Please select an exercise and enter valid sets and reps.");
        }
    };

    const handleDeleteWorkout = (id) => {
        const updatedLogs = todayLogs.filter(log => log.id !== id);
        updateState({
            exerciseRecords: {
                ...appState.exerciseRecords,
                [today]: updatedLogs
            }
        });
    };

    // Prepare options grouped by category
    const activeExercises = appState.exercises.filter(e => !e.archived);
    const groupedExercises = activeExercises.reduce((acc, ex) => {
        const cat = ex.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(ex);
        return acc;
    }, {});

    // Nutrition Data
    const nutritionRecords = appState.nutritionRecords[today] || { meals: [], water: [] };
    const meals = nutritionRecords.meals;
    const waterLogs = nutritionRecords.water || [];

    const HEALTHY_CATEGORIES = ["High Protein", "Balanced Meal", "Healthy Homemade", "Healthy Outside Food"];
    const JUNK_CATEGORIES = ["Junk Food", "Sugary", "Fried Food", "Fast Food", "Cheat Meal"];
    
    let healthyCount = 0;
    let junkCount = 0;
    let proteinCount = 0;

    meals.forEach(meal => {
        if (HEALTHY_CATEGORIES.includes(meal.category)) healthyCount++;
        if (JUNK_CATEGORIES.includes(meal.category)) junkCount++;
        if (meal.category === "High Protein") proteinCount++;
    });

    const [mealName, setMealName] = useState('');
    const [mealCategory, setMealCategory] = useState('');
    const [mealNote, setMealNote] = useState('');

    const handleLogMeal = () => {
        if (mealName && mealCategory) {
            const newMeal = {
                id: generateId(),
                meal: mealName,
                category: mealCategory,
                note: mealNote,
                timestamp: getCurrentTime()
            };
            
            updateState({
                nutritionRecords: {
                    ...appState.nutritionRecords,
                    [today]: {
                        ...nutritionRecords,
                        meals: [...meals, newMeal]
                    }
                }
            });
            setMealName('');
            setMealCategory('');
            setMealNote('');
        } else {
            alert("Please enter a meal name and select a category.");
        }
    };

    const handleDeleteMeal = (id) => {
        updateState({
            nutritionRecords: {
                ...appState.nutritionRecords,
                [today]: {
                    ...nutritionRecords,
                    meals: meals.filter(m => m.id !== id)
                }
            }
        });
    };

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

    const handleDeleteWater = (id) => {
        updateState({
            nutritionRecords: {
                ...appState.nutritionRecords,
                [today]: {
                    ...nutritionRecords,
                    water: waterLogs.filter(w => w.id !== id)
                }
            }
        });
    };

    return (
        <div className="app-container">
            <header className="top-header">
                <div className="header-left">
                    <h1>Health & Fitness</h1>
                    <div className="date-display">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <div className="header-right">
                    <button className="btn outline" onClick={openManage}>
                        ⚙️ Manage Exercises
                    </button>
                </div>
            </header>

            <section className="panel minimal-panel mt-4">
                <h2>Daily Stats Overview</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Exercises Completed</div>
                        <div className="stat-value">{distinctExercises}</div>
                    </div>
                    <div className="stat-card highlight">
                        <div className="stat-label">Total Sets</div>
                        <div className="stat-value">{totalSets}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label" style={{ color: 'var(--accent)' }}>Total Reps</div>
                        <div className="stat-value">{totalReps}</div>
                    </div>
                </div>
            </section>

            <div className="analytics-row mt-4">
                <section className="panel minimal-panel flex-1">
                    <h2>Log Workout</h2>
                    <div className="log-exercise-form">
                        <select className="ex-input" value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)}>
                            <option value="" disabled>Select Exercise...</option>
                            {Object.entries(groupedExercises).map(([cat, exs]) => (
                                <optgroup label={cat} key={cat}>
                                    {exs.map(ex => (
                                        <option value={ex.id} key={ex.id}>{ex.name}</option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="number" className="ex-input" placeholder="Sets" min="1" value={sets} onChange={(e) => setSets(e.target.value)} />
                            <input type="number" className="ex-input" placeholder="Reps" min="1" value={reps} onChange={(e) => setReps(e.target.value)} />
                        </div>
                        <button className="btn primary w-100" onClick={handleLogWorkout}>Log Entry</button>
                    </div>

                    <h2 className="mt-4">Today's Log</h2>
                    <ul className="exercise-log-list">
                        {todayLogs.length === 0 ? (
                            <li className="log-item" style={{ justifyContent: 'center', color: 'var(--text-secondary)' }}>No exercises logged today.</li>
                        ) : (
                            todayLogs.map(log => {
                                const ex = appState.exercises.find(e => e.id === log.exerciseId);
                                return (
                                    <li className="log-item" key={log.id}>
                                        <div className="log-info">
                                            <div className="log-name">{ex ? ex.name : 'Unknown'}</div>
                                            <div className="log-stats">{log.sets} sets × {log.reps} reps</div>
                                        </div>
                                        <button className="del-log-btn" onClick={() => handleDeleteWorkout(log.id)} title="Delete Entry">✖</button>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </section>

                <section className="panel minimal-panel flex-2">
                    <h2>📈 Weekly Progress (Total Reps)</h2>
                    <ExerciseWeeklyChart appState={appState} />
                </section>
            </div>

            {/* NUTRITION SECTION */}
            <h1 className="mt-4 subtitle">Nutrition & Meals</h1>
            
            <section className="panel minimal-panel">
                <h2>Daily Nutrition Stats</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Meals Today</div>
                        <div className="stat-value">{meals.length}</div>
                    </div>
                    <div className="stat-card highlight">
                        <div className="stat-label">High Protein</div>
                        <div className="stat-value">{proteinCount}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label" style={{ color: 'var(--accent)' }}>Healthy</div>
                        <div className="stat-value">{healthyCount}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label" style={{ color: 'var(--danger)' }}>Junk Food</div>
                        <div className="stat-value">{junkCount}</div>
                    </div>
                </div>
            </section>

            <div className="analytics-row mt-4">
                <section className="panel minimal-panel flex-1">
                    <h2>Log Meal</h2>
                    <div className="log-exercise-form">
                        <input type="text" className="ex-input" placeholder="Meal Name (e.g. Chicken Rice)" value={mealName} onChange={(e) => setMealName(e.target.value)} />
                        <select className="ex-input" value={mealCategory} onChange={(e) => setMealCategory(e.target.value)}>
                            <option value="" disabled>Select Category...</option>
                            <optgroup label="Healthy">
                                <option value="High Protein">High Protein</option>
                                <option value="Balanced Meal">Balanced Meal</option>
                                <option value="Healthy Homemade">Healthy Homemade</option>
                                <option value="Healthy Outside Food">Healthy Outside Food</option>
                            </optgroup>
                            <optgroup label="Unhealthy / Junk">
                                <option value="Junk Food">Junk Food</option>
                                <option value="Sugary">Sugary</option>
                                <option value="Fried Food">Fried Food</option>
                                <option value="Fast Food">Fast Food</option>
                            </optgroup>
                            <optgroup label="Other">
                                <option value="Snack">Snack</option>
                                <option value="Cheat Meal">Cheat Meal</option>
                                <option value="Beverage">Beverage</option>
                                <option value="Other">Other</option>
                            </optgroup>
                        </select>
                        <input type="text" className="ex-input" placeholder="Short note (optional)..." value={mealNote} onChange={(e) => setMealNote(e.target.value)} />
                        <button className="btn primary w-100" onClick={handleLogMeal}>Log Meal</button>
                    </div>
                </section>

                <section className="panel minimal-panel flex-2">
                    <h2>Today's Meals</h2>
                    <ul className="exercise-log-list">
                        {meals.length === 0 ? (
                            <li className="log-item" style={{ justifyContent: 'center', color: 'var(--text-secondary)' }}>No meals logged today.</li>
                        ) : (
                            meals.map(log => {
                                let badgeClass = 'other';
                                if (HEALTHY_CATEGORIES.includes(log.category)) badgeClass = 'healthy';
                                if (log.category === 'High Protein') badgeClass = 'high-protein';
                                if (JUNK_CATEGORIES.includes(log.category)) badgeClass = 'junk';

                                return (
                                    <li className="log-item" style={{ alignItems: 'flex-start' }} key={log.id}>
                                        <div className="log-info" style={{ gap: '0.3rem' }}>
                                            <div className="log-name">
                                                <span className={`meal-badge ${badgeClass}`}>{log.category}</span>
                                                {log.meal}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span className="meal-timestamp">{log.timestamp}</span>
                                                {log.note && <span className="meal-note">"{log.note}"</span>}
                                            </div>
                                        </div>
                                        <button className="del-log-btn" onClick={() => handleDeleteMeal(log.id)} title="Delete Entry">✖</button>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                </section>
            </div>

            <div className="analytics-row mt-4">
                <section className="panel minimal-panel flex-1" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <h2>💧 Water Tracking</h2>
                    <p style={{ marginBottom: '1rem' }}>Water Taken Today: <strong style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}>{waterLogs.length}</strong> times</p>
                    <button className="btn outline large" style={{ width: '100%', borderColor: '#0ea5e9', color: '#0ea5e9' }} onClick={handleLogWater}>
                        <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>+</span> Add Water
                    </button>
                </section>

                <section className="panel minimal-panel flex-2">
                    <h2>Today's Water Log</h2>
                    <ul className="exercise-log-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', flexDirection: 'row' }}>
                        {waterLogs.length === 0 ? (
                            <li className="log-item" style={{ justifyContent: 'center', color: 'var(--text-secondary)', width: '100%' }}>No water logged today.</li>
                        ) : (
                            waterLogs.map(log => (
                                <li key={log.id} className="log-item" style={{ padding: '0.5rem 1rem', borderRadius: '20px', background: 'rgba(14, 165, 233, 0.1)', borderColor: 'rgba(14, 165, 233, 0.3)' }}>
                                    <span style={{ color: '#0ea5e9', fontWeight: 500 }}>{log.timestamp}</span>
                                    <button className="del-log-btn" onClick={() => handleDeleteWater(log.id)} title="Delete Entry" style={{ marginLeft: '0.5rem', color: '#0ea5e9' }}>✖</button>
                                </li>
                            ))
                        )}
                    </ul>
                </section>
            </div>
        </div>
    );
}
