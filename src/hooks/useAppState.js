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
                { id: "act_1", name: "Unreal Engine", type: "productive", archived: false },
                { id: "act_2", name: "Japanese", type: "productive", archived: false },
                { id: "act_3", name: "Chess", type: "productive", archived: false }
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
            }
        };

        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                initialData = { ...initialData, ...parsed };
                // Enforce categories on exercises for migrated data
                if (initialData.exercises && (!initialData.exercises[0] || !initialData.exercises[0].category)) {
                    initialData.exercises = [...DEFAULT_EXERCISES]; 
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
                initialData.records[today][act.id] = { time: 0, break: 0, goal: 0 };
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
