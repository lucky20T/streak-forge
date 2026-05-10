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
 *   - For each date, merge individual activity logs (take max time/value)
 *   - For activities/exercises/money definitions, prefer cloud
 *   - Keep higher streak
 */
export function mergeStates(localState, cloudState) {
    if (!cloudState) return localState;

    const today = new Date().toISOString().slice(0, 10);

    // Helper to merge date-based maps (records, exerciseRecords, nutritionRecords)
    const mergeDateMaps = (localMap, cloudMap) => {
        const merged = { ...cloudMap };
        Object.keys(localMap || {}).forEach(date => {
            if (!merged[date]) {
                merged[date] = localMap[date];
            } else {
                // Merge the entries for this specific date
                const localDateData = localMap[date];
                const cloudDateData = merged[date];
                
                Object.keys(localDateData).forEach(id => {
                    if (!cloudDateData[id]) {
                        cloudDateData[id] = localDateData[id];
                    } else {
                        // Both have data for this ID on this date
                        // Compare and take the more "complete" one
                        const localVal = localDateData[id];
                        const cloudVal = cloudDateData[id];
                        
                        // For activity logs: take max time
                        if (typeof localVal.time === 'number') {
                            cloudDateData[id] = {
                                ...cloudVal,
                                time: Math.max(localVal.time || 0, cloudVal.time || 0),
                                break: Math.max(localVal.break || 0, cloudVal.break || 0),
                                // merge breaks array if they exist
                                breaks: Array.from(new Set([...(localVal.breaks || []), ...(cloudVal.breaks || [])]))
                            };
                        } else {
                            // For others (exercise/nutrition), just prefer local if it's today, else cloud
                            if (date === today) {
                                cloudDateData[id] = localVal;
                            }
                        }
                    }
                });
            }
        });
        return merged;
    };

    const mergedRecords = mergeDateMaps(localState.records, cloudState.records);
    const mergedExerciseRecords = mergeDateMaps(localState.exerciseRecords, cloudState.exerciseRecords);
    const mergedNutritionRecords = mergeDateMaps(localState.nutritionRecords, cloudState.nutritionRecords);

    // Choose streak with higher current value
    const streak = (localState.streak?.current || 0) >= (cloudState.streak?.current || 0)
        ? localState.streak
        : cloudState.streak;

    return {
        ...cloudState,           // base: cloud definitions
        records: mergedRecords,
        exerciseRecords: mergedExerciseRecords,
        nutritionRecords: mergedNutritionRecords,
        streak,
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
