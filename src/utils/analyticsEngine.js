export function getDateRange(filter) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let startDate = new Date(today);
    let endDate = new Date(today);

    if (filter === 'Week') {
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        startDate = new Date(today.setDate(diff));
    } else if (filter === 'Month') {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (filter === 'Year') {
        startDate = new Date(today.getFullYear(), 0, 1);
    } else if (filter === 'All Time') {
        startDate = new Date(2000, 0, 1);
    }

    return { startDate, endDate };
}

export function getDatesInRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        dates.push(`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
}

export function aggregateActivityData(appState, filter) {
    const { startDate, endDate } = getDateRange(filter);
    const dateRange = getDatesInRange(startDate, endDate);

    let totalFocus = 0;
    let totalEntertainment = 0;
    let totalBreaks = 0;
    let breakCount = 0;
    let longestSession = 0;

    const activityTotals = {};

    dateRange.forEach(date => {
        if (appState.records[date]) {
            Object.entries(appState.records[date]).forEach(([actId, data]) => {
                const act = appState.activities.find(a => a.id === actId);
                if (act) {
                    if (act.type === 'productive') totalFocus += data.time || 0;
                    if (act.type === 'entertainment') totalEntertainment += data.time || 0;

                    activityTotals[act.name] = (activityTotals[act.name] || 0) + (data.time || 0);

                    if ((data.time || 0) > longestSession) longestSession = data.time;

                    if (data.breaks) {
                        data.breaks.forEach(b => {
                            totalBreaks += b;
                            breakCount++;
                        });
                    }
                }
            });
        }
    });

    let mostFocused = '-';
    let leastFocused = '-';
    let maxTime = -1;
    let minTime = Infinity;

    Object.entries(activityTotals).forEach(([name, time]) => {
        if (time > maxTime) { maxTime = time; mostFocused = name; }
        if (time > 0 && time < minTime) { minTime = time; leastFocused = name; }
    });

    const averageBreak = breakCount > 0 ? totalBreaks / breakCount : 0;
    const dailyAverage = dateRange.length > 0 ? totalFocus / dateRange.length : 0;

    return {
        totalFocus,
        totalEntertainment,
        mostFocused,
        leastFocused,
        dailyAverage,
        longestSession,
        totalBreaks,
        averageBreak,
        breakCount,
        activityTotals
    };
}

export function aggregateExerciseData(appState, filter) {
    const { startDate, endDate } = getDateRange(filter);
    const dateRange = getDatesInRange(startDate, endDate);

    let totalWorkouts = 0;
    let totalReps = 0;
    let totalSets = 0;
    const exerciseTotals = {};
    const categoryTotals = {};

    dateRange.forEach(date => {
        if (appState.exerciseRecords[date] && appState.exerciseRecords[date].length > 0) {
            totalWorkouts++;
            appState.exerciseRecords[date].forEach(log => {
                totalSets += log.sets;
                totalReps += (log.sets * log.reps);

                const ex = appState.exercises.find(e => e.id === log.exerciseId);
                if (ex) {
                    exerciseTotals[ex.name] = (exerciseTotals[ex.name] || 0) + log.sets;
                    categoryTotals[ex.category] = (categoryTotals[ex.category] || 0) + log.sets;
                }
            });
        }
    });

    let mostTrained = '-';
    let maxSets = -1;
    Object.entries(exerciseTotals).forEach(([name, sets]) => {
        if (sets > maxSets) { maxSets = sets; mostTrained = name; }
    });

    return {
        totalWorkouts,
        totalReps,
        totalSets,
        mostTrained,
        categoryTotals
    };
}

export function aggregateNutritionData(appState, filter) {
    const { startDate, endDate } = getDateRange(filter);
    const dateRange = getDatesInRange(startDate, endDate);

    let totalMeals = 0;
    let healthyCount = 0;
    let junkCount = 0;
    let highProteinCount = 0;
    let totalWater = 0;

    const HEALTHY_CATEGORIES = ["High Protein", "Balanced Meal", "Healthy Homemade", "Healthy Outside Food"];
    const JUNK_CATEGORIES = ["Junk Food", "Sugary", "Fried Food", "Fast Food", "Cheat Meal"];

    dateRange.forEach(date => {
        if (appState.nutritionRecords[date]) {
            const meals = appState.nutritionRecords[date].meals || [];
            totalMeals += meals.length;

            meals.forEach(meal => {
                if (HEALTHY_CATEGORIES.includes(meal.category)) healthyCount++;
                if (JUNK_CATEGORIES.includes(meal.category)) junkCount++;
                if (meal.category === "High Protein") highProteinCount++;
            });

            totalWater += (appState.nutritionRecords[date].water || []).length;
        }
    });

    const mealsPerDay = dateRange.length > 0 ? totalMeals / dateRange.length : 0;

    return {
        totalMeals,
        mealsPerDay,
        healthyCount,
        junkCount,
        highProteinCount,
        totalWater
    };
}

export function generateSmartInsights(actData, exData, nutData, filter) {
    const insights = [];

    if (actData.totalFocus > actData.totalEntertainment * 1.5) {
        insights.push(`You maintained strong productivity this ${filter.toLowerCase()}, with focus time significantly exceeding entertainment.`);
    } else if (actData.totalEntertainment > actData.totalFocus) {
        insights.push(`Entertainment time exceeded focus time this ${filter.toLowerCase()}. Try scheduling more dedicated work blocks.`);
    }

    if (actData.averageBreak > 900) {
        insights.push("Your average break duration is getting long (>15 mins). Consider shortening breaks to maintain momentum.");
    }

    if (exData.totalWorkouts > 3 && filter === 'Week') {
        insights.push("Great exercise consistency! You worked out more than 3 times this week.");
    }

    if (nutData.healthyCount > nutData.junkCount * 2) {
        insights.push("Excellent nutrition balance. You are eating primarily healthy meals.");
    } else if (nutData.junkCount > nutData.healthyCount) {
        insights.push("Your junk food intake is high. Consider substituting with balanced meals.");
    }

    if (insights.length === 0) {
        insights.push("Keep tracking your data to generate more personalized insights.");
    }

    return insights;
}

export function aggregateFinanceData(appState, filter) {
    // Finances don't strictly use daily dates like activities, transactions have their own date
    // We'll filter transactions that fall between startDate and endDate
    const { startDate, endDate } = getDateRange(filter);
    
    let totalIncome = 0;
    let totalExpenses = 0;
    const expenseCategories = {};
    const incomeSources = {};

    const transactions = appState.money?.transactions || [];

    transactions.forEach(t => {
        const tDate = new Date(t.date);
        tDate.setHours(0,0,0,0);
        
        if (tDate >= startDate && tDate <= endDate) {
            if (t.type === 'income') {
                totalIncome += t.amount;
                incomeSources[t.category] = (incomeSources[t.category] || 0) + t.amount;
            } else {
                totalExpenses += t.amount;
                expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amount;
            }
        }
    });

    const remaining = totalIncome - totalExpenses;
    const spentPercent = totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0;

    return {
        totalIncome,
        totalExpenses,
        remaining,
        spentPercent,
        expenseCategories,
        incomeSources
    };
}
