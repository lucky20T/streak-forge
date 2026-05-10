import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const SYNC_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
let lastSyncTime = 0;
let syncTimer = null;

/**
 * Upload the full appState to Firestore under users/{userId}/data/main
 * Throttled so it never writes more often than SYNC_COOLDOWN_MS.
 */
export async function uploadData(userId, appState) {
    if (!userId || !appState) return;

    const now = Date.now();
    if (now - lastSyncTime < 10_000) return; // hard stop: no write within 10s of last

    try {
        const ref = doc(db, 'users', userId, 'data', 'main');
        await setDoc(ref, {
            ...appState,
            _syncedAt: now,
        });
        lastSyncTime = now;
        console.log('[Sync] Uploaded to Firestore at', new Date(now).toLocaleTimeString());
    } catch (err) {
        console.error('[Sync] Upload failed:', err);
        throw err;
    }
}

/**
 * Download the user's saved state from Firestore.
 * Returns null if no data found.
 */
export async function downloadData(userId) {
    if (!userId) return null;
    try {
        const ref = doc(db, 'users', userId, 'data', 'main');
        const snap = await getDoc(ref);
        if (snap.exists()) {
            const data = snap.data();
            delete data._syncedAt;
            return data;
        }
        return null;
    } catch (err) {
        console.error('[Sync] Download failed:', err);
        return null;
    }
}

/**
 * Merge cloud data with local data on login.
 * Strategy:
 *   - Merge records by date (union of both, prefer local for today)
 *   - For activities, prefer cloud (multi-device source of truth)
 *   - Keep local streak if cloud streak is older
 */
export function mergeStates(localState, cloudState) {
    if (!cloudState) return localState;

    const today = new Date().toISOString().slice(0, 10);

    // Merge records: union of all dates, prefer local for today
    const mergedRecords = { ...cloudState.records };
    Object.keys(localState.records || {}).forEach(date => {
        if (date === today) {
            // Always keep local for today (active session)
            mergedRecords[date] = localState.records[date];
        } else if (!mergedRecords[date]) {
            mergedRecords[date] = localState.records[date];
        }
    });

    // Merge exercise records
    const mergedExerciseRecords = { ...cloudState.exerciseRecords };
    Object.keys(localState.exerciseRecords || {}).forEach(date => {
        if (!mergedExerciseRecords[date]) {
            mergedExerciseRecords[date] = localState.exerciseRecords[date];
        }
    });

    // Merge nutrition records
    const mergedNutritionRecords = { ...cloudState.nutritionRecords };
    Object.keys(localState.nutritionRecords || {}).forEach(date => {
        if (!mergedNutritionRecords[date]) {
            mergedNutritionRecords[date] = localState.nutritionRecords[date];
        }
    });

    // Choose streak with higher current value
    const streak = (localState.streak?.current || 0) >= (cloudState.streak?.current || 0)
        ? localState.streak
        : cloudState.streak;

    return {
        ...cloudState,           // base: cloud (activities, exercises list, money config)
        records: mergedRecords,
        exerciseRecords: mergedExerciseRecords,
        nutritionRecords: mergedNutritionRecords,
        streak,
        // always keep local money transactions merged
        money: mergeMoney(localState.money, cloudState.money),
    };
}

function mergeMoney(local, cloud) {
    if (!cloud) return local;
    if (!local) return cloud;

    // Merge transactions by id to avoid duplicates
    const txMap = {};
    [...(cloud.transactions || []), ...(local.transactions || [])].forEach(tx => {
        txMap[tx.id] = tx;
    });

    return {
        ...cloud,
        transactions: Object.values(txMap),
    };
}

/**
 * Start a periodic sync every 5 minutes.
 * Returns a cleanup function.
 */
export function startPeriodicSync(userId, getState) {
    stopPeriodicSync();
    syncTimer = setInterval(async () => {
        const state = getState();
        if (state) await uploadData(userId, state);
    }, SYNC_COOLDOWN_MS);

    return stopPeriodicSync;
}

export function stopPeriodicSync() {
    if (syncTimer) {
        clearInterval(syncTimer);
        syncTimer = null;
    }
}
