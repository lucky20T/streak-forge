import { Activity, Dumbbell, Wallet, UserCircle, Settings, BarChart2 } from 'lucide-react';

export default function Sidebar({ activeView, setActiveView }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="brand">Streak Forge</div>
                <div className="brand-subtitle">Productivity Ritual</div>
            </div>
            
            <nav className="nav-menu">
                <div className="nav-section">
                    <button 
                        className={`nav-item ${activeView === 'view-activity' ? 'active' : ''}`} 
                        onClick={() => setActiveView('view-activity')}
                    >
                        <span className="nav-icon"><Activity size={18} /></span>
                        <span>Activity</span>
                    </button>
                    <button 
                        className={`nav-item ${activeView === 'view-exercise' ? 'active' : ''}`} 
                        onClick={() => setActiveView('view-exercise')}
                    >
                        <span className="nav-icon"><Dumbbell size={18} /></span>
                        <span>Exercise</span>
                    </button>
                    <button 
                        className={`nav-item ${activeView === 'view-money' ? 'active' : ''}`} 
                        onClick={() => setActiveView('view-money')}
                    >
                        <span className="nav-icon"><Wallet size={18} /></span>
                        <span>Money</span>
                    </button>
                    <button 
                        className={`nav-item ${activeView === 'view-analytics' ? 'active' : ''}`} 
                        onClick={() => setActiveView('view-analytics')}
                    >
                        <span className="nav-icon"><BarChart2 size={18} /></span>
                        <span>Stats</span>
                    </button>
                    <button 
                        className={`nav-item ${activeView === 'view-settings' ? 'active' : ''}`}
                        onClick={() => setActiveView('view-settings')}
                    >
                        <span className="nav-icon"><Settings size={18} /></span>
                        <span>Settings</span>
                    </button>
                </div>
            </nav>
        </aside>
    );
}
