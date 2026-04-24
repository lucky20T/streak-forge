let HABITS = [
    "Study",
    "Game Dev",
    "Chess",
    "LeetCode",
    "Exercise"
];

// Configuration
const DAYS_TO_SHOW = 7;
const STORAGE_KEY = "streak_forge_data";
const HABITS_STORAGE_KEY = "streak_forge_habits";
const INCOME_STORAGE_KEY = "streak_forge_income";
const GOALS_STORAGE_KEY = "streak_forge_goals";

// Application State
let appData = {};
let dates = []; // Array of YYYY-MM-DD strings for the past 7 days
let shortGoals = [];
let longGoals = [];

// Initialize App
function init() {
    loadData();
    loadIncome();
    generateDates();
    renderTimetable();
    renderGoals();
    renderGrid();
    updateDashboard();
    drawGraph();
}

// ------ Data Management ------

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            appData = JSON.parse(saved);
        } catch (e) {
            appData = {};
        }
    }
    const savedHabits = localStorage.getItem(HABITS_STORAGE_KEY);
    if (savedHabits) {
        try {
            HABITS = JSON.parse(savedHabits);
        } catch(e) {}
    }
    
    const savedGoals = localStorage.getItem(GOALS_STORAGE_KEY);
    if (savedGoals) {
        try {
            const p = JSON.parse(savedGoals);
            if (p.short) shortGoals = p.short;
            if (p.long) longGoals = p.long;
        } catch(e) {}
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    updateDashboard();
    drawGraph();
}

// ------ Date Logic ------

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function generateDates() {
    dates = [];
    for (let i = DAYS_TO_SHOW - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(formatDate(d));
    }
}

function getFriendlyDateLabel(dateStr) {
    const today = formatDate(new Date());
    
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterday = formatDate(d);

    if (dateStr === today) return "Today";
    if (dateStr === yesterday) return "Yesterday";
    
    // Create Date object correctly handling timezones
    const parts = dateStr.split('-');
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    const options = { weekday: 'short' };
    return dateObj.toLocaleDateString('en-US', options);
}

// ------ UI Rendering ------

function getHabitStreak(habit) {
    let count = 0;
    let d = new Date();
    let isCheckingToday = true;
    while(true) {
        let dateStr = formatDate(d);
        let done = (appData[dateStr] && appData[dateStr][habit]);
        if (done) count++;
        else if (!isCheckingToday) break;
        isCheckingToday = false;
        d.setDate(d.getDate() - 1);
    }
    return count;
}

function renderGrid() {
    const grid = document.getElementById("habit-grid");
    grid.innerHTML = "";

    const emptyHeader = document.createElement("div");
    emptyHeader.className = "grid-header habit-label-header";
    emptyHeader.textContent = "Habits";
    grid.appendChild(emptyHeader);

    dates.forEach(dateStr => {
        const dateHeader = document.createElement("div");
        dateHeader.className = "grid-header";
        dateHeader.textContent = getFriendlyDateLabel(dateStr);
        grid.appendChild(dateHeader);
    });

    HABITS.forEach(habit => {
        const habitLabel = document.createElement("div");
        habitLabel.className = "habit-label";
        const nameText = document.createElement("span");
        nameText.className = "habit-name-text";
        nameText.textContent = habit;
        const streakText = document.createElement("span");
        streakText.className = "per-habit-streak";
        streakText.textContent = getHabitStreak(habit) + "🔥";
        habitLabel.append(nameText, streakText);
        grid.appendChild(habitLabel);

        dates.forEach(dateStr => {
            const cell = document.createElement("div");
            cell.className = "grid-cell toggle-cell";
            cell.dataset.date = dateStr;
            cell.dataset.habit = habit;
            
            const isCompleted = appData[dateStr] && appData[dateStr][habit];
            if (isCompleted) {
                cell.classList.add("completed");
                cell.textContent = "✅";
            } else {
                cell.textContent = "⬜";
            }

            const todayStr = formatDate(new Date());
            if (dateStr === todayStr) {
                cell.addEventListener("click", () => toggleHabit(dateStr, habit, cell));
            } else {
                cell.classList.add("disabled-cell");
                if (!isCompleted) cell.classList.add("missed-cell");
            }
            
            grid.appendChild(cell);
        });
    });
}

