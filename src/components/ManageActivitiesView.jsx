import { useState } from 'react';
import TopHeader from './TopHeader';
import { Code, Languages, Gamepad2, Play, Pencil, Archive, RotateCcw, Box } from 'lucide-react';
import { generateId } from '../utils';

export default function ManageActivitiesView({ appState, updateState }) {
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    
    // Add mode
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState('productive');

    const activeActivities = appState.activities.filter(a => !a.archived);
    const archivedActivities = appState.activities.filter(a => a.archived);

    const getIconForActivity = (name, type) => {
        const lower = name.toLowerCase();
        if (lower.includes('unreal') || lower.includes('code')) return <Code size={18} />;
        if (lower.includes('japanese') || lower.includes('language')) return <Languages size={18} />;
        if (lower.includes('chess') || lower.includes('game')) return <Gamepad2 size={18} />;
        return <Play size={18} />;
    };

    const getDescriptionForActivity = (name, type) => {
        const lower = name.toLowerCase();
        if (lower.includes('unreal') || lower.includes('code')) return "Daily practice in blueprints and C++ for game development.";
        if (lower.includes('japanese') || lower.includes('language')) return "Kanji study and conversational practice via audio lessons.";
        if (lower.includes('chess')) return "Puzzles and rapid games to improve tactical vision.";
        if (type === 'productive') return "Deep work session for focused output.";
        return "Leisure activity to relax and unwind.";
    };

    const handleArchiveToggle = (id) => {
        const updated = appState.activities.map(a => {
            if (a.id === id) return { ...a, archived: !a.archived };
            return a;
        });
        updateState({ activities: updated });
    };

    const handleSaveEdit = (id) => {
        if (editName.trim()) {
            const updated = appState.activities.map(a => {
                if (a.id === id) return { ...a, name: editName.trim() };
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
                archived: false
            };
            updateState({ activities: [...appState.activities, newAct] });
            setNewName('');
            setIsAdding(false);
        }
    };

    const ActivityCard = ({ act }) => {
        const isProd = act.type === 'productive';
        const tagText = isProd ? (act.name.toLowerCase().includes('japan') ? 'Learning' : 'Focus') : 'Entertainment';
        const badgeClass = isProd ? 'productive' : 'entertainment';

        return (
            <div className="activity-card" style={{ padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)', borderRadius: '12px', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ color: isProd ? 'var(--accent)' : 'var(--text-secondary)' }}>
                            {getIconForActivity(act.name, act.type)}
                        </div>
                        <span className={`activity-tag ${badgeClass}`} style={{ fontSize: '0.65rem', background: '#f3f4f6', color: '#374151' }}>
                            {tagText}
                        </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                        <Pencil 
                            size={16} 
                            style={{ cursor: 'pointer' }} 
                            onClick={() => { setEditingId(act.id); setEditName(act.name); }} 
                        />
                        {act.archived ? (
                            <RotateCcw size={16} style={{ cursor: 'pointer' }} onClick={() => handleArchiveToggle(act.id)} />
                        ) : (
                            <Archive size={16} style={{ cursor: 'pointer' }} onClick={() => handleArchiveToggle(act.id)} />
                        )}
                    </div>
                </div>

                {editingId === act.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input 
                            type="text" 
                            style={{ flexGrow: 1, padding: '0.25rem 0.5rem', border: '1px solid var(--accent)', borderRadius: '4px' }}
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            autoFocus
                        />
                        <button className="btn primary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleSaveEdit(act.id)}>Save</button>
                    </div>
                ) : (
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600 }}>{act.name}</h3>
                )}
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {getDescriptionForActivity(act.name, act.type)}
                </p>
            </div>
        );
    };

    return (
        <div className="app-container">
            <TopHeader title="Streak Forge" onManage={() => {}} />

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
                <div className="panel" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input 
                        type="text" 
                        placeholder="Activity Name..." 
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', flexGrow: 1 }}
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        autoFocus
                    />
                    <select 
                        value={newType} 
                        onChange={(e) => setNewType(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    >
                        <option value="productive">Productive</option>
                        <option value="entertainment">Entertainment</option>
                    </select>
                    <button className="btn primary" onClick={handleAdd}>Add</button>
                    <button className="btn outline" onClick={() => setIsAdding(false)}>Cancel</button>
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
