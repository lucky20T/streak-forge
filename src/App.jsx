import { useState, useEffect } from 'react';
import { useAppState } from './hooks/useAppState';
import Sidebar from './components/Sidebar';
import ActivityView from './components/ActivityView';
import ExerciseView from './components/ExerciseView';
import MoneyView from './components/MoneyView';
import FocusModal from './components/FocusModal';
import ManageActivitiesModal from './components/ManageActivitiesModal';
import ManageExercisesModal from './components/ManageExercisesModal';

function App() {
  const { appState, updateState } = useAppState();
  const [activeView, setActiveView] = useState('view-activity');
  const [activeModal, setActiveModal] = useState(null); // 'focus', 'manage-activities', 'manage-exercises'
  const [activeFocusId, setActiveFocusId] = useState(null);
  
  // Timer state for Focus Mode
  const [focusState, setFocusState] = useState({
      status: 'idle', // 'idle', 'running', 'break'
      time: 0,
      break: 0
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
                    setActiveModal('focus');
                }}
                openManage={() => setActiveModal('manage-activities')}
            />
        )}
        
        {activeView === 'view-exercise' && (
            <ExerciseView 
                appState={appState} 
                updateState={updateState} 
                openManage={() => setActiveModal('manage-exercises')}
            />
        )}

        {activeView === 'view-money' && (
            <MoneyView 
                appState={appState} 
                updateState={updateState} 
            />
        )}
      </main>

      {/* Modals */}
      {activeModal === 'focus' && (
          <FocusModal 
              appState={appState}
              updateState={updateState}
              activityId={activeFocusId}
              onClose={() => {
                  setActiveModal(null);
                  setActiveFocusId(null);
              }}
              focusState={focusState}
              setFocusState={setFocusState}
          />
      )}

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
    </div>
  );
}

export default App;
