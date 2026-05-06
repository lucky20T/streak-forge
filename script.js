// Constants
const TASKS = ["Unreal", "Japanese", "Chess"];
const MINIMUM_PRODUCTIVE_SECONDS_FOR_STREAK = 4 * 60 * 60; // 4 hours

// View Navigation
function switchView(viewId) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show target view
    document.getElementById(viewId).classList.add('active');
    
    // Update active state on nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Find the button that called this (or just match the onclick attribute)
    const activeBtn = document.querySelector(`button[onclick="switchView('${viewId}')"]`);
    if (activeBtn) activeBtn.classList.add('active');
}

// State Management
let appState = {
    records: {}, // { "YYYY-MM-DD": { "Unreal": { time: 0, break: 0, goal: 0 } } }
    goals: { short: [], long: [] },
    income: 0,
    streak: { current: 0, best: 0, lastStreakDate: null }
};

let activeFocus = {
    task: null,
    status: 'idle', // 'idle', 'running', 'break'
    intervalId: null
};

// Utilities
function getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatHoursMins(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    return `${h}h ${m}m`;
}

// Data Persistence
function loadData() {
    const data = localStorage.getItem('streakForgeDataV2');
    if (data) {
        appState = JSON.parse(data);
    }
    
    // Ensure today's record exists
    const today = getTodayString();
    if (!appState.records[today]) {
        appState.records[today] = {};
    }
    
    TASKS.forEach(task => {
        if (!appState.records[today][task]) {
            appState.records[today][task] = { time: 0, break: 0, goal: 0 };
        }
    });
}

function saveData() {
    localStorage.setItem('streakForgeDataV2', JSON.stringify(appState));
    updateObjectivesUI();
}

// Focus Logic
function openFocusMode(task) {
    // If we're already running another task, don't allow opening a different one unless stopped
    if (activeFocus.status !== 'idle' && activeFocus.task !== task) {
        alert("Please stop the current task before starting a new one.");
        return;
    }
    
    activeFocus.task = task;
    document.getElementById('focus-title').textContent = task;
    
    // Setup UI based on status
    syncFocusUI();
    
    document.getElementById('focus-overlay').classList.remove('hidden');
}

function closeFocusMode() {
    if (activeFocus.status !== 'idle') {
        // Can't close if running, must stop first, or we just hide the modal but keep it running?
        // Let's just hide the modal and let it run in background.
    } else {
        activeFocus.task = null;
    }
    document.getElementById('focus-overlay').classList.add('hidden');
    updateUI();
}

function startFocusTimer() {
    if (activeFocus.status === 'running') return;
    
    activeFocus.status = 'running';
    syncFocusUI();
    
    if (activeFocus.intervalId) clearInterval(activeFocus.intervalId);
    
    activeFocus.intervalId = setInterval(() => {
        const today = getTodayString();
        appState.records[today][activeFocus.task].time++;
        document.getElementById('focus-main-timer').textContent = formatTime(appState.records[today][activeFocus.task].time);
        
        if (appState.records[today][activeFocus.task].time % 10 === 0) saveData();
    }, 1000);
}

function startBreak() {
    if (activeFocus.status !== 'running') return;
    
    activeFocus.status = 'break';
    syncFocusUI();
    
    if (activeFocus.intervalId) clearInterval(activeFocus.intervalId);
    
    activeFocus.intervalId = setInterval(() => {
        const today = getTodayString();
        appState.records[today][activeFocus.task].break++;
        document.getElementById('focus-break-timer').textContent = formatTime(appState.records[today][activeFocus.task].break);
        
        if (appState.records[today][activeFocus.task].break % 10 === 0) saveData();
    }, 1000);
}

function resumeFocus() {
    if (activeFocus.status !== 'break') return;
    startFocusTimer();
}

function stopFocus() {
    if (activeFocus.intervalId) {
        clearInterval(activeFocus.intervalId);
        activeFocus.intervalId = null;
    }
    activeFocus.status = 'idle';
    syncFocusUI();
    checkStreak();
    saveData();
    updateUI();
}

