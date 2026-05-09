import TopHeader from './TopHeader';

export default function MoneyView({ appState, updateState, openTransactionModal, openBudgetModal, openIncomeModal }) {
    const money = appState.money || { balance: 0, transactions: [], budgets: [], incomeSources: [] };
    
    // Calculate total income and expenses from transactions
    let income = 0;
    let expenses = 0;
    const incomeSourcesMap = {};
    
    money.transactions.forEach(tx => {
        if (tx.type === 'income') {
            income += tx.amount;
            incomeSourcesMap[tx.category] = (incomeSourcesMap[tx.category] || 0) + tx.amount;
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

    // Income Contribution
    const incomeContribution = Object.keys(incomeSourcesMap).map(cat => {
        const amt = incomeSourcesMap[cat];
        return {
            name: cat,
            amount: amt,
            percentage: income > 0 ? Math.round((amt / income) * 100) : 0
        };
    }).sort((a, b) => b.amount - a.amount);

    const overallPctSpent = income > 0 ? Math.min(Math.round((expenses / income) * 100), 100) : 0;
    const remainingBalance = income - expenses; // Could be negative if they overspend
    const remainingPct = income > 0 ? Math.max(0, 100 - overallPctSpent) : 0;

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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <div className="panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>↓</div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Income</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹{income.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                </div>

                <div className="panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>↑</div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Expenses</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹{expenses.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                </div>

                <div className="panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>₹</div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Remaining Balance</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>₹{remainingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                </div>

                <div className="panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#f3e8ff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>%</div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Income Spent</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: overallPctSpent > 90 ? 'var(--danger)' : 'inherit' }}>
                        {overallPctSpent}% Used
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* LEFT COLUMN: Transactions & Overall Progress */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* GLOBAL BUDGET PROGRESS */}
                    <div className="panel" style={{ padding: '2rem', background: 'linear-gradient(to bottom right, #ffffff, #fafafa)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                            <div>
                                <h2 style={{ margin: '0 0 0.5rem 0' }}>Overall Budget</h2>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    <strong style={{ color: 'var(--text-primary)' }}>{overallPctSpent}%</strong> of income used
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--success)', marginBottom: '0.2rem' }}>
                                    Remaining: ₹{Math.max(0, remainingBalance).toLocaleString()} ({remainingPct}%)
                                </div>
                            </div>
                        </div>
                        <div className="time-allocation-bar" style={{ height: '12px', margin: 0, background: '#f3f4f6' }}>
                            <div className="time-allocation-fill" style={{ width: `${overallPctSpent}%`, background: overallPctSpent > 90 ? 'var(--danger)' : 'var(--accent)', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                        </div>
                    </div>

                    <div>
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
                </div>

                {/* RIGHT COLUMN: Budgets & Income Sources */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    {/* INCOME SOURCES CONTRIBUTION */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Income Sources</h2>
                            <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }} onClick={openIncomeModal}>Manage Expected</span>
                        </div>
                        <div className="panel" style={{ padding: '1.5rem' }}>
                            {incomeContribution.length === 0 ? (
                                <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No income sources recorded.</div>
                            ) : (
                                incomeContribution.map(s => (
                                    <div key={s.name} style={{ marginBottom: '1.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{s.name}</div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{s.percentage}%</div>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                            ₹{s.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </div>
                                        <div className="time-allocation-bar" style={{ margin: 0, height: '6px' }}>
                                            <div className="time-allocation-fill" style={{ width: `${s.percentage}%`, background: 'var(--success)', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* CATEGORY BUDGETS */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Category Budgets</h2>
                            <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }} onClick={openBudgetModal}>Edit limits</span>
                        </div>
                        <div className="panel" style={{ padding: '1.5rem' }}>
                            {dynamicBudgets.length === 0 ? (
                                <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No budgets set. Click "Edit" to create one.</div>
                            ) : (
                                dynamicBudgets.map(b => {
                                    const budgetPctOfIncome = income > 0 ? Math.round((b.total / income) * 100) : 0;
                                    
                                    return (
                                        <div key={b.category} style={{ marginBottom: '1.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{b.category}</div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{budgetPctOfIncome}%</div>
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                                ₹{b.total.toLocaleString()} • {income > 0 ? `${budgetPctOfIncome}% of total income` : 'No income added'}
                                            </div>
                                            <div className="time-allocation-bar" style={{ margin: 0, height: '6px' }}>
                                                <div className="time-allocation-fill" style={{ width: `${budgetPctOfIncome}%`, background: b.color || 'var(--accent)', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
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
