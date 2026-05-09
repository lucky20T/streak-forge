import { useState } from 'react';

export default function LogTransactionModal({ appState, updateState, onClose }) {
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const money = appState.money || { balance: 0, transactions: [], budgets: [], incomeSources: [] };
    const budgets = money.budgets || [];
    const incomeSources = money.incomeSources || [];
    
    // Suggest categories based on budgets or expected income sources
    const suggestedCategories = type === 'expense' 
        ? budgets.map(b => b.category)
        : incomeSources.map(s => s.category);

    const handleSave = () => {
        const finalCategory = category;
        // For income, name is the source (category)
        const finalName = type === 'income' ? category : name;

        if (!amount || !finalName || !finalCategory) return;
        
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return;

        const newTx = {
            id: 'tx_' + Date.now() + Math.floor(Math.random() * 1000),
            type,
            amount: numAmount,
            name: finalName,
            category: finalCategory,
            date,
            icon: type === 'income' ? '💵' : '💳'
        };

        const updatedTransactions = [...money.transactions, newTx];
        
        let newBalance = money.balance;
        if (type === 'income') {
            newBalance += numAmount;
        } else {
            newBalance -= numAmount;
        }

        updateState({
            money: {
                ...money,
                balance: newBalance,
                transactions: updatedTransactions
            }
        });
        
        onClose();
    };

    return (
        <div className="overlay" onClick={onClose}>
            <div className="overlay-content" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Log Transaction</h2>
                    <button className="icon-btn" onClick={onClose}>✕</button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <button 
                        className={`btn flex-1 ${type === 'expense' ? 'primary' : 'outline'}`} 
                        style={type === 'expense' ? { background: 'var(--danger)', borderColor: 'var(--danger)' } : {}}
                        onClick={() => setType('expense')}
                    >
                        Expense
                    </button>
                    <button 
                        className={`btn flex-1 ${type === 'income' ? 'primary' : 'outline'}`} 
                        style={type === 'income' ? { background: 'var(--success)', borderColor: 'var(--success)' } : {}}
                        onClick={() => setType('income')}
                    >
                        Income
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>Amount (₹)</label>
                        <input 
                            type="number" 
                            className="input-field" 
                            placeholder="0.00" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                        />
                    </div>

                    {type === 'expense' && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>Name/Merchant</label>
                            <input 
                                type="text" 
                                className="input-field" 
                                placeholder="e.g. Whole Foods" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                            />
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                            {type === 'income' ? 'Source' : 'Category'}
                        </label>
                        <input 
                            type="text" 
                            className="input-field" 
                            placeholder={type === 'income' ? "e.g. Salary" : "e.g. Food & Dining"} 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)} 
                            list="category-suggestions"
                        />
                        <datalist id="category-suggestions">
                            {suggestedCategories.map(cat => (
                                <option key={cat} value={cat} />
                            ))}
                        </datalist>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>Date</label>
                        <input 
                            type="date" 
                            className="input-field" 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)} 
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button className="btn outline" onClick={onClose}>Cancel</button>
                    <button className="btn primary" onClick={handleSave} style={{ background: type === 'expense' ? 'var(--danger)' : 'var(--success)' }}>
                        Save Transaction
                    </button>
                </div>
            </div>
        </div>
    );
}
