import TopHeader from './TopHeader';

export default function MoneyView({ appState, updateState, openTransactionModal, openBudgetModal, openIncomeModal }) {
    const money = appState.money || { balance: 0, transactions: [], budgets: [], incomeSources: [] };
    const totalBalance = money.balance || 0;
    
    // Calculate total income and expenses from transactions
    let income = 0;
    let expenses = 0;
    
    money.transactions.forEach(tx => {
        if (tx.type === 'income') {
            income += tx.amount;
        } else {
            expenses += tx.amount;
        }
    });

    const transactions = [...money.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Dynamically calculate budget spent
    const dynamicBudgets = (money.budgets || []).map(b => {
        let spent = 0;
        transactions.forEach(tx => {
            if (tx.type === 'expense' && tx.category.toLowerCase() === b.category.toLowerCase()) {
                spent += tx.amount;
            }
        });
        return { ...b, spent };
    });

    // Dynamically calculate income source collected
    const dynamicIncomeSources = (money.incomeSources || []).map(s => {
        let collected = 0;
        transactions.forEach(tx => {
            if (tx.type === 'income' && tx.category.toLowerCase() === s.category.toLowerCase()) {
                collected += tx.amount;
            }
        });
        return { ...s, collected };
    });

    const handleDeleteTransaction = (txId) => {
        if (!window.confirm("Are you sure you want to delete this transaction?")) return;

        const txToDelete = money.transactions.find(t => t.id === txId);
        if (!txToDelete) return;

        const updatedTransactions = money.transactions.filter(t => t.id !== txId);
        
        let newBalance = money.balance;
        if (txToDelete.type === 'income') {
            newBalance -= txToDelete.amount;
        } else {
            newBalance += txToDelete.amount;
        }

        updateState({
            money: {
                ...money,
                balance: newBalance,
                transactions: updatedTransactions
            }
        });
    };

    return (
        <div className="app-container">
            <TopHeader title="Money Overview" />

            {/* Top Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="panel" style={{ padding: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Total Balance</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>₹{totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                </div>

                <div className="panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>↓</div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Income</span>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>₹{income.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                </div>

                <div className="panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>↑</div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Expenses</span>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>₹{expenses.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* LEFT COLUMN: Transactions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h2 style={{ margin: 0 }}>Recent Transactions</h2>
                        <button className="btn primary small" onClick={openTransactionModal}>+ Log Transaction</button>
                    </div>
                    
                    <div className="panel" style={{ padding: '0' }}>
                        {transactions.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                No transactions logged yet. Click "+ Log Transaction" to start tracking.
                            </div>
                        ) : (
                            <ul style={{ listStyle: 'none' }}>
                                {transactions.map((tx, idx) => (
                                    <li key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: idx !== transactions.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                                {tx.icon || (tx.type === 'income' ? '💵' : '💳')}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{tx.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{tx.category} • {new Date(tx.date).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ fontWeight: 500, color: tx.type === 'income' ? 'var(--success)' : 'var(--text-primary)' }}>
                                                {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                            </div>
                                            <button 
                                                className="icon-btn" 
                                                style={{ color: 'var(--danger)', fontSize: '0.85rem', padding: '0.2rem', opacity: 0.5 }}
                                                onClick={() => handleDeleteTransaction(tx.id)}
                                                title="Delete Transaction"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Budgets & Income */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Budgets</h2>
                            <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }} onClick={openBudgetModal}>Edit</span>
                        </div>
                        <div className="panel" style={{ padding: '1.5rem' }}>
                            {dynamicBudgets.length === 0 ? (
                                <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No budgets set. Click "Edit" to create one.</div>
                            ) : (
                                dynamicBudgets.map(b => {
                                    const pct = b.total > 0 ? Math.min(Math.round((b.spent / b.total) * 100), 100) : 0;
                                    const isOver = b.spent > b.total;
                                    const color = isOver ? 'var(--danger)' : b.color || 'var(--accent)';
                                    
                                    return (
                                        <div key={b.category} style={{ marginBottom: '1.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{b.category}</div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isOver ? 'var(--danger)' : 'inherit' }}>{pct}%</div>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                                ₹{b.spent.toLocaleString()} / ₹{b.total.toLocaleString()}
                                            </div>
                                            <div className="time-allocation-bar" style={{ margin: 0 }}>
                                                <div className="time-allocation-fill" style={{ width: `${pct}%`, background: color }}></div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Expected Income Sources</h2>
                            <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }} onClick={openIncomeModal}>Edit</span>
                        </div>
                        <div className="panel" style={{ padding: '1.5rem' }}>
                            {dynamicIncomeSources.length === 0 ? (
                                <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No expected income sources. Click "Edit" to create one.</div>
                            ) : (
                                dynamicIncomeSources.map(s => {
                                    const pct = s.expected > 0 ? Math.min(Math.round((s.collected / s.expected) * 100), 100) : 0;
                                    return (
                                        <div key={s.category} style={{ marginBottom: '1.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{s.category}</div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{pct}%</div>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                                ₹{s.collected.toLocaleString(undefined, {minimumFractionDigits: 2})} / ₹{s.expected.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                            </div>
                                            <div className="time-allocation-bar" style={{ margin: 0 }}>
                                                <div className="time-allocation-fill" style={{ width: `${pct}%`, background: s.color || 'var(--success)' }}></div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