function toggleHabit(dateStr, habit, cellElement) {
    const todayStr = formatDate(new Date());
    if (dateStr !== todayStr) return;
    
    // Ensure date object exists
    if (!appData[dateStr]) {
        appData[dateStr] = {};
    }

    // Toggle boolean
    const currentState = appData[dateStr][habit] || false;
    appData[dateStr][habit] = !currentState;

    // Update UI
    if (appData[dateStr][habit]) {
        cellElement.classList.add("completed");
        cellElement.textContent = "✅";
    } else {
        cellElement.classList.remove("completed");
        cellElement.textContent = "⬜";
    }

    saveData();
}

// ------ Stats & Streak ------

function updateDashboard() {
    document.getElementById("header-active-habits").textContent = HABITS.length;
    const todayStr = formatDate(new Date());
    const percent = calculateDayPercentage(todayStr);
    document.getElementById("today-percent").textContent = `${percent}%`;

    const banner = document.getElementById("zero-day-banner");
    if (percent === 0) {
        banner.style.display = "block";
    } else {
        banner.style.display = "none";
    }

    let streakCount = 0;
    let d = new Date();
    let isCheckingToday = true;
    while (true) {
        let dateStr = formatDate(d);
        let dayPercent = calculateDayPercentage(dateStr);

        if (dayPercent === 100) { streakCount++; } 
        else if (!isCheckingToday) { break; }
        
        isCheckingToday = false;
        d.setDate(d.getDate() - 1);
    }
    document.getElementById("streak-counter").textContent = `🔥 Streak: ${streakCount} days`;

    // --- Insights Logic ---
    let skippedCounts = {};
    HABITS.forEach(h => skippedCounts[h] = 0);
    let dayScores = {}; let dayCounts = {};

    dates.forEach(dateStr => {
        let dObj = new Date(dateStr.split('-')[0], dateStr.split('-')[1]-1, dateStr.split('-')[2]);
        let dayOfWeek = dObj.getDay();
        if (!dayScores[dayOfWeek]) { dayScores[dayOfWeek] = 0; dayCounts[dayOfWeek] = 0; }
        dayCounts[dayOfWeek]++;
        dayScores[dayOfWeek] += calculateDayPercentage(dateStr);

        HABITS.forEach(h => {
             if (!appData[dateStr] || !appData[dateStr][h]) {
                 skippedCounts[h]++;
             }
        });
    });

    let bestDayIdx = -1; let bestAvg = -1;
    for (let i=0; i<7; i++) {
        if(dayCounts[i] > 0) {
            let avg = dayScores[i] / dayCounts[i];
            if (avg > bestAvg) { bestAvg = avg; bestDayIdx = i; }
        }
    }
    const daysArr = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    document.getElementById("insight-best-day").textContent = bestDayIdx > -1 ? daysArr[bestDayIdx] : "-";

    let mostSkipped = "-"; let maxSkips = -1;
    for (let h in skippedCounts) {
        if (skippedCounts[h] > maxSkips && skippedCounts[h] > 0) {
            maxSkips = skippedCounts[h]; mostSkipped = h;
        }
    }
    document.getElementById("insight-most-skipped").textContent = mostSkipped;

    let maxHist = 0;
    let allDates = Object.keys(appData).sort();
    if (allDates.length > 0) {
        let currentS = 0;
        let p = allDates[0].split('-');
        let checkD = new Date(p[0], p[1]-1, p[2]);
        let todayD = new Date();
        while(checkD <= todayD) {
            let dStr = formatDate(checkD);
            if (calculateDayPercentage(dStr) === 100) {
                currentS++; if(currentS > maxHist) maxHist = currentS;
            } else { currentS = 0; }
            checkD.setDate(checkD.getDate() + 1);
        }
    }
    maxHist = Math.max(maxHist, streakCount);
    document.getElementById("insight-longest").textContent = `${maxHist}`;
}

function calculateDayPercentage(dateStr) {
    if (!appData[dateStr] || HABITS.length === 0) return 0;
    
    let completedCount = 0;
    HABITS.forEach(habit => {
        if (appData[dateStr][habit]) {
            completedCount++;
        }
    });

    return Math.round((completedCount / HABITS.length) * 100);
}

// ------ Interactions ------

document.getElementById("reset-today-btn").addEventListener("click", () => {
    const todayStr = formatDate(new Date());
    if (appData[todayStr]) {
        delete appData[todayStr];
        saveData();
        renderGrid();
    }
});

// ------ Graph Drawing ------

