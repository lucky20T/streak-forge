import { useState, useRef } from 'react';
import TopHeader from './TopHeader';

export default function SettingsView({ appState, updateState }) {
    const fileInputRef = useRef(null);
    const [importError, setImportError] = useState('');

    const handleExport = () => {
        const dataStr = JSON.stringify(appState, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().split('T')[0];
        a.download = `streak-forge-backup-${date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsedData = JSON.parse(event.target.result);
                // Basic validation
                if (parsedData.activities && parsedData.records) {
                    updateState(parsedData);
                    setImportError('');
                    alert("Data imported successfully!");
                } else {
                    setImportError("Invalid backup file format.");
                }
            } catch (err) {
                setImportError("Failed to parse JSON file.");
            }
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    const handleClearData = () => {
        const confirmed = window.confirm(
            "⚠️ WARNING: This will permanently delete ALL your activities, exercises, finances, and history.\n\nAre you sure you want to proceed?"
        );
        if (confirmed) {
            localStorage.removeItem('streakForgeDataV3');
            localStorage.removeItem('streakForge_activeSession');
            window.location.reload();
        }
    };

    return (
        <div className="app-container">
            <TopHeader title="Settings" />
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Manage your data and application preferences.</p>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '800px' }}>
                <section className="panel" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Data Management</h2>
                    
                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Export Data</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Download a complete backup of all your Streak Forge data as a JSON file.
                        </p>
                        <button className="btn primary" onClick={handleExport}>
                            Export Backup
                        </button>
                    </div>

                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '1.5rem 0' }}></div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Import Data</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Restore your data from a previously exported JSON backup file.
                        </p>
                        <input 
                            type="file" 
                            accept=".json" 
                            style={{ display: 'none' }} 
                            ref={fileInputRef}
                            onChange={handleImport}
                        />
                        <button className="btn outline" onClick={() => fileInputRef.current?.click()}>
                            Select Backup File
                        </button>
                        {importError && (
                            <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 500 }}>
                                {importError}
                            </div>
                        )}
                    </div>

                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '1.5rem 0' }}></div>

                    <div>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--danger)', marginBottom: '0.5rem' }}>Danger Zone</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Permanently wipe all data from your browser. This action cannot be undone.
                        </p>
                        <button 
                            className="btn large" 
                            style={{ background: '#fef2f2', color: 'var(--danger)', border: '1px solid #fecaca', fontWeight: 600 }}
                            onClick={handleClearData}
                        >
                            Clear All Data
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
