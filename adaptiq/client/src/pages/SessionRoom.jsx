import React from 'react';
import LearningStage from '../components/LearningStage';
import PedagogyInspector from '../components/PedagogyInspector';
import ResponseInput from '../components/ResponseInput';

export default function SessionRoom() {
  return (
    <div className="session-room-cockpit">
      <div className="cockpit-grid">
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