function drawGraph() {
    const canvas = document.getElementById("progressChart");
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const padding = 20;
    const barWidth = (width - padding * 2) / DAYS_TO_SHOW - 10;
    const maxBarHeight = height - padding * 2;

    // Background line (x-axis)
    ctx.beginPath();
    ctx.moveTo(padding, height - padding + 5);
    ctx.lineTo(width - padding, height - padding + 5);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw bars
    dates.forEach((dateStr, index) => {
        const percent = calculateDayPercentage(dateStr);
        const barHeight = (percent / 100) * maxBarHeight;
        
        const x = padding + (index * ((width - padding * 2) / DAYS_TO_SHOW));
        const y = height - padding - barHeight;

        // Bar background (empty part)
        ctx.fillStyle = "#262626";
        ctx.fillRect(x, height - padding - maxBarHeight, barWidth, maxBarHeight - barHeight);

        // Bar fill (completed part)
        ctx.fillStyle = percent === 100 ? "#3fb950" : "#2ea043"; // Greener if 100%
        ctx.fillRect(x, y, barWidth, barHeight);

        // Simple labels for Days (e.g. "M", "T", "W")
        const dateObj = new Date(dateStr.split('-')[0], dateStr.split('-')[1] - 1, dateStr.split('-')[2]);
        const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'narrow' });
        
        ctx.fillStyle = "#888";
        ctx.font = "12px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(dayLabel, x + barWidth / 2, height - 5);
    });
}

// ------ Habit Management ------

function saveHabits() {
    localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(HABITS));
}

function renderTimetable() {
    const list = document.getElementById("timetable-list");
    list.innerHTML = "";
    HABITS.forEach((habit, idx) => {
        const li = document.createElement("li");
        li.textContent = habit;

        const actions = document.createElement("div");
        actions.className = "habit-actions";

        const upBtn = document.createElement("button");
        upBtn.textContent = "↑";
        upBtn.className = "icon-btn";
        upBtn.onclick = () => moveHabit(idx, -1);

        const downBtn = document.createElement("button");
        downBtn.textContent = "↓";
        downBtn.className = "icon-btn";
        downBtn.onclick = () => moveHabit(idx, 1);

        const editBtn = document.createElement("button");
        editBtn.textContent = "✎";
        editBtn.className = "icon-btn";
        editBtn.onclick = () => editHabit(habit);

        const delBtn = document.createElement("button");
        delBtn.textContent = "×";
        delBtn.className = "icon-btn delete-icon";
        delBtn.onclick = () => removeHabit(habit);

        actions.append(upBtn, downBtn, editBtn, delBtn);
        li.appendChild(actions);
        list.appendChild(li);
    });
}

function moveHabit(idx, dir) {
    if (idx + dir < 0 || idx + dir >= HABITS.length) return;
    const temp = HABITS[idx];
    HABITS[idx] = HABITS[idx + dir];
    HABITS[idx + dir] = temp;
    saveHabits();
    renderTimetable();
    renderGrid();
}

function editHabit(oldName) {
    const newName = prompt("Enter new habit name:", oldName);
    if (!newName || newName === oldName || HABITS.includes(newName)) return;
    
    const idx = HABITS.indexOf(oldName);
    HABITS[idx] = newName;
    saveHabits();

    // Migrate history
    for (let date in appData) {
        if (appData[date] && typeof appData[date][oldName] !== 'undefined') {
            appData[date][newName] = appData[date][oldName];
            delete appData[date][oldName];
        }
    }
    saveData();
    renderTimetable();
    renderGrid();
    updateDashboard();
}

function addHabit(name) {
    if (!name || HABITS.includes(name)) return;
    HABITS.push(name);
    saveHabits();
    renderTimetable();
    renderGrid();
    updateDashboard();
    drawGraph();
}

function removeHabit(name) {
    HABITS = HABITS.filter(h => h !== name);
    saveHabits();
    renderTimetable();
    renderGrid();
    updateDashboard();
    drawGraph();
}

function triggerAddHabit() {
    const input = document.getElementById("new-habit-input");
    const val = input.value.trim();
    if (val) {
        addHabit(val);
        input.value = "";
    }
}

document.getElementById("add-habit-btn").addEventListener("click", triggerAddHabit);
document.getElementById("new-habit-input").addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        triggerAddHabit();
    }
});

// ------ Data Sync ------

