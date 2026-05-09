import { useState, useEffect } from 'react';
import { useAppState } from './hooks/useAppState';
import Sidebar from './components/Sidebar';
import ActivityView from './components/ActivityView';
import ExerciseView from './components/ExerciseView';
import MoneyView from './components/MoneyView';
import ManageView from './components/ManageView';
import ManageActivitiesView from './components/ManageActivitiesView';
import ManageExercisesView from './components/ManageExercisesView';
import FloatingTimer from './components/FloatingTimer';
import ManageActivitiesModal from './components/ManageActivitiesModal';
import ManageExercisesModal from './components/ManageExercisesModal';
import LogTransactionModal from './components/LogTransactionModal';
import EditBudgetsModal from './components/EditBudgetsModal';
import EditIncomeSourcesModal from './components/EditIncomeSourcesModal';

function App() {
  const { appState, updateState } = useAppState();
  const [activeView, setActiveView] = useState('view-activity');
  const [activeModal, setActiveModal] = useState(null); // 'manage-activities', 'manage-exercises', 'log-transaction', 'edit-budgets', 'edit-income'
  
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

  return (
    <div className="app-layout">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="app-main">
        {activeView === 'view-activity' && (
            <ActivityView 
                appState={appState} 
                updateState={updateState} 
                openFocus={(id) => {
                    setActiveFocusId(id);
                }}
                openManage={() => setActiveView('view-manage-activities')}
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

        {activeView === 'view-manage' && (
            <ManageView 
                appState={appState} 
                openActivityModal={() => setActiveModal('manage-activities')}
                openExerciseModal={() => setActiveModal('manage-exercises')}
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
      </main>

      {/* Floating Timer (Global) */}
      {activeFocusId && (
          <FloatingTimer 
              appState={appState}
              updateState={updateState}
              activityId={activeFocusId}
              onClose={() => setActiveFocusId(null)}
          />
      )}

      {/* Modals */}
      {activeModal === 'manage-activities' && (
          <ManageActivitiesModal 
              appState={appState}
              updateState={updateState}
              onClose={() => setActiveModal(null)}
          />
      )}

      {activeModal === 'manage-exercises' && (
          <ManageExercisesModal 
              appState={appState}
              updateState={updateState}
              onClose={() => setActiveModal(null)}
          />
      )}

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
