import { useState } from 'react';
import TopHeader from './TopHeader';
import { generateId } from '../utils';
import { Zap, GripVertical, Pencil, Archive, RotateCcw } from 'lucide-react';

export default function ManageExercisesView({ onProfile, onSettings, onBack, appState, updateState, user, syncStatus, lastSynced, onSignIn, onLogout, onSyncNow }) {
    // Quick Add Form
    const [newName, setNewName] = useState('');
    const [newCategory, setNewCategory] = useState('Push');
    
    // Inline Edit State
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const handleQuickAdd = () => {
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
        const updated = appState.exercises.map(e => {
            if (e.id === id) return { ...e, archived: !e.archived };
            return e;
        });
        updateState({ exercises: updated });
    };

    const handleSaveEdit = (id) => {
        if (editName.trim()) {
            const updated = appState.exercises.map(e => {
                if (e.id === id) return { ...e, name: editName.trim() };
                return e;
            });
            updateState({ exercises: updated });
            setEditingId(null);
        }
    };

    // Grouping
    const allExercises = appState.exercises || [];
    
    // Create an object to store grouped exercises
    const grouped = {
        Push: [], Pull: [], Legs: [], Core: [], Cardio: [], Skill: [], Mobility: [], Other: []
    };

    allExercises.forEach(ex => {
        const cat = ex.category || 'Other';
        if (grouped[cat]) grouped[cat].push(ex);
        else grouped['Other'].push(ex);
    });

    const getTagStyles = (category) => {
        const map = {
            Push: { bg: '#eff6ff', color: '#2563eb' },
            Pull: { bg: '#ecfdf5', color: '#059669' },
            Legs: { bg: '#fef2f2', color: '#dc2626' },
            Core: { bg: '#fefce8', color: '#ca8a04' },
            Cardio: { bg: '#fff7ed', color: '#ea580c' },
            Skill: { bg: '#f3e8ff', color: '#9333ea' },
            Mobility: { bg: '#e0f2fe', color: '#0284c7' },
            Other: { bg: '#f3f4f6', color: '#4b5563' }
        };
        return map[category] || map['Other'];
    };

    const renderList = (exercises) => {
        return exercises.map((ex, index) => (
            <div key={ex.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: index !== exercises.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexGrow: 1 }}>
                    <GripVertical size={16} style={{ color: '#d1d5db', cursor: 'grab' }} />
                    {editingId === ex.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', flexGrow: 1, maxWidth: '300px' }}>
                            <input 
                                type="text" 
                                style={{ flexGrow: 1, padding: '0.25rem 0.5rem', border: '1px solid var(--accent)', borderRadius: '4px' }}
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                autoFocus
                            />
                            <button className="btn primary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleSaveEdit(ex.id)}>Save</button>
                        </div>
                    ) : (
                        <span style={{ fontWeight: 500, color: ex.archived ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: ex.archived ? 'line-through' : 'none' }}>
                            {ex.name}
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                    {editingId !== ex.id && (
                        <Pencil 
                            size={16} 
                            style={{ cursor: 'pointer' }} 
                            onClick={() => { setEditingId(ex.id); setEditName(ex.name); }} 
                            title="Edit"
                        />
                    )}
                    {ex.archived ? (
                        <RotateCcw size={16} style={{ cursor: 'pointer' }} onClick={() => handleArchiveToggle(ex.id)} title="Unarchive" />
                    ) : (
                        <Archive size={16} style={{ cursor: 'pointer' }} onClick={() => handleArchiveToggle(ex.id)} title="Archive" />
                    )}
                </div>
            </div>
        ));
    };

    return (
        <div className="app-container">
            <TopHeader 
                title="Manage Exercises" 
                onBack={onBack}
                onProfile={onProfile}
                onSettings={onSettings}
                user={user} 
                syncStatus={syncStatus} 
                lastSynced={lastSynced} 
                onSignIn={onSignIn} 
                onLogout={onLogout} 
                onSyncNow={onSyncNow} 
            />

            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.25rem' }}>Manage Exercises</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Configure your workout routines and movements.</p>
            </div>

            <div className="manage-exercise-layout" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                
                {/* Left Column: Quick Add */}
                <div className="panel" style={{ width: '300px', flexShrink: 0, padding: '2rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                        <Zap size={20} style={{ color: '#2563eb' }} />
                        <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Quick Add</h2>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Exercise Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Diamond Push-ups" 
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Category</label>
                        <select 
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: '#fff' }}
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                        >
                            <option value="Push">Push</option>
                            <option value="Pull">Pull</option>
                            <option value="Legs">Legs</option>
                            <option value="Core">Core</option>
                            <option value="Cardio">Cardio</option>
                            <option value="Skill">Skill</option>
                            <option value="Mobility">Mobility</option>
                        </select>
                    </div>

                    <button 
                        className="btn w-100" 
                        style={{ background: '#e5e7eb', color: '#374151', padding: '0.75rem', fontWeight: 600, border: 'none' }}
                        onClick={handleQuickAdd}
                    >
                        Add to Library
                    </button>

                    <div style={{ marginTop: '2rem', height: '150px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Manage UI Preview</span>
                    </div>
                </div>

                {/* Right Column: Library */}
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {Object.keys(grouped).map(cat => {
                        const exercises = grouped[cat];
                        if (exercises.length === 0) return null;
                        
                        const styles = getTagStyles(cat);
                        
                        return (
                            <div key={cat} className="panel" style={{ padding: '1.5rem 2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ background: styles.bg, color: styles.color, fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '12px', textTransform: 'uppercase' }}>
                                            {cat}
                                        </span>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Library</h3>
                                    </div>
                                    <span style={{ background: '#f3f4f6', color: '#4b5563', fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                                        {exercises.length} Exercises
                                    </span>
                                </div>
                                
                                <div>
                                    {renderList(exercises)}
                                </div>
                            </div>
                        );
                    })}

                </div>

            </div>
        </div>
    );
}
