import { useState } from 'react';

export default function EditBudgetsModal({ appState, updateState, onClose }) {
    const money = appState.money || { balance: 0, transactions: [], budgets: [] };
    const [budgets, setBudgets] = useState(money.budgets || []);

    const [newCat, setNewCat] = useState('');
    const [newTotal, setNewTotal] = useState('');

    const handleAddBudget = () => {
        if (!newCat || !newTotal) return;
        const totalNum = parseFloat(newTotal);
        if (isNaN(totalNum) || totalNum <= 0) return;

        // Check if exists
        if (budgets.find(b => b.category.toLowerCase() === newCat.toLowerCase())) {
            alert('Budget for this category already exists.');
            return;
        }

        const colors = ['var(--accent)', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newBudget = {
            category: newCat,
            total: totalNum,
            color: randomColor
        };

        setBudgets([...budgets, newBudget]);
        setNewCat('');
        setNewTotal('');
    };

    const handleRemoveBudget = (index) => {
        const newB = [...budgets];
        newB.splice(index, 1);
        setBudgets(newB);
    };

    const handleUpdateTotal = (index, value) => {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) return;

        const newB = [...budgets];
        newB[index].total = num;
        setBudgets(newB);
    };

    const handleSave = () => {
        updateState({
            money: {
                ...money,
                budgets
            }
        });
        onClose();
    };

    // Calculate spent dynamically for display
    const dynamicBudgets = budgets.map(b => {
        let spent = 0;
        (money.transactions || []).forEach(tx => {
            if (tx.type === 'expense' && tx.category.toLowerCase() === b.category.toLowerCase()) {
                spent += tx.amount;
            }
        });
        return { ...b, spent };
    });

    return (
        <div className="overlay" onClick={onClose}>
            <div className="overlay-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Edit Budgets</h2>
                    <button className="icon-btn" onClick={onClose}>✕</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', maxHeight: '300px', overflowY: 'auto' }}>
                    {dynamicBudgets.length === 0 ? (
                        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>No budgets defined yet.</div>
                    ) : (
                        dynamicBudgets.map((b, idx) => (
                            <div key={b.category} className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', marginBottom: 0 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.category}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Spent: ₹{b.spent.toLocaleString()}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.85rem' }}>Limit: ₹</span>
                                    <input 
                                        type="number" 
                                        value={b.total} 
                                        onChange={(e) => handleUpdateTotal(idx, e.target.value)} 
                                        style={{ width: '80px', padding: '0.25rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                                    />
                                    <button className="icon-btn" style={{ color: 'var(--danger)', marginLeft: '0.5rem' }} onClick={() => handleRemoveBudget(idx)}>✕</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>Add New Budget Category</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: 2 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Category Name</label>
                            <input 
                                type="text" 
                                className="input-field" 
                                placeholder="e.g. Health" 
                                value={newCat}
                                onChange={(e) => setNewCat(e.target.value)}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.25rem' }}>Monthly Limit</label>
                            <input 
                                type="number" 
                                className="input-field" 
                                placeholder="0" 
                                value={newTotal}
                                onChange={(e) => setNewTotal(e.target.value)}
                            />
                        </div>
                        <button className="btn outline" onClick={handleAddBudget} style={{ height: '38px', padding: '0 1rem' }}>Add</button>
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
