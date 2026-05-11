import { useState, useEffect } from 'react';

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

export const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const generateId = () => {
    return 'act_' + Math.random().toString(36).substr(2, 9);
};

export const getCurrentTime = () => {
    const now = new Date();
    let h = now.getHours();
    let m = now.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; 
    m = m < 10 ? '0'+m : m;
    return `${h}:${m} ${ampm}`;
};

export function useAppState() {
    const [appState, setAppState] = useState(() => {
        const stored = localStorage.getItem('streakForgeDataV3');
        const today = getTodayString();
        
        let initialData = {
            activities: [
                { id: "act_1", name: "Unreal Engine", type: "productive", subcategory: "Focus", description: "Daily practice in blueprints and C++ for game development.", dailyGoal: 14400, archived: false },
                { id: "act_2", name: "Japanese", type: "productive", subcategory: "Learning", description: "Kanji study and conversational practice via audio lessons.", dailyGoal: 7200, archived: false },
                { id: "act_3", name: "Chess", type: "entertainment", subcategory: "Gaming", description: "Puzzles and rapid games to improve tactical vision.", dailyGoal: 3600, archived: false }
            ],
            exercises: [...DEFAULT_EXERCISES],
            records: {}, 
            exerciseRecords: {},
            nutritionRecords: {},
            income: 0,
            streak: { current: 0, best: 0, lastStreakDate: null },
            money: {
                balance: 0,
                transactions: [],
                budgets: [
                    { category: 'Food & Dining', total: 600, spent: 0, color: 'var(--accent)' },
                    { category: 'Rent & Utilities', total: 2300, spent: 0, color: 'var(--danger)' },
                    { category: 'Transportation', total: 300, spent: 0, color: 'var(--accent)' },
                    { category: 'Entertainment', total: 200, spent: 0, color: 'var(--accent)' }
                ],
                incomeSources: [
                    { category: 'Salary', expected: 6000, collected: 0, color: 'var(--success)' },
                    { category: 'Freelance', expected: 1200, collected: 0, color: 'var(--success)' },
                    { category: 'Investments', expected: 600, collected: 0, color: 'var(--success)' },
                    { category: 'Side Project', expected: 400, collected: 0, color: 'var(--success)' }
                ]
            },
            skills: [
                { id: "skill_1", name: "Unreal Engine", activities: ["act_1"], createdAt: new Date().toISOString() },
                { id: "skill_2", name: "Japanese", activities: ["act_2"], createdAt: new Date().toISOString() },
                { id: "skill_3", name: "Chess", activities: ["act_3"], createdAt: new Date().toISOString() }
            ],
            goals: [
                { id: "goal_1", title: "Become Unreal Developer", description: "Reach advanced level in Unreal Engine", type: "long-term", targetHours: 300, skillId: "skill_1", completed: false, createdAt: new Date().toISOString() },
                { id: "goal_2", title: "Conversational Japanese", description: "Reach intermediate level in Japanese", type: "long-term", targetHours: 100, skillId: "skill_2", completed: false, createdAt: new Date().toISOString() },
                { id: "goal_3", title: "50h Japanese Practice", description: "Short term milestone for Japanese", type: "short-term", targetHours: 50, skillId: "skill_2", completed: false, createdAt: new Date().toISOString() }
            ]
        };

        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                initialData = { ...initialData, ...parsed };
                // Enforce categories on exercises for migrated data
                if (initialData.exercises && (!initialData.exercises[0] || !initialData.exercises[0].category)) {
                    initialData.exercises = [...DEFAULT_EXERCISES]; 
                }
                
                // Initialize skills and goals if missing
                if (!initialData.skills) initialData.skills = [];
                if (!initialData.goals) initialData.goals = [];

                // Migrate legacy activities
                if (initialData.activities) {
                    initialData.activities = initialData.activities.map(act => {
                        if (!act.subcategory) {
                            const isProd = act.type === 'productive';
                            const lowerName = act.name.toLowerCase();
                            
                            let subcat = isProd ? 'Focus' : 'Gaming';
                            if (lowerName.includes('japan') || lowerName.includes('learn')) subcat = 'Learning';
                            if (lowerName.includes('work')) subcat = 'Work';
                            if (lowerName.includes('movie') || lowerName.includes('anime')) subcat = 'Movies + Anime';

                            act.subcategory = subcat;
                            act.description = act.description || (isProd ? "Deep work session for focused output." : "Leisure activity to relax and unwind.");
                        }
                        if (typeof act.dailyGoal === 'undefined') {
                            act.dailyGoal = 0;
                        }
                        return act;
                    });
                }
            } catch(e) {
                console.error("Error parsing localStorage data:", e);
            }
        }

        // Initialize today's structure if missing
        if (!initialData.records[today]) initialData.records[today] = {};
        if (!initialData.exerciseRecords[today]) initialData.exerciseRecords[today] = [];
        if (!initialData.nutritionRecords[today]) initialData.nutritionRecords[today] = { meals: [], water: [] };
        
        initialData.activities.forEach(act => {
            if (!initialData.records[today][act.id]) {
                initialData.records[today][act.id] = { time: 0, break: 0, goal: act.dailyGoal || 0 };
            } else {
                // If it exists but has no goal (e.g. from a past session today before this update), update it
                if (typeof initialData.records[today][act.id].goal === 'undefined' || initialData.records[today][act.id].goal === 0) {
                    initialData.records[today][act.id].goal = act.dailyGoal || 0;
                }
            }
        });

        return initialData;
    });

    useEffect(() => {
        localStorage.setItem('streakForgeDataV3', JSON.stringify(appState));
    }, [appState]);

    const updateState = (updates) => {
        setAppState(prev => {
            const newState = { ...prev, ...updates };
            return newState;
        });
    };

    return { appState, updateState };
}
