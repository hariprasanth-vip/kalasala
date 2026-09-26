import React from 'react';
import { Home, MessageSquare, Clock, Dna, Settings, BarChart2, User, ChevronRight, LogOut, Plus } from 'lucide-react';
import { useTutor } from '../context/TutorContext';

export default function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    studentProfile,
    handleNewChat,
    setIsProfileModalOpen,
    setProfileModalMode
  } = useTutor();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'history', label: 'Learning History', icon: Clock },
    { id: 'dna', label: 'Teaching DNA', icon: Dna },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleOpenEditProfile = () => {
    setProfileModalMode('edit');
    setIsProfileModalOpen(true);
  };

  const handleOpenLogout = () => {
    setProfileModalMode('logout');
    setIsProfileModalOpen(true);
  };

  return (
    <aside className="sidebar-container">
      {/* Top Section: New Chat Action Button */}
      <div>
        <div style={{ padding: '0 0.5rem 0.75rem 0.5rem' }}>
          <button
            onClick={() => {
              setActiveTab('chat');
              if (handleNewChat) handleNewChat();
            }}
            className="new-chat-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.12), rgba(168, 85, 247, 0.12))',
              border: '1px solid rgba(0, 242, 254, 0.35)',
              color: '#00f2fe',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0, 242, 254, 0.1)'
            }}
          >
            <Plus size={16} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-button ${isActive ? 'active' : ''}`}
                id={`sidebar-nav-${item.id}`}
              >
                <Icon size={18} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Section: Profile, Stats & Log Out */}
      <div className="sidebar-footer">
        {/* Student Mini Card - Clickable to edit/switch */}
        <div
          className="student-profile-card"
          onClick={handleOpenEditProfile}
          title="Click to switch or edit learner profile"
          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
        >
          <div className="student-avatar-wrap">
            <User size={18} />
          </div>
          <div className="student-info" style={{ overflow: 'hidden' }}>
            <div className="student-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {studentProfile.name || 'Student'}
            </div>
            <div className="student-email" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {studentProfile.email || 'student@adaptiq.com'}
            </div>
          </div>
        </div>

        {/* Learning Profile Expandable Box */}
        <div
          className="learning-profile-box"
          onClick={() => setActiveTab('dna')}
          title="Click to view full Teaching DNA analytics"
          style={{ cursor: 'pointer' }}
        >
          <div className="learning-profile-header">
            <div className="header-left">
              <BarChart2 size={16} className="accent-teal" />
              <span>Learning Profile</span>
            </div>
            <ChevronRight size={14} className="chevron-icon" />
          </div>

          <div className="profile-stats-grid">
            <div className="stat-row">
              <span className="stat-title">Level</span>
              <span className="stat-value">{studentProfile.level || 4}</span>
            </div>
            <div className="stat-row">
              <span className="stat-title">Concepts Mastered</span>
              <span className="stat-value">{studentProfile.conceptsMastered || 12}</span>
            </div>
            <div className="stat-row">
              <span className="stat-title">Total Study Time</span>
              <span className="stat-value">{studentProfile.studyTime || '15h'}</span>
            </div>
          </div>
        </div>

        {/* Log Out Button */}
        <button
          className="logout-button"
          onClick={handleOpenLogout}
          id="btn-sidebar-logout"
          style={{ width: '100%' }}
        >
          <LogOut size={16} />
          <span>Switch / Log Out</span>
        </button>
      </div>
    </aside>
  );
}
