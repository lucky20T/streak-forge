import TopHeader from './TopHeader';

export default function ManageView({ appState, openActivityModal, openExerciseModal }) {
    const productiveActivities = appState.activities.filter(a => !a.archived && a.type === 'productive').slice(0, 3);
    const topExercises = appState.exercises.filter(e => !e.archived).slice(0, 3);

    return (
        <div className="app-container">
            <TopHeader title="Manage" />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Manage Activities</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Configure your tracking parameters and goals.</p>
                </div>
                <button className="btn primary large" style={{ background: '#111827', color: 'white' }}>
                    + New Category
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                
                {/* Focus Card */}
                <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Focus</span>
                        </div>
                        <span style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>•••</span>
                    </div>
                    
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                        Configure deep work sessions and study subjects.
                    </p>

                    <div style={{ flexGrow: 1 }}>
                        {productiveActivities.map(act => (
                            <div key={act.id} style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                                {act.name}
                            </div>
                        ))}
                    </div>

                    <button className="btn outline w-100" style={{ marginTop: '1.5rem' }} onClick={openActivityModal}>
                        + Add Subject
                    </button>
                </div>

                {/* Exercise Card */}
                <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5l11 11"></path><path d="M21 21l-1-1"></path><path d="M3 3l1 1"></path><path d="M18 22l4-4"></path><path d="M2 6l4-4"></path><path d="M3 10l7-7"></path><path d="M14 21l7-7"></path></svg>
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Exercise</span>
                        </div>
                        <span style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>•••</span>
                    </div>
                    
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                        Manage workout routines, sets, and fitness goals.
                    </p>

                    <div style={{ flexGrow: 1 }}>
                        {topExercises.length > 0 ? (
                            topExercises.map(ex => (
                                <div key={ex.id} style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                                    {ex.name}
                                </div>
                            ))
                        ) : (
                            <div style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Strength Training</div>
                        )}
                    </div>

                    <button className="btn outline w-100" style={{ marginTop: '1.5rem' }} onClick={openExerciseModal}>
                        + Add Routine
                    </button>
                </div>

                {/* Money Card */}
                <div className="panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f3f4f6', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Money</span>
                        </div>
                        <span style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>•••</span>
                    </div>
                    
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                        Set budgets, track expenses, and manage income sources.
                    </p>

                    <div style={{ flexGrow: 1 }}>
                        <div style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Monthly Budget</div>
                        <div style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Savings Goal</div>
                    </div>

                    <button className="btn outline w-100" style={{ marginTop: '1.5rem' }}>
                        + Add Budget
                    </button>
                </div>

            </div>
        </div>
    );
}
