import { useState } from 'react';

export default function MoneyView({ appState, updateState }) {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState(appState.income);

    const handleSave = () => {
        const val = parseFloat(inputValue);
        if (!isNaN(val) && val >= 0) {
            updateState({ income: val });
            setIsEditing(false);
        } else {
            alert('Please enter a valid positive number');
        }
    };

    return (
        <div className="app-container">
            <header className="top-header">
                <div className="header-left">
                    <h1>Financial Tracking</h1>
                </div>
            </header>

            <section className="panel minimal-panel mt-4" style={{ maxWidth: '400px' }}>
                <h2>Monthly Income / Allowance</h2>
                <div className="income-tracker mt-4">
                    <div className="income-display">
                        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>$</span>
                        {!isEditing ? (
                            <>
                                <span style={{ fontSize: '2rem', fontWeight: 700, marginLeft: '0.2rem' }}>{appState.income}</span>
                                <button className="icon-btn" style={{ marginLeft: '1rem' }} onClick={() => setIsEditing(true)}>✏️</button>
                            </>
                        ) : (
                            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem' }}>
                                <input 
                                    type="number" 
                                    className="ex-input" 
                                    value={inputValue} 
                                    onChange={(e) => setInputValue(e.target.value)}
                                    style={{ width: '120px', fontSize: '1.5rem', padding: '0.5rem' }} 
                                />
                                <button className="btn primary" onClick={handleSave}>Save</button>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
