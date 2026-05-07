import { Bell, Search } from 'lucide-react';

export default function TopHeader({ title, onManage }) {
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    return (
        <header className="top-header">
            <div className="header-left" style={{ width: '200px' }}>
                <h1 style={{ fontSize: '1.25rem' }}>{title}</h1>
            </div>
            
            <div className="date-display" style={{ flexGrow: 1, textAlign: 'center' }}>
                {todayStr} • {timeStr}
            </div>
            
            <div className="header-right">
                <Bell size={20} className="header-icon" />
                <Search size={20} className="header-icon" />
                {onManage && (
                    <button className="btn primary" onClick={onManage}>
                        Manage
                    </button>
                )}
            </div>
        </header>
    );
}
