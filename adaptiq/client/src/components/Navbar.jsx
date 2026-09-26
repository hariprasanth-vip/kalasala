import React from 'react';
import { Brain, User, ChevronDown } from 'lucide-react';
import { useTutor } from '../context/TutorContext';

export default function Navbar() {
  const {
    studentProfile,
    setActiveTab,
    setIsProfileModalOpen,
    setProfileModalMode
  } = useTutor();

  const handleOpenProfile = () => {
    setProfileModalMode('edit');
    setIsProfileModalOpen(true);
  };

  const displayName = studentProfile.name ? studentProfile.name.split(' ')[0] : 'Learner';

  return (
    <header className="navbar-container">
      <div
        className="navbar-brand"
        onClick={() => setActiveTab('home')}
        style={{ cursor: 'pointer' }}
        title="Go to Dashboard"
      >
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

        <div
          className="user-profile-badge"
          onClick={handleOpenProfile}
          title="Click to edit or switch student profile"
          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
          id="navbar-user-badge"
        >
          <div className="avatar-circle">
            <User size={16} />
          </div>
          <span className="profile-name">{displayName}</span>
          <ChevronDown size={14} className="profile-chevron" />
        </div>
      </div>
    </header>
  );
}
