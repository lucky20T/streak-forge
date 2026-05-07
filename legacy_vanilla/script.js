// Constants
const MINIMUM_PRODUCTIVE_SECONDS_FOR_STREAK = 4 * 60 * 60;

// View Navigation
function switchView(viewId) {
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const activeBtn = document.querySelector(`button[onclick="switchView('${viewId}')"]`);
    if (activeBtn) activeBtn.classList.add('active');
}

const DEFAULT_EXERCISES = [
    { id: "ex_1", name: "Push-ups", category: "Push", archived: false },
    { id: "ex_2", name: "Incline Push-ups", category: "Push", archived: false },
    { id: "ex_3", name: "Decline Push-ups", category: "Push", archived: false },
    { id: "ex_4", name: "Diamond Push-ups", category: "Push", archived: false },
    { id: "ex_5", name: "Pike Push-ups", category: "Push", archived: false },
    { id: "ex_6", name: "Archer Push-ups", category: "Push", archived: false },
    { id: "ex_7", name: "Pull-ups", category: "Pull", archived: false },
    { id: "ex_8", name: "Chin-ups", category: "Pull", archived: false },
    { id: "ex_9", name: "Australian Rows", category: "Pull", archived: false },
    { id: "ex_10", name: "Dead Hangs", category: "Pull", archived: false },
    { id: "ex_11", name: "Squats", category: "Legs", archived: false },
    { id: "ex_12", name: "Jump Squats", category: "Legs", archived: false },
    { id: "ex_13", name: "Lunges", category: "Legs", archived: false },
    { id: "ex_14", name: "Bulgarian Split Squats", category: "Legs", archived: false },
    { id: "ex_15", name: "Calf Raises", category: "Legs", archived: false },
    { id: "ex_16", name: "Dips", category: "Push", archived: false },
    { id: "ex_17", name: "Bench Dips", category: "Push", archived: false },
    { id: "ex_18", name: "Plank", category: "Core", archived: false },
    { id: "ex_19", name: "Side Plank", category: "Core", archived: false },
    { id: "ex_20", name: "Hollow Hold", category: "Core", archived: false },
    { id: "ex_21", name: "Leg Raises", category: "Core", archived: false },
    { id: "ex_22", name: "Hanging Knee Raises", category: "Core", archived: false },
    { id: "ex_23", name: "Mountain Climbers", category: "Cardio", archived: false },
    { id: "ex_24", name: "Burpees", category: "Cardio", archived: false },
    { id: "ex_25", name: "Jumping Jacks", category: "Cardio", archived: false },
    { id: "ex_26", name: "Handstand Practice", category: "Skill", archived: false },
    { id: "ex_27", name: "Wall Handstand Hold", category: "Skill", archived: false },
    { id: "ex_28", name: "Stretching", category: "Mobility", archived: false },
    { id: "ex_29", name: "Mobility", category: "Mobility", archived: false }
];

// State Management
let appState = {
    activities: [
        { id: "act_1", name: "Unreal Engine", type: "productive", archived: false },
        { id: "act_2", name: "Japanese", type: "productive", archived: false },
        { id: "act_3", name: "Chess", type: "productive", archived: false }
    ],
    exercises: [...DEFAULT_EXERCISES],
    records: {}, 
    exerciseRecords: {}, // { "YYYY-MM-DD": [ { id: "log_1", exerciseId: "ex_1", sets: 4, reps: 12 } ] }
    nutritionRecords: {}, // { "YYYY-MM-DD": { meals: [{id, meal, category, note, timestamp}], water: [] } }
    income: 0,
    streak: { current: 0, best: 0, lastStreakDate: null }
};

let activeFocus = {
    activityId: null,
    status: 'idle', // 'idle', 'running', 'break'
    intervalId: null
};

