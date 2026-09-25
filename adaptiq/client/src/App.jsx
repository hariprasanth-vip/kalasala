import React from 'react';
import { TutorProvider, useTutor } from './context/TutorContext';
import Navbar from './components/Navbar';
import SessionRoom from './pages/SessionRoom';
import Dashboard from './pages/Dashboard';
import './index.css';

function MainApp() {
  const { activeTab } = useTutor();

  return (
    <div className="app-container">
      <Navbar />
      <div className="app-body">
        {activeTab === 'home' ? <Dashboard /> : <SessionRoom />}
      </div>
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
