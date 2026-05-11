import { Bell, Cloud, CloudOff, RefreshCw, LogOut, ArrowLeft, User as UserIcon, Settings } from 'lucide-react';

const SYNC_LABEL = {
    idle:    { text: 'Cloud Sync Disabled', color: '#9ca3af' },
    syncing: { text: 'Syncing…',            color: '#f59e0b' },
    synced:  { text: 'Synced',              color: '#10b981' },
    error:   { text: 'Sync Error',          color: '#ef4444' },
    offline: { text: 'Offline Mode',        color: '#9ca3af' },
};

export default function TopHeader({ title, onManage, onBack, onProfile, onSettings, user, syncStatus, lastSynced, onSignIn, onLogout, onSyncNow }) {
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const timeStr  = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const sync     = SYNC_LABEL[syncStatus] || SYNC_LABEL.idle;
    
    let lastSyncStr = '';
    if (lastSynced) {
        const diff = Math.floor((new Date() - lastSynced) / 1000);
        if (diff < 60) lastSyncStr = 'Just now';
        else if (diff < 3600) lastSyncStr = `${Math.floor(diff/60)}m ago`;
        else lastSyncStr = 'Long ago';
    }

    return (
        <header className="top-header" style={{ flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {onBack && (
                    <button 
                        onClick={onBack}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '0.25rem' }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}
                <h1 style={{ fontSize: '1.25rem' }}>{title}</h1>
            </div>
            
            <div className="date-display" style={{ flexGrow: 1, textAlign: 'center' }}>
                {todayStr} • {timeStr}
            </div>
            
            <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Icons Section */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div className="mobile-only" style={{ gap: '0.75rem', alignItems: 'center' }}>
                        <UserIcon 
                            size={20} 
                            className="header-icon" 
                            style={{ cursor: 'pointer', color: title === 'Profile & Progression' ? 'var(--accent)' : 'inherit' }} 
                            onClick={onProfile}
                        />
                        <Settings 
                            size={20} 
                            className="header-icon" 
                            style={{ cursor: 'pointer', color: title === 'Settings' ? 'var(--accent)' : 'inherit' }} 
                            onClick={onSettings}
                        />
                    </div>
                    <Bell size={20} className="header-icon" />
                </div>

                {/* Sync status pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 500, color: sync.color }}>
                    {syncStatus === 'synced'  && <Cloud size={13} />}
                    {syncStatus === 'syncing' && <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />}
                    {(syncStatus === 'idle' || syncStatus === 'offline') && <CloudOff size={13} />}
                    {syncStatus === 'error'   && <CloudOff size={13} />}
                    <span>{sync.text}{lastSyncStr ? ` (${lastSyncStr})` : ''}</span>
                </div>

                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {onSyncNow && (
                            <button
                                onClick={onSyncNow}
                                title="Sync now"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '0.25rem' }}
                            >
                                <RefreshCw size={15} />
                            </button>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {user.photoURL && (
                                <img
                                    src={user.photoURL}
                                    alt={user.displayName}
                                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }}
                                />
                            )}
                            <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {user.displayName?.split(' ')[0] || 'User'}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={onLogout}
                            title="Sign out"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', padding: '0.25rem' }}
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                ) : null}

                {onManage && (
                    <button className="btn primary" onClick={onManage}>
                        Manage
                    </button>
                )}
            </div>
        </header>
    );
}
