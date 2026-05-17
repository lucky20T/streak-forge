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

export function playChime() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const playTone = (freq, startTime, duration) => {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            
            gainNode.gain.setValueAtTime(0.15, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
            
            osc.start(startTime);
            osc.stop(startTime + duration);
        };

        const now = audioCtx.currentTime;
        playTone(523.25, now, 1.2);       // C5
        playTone(783.99, now + 0.15, 1.5); // G5
    } catch (e) {
        console.error("Web Audio API not supported or blocked", e);
    }
}

export function showNotification(title, body) {
    if (!("Notification" in window)) return;
    
    if (Notification.permission === "granted") {
        new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(title, { body });
            }
        });
    }
}
