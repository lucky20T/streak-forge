import { useState } from 'react';

export default function EditIncomeSourcesModal({ appState, updateState, onClose }) {
    const money = appState.money || { balance: 0, transactions: [], budgets: [], incomeSources: [] };
    const [incomeSources, setIncomeSources] = useState(money.incomeSources || []);

    const [newCat, setNewCat] = useState('');
    const [newExpected, setNewExpected] = useState('');

    const handleAddSource = () => {
        if (!newCat || !newExpected) return;
        const expectedNum = parseFloat(newExpected);
        if (isNaN(expectedNum) || expectedNum <= 0) return;

        // Check if exists
        if (incomeSources.find(s => s.category.toLowerCase() === newCat.toLowerCase())) {
            alert('Expected Income for this category already exists.');
            return;
        }

        const newSource = {
            category: newCat,
            expected: expectedNum,
            color: 'var(--success)'
        };

        setIncomeSources([...incomeSources, newSource]);
        setNewCat('');
        setNewExpected('');
    };

    const handleRemoveSource = (index) => {
        const newS = [...incomeSources];
        newS.splice(index, 1);
        setIncomeSources(newS);
    };

    const handleUpdateExpected = (index, value) => {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) return;

        const newS = [...incomeSources];
        newS[index].expected = num;
        setIncomeSources(newS);
    };

    const handleSave = () => {
        updateState({
            money: {
                ...money,
                incomeSources
            }
        });
        onClose();
    };

    // Calculate collected dynamically for display
    const dynamicIncomeSources = incomeSources.map(s => {
        let collected = 0;
        (money.transactions || []).forEach(tx => {
            if (tx.type === 'income' && tx.category.toLowerCase() === s.category.toLowerCase()) {
                collected += tx.amount;
            }
        });
        return { ...s, collected };
    });

    return (
        <div className="overlay" onClick={onClose}>
            <div className="overlay-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Expected Income</h2>
                    <button className="icon-btn" onClick={onClose}>✕</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', maxHeight: '300px', overflowY: 'auto' }}>
                    {dynamicIncomeSources.length === 0 ? (
                        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>No expected income sources defined yet.</div>
                    ) : (
                        dynamicIncomeSources.map((s, idx) => (
                            <div key={s.category} className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', marginBottom: 0 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.category}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Collected: ₹{s.collected.toLocaleString()}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.85rem' }}>Expected: ₹</span>
                                    <input 
                                        type="number" 
                                        value={s.expected} 
                                        onChange={(e) => handleUpdateExpected(idx, e.target.value)} 
                                        style={{ width: '80px', padding: '0.25rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                                    />
                                    <button className="icon-btn" style={{ color: 'var(--danger)', marginLeft: '0.5rem' }} onClick={() => handleRemoveSource(idx)}>✕</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Add New Income Source</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: 2 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Source Name</label>
                            <input 
                                type="text" 
                                className="input-field" 
                                placeholder="e.g. Salary" 
                                value={newCat}
                                onChange={(e) => setNewCat(e.target.value)}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Expected (₹)</label>
                            <input 
                                type="number" 
                                className="input-field" 
                                placeholder="0" 
                                value={newExpected}
                                onChange={(e) => setNewExpected(e.target.value)}
                            />
                        </div>
                        <button className="btn outline" onClick={handleAddSource} style={{ height: '38px', padding: '0 1rem' }}>Add</button>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button className="btn outline" onClick={onClose}>Cancel</button>
                    <button className="btn primary" onClick={handleSave}>Save Changes</button>
                </div>
            </div>
        </div>
    );
}
