import { Activity, Dumbbell, Wallet } from 'lucide-react';

export default function Sidebar({ activeView, setActiveView }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="brand">⚡ Streak Forge</div>
            </div>
            
            <nav className="nav-menu">
                <div className="nav-section">
                    <button 
                        className={`nav-item ${activeView === 'view-activity' ? 'active' : ''}`} 
                        onClick={() => setActiveView('view-activity')}
                    >
                        <span className="nav-icon"><Activity size={18} /></span>
                        <span className="nav-label">Activity</span>
                    </button>
                    <button 
                        className={`nav-item ${activeView === 'view-exercise' ? 'active' : ''}`} 
                        onClick={() => setActiveView('view-exercise')}
                    >
                        <span className="nav-icon"><Dumbbell size={18} /></span>
                        <span className="nav-label">Health</span>
                    </button>
                </div>
                
                <div className="nav-section bottom">
                    <button 
                        className={`nav-item ${activeView === 'view-money' ? 'active' : ''}`} 
                        onClick={() => setActiveView('view-money')}
                    >
                        <span className="nav-icon"><Wallet size={18} /></span>
                        <span className="nav-label">Money</span>
                    </button>
                </div>
            </nav>
        </aside>
    );
}
