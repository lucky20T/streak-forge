import { useState } from 'react';
import { generateId, getTodayString } from '../utils';

export default function LogExerciseModal({ appState, updateState, onClose }) {
    const activeExercises = appState.exercises.filter(e => !e.archived);
    
    const [selectedExerciseId, setSelectedExerciseId] = useState(activeExercises.length > 0 ? activeExercises[0].id : '');
    const [sets, setSets] = useState(3);
    const [reps, setReps] = useState(10);

    const handleSave = () => {
        if (!selectedExerciseId) return;

        const today = getTodayString();
        const currentLogs = appState.exerciseRecords[today] || [];
        
        const newLog = {
            id: generateId(),
            exerciseId: selectedExerciseId,
            sets: parseInt(sets) || 0,
            reps: parseInt(reps) || 0
        };

        updateState({
            exerciseRecords: {
                ...appState.exerciseRecords,
                [today]: [...currentLogs, newLog]
            }
        });

        onClose();
    };

    return (
        <div className="overlay overlay-active" onClick={onClose}>
            <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
                <button className="icon-btn" style={{ position: 'absolute', top: '1rem', right: '1rem' }} onClick={onClose}>✖</button>
                <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>🏋️</span> Log Exercise</h2>
                
                {activeExercises.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', background: '#f9fafb', borderRadius: '8px', marginBottom: '1.5rem' }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>You don't have any exercises in your library yet.</p>
                        <p style={{ fontSize: '0.85rem' }}>Go to <strong>Manage</strong> to add some exercises first!</p>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Select Exercise</label>
                            <select 
                                value={selectedExerciseId}
                                onChange={(e) => setSelectedExerciseId(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                            >
                                {activeExercises.map(ex => (
                                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Sets</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={sets}
                                    onChange={(e) => setSets(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Reps (per set)</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={reps}
                                    onChange={(e) => setReps(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn outline" onClick={onClose}>Cancel</button>
                            <button className="btn primary" onClick={handleSave}>Log to Routine</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
