import React, { useState } from 'react';
import {
  Settings,
  User,
  Brain,
  Globe,
  Trash2,
  RefreshCw,
  Download,
  Save,
  CheckCircle2,
  Shield,
  Layers,
  Sparkles,
  Users,
  Lock,
  Eye,
  EyeOff,
  Database
} from 'lucide-react';
import { useTutor } from '../context/TutorContext';
import { updateStudentProfileApi, resetStudentDnaApi } from '../services/api';

export default function SettingsView() {
  const {
    studentProfile,
    setStudentProfile,
    handleNewChat,
    setActiveTab
  } = useTutor();

  // Local form state
  const [formData, setFormData] = useState({
    name: studentProfile.name || 'Sharvesh',
    email: studentProfile.email || 'sharvesh@adaptiq.com',
    password: studentProfile.password || 'adaptiq123',
    studentIdNumber: studentProfile.studentIdNumber || 'ADAPTIQ-2026',
    gradeLevel: studentProfile.gradeLevel || 'Undergraduate Computer Science - Year 3',
    language: localStorage.getItem('adaptiq_tutor_lang') || 'tanglish',
    tone: localStorage.getItem('adaptiq_tutor_tone') || 'encouraging',
    activeRecall: true,
    diagrams: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [clearingChat, setClearingChat] = useState(false);
  const [resettingDna, setResettingDna] = useState(false);

  // Preset profiles for instant one-click switching
  const presetProfiles = [
    {
      name: 'Sharvesh',
      email: 'sharvesh@adaptiq.com',
      gradeLevel: 'Full Stack Engineering - Year 3',
      level: 5,
      studyTime: '18h'
    },
    {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@kalasala.edu',
      gradeLevel: 'Undergraduate CS - Year 2',
      level: 4,
      studyTime: '15h'
    },
    {
      name: 'Priya K',
      email: 'priya.k@adaptiq.com',
      gradeLevel: 'Data Structures & Algorithms Track',
      level: 3,
      studyTime: '8h'
    }
  ];

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const updated = {
        ...studentProfile,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        studentIdNumber: formData.studentIdNumber,
        gradeLevel: formData.gradeLevel
      };

      // Save to context
      setStudentProfile(updated);

      // Save to localStorage
      localStorage.setItem('adaptiq_student_profile', JSON.stringify(updated));
      localStorage.setItem('adaptiq_tutor_lang', formData.language);
      localStorage.setItem('adaptiq_tutor_tone', formData.tone);

      // Save to MongoDB backend
      await updateStudentProfileApi({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        studentIdNumber: formData.studentIdNumber,
        gradeLevel: formData.gradeLevel
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectPreset = async (preset) => {
    setFormData((prev) => ({
      ...prev,
      name: preset.name,
      email: preset.email,
      gradeLevel: preset.gradeLevel
    }));

    const updated = {
      ...studentProfile,
      name: preset.name,
      email: preset.email,
      gradeLevel: preset.gradeLevel,
      level: preset.level || studentProfile.level,
      studyTime: preset.studyTime || studentProfile.studyTime
    };

    setStudentProfile(updated);
    localStorage.setItem('adaptiq_student_profile', JSON.stringify(updated));

    await updateStudentProfileApi({
      name: preset.name,
      email: preset.email,
      gradeLevel: preset.gradeLevel
    }).catch(() => {});

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleClearChatSession = () => {
    if (window.confirm('Clear current active conversation and start a new clean learning session?')) {
      setClearingChat(true);
      handleNewChat();
      setTimeout(() => {
        setClearingChat(false);
        setActiveTab('chat');
      }, 500);
    }
  };

  const handleResetDna = async () => {
    if (window.confirm('Reset student DNA back to 20% neutral balance across all 5 strategies?')) {
      setResettingDna(true);
      await resetStudentDnaApi().catch(() => {});
      setTimeout(() => {
        setResettingDna(false);
        alert('Teaching DNA successfully reset to baseline.');
      }, 500);
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      student: studentProfile,
      exportedAt: new Date().toISOString(),
      platform: 'AdaptIQ Cognitive Pedagogy Engine',
      appVersion: '2.0.0'
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adaptiq-profile-${studentProfile.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="settings-page" style={{ flex: 1, height: '100%', overflowY: 'auto', padding: '28px 36px', background: 'radial-gradient(circle at 80% 10%, rgba(59, 130, 246, 0.08) 0%, transparent 60%)' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', fontSize: '0.8rem', fontWeight: 600, marginBottom: '10px' }}>
          <Settings size={14} />
          <span>System & Account Preferences</span>
        </div>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: '0 0 6px 0', background: 'linear-gradient(90deg, #ffffff 40%, #60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Preferences & Dynamic Profile
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
          Manage your personal learner identity, tutor dialogue language, cognitive telemetry, and session data.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '24px' }}>
        
        {/* Left Column: Profile Settings & AI Tutor Preferences */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Student Profile Card */}
          <div style={{ background: 'rgba(13, 22, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={20} color="#00f2fe" />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                  Learner Identity
                </h2>
              </div>
              {saveSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '0.82rem', fontWeight: 600 }}>
                  <CheckCircle2 size={14} />
                  <span>Saved to MongoDB!</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sharvesh"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. sharvesh@adaptiq.com"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>
                    Password / Secret Key (Saved in DB)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Security key"
                      style={{
                        width: '100%',
                        padding: '12px 38px 12px 14px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>
                    Student ID Number
                  </label>
                  <input
                    type="text"
                    value={formData.studentIdNumber}
                    onChange={(e) => setFormData({ ...formData, studentIdNumber: e.target.value })}
                    placeholder="ADAPTIQ-2026"
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 500 }}>
                  Current Academic Track / Discipline
                </label>
                <input
                  type="text"
                  value={formData.gradeLevel}
                  onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                  placeholder="e.g. Undergraduate Computer Science - Year 3"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #00f2fe 0%, #3b82f6 100%)',
                    border: 'none',
                    color: '#060b18',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0, 242, 254, 0.25)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Save size={16} />
                  <span>{saving ? 'Updating...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* AI Tutor Pedagogical Preferences */}
          <div style={{ background: 'rgba(13, 22, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Brain size={20} color="#a855f7" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                Tutor Dialogue Customization
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 500 }}>
                  Primary Language & Dialect
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    { id: 'tanglish', label: 'Tanglish (Tamil + English)' },
                    { id: 'english', label: 'English (Global)' },
                    { id: 'tamil', label: 'Tamil (தமிழ்)' }
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, language: l.id })}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '10px',
                        background: formData.language === l.id ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${formData.language === l.id ? '#00f2fe' : 'rgba(255, 255, 255, 0.08)'}`,
                        color: formData.language === l.id ? '#00f2fe' : '#94a3b8',
                        fontWeight: formData.language === l.id ? 700 : 500,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 500 }}>
                  Pedagogical Tone
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {[
                    { id: 'encouraging', label: 'Encouraging & Socratic' },
                    { id: 'rigorous', label: 'Rigorous & Academic' },
                    { id: 'code', label: 'Code & Sandboxed' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, tone: t.id })}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '10px',
                        background: formData.tone === t.id ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${formData.tone === t.id ? '#a855f7' : 'rgba(255, 255, 255, 0.08)'}`,
                        color: formData.tone === t.id ? '#a855f7' : '#94a3b8',
                        fontWeight: formData.tone === t.id ? 700 : 500,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Switch Student + Session Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Quick Switch Learner Account */}
          <div style={{ background: 'rgba(13, 22, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Users size={20} color="#10b981" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                Switch Student Profile
              </h2>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 16px 0' }}>
              Select a preset or enter your custom name above to immediately change the active learner.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {presetProfiles.map((p) => {
                const isCurrent = studentProfile.name.toLowerCase() === p.name.toLowerCase();
                return (
                  <div
                    key={p.name}
                    onClick={() => handleSelectPreset(p)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: isCurrent ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isCurrent ? 'rgba(0, 242, 254, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: isCurrent ? '#00f2fe' : '#fff', fontSize: '0.9rem' }}>
                        {p.name} {isCurrent && '✓'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.gradeLevel}</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.06)', color: '#cbd5e1' }}>
                      Level {p.level}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Session Management & Actions */}
          <div style={{ background: 'rgba(13, 22, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Shield size={20} color="#f59e0b" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                Session Controls
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Clear Chat */}
              <button
                type="button"
                onClick={handleClearChatSession}
                disabled={clearingChat}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#f87171',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Trash2 size={16} />
                <span>{clearingChat ? 'Clearing...' : 'Clear Current Chat Dialogue'}</span>
              </button>

              {/* Reset DNA */}
              <button
                type="button"
                onClick={handleResetDna}
                disabled={resettingDna}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  color: '#fbbf24',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <RefreshCw size={16} className={resettingDna ? 'spin-anim' : ''} />
                <span>{resettingDna ? 'Resetting...' : 'Reset Teaching DNA (20% Baseline)'}</span>
              </button>

              {/* Export Data */}
              <button
                type="button"
                onClick={handleExportData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(0, 242, 254, 0.1)',
                  border: '1px solid rgba(0, 242, 254, 0.25)',
                  color: '#00f2fe',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Download size={16} />
                <span>Export Learning Profile (JSON)</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