// Modal UI Sync
function syncFocusUI() {
    const today = getTodayString();
    const taskData = appState.records[today][activeFocus.task];
    
    // Set Timers
    document.getElementById('focus-main-timer').textContent = formatTime(taskData.time);
    document.getElementById('focus-break-timer').textContent = formatTime(taskData.break);
    
    // Set Goal
    const goalDisplay = document.getElementById('focus-goal-display');
    const goalText = document.getElementById('focus-goal-text');
    if (taskData.goal > 0) {
        goalDisplay.classList.remove('hidden');
        goalText.textContent = `${Math.floor(taskData.goal / 60)} mins`;
    } else {
        goalDisplay.classList.add('hidden');
    }

    // Toggle Controls
    document.getElementById('focus-controls-initial').classList.add('hidden');
    document.getElementById('focus-controls-running').classList.add('hidden');
    document.getElementById('focus-controls-break').classList.add('hidden');
    document.getElementById('focus-goal-input-area').classList.add('hidden');
    document.getElementById('break-timer-wrapper').classList.add('hidden');
    
    if (activeFocus.status === 'idle') {
        document.getElementById('focus-controls-initial').classList.remove('hidden');
    } else if (activeFocus.status === 'running') {
        document.getElementById('focus-controls-running').classList.remove('hidden');
    } else if (activeFocus.status === 'break') {
        document.getElementById('focus-controls-break').classList.remove('hidden');
        document.getElementById('break-timer-wrapper').classList.remove('hidden');
    }
}

// Goal Settings in Modal
function openGoalInput() {
    document.getElementById('focus-controls-initial').classList.add('hidden');
    document.getElementById('focus-goal-input-area').classList.remove('hidden');
    const today = getTodayString();
    const taskData = appState.records[today][activeFocus.task];
    document.getElementById('focus-goal-input').value = taskData.goal > 0 ? Math.floor(taskData.goal / 60) : '';
}

function saveGoal() {
    const val = parseInt(document.getElementById('focus-goal-input').value);
    if (!isNaN(val) && val > 0) {
        const today = getTodayString();
        appState.records[today][activeFocus.task].goal = val * 60; // save in seconds
        saveData();
    }
    syncFocusUI();
}

function cancelGoal() {
    syncFocusUI();
}

