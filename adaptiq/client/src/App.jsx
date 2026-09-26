import React from 'react';
import { TutorProvider, useTutor } from './context/TutorContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SessionRoom from './pages/SessionRoom';
import Dashboard from './pages/Dashboard';
import LearningHistory from './pages/LearningHistory';
import TeachingDnaView from './pages/TeachingDnaView';
import SettingsView from './pages/SettingsView';
import ProfileModal from './components/ProfileModal';
import AssessmentModal from './components/AssessmentModal';
import './index.css';

function MainApp() {
  const { activeTab, isAssessmentOpen, setIsAssessmentOpen, assessmentTopic } = useTutor();

  return (
    <div className="app-container">
      <Navbar />
      <div className="app-body">
        {/* Left Navigation Sidebar - always present across all tabs */}
        <Sidebar />

        {/* Dynamic Center/Right Viewport */}
        <main
          className="app-main-viewport"
          style={{
            flex: 1,
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            position: 'relative'
          }}
        >
          {activeTab === 'home' && <Dashboard />}
          {activeTab === 'chat' && <SessionRoom />}
          {activeTab === 'history' && <LearningHistory />}
          {activeTab === 'dna' && <TeachingDnaView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Profile / Switch User Modal */}
      <ProfileModal />

      {/* Global 5-Question Real-Time Ollama Assessment Modal */}
      <AssessmentModal
        isOpen={isAssessmentOpen}
        onClose={() => setIsAssessmentOpen(false)}
        topic={assessmentTopic}
      />
    </div>
  );
}

export default function App() {
  return (
    <TutorProvider>
      <MainApp />
    </TutorProvider>
  );
}