// Utilities
function getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getDateString(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getCurrentTime() {
    const now = new Date();
    let h = now.getHours();
    let m = now.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; 
    m = m < 10 ? '0'+m : m;
    return `${h}:${m} ${ampm}`;
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

function generateId() {
    return 'act_' + Math.random().toString(36).substr(2, 9);
}

// Data Persistence & Migration
function loadData() {
    const data = localStorage.getItem('streakForgeDataV3');
    if (data) {
        appState = JSON.parse(data);
        // Ensure exercises have categories (migrate existing V3 users)
        if (appState.exercises && (!appState.exercises[0] || !appState.exercises[0].category)) {
            appState.exercises = [...DEFAULT_EXERCISES]; 
        }
        if (!appState.nutritionRecords) {
            appState.nutritionRecords = {};
        }
    } else {
        // Attempt to migrate from V2
        const oldData = localStorage.getItem('streakForgeDataV2');
        if (oldData) {
            const parsed = JSON.parse(oldData);
            let newActivities = [];
            let newRecords = {};

            // Convert string array to objects
            if (Array.isArray(parsed.activities) && typeof parsed.activities[0] === 'string') {
                parsed.activities.forEach(name => {
                    const id = 'act_' + name.replace(/\s+/g, '').toLowerCase();
                    newActivities.push({ id, name, type: 'productive', archived: false });
                });
            } else if (Array.isArray(parsed.activities)) {
                newActivities = parsed.activities;
            }

            // Convert records
            for (const date in parsed.records) {
                newRecords[date] = {};
                for (const oldKey in parsed.records[date]) {
                    // find id
                    const act = newActivities.find(a => a.name === oldKey || a.id === oldKey);
                    if (act) {
                        newRecords[date][act.id] = parsed.records[date][oldKey];
                    }
                }
            }

            appState.activities = newActivities.length ? newActivities : appState.activities;
            appState.records = newRecords;
            appState.income = parsed.income || 0;
            appState.streak = parsed.streak || { current: 0, best: 0, lastStreakDate: null };
            
            // Add default exercises if migrating from V2
            if (!appState.exercises || (!appState.exercises[0] || !appState.exercises[0].category)) {
                appState.exercises = [...DEFAULT_EXERCISES];
                appState.exerciseRecords = {};
            }
            if (!appState.nutritionRecords) {
                appState.nutritionRecords = {};
            }

            saveData();
        }
    }

    if (!appState.exercises || (!appState.exercises[0] || !appState.exercises[0].category)) {
        appState.exercises = [...DEFAULT_EXERCISES];
    }
    if (!appState.exerciseRecords) appState.exerciseRecords = {};
    if (!appState.nutritionRecords) appState.nutritionRecords = {};

    const today = getTodayString();
    if (!appState.records[today]) appState.records[today] = {};
    if (!appState.exerciseRecords[today]) appState.exerciseRecords[today] = [];
    if (!appState.nutritionRecords[today]) appState.nutritionRecords[today] = { meals: [], water: [] };
    
    appState.activities.forEach(act => {
        if (!appState.records[today][act.id]) {
            appState.records[today][act.id] = { time: 0, break: 0, goal: 0 };
        }
    });
}

function saveData() {
    localStorage.setItem('streakForgeDataV3', JSON.stringify(appState));
    updateObjectivesUI();
    drawWeeklyChart();
    updateBalanceInsights();
    updateExerciseUI();
    updateNutritionUI();
}

// Manage Activities
function openManageModal() {
    renderManageList();
    document.getElementById('manage-overlay').classList.remove('hidden');
}

function closeManageModal() {
    document.getElementById('manage-overlay').classList.add('hidden');
    updateUI();
}

function renderManageList() {
    const activeList = document.getElementById('manage-active-list');
    const archivedList = document.getElementById('manage-archived-list');
    
    activeList.innerHTML = '';
    archivedList.innerHTML = '';

    appState.activities.forEach(act => {
        const li = document.createElement('li');
        li.className = 'manage-item';
        
        li.innerHTML = `
            <div class="manage-item-info">
                <span class="manage-item-type ${act.type}">${act.type === 'productive' ? '📚 Prod' : '🎮 Ent'}</span>
                <span id="act-name-disp-${act.id}">${act.name}</span>
                <input type="text" id="act-name-input-${act.id}" class="edit-input hidden" value="${act.name}">
            </div>
            <div class="manage-item-actions">
                <button class="icon-btn" id="btn-edit-${act.id}" title="Edit Name">✏️</button>
                <button class="icon-btn hidden" id="btn-save-${act.id}" title="Save">✅</button>
                <button class="icon-btn" onclick="toggleArchive('${act.id}')" title="${act.archived ? 'Unarchive' : 'Archive'}">
                    ${act.archived ? '↩️' : '🗄️'}
                </button>
            </div>
        `;

        // Edit bindings
        const editBtn = li.querySelector(`#btn-edit-${act.id}`);
        const saveBtn = li.querySelector(`#btn-save-${act.id}`);
        const disp = li.querySelector(`#act-name-disp-${act.id}`);
        const input = li.querySelector(`#act-name-input-${act.id}`);

        editBtn.onclick = () => {
            disp.classList.add('hidden');
            editBtn.classList.add('hidden');
            input.classList.remove('hidden');
            saveBtn.classList.remove('hidden');
            input.focus();
        };

        saveBtn.onclick = () => {
            const newName = input.value.trim();
            if (newName) {
                act.name = newName;
                saveData();
                renderManageList(); // re-render to reset state cleanly
            }
        };

        if (act.archived) {
            archivedList.appendChild(li);
        } else {
            activeList.appendChild(li);
        }
    });
}

function addNewActivity() {
    const nameInput = document.getElementById('new-activity-name');
    const typeSelect = document.getElementById('new-activity-type');
    const name = nameInput.value.trim();
    
    if (name) {
        const newAct = {
            id: generateId(),
            name: name,
            type: typeSelect.value,
            archived: false
        };
        appState.activities.push(newAct);
        
        const today = getTodayString();
        appState.records[today][newAct.id] = { time: 0, break: 0, goal: 0 };
        
        saveData();
        nameInput.value = '';
        renderManageList();
    }
}

window.toggleArchive = function(id) {
    const act = appState.activities.find(a => a.id === id);
    if (act) {
        act.archived = !act.archived;
        saveData();
        renderManageList();
    }
}

// Focus Logic
function openFocusMode(activityId) {
    if (activeFocus.status !== 'idle' && activeFocus.activityId !== activityId) {
        alert("Please stop the current task before starting a new one.");
        return;
    }
    
    const act = appState.activities.find(a => a.id === activityId);
    if(!act) return;

    activeFocus.activityId = activityId;
    document.getElementById('focus-title').textContent = act.name;
    syncFocusUI();
    document.getElementById('focus-overlay').classList.remove('hidden');
}

function closeFocusMode() {
    if (activeFocus.status === 'idle') {
        activeFocus.activityId = null;
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
        if (!appState.records[today][activeFocus.activityId]) {
            appState.records[today][activeFocus.activityId] = { time: 0, break: 0, goal: 0 };
        }
        appState.records[today][activeFocus.activityId].time++;
        document.getElementById('focus-main-timer').textContent = formatTime(appState.records[today][activeFocus.activityId].time);
        
        if (appState.records[today][activeFocus.activityId].time % 10 === 0) saveData();
    }, 1000);
}

function startBreak() {
    if (activeFocus.status !== 'running') return;
    
    activeFocus.status = 'break';
    syncFocusUI();
    
    if (activeFocus.intervalId) clearInterval(activeFocus.intervalId);
    
    activeFocus.intervalId = setInterval(() => {
        const today = getTodayString();
        appState.records[today][activeFocus.activityId].break++;
        document.getElementById('focus-break-timer').textContent = formatTime(appState.records[today][activeFocus.activityId].break);
        
        if (appState.records[today][activeFocus.activityId].break % 10 === 0) saveData();
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
    checkGlobalStreak();
    saveData();
    updateUI();
}

// Modal UI Sync
function syncFocusUI() {
    const today = getTodayString();
    if(!appState.records[today][activeFocus.activityId]) appState.records[today][activeFocus.activityId] = {time:0, break:0, goal:0};
    const taskData = appState.records[today][activeFocus.activityId];
    
    document.getElementById('focus-main-timer').textContent = formatTime(taskData.time);
    document.getElementById('focus-break-timer').textContent = formatTime(taskData.break);
    
    const goalDisplay = document.getElementById('focus-goal-display');
    const goalText = document.getElementById('focus-goal-text');
    if (taskData.goal > 0) {
        goalDisplay.classList.remove('hidden');
        goalText.textContent = `${Math.floor(taskData.goal / 60)} mins`;
    } else {
        goalDisplay.classList.add('hidden');
    }

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

function openGoalInput() {
    document.getElementById('focus-controls-initial').classList.add('hidden');
    document.getElementById('focus-goal-input-area').classList.remove('hidden');
    const today = getTodayString();
    const taskData = appState.records[today][activeFocus.activityId];
    document.getElementById('focus-goal-input').value = taskData.goal > 0 ? Math.floor(taskData.goal / 60) : '';
}

function saveGoal() {
    const val = parseInt(document.getElementById('focus-goal-input').value);
    if (!isNaN(val) && val > 0) {
        const today = getTodayString();
        appState.records[today][activeFocus.activityId].goal = val * 60; 
        saveData();
    }
    syncFocusUI();
}

function cancelGoal() { syncFocusUI(); }

// Calculate Activity Streak
function calculateActivityStreak(activityId) {
    let streak = 0;
    const today = getTodayString();
    
    if (appState.records[today] && appState.records[today][activityId] && appState.records[today][activityId].time > 0) {
        streak++;
    }
    
    for (let i = 1; i < 365; i++) {
        const dateStr = getDateString(i);
        if (appState.records[dateStr] && appState.records[dateStr][activityId] && appState.records[dateStr][activityId].time > 0) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

// Dashboard UI
function updateObjectivesUI() {
    const today = getTodayString();
    const container = document.getElementById('objectives-container');
    
    // Only show unarchived tasks
    const activeTasks = appState.activities.filter(a => !a.archived);
    
    container.innerHTML = activeTasks.map(act => {
        const data = (appState.records[today] && appState.records[today][act.id]) || { time: 0, break: 0 };
        const streak = calculateActivityStreak(act.id);
        
        return `
            <div class="task-card" data-type="${act.type}" onclick="openFocusMode('${act.id}')">
                <div class="task-card-header">
                    <div class="task-name">${act.name}</div>
                </div>
                <div class="task-stats">
                    <div class="streak">🔥 Streak: ${streak}</div>
                    <div class="time">${formatTime(data.time)}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Analytics
function updateBalanceInsights() {
    const today = getTodayString();
    let prodTime = 0;
    let entTime = 0;

    if (appState.records[today]) {
        for (const actId in appState.records[today]) {
            const act = appState.activities.find(a => a.id === actId);
            if (act) {
                if (act.type === 'productive') prodTime += appState.records[today][actId].time;
                if (act.type === 'entertainment') entTime += appState.records[today][actId].time;
            }
        }
    }

    const prodDisplay = document.getElementById('balance-productive');
    const entDisplay = document.getElementById('balance-entertainment');
    const feedback = document.getElementById('balance-feedback-text');

    if(prodDisplay) prodDisplay.textContent = formatHoursMins(prodTime);
    if(entDisplay) entDisplay.textContent = formatHoursMins(entTime);

    if (feedback) {
        if (prodTime === 0 && entTime === 0) {
            feedback.textContent = "Track some activities to see your balance.";
        } else if (entTime > prodTime) {
            feedback.textContent = "Entertainment time exceeded focus time today.";
        } else if (prodTime > entTime * 2 && entTime > 0) {
            feedback.textContent = "Great balance between work and relaxation.";
        } else if (entTime === 0) {
            feedback.textContent = "100% Productive! Don't forget to take a break.";
        } else {
            feedback.textContent = "Solid focus session today.";
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
        
        let dayProdTotal = 0;
        if (appState.records[dateStr]) {
            for (const actId in appState.records[dateStr]) {
                const act = appState.activities.find(a => a.id === actId);
                // Only graph productive time
                if (act && act.type === 'productive') {
                    dayProdTotal += appState.records[dateStr][actId].time;
                }
            }
        }
        totals.push(dayProdTotal / 3600); 
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

function checkGlobalStreak() {
    const today = getTodayString();
    let todayProdTotal = 0;
    for (const actId in appState.records[today]) {
        const act = appState.activities.find(a => a.id === actId);
        if (act && act.type === 'productive') {
            todayProdTotal += appState.records[today][actId].time;
        }
    }

    if (todayProdTotal >= MINIMUM_PRODUCTIVE_SECONDS_FOR_STREAK) {
        if (appState.streak.lastStreakDate !== today) {
            const yesterdayStr = getDateString(1);
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

// Exercise Tracking & Managing
function openManageExerciseModal() {
    renderManageExerciseList();
    document.getElementById('exercise-manage-overlay').classList.remove('hidden');
}

function closeManageExerciseModal() {
    document.getElementById('exercise-manage-overlay').classList.add('hidden');
    updateExerciseUI();
}

function renderManageExerciseList() {
    const activeList = document.getElementById('manage-ex-active-list');
    const archivedList = document.getElementById('manage-ex-archived-list');
    
    activeList.innerHTML = '';
    archivedList.innerHTML = '';

    appState.exercises.forEach(ex => {
        const li = document.createElement('li');
        li.className = 'manage-item';
        
        const catClass = ex.category ? ex.category : 'Push';
        
        li.innerHTML = `
            <div class="manage-item-info">
                <span class="manage-item-type ${catClass}">${catClass}</span>
                <span id="ex-name-disp-${ex.id}">${ex.name}</span>
                <input type="text" id="ex-name-input-${ex.id}" class="edit-input hidden" value="${ex.name}">
            </div>
            <div class="manage-item-actions">
                <button class="icon-btn" id="btn-edit-ex-${ex.id}" title="Edit Name">✏️</button>
                <button class="icon-btn hidden" id="btn-save-ex-${ex.id}" title="Save">✅</button>
                <button class="icon-btn" onclick="toggleArchiveExercise('${ex.id}')" title="${ex.archived ? 'Unarchive' : 'Archive'}">
                    ${ex.archived ? '↩️' : '🗄️'}
                </button>
            </div>
        `;

        const editBtn = li.querySelector(`#btn-edit-ex-${ex.id}`);
        const saveBtn = li.querySelector(`#btn-save-ex-${ex.id}`);
        const disp = li.querySelector(`#ex-name-disp-${ex.id}`);
        const input = li.querySelector(`#ex-name-input-${ex.id}`);

        editBtn.onclick = () => {
            disp.classList.add('hidden');
            editBtn.classList.add('hidden');
            input.classList.remove('hidden');
            saveBtn.classList.remove('hidden');
            input.focus();
        };

        saveBtn.onclick = () => {
            const newName = input.value.trim();
            if (newName) {
                ex.name = newName;
                saveData();
                renderManageExerciseList(); 
            }
        };

        if (ex.archived) {
            archivedList.appendChild(li);
        } else {
            activeList.appendChild(li);
        }
    });
}

function addNewExercise() {
    const nameInput = document.getElementById('new-exercise-name');
    const catSelect = document.getElementById('new-exercise-category');
    const name = nameInput.value.trim();
    const category = catSelect ? catSelect.value : 'Push';
    
    if (name) {
        const newEx = {
            id: generateId(),
            name: name,
            category: category,
            archived: false
        };
        appState.exercises.push(newEx);
        saveData();
        nameInput.value = '';
        renderManageExerciseList();
    }
}

window.toggleArchiveExercise = function(id) {
    const ex = appState.exercises.find(e => e.id === id);
    if (ex) {
        ex.archived = !ex.archived;
        saveData();
        renderManageExerciseList();
    }
}

function logWorkout() {
    const exId = document.getElementById('exercise-select').value;
    const sets = parseInt(document.getElementById('exercise-sets').value);
    const reps = parseInt(document.getElementById('exercise-reps').value);

    if (exId && sets > 0 && reps > 0) {
        const today = getTodayString();
        appState.exerciseRecords[today].push({
            id: generateId(),
            exerciseId: exId,
            sets: sets,
            reps: reps
        });
        saveData();
        
        // Reset inputs
        document.getElementById('exercise-sets').value = '';
        document.getElementById('exercise-reps').value = '';
    } else {
        alert("Please select an exercise and enter valid sets and reps.");
    }
}

window.deleteWorkoutLog = function(logId) {
    const today = getTodayString();
    appState.exerciseRecords[today] = appState.exerciseRecords[today].filter(log => log.id !== logId);
    saveData();
}

function updateExerciseUI() {
    const today = getTodayString();
    document.getElementById('exercise-current-date').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Populate Select Dropdown grouped by Category
    const select = document.getElementById('exercise-select');
    const activeExercises = appState.exercises.filter(e => !e.archived);
    
    // Group by category
    const grouped = activeExercises.reduce((acc, ex) => {
        const cat = ex.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(ex);
        return acc;
    }, {});

    let optionsHTML = '<option value="" disabled selected>Select Exercise...</option>';
    for (const [category, exercises] of Object.entries(grouped)) {
        optionsHTML += `<optgroup label="${category}">`;
        exercises.forEach(ex => {
            optionsHTML += `<option value="${ex.id}">${ex.name}</option>`;
        });
        optionsHTML += `</optgroup>`;
    }
    
    select.innerHTML = optionsHTML;

    // Today's Log
    const logList = document.getElementById('today-exercise-log');
    const todayLogs = appState.exerciseRecords[today] || [];
    
    if (todayLogs.length === 0) {
        logList.innerHTML = '<li class="log-item" style="justify-content:center; color:var(--text-secondary)">No workouts logged today.</li>';
    } else {
        logList.innerHTML = todayLogs.map(log => {
            const ex = appState.exercises.find(e => e.id === log.exerciseId);
            const exName = ex ? ex.name : 'Unknown Exercise';
            return `
                <li class="log-item">
                    <div class="log-info">
                        <span class="log-name">${exName}</span>
                        <span class="log-stats">${log.sets} sets × ${log.reps} reps</span>
                    </div>
                    <button class="del-log-btn" onclick="deleteWorkoutLog('${log.id}')" title="Delete Entry">✖</button>
                </li>
            `;
        }).join('');
    }

    // Daily Stats
    let totalEx = new Set(todayLogs.map(l => l.exerciseId)).size;
    let totalSets = todayLogs.reduce((acc, log) => acc + log.sets, 0);
    let totalReps = todayLogs.reduce((acc, log) => acc + (log.sets * log.reps), 0);

    document.getElementById('ex-today-count').textContent = totalEx;
    document.getElementById('ex-today-sets').textContent = totalSets;
    document.getElementById('ex-today-reps').textContent = totalReps;

    drawExerciseWeeklyChart();
}

function drawExerciseWeeklyChart() {
    const canvas = document.getElementById('exercise-weekly-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);

    const last7Days = [];
    const totals = [];
    let weekReps = 0;
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        last7Days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
        
        let dayRepsTotal = 0;
        if (appState.exerciseRecords[dateStr]) {
            appState.exerciseRecords[dateStr].forEach(log => {
                dayRepsTotal += (log.sets * log.reps);
            });
        }
        totals.push(dayRepsTotal); 
        weekReps += dayRepsTotal;
    }

    const maxReps = Math.max(...totals, 50); 
    
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
        const h = (totals[i] / maxReps) * (height - 50);
        const x = 50 + i * barWidth + (barWidth * 0.1);
        const y = height - 30 - h;
        
        ctx.fillRect(x, y, barWidth * 0.8, h);
        
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText(last7Days[i], x + (barWidth * 0.4), height - 10);
        
        if (totals[i] > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.fillText(totals[i], x + (barWidth * 0.4), y - 5);
        }
        ctx.fillStyle = '#22c55e';
    }

    ctx.fillStyle = '#aaaaaa';
    ctx.textAlign = 'right';
    ctx.fillText('0', 30, height - 25);
    ctx.fillText(Math.floor(maxReps/2), 30, height - 25 - (height-50)/2);
    ctx.fillText(maxReps, 30, 20);

    const feedback = document.getElementById('exercise-feedback');
    if (weekReps === 0) {
        feedback.textContent = "Start logging to see progress.";
    } else {
        feedback.textContent = `You've completed ${weekReps} reps this week! Keep it up.`;
    }
}

// Nutrition & Meal Tracking
function logMeal() {
    const mealName = document.getElementById('meal-name').value.trim();
    const category = document.getElementById('meal-category').value;
    const note = document.getElementById('meal-note').value.trim();

    if (mealName && category) {
        const today = getTodayString();
        
        // Safety check
        if (!appState.nutritionRecords[today]) {
            appState.nutritionRecords[today] = { meals: [], water: [] };
        }

        appState.nutritionRecords[today].meals.push({
            id: generateId(),
            meal: mealName,
            category: category,
            note: note,
            timestamp: getCurrentTime()
        });
        
        saveData();
        
        // Reset inputs
        document.getElementById('meal-name').value = '';
        document.getElementById('meal-category').value = '';
        document.getElementById('meal-note').value = '';
    } else {
        alert("Please enter a meal name and select a category.");
    }
}

window.deleteMealLog = function(logId) {
    const today = getTodayString();
    if (appState.nutritionRecords[today]) {
        appState.nutritionRecords[today].meals = appState.nutritionRecords[today].meals.filter(log => log.id !== logId);
        saveData();
    }
}

function updateNutritionUI() {
    const today = getTodayString();
    const records = appState.nutritionRecords[today] || { meals: [], water: [] };
    const meals = records.meals;

    // Daily Stats Calculation
    const HEALTHY_CATEGORIES = ["High Protein", "Balanced Meal", "Healthy Homemade", "Healthy Outside Food"];
    const JUNK_CATEGORIES = ["Junk Food", "Sugary", "Fried Food", "Fast Food", "Cheat Meal"];
    
    let healthyCount = 0;
    let junkCount = 0;
    let proteinCount = 0;

    meals.forEach(meal => {
        if (HEALTHY_CATEGORIES.includes(meal.category)) healthyCount++;
        if (JUNK_CATEGORIES.includes(meal.category)) junkCount++;
        if (meal.category === "High Protein") proteinCount++;
    });

    const elTotal = document.getElementById('nut-today-count');
    const elProtein = document.getElementById('nut-high-protein');
    const elHealthy = document.getElementById('nut-healthy');
    const elJunk = document.getElementById('nut-junk');

    if (elTotal) elTotal.textContent = meals.length;
    if (elProtein) elProtein.textContent = proteinCount;
    if (elHealthy) elHealthy.textContent = healthyCount;
    if (elJunk) elJunk.textContent = junkCount;

    // Today's Logs Rendering
    const logList = document.getElementById('today-meal-log');
    if (logList) {
        if (meals.length === 0) {
            logList.innerHTML = '<li class="log-item" style="justify-content:center; color:var(--text-secondary)">No meals logged today.</li>';
        } else {
            logList.innerHTML = meals.map(log => {
                // Determine badge color
                let badgeClass = 'other';
                if (HEALTHY_CATEGORIES.includes(log.category)) badgeClass = 'healthy';
                if (log.category === 'High Protein') badgeClass = 'high-protein';
                if (JUNK_CATEGORIES.includes(log.category)) badgeClass = 'junk';

                return `
                    <li class="log-item" style="align-items: flex-start;">
                        <div class="log-info" style="gap:0.3rem;">
                            <div class="log-name">
                                <span class="meal-badge ${badgeClass}">${log.category}</span>
                                ${log.meal}
                            </div>
                            <div style="display:flex; align-items:center; gap: 0.5rem;">
                                <span class="meal-timestamp">${log.timestamp}</span>
                                ${log.note ? `<span class="meal-note">"${log.note}"</span>` : ''}
                            </div>
                        </div>
                        <button class="del-log-btn" onclick="deleteMealLog('${log.id}')" title="Delete Entry">✖</button>
                    </li>
                `;
            }).join('');
        }
    }

    // Water Logic
    const waterLogs = records.water || [];
    const waterCountEl = document.getElementById('water-today-count');
    if (waterCountEl) waterCountEl.textContent = waterLogs.length;

    const waterList = document.getElementById('today-water-log');
    if (waterList) {
        if (waterLogs.length === 0) {
            waterList.innerHTML = '<li class="log-item" style="justify-content:center; color:var(--text-secondary); width:100%;">No water logged today.</li>';
        } else {
            waterList.innerHTML = waterLogs.map(log => `
                <li class="log-item" style="padding: 0.5rem 1rem; border-radius: 20px; background: rgba(14, 165, 233, 0.1); border-color: rgba(14, 165, 233, 0.3);">
                    <span style="color: #0ea5e9; font-weight: 500;">${log.timestamp}</span>
                    <button class="del-log-btn" onclick="deleteWaterLog('${log.id}')" title="Delete Entry" style="margin-left:0.5rem; color:#0ea5e9;">✖</button>
                </li>
            `).join('');
        }
    }
}

function logWater() {
    const today = getTodayString();
    if (!appState.nutritionRecords[today]) {
        appState.nutritionRecords[today] = { meals: [], water: [] };
    }
    
    appState.nutritionRecords[today].water.push({
        id: generateId(),
        timestamp: getCurrentTime()
    });
    
    saveData();
}

window.deleteWaterLog = function(logId) {
    const today = getTodayString();
    if (appState.nutritionRecords[today] && appState.nutritionRecords[today].water) {
        appState.nutritionRecords[today].water = appState.nutritionRecords[today].water.filter(w => w.id !== logId);
        saveData();
    }
}

// Income Tracker (Money View)
function setupIncome() {
    const incomeDisplay = document.getElementById('income-amount');
    const incomeInput = document.getElementById('income-input');
    const editBtn = document.getElementById('edit-income-btn');
    const saveBtn = document.getElementById('save-income-btn');
    const form = document.getElementById('income-edit-form');
    const displayContainer = document.querySelector('.income-display');

    if (!incomeDisplay) return; 
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
    const dateDisplay = document.getElementById('current-date');
    if (dateDisplay) {
        dateDisplay.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    
    const currStreakDisp = document.getElementById('current-streak');
    if (currStreakDisp) currStreakDisp.textContent = appState.streak.current;
    
    const bestStreakDisp = document.getElementById('best-streak');
    if (bestStreakDisp) bestStreakDisp.textContent = appState.streak.best;
    
    updateObjectivesUI();
    drawWeeklyChart();
    updateBalanceInsights();
    updateExerciseUI();
}

function init() {
    loadData();
    setupIncome();
    updateUI();
    
    // Bind new event listeners
    document.getElementById('open-manage-btn')?.addEventListener('click', openManageModal);
    document.getElementById('close-manage-btn')?.addEventListener('click', closeManageModal);
    document.getElementById('btn-add-activity')?.addEventListener('click', addNewActivity);
    
    document.getElementById('close-focus-btn')?.addEventListener('click', closeFocusMode);
    document.getElementById('btn-focus-start')?.addEventListener('click', startFocusTimer);
    document.getElementById('btn-focus-break')?.addEventListener('click', startBreak);
    document.getElementById('btn-focus-resume')?.addEventListener('click', resumeFocus);
    document.getElementById('btn-focus-stop')?.addEventListener('click', stopFocus);
    document.getElementById('btn-focus-stop-from-break')?.addEventListener('click', stopFocus);
    document.getElementById('btn-focus-set-goal')?.addEventListener('click', openGoalInput);
    document.getElementById('btn-focus-save-goal')?.addEventListener('click', saveGoal);
    document.getElementById('btn-focus-cancel-goal')?.addEventListener('click', cancelGoal);

    // Exercise Listeners
    document.getElementById('open-manage-exercise-btn')?.addEventListener('click', openManageExerciseModal);
    document.getElementById('close-manage-exercise-btn')?.addEventListener('click', closeManageExerciseModal);
    document.getElementById('btn-add-exercise')?.addEventListener('click', addNewExercise);
    document.getElementById('btn-log-exercise')?.addEventListener('click', logWorkout);

    // Nutrition Listeners
    document.getElementById('btn-log-meal')?.addEventListener('click', logMeal);
    document.getElementById('btn-log-water')?.addEventListener('click', logWater);
}

document.addEventListener('DOMContentLoaded', init);
