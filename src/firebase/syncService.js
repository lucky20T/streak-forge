import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

const SYNC_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
let lastSyncTime = 0;
let syncTimer = null;
let unsubscribeListener = null;

/**
 * Upload the full appState to Firestore under users/{userId}/data/main
 */
export async function uploadData(userId, appState) {
    if (!userId || !appState) return;

    const now = Date.now();
    // Throttle to avoid hitting Firestore limits too hard, but keep it responsive
    if (now - lastSyncTime < 5000) return; 

    try {
        const ref = doc(db, 'users', userId, 'data', 'main');
        await setDoc(ref, {
            ...appState,
            _syncedAt: now,
            _deviceId: window.crypto.randomUUID() // Tag the device that made the change
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
 */
export async function downloadData(userId) {
    if (!userId) return null;
    try {
        const ref = doc(db, 'users', userId, 'data', 'main');
        const snap = await getDoc(ref);
        if (snap.exists()) {
            const data = snap.data();
            delete data._syncedAt;
            delete data._deviceId;
            return data;
        }
        return null;
    } catch (err) {
        console.error('[Sync] Download failed:', err);
        return null;
    }
}

/**
 * Subscribe to real-time updates from Firestore.
 */
export function subscribeToData(userId, onUpdate) {
    if (!userId) return null;
    
    if (unsubscribeListener) {
        unsubscribeListener();
    }

    const ref = doc(db, 'users', userId, 'data', 'main');
    unsubscribeListener = onSnapshot(ref, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            // Don't trigger update if the change was local (optional optimization)
            onUpdate(data);
        }
    }, (err) => {
        console.error('[Sync] Listener failed:', err);
    });

    return unsubscribeListener;
}

/**
 * Merge cloud data with local data on login.
 */
export function mergeStates(localState, cloudState) {
    if (!cloudState) return localState;

    const today = new Date().toISOString().slice(0, 10);

    const mergeDateMaps = (localMap, cloudMap) => {
        const merged = { ...cloudMap };
        Object.keys(localMap || {}).forEach(date => {
            if (!merged[date]) {
                merged[date] = localMap[date];
            } else {
                const localDateData = localMap[date];
                const cloudDateData = merged[date];
                
                Object.keys(localDateData).forEach(id => {
                    if (!cloudDateData[id]) {
                        cloudDateData[id] = localDateData[id];
                    } else {
                        const localVal = localDateData[id];
                        const cloudVal = cloudDateData[id];
                        // For activity logs: take max time
                        if (typeof localVal.time === 'number') {
                            cloudDateData[id] = {
                                ...cloudVal,
                                time: Math.max(localVal.time || 0, cloudVal.time || 0),
                                break: Math.max(localVal.break || 0, cloudVal.break || 0),
                                breaks: Array.from(new Set([...(localVal.breaks || []), ...(cloudVal.breaks || [])]))
                            };
                        } else if (Array.isArray(localVal)) {
                            // For exercises (arrays of sets): union by index or just prefer the one with more entries
                            if (localVal.length >= cloudVal.length) {
                                cloudDateData[id] = localVal;
                            }
                        } else if (typeof localVal === 'object' && localVal !== null) {
                            // For nutrition (meals/water objects): merge properties
                            cloudDateData[id] = {
                                ...cloudVal,
                                ...localVal,
                                // Special case for meals and water arrays
                                meals: Array.from(new Set([...(cloudVal.meals || []), ...(localVal.meals || [])])),
                                water: Array.from(new Set([...(cloudVal.water || []), ...(localVal.water || [])]))
                            };
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

    const streak = (localState.streak?.current || 0) >= (cloudState.streak?.current || 0)
        ? localState.streak
        : cloudState.streak;

    return {
        ...cloudState, 
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

    const txMap = {};
    [...(cloud.transactions || []), ...(local.transactions || [])].forEach(tx => {
        txMap[tx.id] = tx;
    });

    return {
        ...cloud,
        transactions: Object.values(txMap),
    };
}

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
    if (unsubscribeListener) {
        unsubscribeListener();
        unsubscribeListener = null;
    }
}

