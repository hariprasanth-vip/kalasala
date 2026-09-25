import React from 'react';
import Sidebar from '../components/Sidebar';
import LearningStage from '../components/LearningStage';
import PedagogyInspector from '../components/PedagogyInspector';
import ResponseInput from '../components/ResponseInput';

export default function SessionRoom() {
  return (
    <div className="session-room-cockpit">
      <div className="cockpit-grid">
        {/* Left Navigation Sidebar */}
        <Sidebar />

        {/* Center Main Stage + Bottom Input Bar */}
        <div className="center-stage-container">
          <div className="center-scrollable">
            <LearningStage />
          </div>
          <ResponseInput />
        </div>

        {/* Right Pedagogical Inspector Panel */}
        <PedagogyInspector />
      </div>
    </div>
  );
}
