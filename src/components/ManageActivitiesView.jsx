import { useState, useEffect } from 'react';
import TopHeader from './TopHeader';
import { Code, Languages, Gamepad2, Play, Pencil, Archive, RotateCcw, Box, Briefcase, Film, Target } from 'lucide-react';
import { generateId } from '../utils';

export default function ManageActivitiesView({ appState, updateState, user, syncStatus, lastSynced, onSignIn, onLogout, onSyncNow }) {
    // Add mode
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState('productive');
    const [newSubcategory, setNewSubcategory] = useState('Focus');
    const [newDescription, setNewDescription] = useState('');
    const [newGoalHours, setNewGoalHours] = useState(0);
    const [newGoalMins, setNewGoalMins] = useState(0);

    // Edit mode
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editType, setEditType] = useState('productive');
    const [editSubcategory, setEditSubcategory] = useState('Focus');
    const [editDescription, setEditDescription] = useState('');
    const [editGoalHours, setEditGoalHours] = useState(0);
    const [editGoalMins, setEditGoalMins] = useState(0);

    const activeActivities = appState.activities.filter(a => !a.archived);
    const archivedActivities = appState.activities.filter(a => a.archived);

    // Keep subcategories in sync with main type
    useEffect(() => {
        if (newType === 'productive') {
            if (!['Learning', 'Focus', 'Work'].includes(newSubcategory)) setNewSubcategory('Focus');
        } else {
            if (!['Movies + Anime', 'Gaming'].includes(newSubcategory)) setNewSubcategory('Gaming');
        }
    }, [newType]);

    useEffect(() => {
        if (editType === 'productive') {
            if (!['Learning', 'Focus', 'Work'].includes(editSubcategory)) setEditSubcategory('Focus');
        } else {
            if (!['Movies + Anime', 'Gaming'].includes(editSubcategory)) setEditSubcategory('Gaming');
        }
    }, [editType]);

    const getIconForActivity = (act) => {
        const sub = (act.subcategory || '').toLowerCase();
        if (sub === 'learning') return <Languages size={18} />;
        if (sub === 'gaming') return <Gamepad2 size={18} />;
        if (sub === 'work') return <Briefcase size={18} />;
        if (sub === 'movies + anime') return <Film size={18} />;
        if (sub === 'focus') return <Target size={18} />;
        return <Code size={18} />;
    };

    const handleArchiveToggle = (id) => {
        const updated = appState.activities.map(a => {
            if (a.id === id) return { ...a, archived: !a.archived };
            return a;
        });
        updateState({ activities: updated });
    };

    const handleStartEdit = (act) => {
        setEditingId(act.id);
        setEditName(act.name);
        setEditType(act.type);
        setEditSubcategory(act.subcategory || (act.type === 'productive' ? 'Focus' : 'Gaming'));
        setEditDescription(act.description || '');
        const goalSeconds = act.dailyGoal || 0;
        setEditGoalHours(Math.floor(goalSeconds / 3600));
        setEditGoalMins(Math.floor((goalSeconds % 3600) / 60));
    };

    const handleSaveEdit = (id) => {
        if (editName.trim()) {
            const updated = appState.activities.map(a => {
                if (a.id === id) {
                    return {
                        ...a,
                        name: editName.trim(),
                        type: editType,
                        subcategory: editSubcategory,
                        description: editDescription.trim(),
                        dailyGoal: (parseInt(editGoalHours) || 0) * 3600 + (parseInt(editGoalMins) || 0) * 60
                    };
                }
                return a;
            });
            updateState({ activities: updated });
            setEditingId(null);
        }
    };

    const handleAdd = () => {
        if (newName.trim()) {
            const newAct = {
                id: generateId(),
                name: newName.trim(),
                type: newType,
                subcategory: newSubcategory,
                description: newDescription.trim() || 'New tracking activity.',
                dailyGoal: (parseInt(newGoalHours) || 0) * 3600 + (parseInt(newGoalMins) || 0) * 60,
                archived: false
            };
            updateState({ activities: [...appState.activities, newAct] });
            setNewName('');
            setNewDescription('');
            setNewGoalHours(0);
            setNewGoalMins(0);
            setIsAdding(false);
        }
    };

    const SubcategorySelect = ({ type, value, onChange }) => {
        if (type === 'productive') {
            return (
                <select value={value} onChange={onChange} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', width: '100%' }}>
                    <option value="Focus">Focus</option>
                    <option value="Learning">Learning</option>
                    <option value="Work">Work</option>
                </select>
            );
        }
        return (
            <select value={value} onChange={onChange} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', width: '100%' }}>
                <option value="Gaming">Gaming</option>
                <option value="Movies + Anime">Movies + Anime</option>
            </select>
        );
    };

    const ActivityCard = ({ act }) => {
        const isProd = act.type === 'productive';
        const badgeClass = isProd ? 'productive' : 'entertainment';

        if (editingId === act.id) {
            return (
                <div className="activity-card" style={{ padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid var(--accent)', borderRadius: '12px', background: '#fff' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 600 }}>Edit Activity</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Name</label>
                            <input 
                                type="text" 
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Type</label>
                                <select 
                                    value={editType} 
                                    onChange={(e) => setEditType(e.target.value)}
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                                >
                                    <option value="productive">Productive</option>
                                    <option value="entertainment">Entertainment</option>
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Subcategory</label>
                                <SubcategorySelect type={editType} value={editSubcategory} onChange={(e) => setEditSubcategory(e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Description</label>
                            <textarea 
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', resize: 'vertical', minHeight: '60px' }}
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Daily Goal (Hours)</label>
                                <input 
                                    type="number" min="0" max="24"
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                                    value={editGoalHours}
                                    onChange={(e) => setEditGoalHours(e.target.value)}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Daily Goal (Mins)</label>
                                <input 
                                    type="number" min="0" max="59"
                                    style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                                    value={editGoalMins}
                                    onChange={(e) => setEditGoalMins(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn primary" style={{ flex: 1 }} onClick={() => handleSaveEdit(act.id)}>Save Changes</button>
                        <button className="btn outline" style={{ flex: 1 }} onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                </div>
            );
        }

        return (
            <div className="activity-card" style={{ padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ color: isProd ? 'var(--accent)' : 'var(--text-secondary)' }}>
                            {getIconForActivity(act)}
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <span className={`activity-tag ${badgeClass}`} style={{ fontSize: '0.65rem' }}>
                                {act.type.toUpperCase()}
                            </span>
                            <span className="activity-tag" style={{ fontSize: '0.65rem', background: '#f3f4f6', color: '#4b5563' }}>
                                {(act.subcategory || '').toUpperCase()}
                            </span>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                        <Pencil 
                            size={16} 
                            style={{ cursor: 'pointer' }} 
                            onClick={() => handleStartEdit(act)} 
                        />
                        {act.archived ? (
                            <RotateCcw size={16} style={{ cursor: 'pointer' }} onClick={() => handleArchiveToggle(act.id)} />
                        ) : (
                            <Archive size={16} style={{ cursor: 'pointer' }} onClick={() => handleArchiveToggle(act.id)} />
                        )}
                    </div>
                </div>

                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600 }}>{act.name}</h3>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {act.description}
                </p>
            </div>
        );
    };

    return (
        <div className="app-container">
            <TopHeader title="Manage Activities" user={user} syncStatus={syncStatus} lastSynced={lastSynced} onSignIn={onSignIn} onLogout={onLogout} onSyncNow={onSyncNow} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.25rem' }}>Manage Activities</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Configure your active tracking habits and review archived items.</p>
                </div>
                <button className="btn" style={{ background: '#eff6ff', color: 'var(--accent)', fontWeight: 600 }} onClick={() => setIsAdding(true)}>
                    + New Category
                </button>
            </div>

            {isAdding && (
                <div className="panel" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Create New Activity</h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 2 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Name</label>
                            <input 
                                type="text" 
                                placeholder="Activity Name..." 
                                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', width: '100%' }}
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Main Type</label>
                            <select 
                                value={newType} 
                                onChange={(e) => setNewType(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', width: '100%' }}
                            >
                                <option value="productive">Productive</option>
                                <option value="entertainment">Entertainment</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Subcategory</label>
                            <SubcategorySelect type={newType} value={newSubcategory} onChange={(e) => setNewSubcategory(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Description</label>
                        <textarea 
                            placeholder="Optional description..."
                            style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', resize: 'vertical', minHeight: '60px' }}
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Daily Goal (Hours)</label>
                            <input 
                                type="number" min="0" max="24"
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                                value={newGoalHours}
                                onChange={(e) => setNewGoalHours(e.target.value)}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Daily Goal (Mins)</label>
                            <input 
                                type="number" min="0" max="59"
                                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                                value={newGoalMins}
                                onChange={(e) => setNewGoalMins(e.target.value)}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn primary" onClick={handleAdd}>Create Activity</button>
                        <button className="btn outline" onClick={() => setIsAdding(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Active Activities</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                {activeActivities.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No active activities.</p>
                ) : (
                    activeActivities.map(act => <ActivityCard key={act.id} act={act} />)
                )}
            </div>

            <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Archived Activities</h2>
            {archivedActivities.length === 0 ? (
                <div style={{ border: '1px dashed var(--border-color)', borderRadius: '12px', padding: '4rem 2rem', textAlign: 'center', background: '#f9fafb' }}>
                    <Box size={48} style={{ color: '#d1d5db', margin: '0 auto 1rem auto' }} />
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>No archived activities</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                        History is saved, but hidden from dashboard. Archive an activity above to clean up your active view.
                    </p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', opacity: 0.7 }}>
                    {archivedActivities.map(act => <ActivityCard key={act.id} act={act} />)}
                </div>
            )}
        </div>
    );
}
