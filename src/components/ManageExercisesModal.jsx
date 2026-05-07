import { useState } from 'react';
import { generateId } from '../utils';

export default function ManageExercisesModal({ appState, updateState, onClose }) {
    const [newName, setNewName] = useState('');
    const [newCategory, setNewCategory] = useState('Push');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const handleAdd = () => {
        if (newName.trim()) {
            const newEx = {
                id: generateId(),
                name: newName.trim(),
                category: newCategory,
                archived: false
            };
            updateState({ exercises: [...appState.exercises, newEx] });
            setNewName('');
        }
    };

    const handleArchiveToggle = (id) => {
        const updatedExercises = appState.exercises.map(e => {
            if (e.id === id) return { ...e, archived: !e.archived };
            return e;
        });
        updateState({ exercises: updatedExercises });
    };

    const handleSaveEdit = (id) => {
        if (editName.trim()) {
            const updatedExercises = appState.exercises.map(e => {
                if (e.id === id) return { ...e, name: editName.trim() };
                return e;
            });
            updateState({ exercises: updatedExercises });
            setEditingId(null);
        }
    };

    const renderExerciseList = (exercises, isArchived) => {
        if (exercises.length === 0) {
            return <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No {isArchived ? 'archived' : 'active'} exercises.</p>;
        }

        return (
            <ul className="manage-list">
                {exercises.map(ex => {
                    const catClass = ex.category ? ex.category : 'Push';
                    return (
                        <li key={ex.id} className="manage-item">
                            <div className="manage-item-info">
                                <span className={`manage-item-type ${catClass}`}>{catClass}</span>
                                {editingId === ex.id ? (
                                    <input 
                                        type="text" 
                                        className="edit-input" 
                                        value={editName} 
                                        onChange={(e) => setEditName(e.target.value)}
                                        autoFocus
                                    />
                                ) : (
                                    <span>{ex.name}</span>
                                )}
                            </div>
                            <div className="manage-item-actions">
                                {editingId === ex.id ? (
                                    <button className="icon-btn" onClick={() => handleSaveEdit(ex.id)} title="Save">✅</button>
                                ) : (
                                    <button className="icon-btn" onClick={() => { setEditingId(ex.id); setEditName(ex.name); }} title="Edit Name">✏️</button>
                                )}
                                <button className="icon-btn" onClick={() => handleArchiveToggle(ex.id)} title={ex.archived ? 'Unarchive' : 'Archive'}>
                                    {ex.archived ? '↩️' : '🗄️'}
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    };

    const activeExercises = appState.exercises.filter(e => !e.archived);
    const archivedExercises = appState.exercises.filter(e => e.archived);

    return (
        <div className="overlay overlay-active" onClick={onClose}>
            <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
                <button className="icon-btn" style={{ position: 'absolute', top: '1rem', right: '1rem' }} onClick={onClose}>✖</button>
                <h2>⚙️ Manage Exercises</h2>
                
                <div className="manage-add-section mt-4">
                    <input 
                        type="text" 
                        placeholder="Exercise Name (e.g. Muscle-ups)..." 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)} 
                    />
                    <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                        <option value="Push">Push</option>
                        <option value="Pull">Pull</option>
                        <option value="Legs">Legs</option>
                        <option value="Core">Core</option>
                        <option value="Cardio">Cardio</option>
                        <option value="Skill">Skill</option>
                        <option value="Mobility">Mobility</option>
                    </select>
                    <button className="btn primary" onClick={handleAdd}>Add</button>
                </div>

                <div className="manage-list-container mt-4">
                    <h3>Active Exercises</h3>
                    {renderExerciseList(activeExercises, false)}
                </div>

                <div className="manage-list-container mt-4" style={{ opacity: 0.7 }}>
                    <h3>Archived Exercises</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>History is saved, but hidden from dropdowns.</p>
                    {renderExerciseList(archivedExercises, true)}
                </div>
            </div>
        </div>
    );
}
