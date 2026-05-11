import { Bell, Cloud, CloudOff, RefreshCw, LogOut } from 'lucide-react';

const SYNC_LABEL = {
    idle:    { text: 'Cloud Sync Disabled', color: '#9ca3af' },
    syncing: { text: 'Syncing…',            color: '#f59e0b' },
    synced:  { text: 'Synced',              color: '#10b981' },
    error:   { text: 'Sync Error',          color: '#ef4444' },
    offline: { text: 'Offline Mode',        color: '#9ca3af' },
};

export default function TopHeader({ title, onManage, user, syncStatus, lastSynced, onSignIn, onLogout, onSyncNow }) {
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
        <header className="top-header" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
            <div className="header-left" style={{ width: '200px' }}>
                <h1 style={{ fontSize: '1.25rem' }}>{title}</h1>
            </div>
            
            <div className="date-display" style={{ flexGrow: 1, textAlign: 'center' }}>
                {todayStr} • {timeStr}
            </div>
            
            <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Sync status pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 500, color: sync.color }}>
                    {syncStatus === 'synced'  && <Cloud size={13} />}
                    {syncStatus === 'syncing' && <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />}
                    {(syncStatus === 'idle' || syncStatus === 'offline') && <CloudOff size={13} />}
                    {syncStatus === 'error'   && <CloudOff size={13} />}
                    <span>{sync.text}{lastSyncStr ? ` (${lastSyncStr})` : ''}</span>
                </div>

                {user ? (
                    <>
                        {/* Sync now button */}
                        {onSyncNow && (
                            <button
                                onClick={onSyncNow}
                                title="Sync now"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', padding: '0.25rem' }}
                            >
                                <RefreshCw size={15} />
                            </button>
                        )}

                        {/* Avatar + name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {user.photoURL && (
                                <img
                                    src={user.photoURL}
                                    alt={user.displayName}
                                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }}
                                />
                            )}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user.displayName?.split(' ')[0] || 'User'}
                            </span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user.email}
                            </span>
                        </div>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={onLogout}
                            title="Sign out"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', padding: '0.25rem' }}
                        >
                            <LogOut size={16} />
                        </button>
                    </>
                ) : null}

                <Bell size={20} className="header-icon" />
                {onManage && (
                    <button className="btn primary" onClick={onManage}>
                        Manage
                    </button>
                )}
            </div>
        </header>
    );
}
