import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppState } from './hooks/useAppState';
import { useAuth } from './hooks/useAuth';
import { uploadData, downloadData, mergeStates, startPeriodicSync, stopPeriodicSync, subscribeToData } from './firebase/syncService';
import Sidebar from './components/Sidebar';
import ActivityView from './components/ActivityView';
import ExerciseView from './components/ExerciseView';
import MoneyView from './components/MoneyView';
import AnalyticsView from './components/AnalyticsView';
import ManageActivitiesView from './components/ManageActivitiesView';
import ManageExercisesView from './components/ManageExercisesView';
import SettingsView from './components/SettingsView';
import FloatingTimer from './components/FloatingTimer';
import LogTransactionModal from './components/LogTransactionModal';
import EditBudgetsModal from './components/EditBudgetsModal';
import EditIncomeSourcesModal from './components/EditIncomeSourcesModal';

// Sync status: 'idle' | 'syncing' | 'synced' | 'offline' | 'error'

function App() {
  const { appState, updateState } = useAppState();
  const { user, authLoading, signInWithGoogle, logout } = useAuth();
  const [activeView, setActiveView] = useState('view-activity');
  const [activeModal, setActiveModal] = useState(null);
  const [syncStatus, setSyncStatus] = useState('idle'); // cloud sync status

  const appStateRef = useRef(appState);
  useEffect(() => { appStateRef.current = appState; }, [appState]);

  const [activeFocusId, setActiveFocusId] = useState(() => {
      const saved = localStorage.getItem('streakForge_activeSession');
      if (saved) {
          try {
              const parsed = JSON.parse(saved);
              return parsed.activityId || null;
          } catch(e) {}
      }
      return null;
  });

  const isMergingRef = useRef(false);

  // ── Real-time Sync Listener ──────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      stopPeriodicSync();
      setSyncStatus('idle');
      return;
    }

    const unsubscribe = subscribeToData(user.uid, (cloudData) => {
      // If we are currently in the middle of a merge or upload, skip
      if (isMergingRef.current) return;

      console.log('[Sync] Remote change detected, merging...');
      const merged = mergeStates(appStateRef.current, cloudData);
      
      // Only update if something actually changed (shallow check)
      if (JSON.stringify(merged) !== JSON.stringify(appStateRef.current)) {
        isMergingRef.current = true;
        updateState(merged);
        setTimeout(() => { isMergingRef.current = false; }, 100);
      }
      setSyncStatus('synced');
    });

    // Start periodic sync every 5 min
    startPeriodicSync(user.uid, () => appStateRef.current);

    return () => {
      unsubscribe?.();
      stopPeriodicSync();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Manual upload helper ─────────────────────────────────────────────────
  const triggerSync = useCallback(async () => {
    if (!user) return;
    setSyncStatus('syncing');
    try {
      await uploadData(user.uid, appStateRef.current);
      setSyncStatus('synced');
    } catch {
      setSyncStatus('error');
    }
  }, [user]);

  // ── Auto-sync on state changes ──────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    
    const timeoutId = setTimeout(() => {
      // If we're currently merging remote data, don't upload immediately
      if (isMergingRef.current) return;

      uploadData(user.uid, appStateRef.current)
        .then(() => setSyncStatus('synced'))
        .catch(() => setSyncStatus('error'));
    }, 2000); // Reduce to 2s for better responsiveness

    return () => clearTimeout(timeoutId);
  }, [appState, user]);

  // ── Sync on page unload ──────────────────────────────────────────────────
  useEffect(() => {
    const handleUnload = () => {
      if (user) uploadData(user.uid, appStateRef.current);
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [user]);

  return (
    <div className="app-layout">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="app-main">
        {activeView === 'view-activity' && (
            <ActivityView 
                appState={appState} 
                updateState={updateState} 
                openFocus={(id) => { setActiveFocusId(id); }}
                openManage={() => setActiveView('view-manage-activities')}
                user={user}
                syncStatus={syncStatus}
                onSignIn={signInWithGoogle}
                onLogout={logout}
                onSyncNow={triggerSync}
            />
        )}
        
        {activeView === 'view-exercise' && (
            <ExerciseView 
                appState={appState} 
                updateState={updateState} 
                openManage={() => setActiveView('view-manage-exercises')}
            />
        )}

        {activeView === 'view-money' && (
            <MoneyView 
                appState={appState} 
                updateState={updateState} 
                openTransactionModal={() => setActiveModal('log-transaction')}
                openBudgetModal={() => setActiveModal('edit-budgets')}
                openIncomeModal={() => setActiveModal('edit-income')}
            />
        )}

        {activeView === 'view-analytics' && (
            <AnalyticsView 
                appState={appState} 
            />
        )}

        {activeView === 'view-manage-activities' && (
            <ManageActivitiesView 
                appState={appState} 
                updateState={updateState} 
            />
        )}

        {activeView === 'view-manage-exercises' && (
            <ManageExercisesView 
                appState={appState} 
                updateState={updateState} 
            />
        )}

        {activeView === 'view-settings' && (
            <SettingsView 
                appState={appState} 
                updateState={updateState}
                user={user}
                syncStatus={syncStatus}
                onSignIn={signInWithGoogle}
                onLogout={logout}
                onSyncNow={triggerSync}
            />
        )}
      </main>

      {/* Floating Timer (Global) */}
      {activeFocusId && (
          <FloatingTimer 
              appState={appState}
              updateState={updateState}
              activityId={activeFocusId}
              onClose={() => setActiveFocusId(null)}
              triggerSync={triggerSync}
          />
      )}

      {/* Modals */}
      {activeModal === 'log-transaction' && (
          <LogTransactionModal 
              appState={appState}
              updateState={updateState}
              onClose={() => setActiveModal(null)}
          />
      )}

      {activeModal === 'edit-budgets' && (
          <EditBudgetsModal 
              appState={appState}
              updateState={updateState}
              onClose={() => setActiveModal(null)}
          />
      )}
      
      {activeModal === 'edit-income' && (
          <EditIncomeSourcesModal 
              appState={appState}
              updateState={updateState}
              onClose={() => setActiveModal(null)}
          />
      )}
    </div>
  );
}

export default App;