// Dashboard UI
function updateObjectivesUI() {
    const today = getTodayString();
    const container = document.getElementById('objectives-container');
    
    container.innerHTML = TASKS.map(task => {
        const data = appState.records[today][task] || { time: 0, break: 0 };
        return `
            <div class="task-card" onclick="openFocusMode('${task}')">
                <div class="task-name">${task}</div>
                <div class="task-stats">
                    <div class="time">${formatTime(data.time)}</div>
                    ${data.break > 0 ? `<div class="break-time">Break: ${formatTime(data.break)}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Event Listeners for Modal
document.getElementById('close-focus-btn').addEventListener('click', closeFocusMode);
document.getElementById('btn-focus-start').addEventListener('click', startFocusTimer);
document.getElementById('btn-focus-break').addEventListener('click', startBreak);
document.getElementById('btn-focus-resume').addEventListener('click', resumeFocus);
document.getElementById('btn-focus-stop').addEventListener('click', stopFocus);
document.getElementById('btn-focus-stop-from-break').addEventListener('click', stopFocus);

document.getElementById('btn-focus-set-goal').addEventListener('click', openGoalInput);
document.getElementById('btn-focus-save-goal').addEventListener('click', saveGoal);
document.getElementById('btn-focus-cancel-goal').addEventListener('click', cancelGoal);

// Global Stats & Analytics Updates
function updateTotalStats() {
    const today = getTodayString();
    let todayTotal = 0;
    let mostFocusedTask = '-';
    let maxTime = 0;

    if (appState.records[today]) {
        for (const [task, data] of Object.entries(appState.records[today])) {
            todayTotal += data.time;
            if (data.time > maxTime) {
                maxTime = data.time;
                mostFocusedTask = task;
            }
        }
    }

    document.getElementById('today-total-time').textContent = formatHoursMins(todayTotal);
    document.getElementById('today-most-focused').textContent = maxTime > 0 ? mostFocusedTask : '-';

    let allTimeTotal = 0;
    for (const date in appState.records) {
        for (const task in appState.records[date]) {
            allTimeTotal += appState.records[date][task].time;
        }
    }
    document.getElementById('total-completed-hours').textContent = Math.floor(allTimeTotal / 3600) + 'h';
    document.getElementById('today-active-timer').textContent = activeFocus.status !== 'idle' ? activeFocus.task : 'None';
}

function checkStreak() {
    const today = getTodayString();
    let todayTotal = 0;
    for (const task in appState.records[today]) {
        todayTotal += appState.records[today][task].time;
    }

    if (todayTotal >= MINIMUM_PRODUCTIVE_SECONDS_FOR_STREAK) {
        if (appState.streak.lastStreakDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
            
            if (appState.streak.lastStreakDate === yesterdayStr) {
                appState.streak.current++;
            } else {
                appState.streak.current = 1;
            }
            appState.streak.lastStreakDate = today;
            
            if (appState.streak.current > appState.streak.best) {
                appState.streak.best = appState.streak.current;
            }
        }
    }
}

function drawWeeklyChart() {
    const canvas = document.getElementById('weekly-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);

    const last7Days = [];
    const totals = [];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        last7Days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
        
        let dayTotal = 0;
        if (appState.records[dateStr]) {
            dayTotal = Object.values(appState.records[dateStr]).reduce((sum, task) => sum + task.time, 0);
        }
        totals.push(dayTotal / 3600); 
    }

    const maxHours = Math.max(...totals, 4); 
    
    ctx.strokeStyle = '#333333';
    ctx.beginPath();
    ctx.moveTo(40, 10);
    ctx.lineTo(40, height - 30);
    ctx.lineTo(width - 10, height - 30);
    ctx.stroke();

    const barWidth = (width - 70) / 7;
    ctx.fillStyle = '#22c55e';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';

    for (let i = 0; i < 7; i++) {
        const h = (totals[i] / maxHours) * (height - 50);
        const x = 50 + i * barWidth + (barWidth * 0.1);
        const y = height - 30 - h;
        
        ctx.fillRect(x, y, barWidth * 0.8, h);
        
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText(last7Days[i], x + (barWidth * 0.4), height - 10);
        
        if (totals[i] > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.fillText(totals[i].toFixed(1) + 'h', x + (barWidth * 0.4), y - 5);
        }
        ctx.fillStyle = '#22c55e';
    }

    ctx.fillStyle = '#aaaaaa';
    ctx.textAlign = 'right';
    ctx.fillText('0h', 30, height - 25);
    ctx.fillText((maxHours/2).toFixed(1) + 'h', 30, height - 25 - (height-50)/2);
    ctx.fillText(maxHours.toFixed(1) + 'h', 30, 20);
}

function updateDistribution() {
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay()); 
    
    const weekTasks = {};
    TASKS.forEach(t => weekTasks[t] = 0);
    let totalWeekTime = 0;

    for (let i = 0; i < 7; i++) {
        const d = new Date(currentWeekStart);
        d.setDate(currentWeekStart.getDate() + i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        
        if (appState.records[dateStr]) {
            for (const [task, data] of Object.entries(appState.records[dateStr])) {
                if (weekTasks[task] !== undefined) {
                    weekTasks[task] += data.time;
                    totalWeekTime += data.time;
                }
            }
        }
    }

    const container = document.getElementById('task-distribution');
    let html = '';

    TASKS.forEach(task => {
        const pct = totalWeekTime > 0 ? (weekTasks[task] / totalWeekTime) * 100 : 0;
        html += `
            <div class="dist-row">
                <div class="dist-header">
                    <span>${task}</span>
                    <span>${pct.toFixed(1)}%</span>
                </div>
                <div class="dist-bar-bg">
                    <div class="dist-bar-fill" style="width: ${pct}%"></div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
    generateInsights(weekTasks, totalWeekTime);
}

function generateInsights(weekTasks, totalWeekTime) {
    const insightsContainer = document.getElementById('productivity-insights');
    const insights = [];

    if (totalWeekTime === 0) {
        insights.push("No data yet for this week. Enter Focus Mode to build momentum!");
    } else {
        let bestTask = '-';
        let bestTime = 0;
        for(const task in weekTasks) {
            if(weekTasks[task] > bestTime) {
                bestTime = weekTasks[task];
                bestTask = task;
            }
        }
        insights.push(`"${bestTask}" is your strongest objective this week.`);
        
        if (bestTime > 0) {
            insights.push(`You spent ${Math.floor(bestTime/3600)}h on ${bestTask} this week.`);
        }

        const today = getTodayString();
        let todayTotal = 0;
        if(appState.records[today]) {
            for(const task in appState.records[today]) {
                todayTotal += appState.records[today][task].time;
            }
        }
        if (todayTotal > MINIMUM_PRODUCTIVE_SECONDS_FOR_STREAK) {
            insights.push("Great job hitting your daily 4-hour goal today! 🔥");
        }
    }

    insightsContainer.innerHTML = insights.map(i => `<li>${i}</li>`).join('');
}

// Side panels (Goals, Income) remaining mostly the same logic
function setupGoalsAndIncome() {
    const renderGoals = (type) => {
        const list = document.getElementById(`${type}-goal-list`);
        list.innerHTML = appState.goals[type].map((g, idx) => `
            <li>
                <span>${g}</span>
                <button onclick="deleteGoal('${type}', ${idx})">✕</button>
            </li>
        `).join('');
    };

    renderGoals('short');
    renderGoals('long');

    window.deleteGoal = (type, idx) => {
        appState.goals[type].splice(idx, 1);
        saveData();
        renderGoals(type);
    };

    document.getElementById('add-short-goal').onclick = () => {
        const input = document.getElementById('short-goal-input');
        if (input.value.trim()) {
            appState.goals.short.push(input.value.trim());
            input.value = '';
            saveData();
            renderGoals('short');
        }
    };

    document.getElementById('add-long-goal').onclick = () => {
        const input = document.getElementById('long-goal-input');
        if (input.value.trim()) {
            appState.goals.long.push(input.value.trim());
            input.value = '';
            saveData();
            renderGoals('long');
        }
    };

    const incomeDisplay = document.getElementById('income-amount');
    const incomeInput = document.getElementById('income-input');
    const editBtn = document.getElementById('edit-income-btn');
    const saveBtn = document.getElementById('save-income-btn');
    const form = document.getElementById('income-edit-form');
    const displayContainer = document.querySelector('.income-display');

    incomeDisplay.textContent = `₹${appState.income}`;

    editBtn.onclick = () => {
        displayContainer.classList.add('hidden');
        form.classList.remove('hidden');
        incomeInput.value = appState.income;
        incomeInput.focus();
    };

    saveBtn.onclick = () => {
        appState.income = parseInt(incomeInput.value) || 0;
        incomeDisplay.textContent = `₹${appState.income}`;
        form.classList.add('hidden');
        displayContainer.classList.remove('hidden');
        saveData();
    };
}

function updateUI() {
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('current-streak').textContent = appState.streak.current;
    document.getElementById('best-streak').textContent = appState.streak.best;
    
    updateObjectivesUI();
    updateTotalStats();
    drawWeeklyChart();
    updateDistribution();
}

function init() {
    loadData();
    setupGoalsAndIncome();
    updateUI();
}

document.addEventListener('DOMContentLoaded', init);
