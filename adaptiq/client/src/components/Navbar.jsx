import React from 'react';
import { Brain, Wifi, User, ChevronDown } from 'lucide-react';
import { useTutor } from '../context/TutorContext';

export default function Navbar() {
  const { studentProfile } = useTutor();

  return (
    <header className="navbar-container">
      <div className="navbar-brand">
        <div className="brand-logo-glow">
          <Brain className="brand-icon" size={24} />
        </div>
        <span className="brand-title">AdaptIQ</span>
        <span className="brand-divider"></span>
        <span className="brand-motto">Learn • Adapt • Grow</span>
      </div>

      <div className="navbar-actions">
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span className="status-text">Online</span>
        </div>

        <div className="user-profile-badge">
          <div className="avatar-circle">
            <User size={16} />
          </div>
          <span className="profile-name">{studentProfile.name.split(' ')[0]}</span>
          <ChevronDown size={14} className="profile-chevron" />
        </div>
      </div>
    </header>
  );
}