document.getElementById("export-btn").addEventListener("click", () => {
    const dataStr = JSON.stringify({ appData, HABITS });
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `streak_forge_backup_${formatDate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
});

const importInput = document.getElementById("import-file");
document.getElementById("import-btn").addEventListener("click", () => {
    importInput.click();
});
importInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const parsed = JSON.parse(e.target.result);
            if (parsed.appData) appData = parsed.appData;
            if (parsed.HABITS) HABITS = parsed.HABITS;
            saveData();
            saveHabits();
            init(); 
            alert("Data successfully imported!");
        } catch (err) {
            alert("Error reading file.");
        }
    };
    reader.readAsText(file);
});

// ------ Income Tracker ------
function loadIncome() {
    const saved = localStorage.getItem(INCOME_STORAGE_KEY);
    const display = document.getElementById("income-amount");
    if (saved) {
        display.textContent = `₹${parseInt(saved).toLocaleString('en-IN')}`;
    } else {
        display.textContent = "₹0";
    }
}

document.getElementById("edit-income-btn").addEventListener("click", () => {
    document.getElementById("income-edit-area").style.display = "flex";
    document.getElementById("income-input").value = localStorage.getItem(INCOME_STORAGE_KEY) || "";
});

document.getElementById("save-income-btn").addEventListener("click", () => {
    const val = document.getElementById("income-input").value;
    if (val) {
        localStorage.setItem(INCOME_STORAGE_KEY, val);
        loadIncome();
        document.getElementById("income-edit-area").style.display = "none";
    }
});

// ------ SPA Navigation ------

function switchView(viewId) {
    document.querySelectorAll('.app-view').forEach(v => v.style.display = 'none');
    document.getElementById(viewId).style.display = 'block';

    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    const navId = 'nav-' + viewId.replace('view-', '');
    const navEl = document.getElementById(navId);
    if(navEl) navEl.classList.add('active');
}

// ------ Goals Tracker ------

function saveGoals() {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify({ short: shortGoals, long: longGoals }));
}

function renderGoals() {
    const sLists = [document.getElementById("short-term-list"), document.getElementById("short-term-list-page")];
    sLists.forEach(list => {
        if(!list) return;
        list.innerHTML = "";
        shortGoals.forEach((g, idx) => {
            const li = document.createElement("li");
            li.textContent = g;
            const del = document.createElement("button");
            del.textContent = "×";
            del.className = "icon-btn delete-icon";
            del.onclick = () => { shortGoals.splice(idx, 1); saveGoals(); renderGoals(); };
            li.appendChild(del);
            list.appendChild(li);
        });
    });

    const lLists = [document.getElementById("long-term-list"), document.getElementById("long-term-list-page")];
    lLists.forEach(list => {
        if(!list) return;
        list.innerHTML = "";
        longGoals.forEach((g, idx) => {
            const li = document.createElement("li");
            li.textContent = g;
            const del = document.createElement("button");
            del.textContent = "×";
            del.className = "icon-btn delete-icon";
            del.onclick = () => { longGoals.splice(idx, 1); saveGoals(); renderGoals(); };
            li.appendChild(del);
            list.appendChild(li);
        });
    });
}

function commitShortGoal(val) {
    if (val) {
        shortGoals.push(val);
        saveGoals();
        renderGoals();
    }
}

function commitLongGoal(val) {
    if (val) {
        longGoals.push(val);
        saveGoals();
        renderGoals();
    }
}

// Attach to dashboard inputs
document.getElementById("add-short-goal-btn").addEventListener("click", () => {
    let inp = document.getElementById("short-goal-input"); commitShortGoal(inp.value.trim()); inp.value = "";
});
document.getElementById("short-goal-input").addEventListener("keyup", (e) => {
    if (e.key === "Enter") { commitShortGoal(e.target.value.trim()); e.target.value = ""; }
});

document.getElementById("add-long-goal-btn").addEventListener("click", () => {
    let inp = document.getElementById("long-goal-input"); commitLongGoal(inp.value.trim()); inp.value = "";
});
document.getElementById("long-goal-input").addEventListener("keyup", (e) => {
    if (e.key === "Enter") { commitLongGoal(e.target.value.trim()); e.target.value = ""; }
});

// Attach to specific page inputs
document.getElementById("add-short-goal-btn-page").addEventListener("click", () => {
    let inp = document.getElementById("short-goal-input-page"); commitShortGoal(inp.value.trim()); inp.value = "";
});
document.getElementById("short-goal-input-page").addEventListener("keyup", (e) => {
    if (e.key === "Enter") { commitShortGoal(e.target.value.trim()); e.target.value = ""; }
});

document.getElementById("add-long-goal-btn-page").addEventListener("click", () => {
    let inp = document.getElementById("long-goal-input-page"); commitLongGoal(inp.value.trim()); inp.value = "";
});
document.getElementById("long-goal-input-page").addEventListener("keyup", (e) => {
    if (e.key === "Enter") { commitLongGoal(e.target.value.trim()); e.target.value = ""; }
});

// Run app
init();
