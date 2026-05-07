import { useState } from 'react';
import { generateId } from '../utils';

export default function ManageActivitiesModal({ appState, updateState, onClose }) {
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState('productive');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const handleAdd = () => {
        if (newName.trim()) {
            const newAct = {
                id: generateId(),
                name: newName.trim(),
                type: newType,
                archived: false
            };
            updateState({ activities: [...appState.activities, newAct] });
            setNewName('');
        }
    };

    const handleArchiveToggle = (id) => {
        const updatedActivities = appState.activities.map(a => {
            if (a.id === id) return { ...a, archived: !a.archived };
            return a;
        });
        updateState({ activities: updatedActivities });
    };

    const handleSaveEdit = (id) => {
        if (editName.trim()) {
            const updatedActivities = appState.activities.map(a => {
                if (a.id === id) return { ...a, name: editName.trim() };
                return a;
            });
            updateState({ activities: updatedActivities });
            setEditingId(null);
        }
    };

    const renderActivityList = (activities, isArchived) => {
        if (activities.length === 0) {
            return <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No {isArchived ? 'archived' : 'active'} activities.</p>;
        }

        return (
            <ul className="manage-list">
                {activities.map(act => (
                    <li key={act.id} className="manage-item">
                        <div className="manage-item-info">
                            <span className={`manage-item-type ${act.type}`}>
                                {act.type === 'productive' ? 'PROD' : 'ENT'}
                            </span>
                            {editingId === act.id ? (
                                <input 
                                    type="text" 
                                    className="edit-input" 
                                    value={editName} 
                                    onChange={(e) => setEditName(e.target.value)}
                                    autoFocus
                                />
                            ) : (
                                <span>{act.name}</span>
                            )}
                        </div>
                        <div className="manage-item-actions">
                            {editingId === act.id ? (
                                <button className="icon-btn" onClick={() => handleSaveEdit(act.id)} title="Save">✅</button>
                            ) : (
                                <button className="icon-btn" onClick={() => { setEditingId(act.id); setEditName(act.name); }} title="Edit Name">✏️</button>
                            )}
                            <button className="icon-btn" onClick={() => handleArchiveToggle(act.id)} title={act.archived ? 'Unarchive' : 'Archive'}>
                                {act.archived ? '↩️' : '🗄️'}
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    const activeActivities = appState.activities.filter(a => !a.archived);
    const archivedActivities = appState.activities.filter(a => a.archived);

    return (
        <div className="overlay overlay-active" onClick={onClose}>
            <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
                <button className="icon-btn" style={{ position: 'absolute', top: '1rem', right: '1rem' }} onClick={onClose}>✖</button>
                <h2>⚙️ Manage Activities</h2>
                
                <div className="manage-add-section mt-4">
                    <input 
                        type="text" 
                        placeholder="Activity Name (e.g. Reading)..." 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)} 
                    />
                    <select value={newType} onChange={(e) => setNewType(e.target.value)}>
                        <option value="productive">Productive</option>
                        <option value="entertainment">Entertainment</option>
                    </select>
                    <button className="btn primary" onClick={handleAdd}>Add</button>
                </div>

                <div className="manage-list-container mt-4">
                    <h3>Active Activities</h3>
                    {renderActivityList(activeActivities, false)}
                </div>

                <div className="manage-list-container mt-4" style={{ opacity: 0.7 }}>
                    <h3>Archived Activities</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>History is saved, but hidden from dashboard.</p>
                    {renderActivityList(archivedActivities, true)}
                </div>
            </div>
        </div>
    );
}
