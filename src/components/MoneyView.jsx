import TopHeader from './TopHeader';

export default function MoneyView({ appState, updateState }) {
    // We mock the detailed data to match the visual layout requested by the user,
    // since the current backend state only holds a single `income` value.
    const totalBalance = appState.income || 12450.00;
    const income = 8200.00;
    const expenses = 3450.00;

    return (
        <div className="app-container">
            <TopHeader title="Money Overview" onManage={() => {}} />

            {/* Top Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="panel" style={{ padding: '2rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Total Balance</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>₹{totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                    <div style={{ display: 'inline-block', background: 'var(--success-light)', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        ↗ +4.2% from last month
                    </div>
                </div>

                <div className="panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>↓</div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Income</span>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>₹{income.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                </div>

                <div className="panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--danger-light)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>↑</div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Expenses</span>
                    </div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>₹{expenses.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* LEFT COLUMN: Transactions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h2 style={{ margin: 0 }}>Recent Transactions</h2>
                        <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>View All</span>
                    </div>
                    
                    <div className="panel" style={{ padding: '0' }}>
                        <ul style={{ listStyle: 'none' }}>
                            {[
                                { id: 1, icon: '🍴', name: 'Whole Foods Market', cat: 'Groceries • Today', amt: -142.50 },
                                { id: 2, icon: '🏠', name: 'Apartment Rent', cat: 'Housing • Yesterday', amt: -2100.00 },
                                { id: 3, icon: '💼', name: 'Tech Corp Inc.', cat: 'Salary • Oct 15', amt: 4100.00 },
                                { id: 4, icon: '📺', name: 'Netflix', cat: 'Entertainment • Oct 12', amt: -15.99 },
                            ].map((tx, idx) => (
                                <li key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: idx !== 3 ? '1px solid var(--border-color)' : 'none' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {tx.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{tx.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{tx.cat}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 500, color: tx.amt > 0 ? 'var(--success)' : 'var(--text-primary)' }}>
                                        {tx.amt > 0 ? '+' : '-'}₹{Math.abs(tx.amt).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* RIGHT COLUMN: Budgets & Income */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Budgets</h2>
                            <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>Edit</span>
                        </div>
                        <div className="panel" style={{ padding: '1.5rem' }}>
                            {[
                                { name: 'Food & Dining', spent: 450, total: 600, pct: 75, color: 'var(--accent)' },
                                { name: 'Rent & Utilities', spent: 2250, total: 2300, pct: 98, color: 'var(--danger)' },
                                { name: 'Entertainment', spent: 80, total: 200, pct: 40, color: 'var(--accent)' },
                                { name: 'Transportation', spent: 120, total: 300, pct: 40, color: 'var(--accent)' },
                            ].map(b => (
                                <div key={b.name} style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{b.name}</div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{b.pct}%</div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                        ₹{b.spent} / ₹{b.total}
                                    </div>
                                    <div className="time-allocation-bar" style={{ margin: 0 }}>
                                        <div className="time-allocation-fill" style={{ width: `${b.pct}%`, background: b.color }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Income Sources</h2>
                            <span style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>Details</span>
                        </div>
                        <div className="panel" style={{ padding: '1.5rem' }}>
                            {[
                                { name: 'Salary', amt: 6000, pct: 73 },
                                { name: 'Freelance', amt: 1200, pct: 15 },
                                { name: 'Investments', amt: 600, pct: 7 },
                                { name: 'Side Project', amt: 400, pct: 5 },
                            ].map(s => (
                                <div key={s.name} style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{s.name}</div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{s.pct}%</div>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                        ₹{s.amt.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                    </div>
                                    <div className="time-allocation-bar" style={{ margin: 0 }}>
                                        <div className="time-allocation-fill" style={{ width: `${s.pct}%`, background: 'var(--success)' }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
