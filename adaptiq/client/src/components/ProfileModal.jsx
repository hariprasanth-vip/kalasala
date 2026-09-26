import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Check,
  LogOut,
  Database,
  KeyRound,
  ShieldCheck,
  UserPlus,
  LogIn
} from 'lucide-react';
import { useTutor } from '../context/TutorContext';

export default function ProfileModal() {
  const {
    studentProfile,
    saveStudentCredentials,
    loginStudent,
    registerStudent,
    isProfileModalOpen,
    setIsProfileModalOpen,
    profileModalMode,
    setProfileModalMode,
    handleNewChat
  } = useTutor();

  // Tab mode within the modal: 'edit' | 'login' | 'register'
  const [activeTabMode, setActiveTabMode] = useState('edit');

  // Form states
  const [name, setName] = useState(studentProfile.name || 'Sharvesh');
  const [email, setEmail] = useState(studentProfile.email || 'sharvesh@adaptiq.com');
  const [password, setPassword] = useState(studentProfile.password || 'adaptiq123');
  const [studentIdNumber, setStudentIdNumber] = useState(studentProfile.studentIdNumber || 'ADAPTIQ-2026');
  const [gradeLevel, setGradeLevel] = useState(studentProfile.gradeLevel || 'Undergraduate Computer Science - Year 3');

  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isProfileModalOpen) return null;

  // Handle saving credentials directly into MongoDB
  const handleSaveCredentials = async (e) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) {
      setStatusMessage({ type: 'error', text: 'Name and Email are required!' });
      return;
    }

    setIsProcessing(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const res = await saveStudentCredentials({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        studentIdNumber: studentIdNumber.trim(),
        gradeLevel: gradeLevel.trim()
      });

      if (res && res.success) {
        setStatusMessage({
          type: 'success',
          text: '✅ Credentials saved to MongoDB (Collection: students)!'
        });
        setTimeout(() => {
          setIsProfileModalOpen(false);
          setStatusMessage({ type: '', text: '' });
        }, 1400);
      } else {
        setStatusMessage({ type: 'error', text: res?.message || 'Failed to save to database.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Database connection error.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Login with Credentials from MongoDB
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatusMessage({ type: 'error', text: 'Email is required!' });
      return;
    }

    setIsProcessing(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const res = await loginStudent(email.trim(), password.trim());
      if (res && res.success) {
        setStatusMessage({
          type: 'success',
          text: `✅ Welcome back, ${res.student.name}! Authenticated with MongoDB.`
        });
        setTimeout(() => {
          setIsProfileModalOpen(false);
          setStatusMessage({ type: '', text: '' });
        }, 1200);
      } else {
        setStatusMessage({ type: 'error', text: res?.message || 'Login failed. Check credentials.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Database login error.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Registering a brand new learner in MongoDB
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setStatusMessage({ type: 'error', text: 'Name and Email are required!' });
      return;
    }

    setIsProcessing(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const res = await registerStudent({
        name: name.trim(),
        email: email.trim(),
        password: password.trim() || 'adaptiq123',
        gradeLevel: gradeLevel.trim() || 'Undergraduate Computer Science',
        studentIdNumber: 'ADAPTIQ-' + Math.floor(1000 + Math.random() * 9000)
      });

      if (res && res.success) {
        setStatusMessage({
          type: 'success',
          text: '🎉 Student created in MongoDB with initial Teaching DNA!'
        });
        setTimeout(() => {
          setIsProfileModalOpen(false);
          setStatusMessage({ type: '', text: '' });
        }, 1400);
      } else {
        setStatusMessage({ type: 'error', text: res?.message || 'Registration failed.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Database registration error.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmLogout = () => {
    const guestStudent = {
      name: 'Guest Learner',
      email: 'learner@adaptiq.com',
      password: '',
      level: 1,
      gradeLevel: 'General Engineering',
      conceptsMastered: 0,
      studyTime: '0h'
    };
    saveStudentCredentials(guestStudent);
    handleNewChat();
    setIsProfileModalOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(4, 8, 19, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsProfileModalOpen(false);
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'linear-gradient(145deg, #0e1a38 0%, #070d1e 100%)',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 242, 254, 0.15)',
          padding: '28px',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsProfileModalOpen(false)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={20} />
        </button>

        {profileModalMode === 'logout' ? (
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', marginBottom: '16px' }}>
              <LogOut size={24} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>
              Log Out or Switch Learner?
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              Currently logged in as <strong style={{ color: '#00f2fe' }}>{studentProfile.name}</strong> ({studentProfile.email}). All interactions and Teaching DNA adaptations are securely saved in MongoDB.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => setProfileModalMode('edit')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #00f2fe 0%, #3b82f6 100%)',
                  border: 'none',
                  color: '#060b18',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <KeyRound size={16} />
                <span>Switch / Edit Credentials in DB</span>
              </button>

              <button
                onClick={handleConfirmLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={16} />
                <span>Log Out to Guest Session</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #00f2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Database size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    Learner Profile & Credentials
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#10b981', marginTop: '2px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                    <span>MongoDB Database Connected</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '18px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '12px' }}>
              <button
                type="button"
                onClick={() => { setActiveTabMode('edit'); setStatusMessage({ type: '', text: '' }); }}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: activeTabMode === 'edit' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
                  border: `1px solid ${activeTabMode === 'edit' ? '#00f2fe' : 'transparent'}`,
                  color: activeTabMode === 'edit' ? '#00f2fe' : '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Edit in DB
              </button>
              <button
                type="button"
                onClick={() => { setActiveTabMode('login'); setStatusMessage({ type: '', text: '' }); }}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: activeTabMode === 'login' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
                  border: `1px solid ${activeTabMode === 'login' ? '#00f2fe' : 'transparent'}`,
                  color: activeTabMode === 'login' ? '#00f2fe' : '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTabMode('register'); setStatusMessage({ type: '', text: '' }); }}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: activeTabMode === 'register' ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
                  border: `1px solid ${activeTabMode === 'register' ? '#00f2fe' : 'transparent'}`,
                  color: activeTabMode === 'register' ? '#00f2fe' : '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                + New Student
              </button>
            </div>

            {/* Status notification banner */}
            {statusMessage.text && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  fontSize: '0.84rem',
                  fontWeight: 500,
                  background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                  color: statusMessage.type === 'success' ? '#34d399' : '#f87171'
                }}
              >
                {statusMessage.text}
              </div>
            )}

            {/* 1. EDIT PROFILE & CREDENTIALS FORM */}
            {activeTabMode === 'edit' && (
              <form onSubmit={handleSaveCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                    <User size={13} />
                    <span>Student Full Name</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sharvesh"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                    <Mail size={13} />
                    <span>Email Address (Database Key)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sharvesh@adaptiq.com"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                      <Lock size={13} />
                      <span>Password / Credentials</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Secret key"
                        style={{
                          width: '100%',
                          padding: '10px 36px 10px 12px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
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
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer'
                        }}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                      <ShieldCheck size={13} />
                      <span>Student ID / Roll No</span>
                    </label>
                    <input
                      type="text"
                      value={studentIdNumber}
                      onChange={(e) => setStudentIdNumber(e.target.value)}
                      placeholder="ADAPTIQ-2026"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                    <GraduationCap size={13} />
                    <span>Academic Discipline / Track</span>
                  </label>
                  <input
                    type="text"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    placeholder="e.g. Undergraduate Computer Science - Year 3"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#cbd5e1',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    style={{
                      flex: 1.8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #00f2fe 0%, #3b82f6 100%)',
                      border: 'none',
                      color: '#060b18',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(0, 242, 254, 0.25)'
                    }}
                  >
                    <Database size={16} />
                    <span>{isProcessing ? 'Writing to DB...' : 'Save Credentials to DB'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* 2. SIGN IN WITH EXISTING CREDENTIALS */}
            {activeTabMode === 'login' && (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                    <Mail size={13} />
                    <span>Registered Student Email</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sharvesh@adaptiq.com"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                    <Lock size={13} />
                    <span>Password / Secret Key</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      style={{
                        width: '100%',
                        padding: '10px 36px 10px 12px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
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
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #00f2fe 0%, #3b82f6 100%)',
                      border: 'none',
                      color: '#060b18',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(0, 242, 254, 0.25)'
                    }}
                  >
                    <LogIn size={16} />
                    <span>{isProcessing ? 'Authenticating...' : 'Sign In with MongoDB'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* 3. REGISTER NEW STUDENT */}
            {activeTabMode === 'register' && (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                    <User size={13} />
                    <span>New Student Name</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya K"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                    <Mail size={13} />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. priya@adaptiq.com"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                    <Lock size={13} />
                    <span>Set Password</span>
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      color: '#fff',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)'
                    }}
                  >
                    <UserPlus size={16} />
                    <span>{isProcessing ? 'Creating in DB...' : 'Create Account in MongoDB'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
