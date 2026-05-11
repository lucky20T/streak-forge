export function getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getDateString(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getCurrentTime() {
    const now = new Date();
    let h = now.getHours();
    let m = now.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; 
    m = m < 10 ? '0'+m : m;
    return `${h}:${m} ${ampm}`;
}

export function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatHoursMins(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return `${h}h ${m}m`;
}

export function generateId(prefix = 'act_') {
    return prefix + Math.random().toString(36).substr(2, 9);
}

export const LEVEL_THRESHOLDS = [0, 20, 100, 300, 1000];
export const LEVEL_LABELS = ['Started', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];

export function getSkillLevelInfo(totalSeconds) {
    const totalHours = totalSeconds / 3600;
    let level = 0;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (totalHours >= LEVEL_THRESHOLDS[i]) {
            level = i;
            break;
        }
    }
    
    const label = LEVEL_LABELS[level];
    const nextLevelHours = LEVEL_THRESHOLDS[level + 1] || null;
    const currentLevelThreshold = LEVEL_THRESHOLDS[level];
    
    let progress = 100;
    if (nextLevelHours !== null) {
        progress = ((totalHours - currentLevelThreshold) / (nextLevelHours - currentLevelThreshold)) * 100;
    }
        
    return { level, label, totalHours, nextLevelHours, progress };
}
