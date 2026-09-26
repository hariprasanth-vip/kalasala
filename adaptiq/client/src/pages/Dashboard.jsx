import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  BookOpen,
  Award,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Zap,
  Layers,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { useTutor } from '../context/TutorContext';
import { fetchLearningHistory } from '../services/api';

export default function Dashboard() {
  const {
    studentProfile,
    setActiveTab,
    setSelectedTopic,
    understandingScore,
    handleStudentResponse,
    setIsProfileModalOpen,
    setProfileModalMode,
    launchAssessment
  } = useTutor();

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchLearningHistory()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setHistory(data);
        }
      })
      .catch((err) => console.warn('Failed to load history on dashboard:', err))
      .finally(() => {
        if (isMounted) setLoadingHistory(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Dynamically group real learning history from MongoDB by topic
  const historyByTopic = {};
  history.forEach((item) => {
    const rawTopic = (item.topicId || 'General Learning').trim();
    if (!historyByTopic[rawTopic]) {
      historyByTopic[rawTopic] = {
        id: rawTopic,
        title: rawTopic,
        description: item.studentPrompt ? `Latest: "${item.studentPrompt.slice(0, 70)}..."` : 'Concept explored via AdaptIQ.',
        scores: [],
        count: 0,
        strategy: item.strategyUsed || 'Analogy',
        lastUpdated: item.timestamp || 'Recent'
      };
    }
    const scoreVal = item.diagnosis?.understandingScore ?? 60;
    historyByTopic[rawTopic].scores.push(scoreVal);
    historyByTopic[rawTopic].count += 1;
  });

  const dynamicTopics = Object.values(historyByTopic).map((t) => {
    const avg = Math.round(t.scores.reduce((a, b) => a + b, 0) / t.scores.length);
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      progress: avg,
      status: avg >= 70 ? 'Mastered' : avg >= 50 ? 'In Progress' : 'Needs Review',
      tag: `${t.count} turn${t.count > 1 ? 's' : ''}`
    };
  });

  const handleLaunchTopic = (topicName) => {
    setSelectedTopic(topicName);
    setActiveTab('chat');
  };

  const handleLaunchPrompt = (starter) => {
    setSelectedTopic(starter.topic);
    setActiveTab('chat');
    if (handleStudentResponse) {
      handleStudentResponse(starter.prompt);
    }
  };

  return (
    <div
      className="dashboard-page"
      style={{
        flex: 1,
        height: '100%',
        overflowY: 'auto',
        padding: '28px 36px',
        background: 'radial-gradient(circle at 80% 15%, rgba(0, 242, 254, 0.08) 0%, transparent 60%)'
      }}
    >
      {/* Welcome Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          background: 'linear-gradient(135deg, rgba(14, 26, 56, 0.85) 0%, rgba(10, 18, 38, 0.95) 100%)',
          border: '1px solid rgba(0, 242, 254, 0.25)',
          borderRadius: '20px',
          padding: '24px 28px',
          marginBottom: '28px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.3)', color: '#00f2fe', fontSize: '0.8rem', fontWeight: 600, marginBottom: '10px' }}>
            <Sparkles size={14} />
            <span>Adaptive AI Cockpit</span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 6px 0', background: 'linear-gradient(90deg, #ffffff 40%, #00f2fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Welcome back, {studentProfile.name.split(' ')[0]} 👋
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', margin: 0 }}>
            {studentProfile.gradeLevel || 'Undergraduate Computer Science'} • Ready for your next learning session
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => {
              setProfileModalMode('edit');
              setIsProfileModalOpen(true);
            }}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Edit Profile
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00f2fe 0%, #3b82f6 100%)',
              border: 'none',
              color: '#060b18',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 242, 254, 0.25)'
            }}
          >
            <MessageSquare size={16} />
            <span>Open Chat</span>
          </button>
        </div>
      </div>

      {/* Dynamic Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: 'rgba(13, 22, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '14px', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 600 }}>Mastery Level</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#00f2fe' }}>Level {studentProfile.level || 4}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Accelerated Pace</div>
        </div>

        <div style={{ background: 'rgba(13, 22, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '14px', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 600 }}>Concepts Mastered</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a855f7' }}>{studentProfile.conceptsMastered || 12} Topics</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Empirically Verified</div>
        </div>

        <div style={{ background: 'rgba(13, 22, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '14px', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 600 }}>Total Study Time</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>{studentProfile.studyTime || '15h'}</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Active Recall Engaged</div>
        </div>

        <div style={{ background: 'rgba(13, 22, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.07)', borderRadius: '14px', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 600 }}>Live Comprehension</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b' }}>{understandingScore || 50}%</div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Diagnostic Gauge</div>
        </div>
      </div>

      {/* Recently Active Topics (Dynamic from MongoDB) */}
      {dynamicTopics.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: '0 0 14px 0' }}>
            ⚡ Continue Exploring Recent Concepts
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {dynamicTopics.slice(0, 4).map((t) => (
              <div
                key={t.id}
                onClick={() => handleLaunchTopic(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(13, 22, 42, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                className="starter-prompt-card"
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f2fe' }}>
                  <Sparkles size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t.progress}% Mastery • {t.tag}</div>
                </div>
                <ArrowRight size={16} color="#64748b" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Learning Modules Grid from MongoDB */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: 0 }}>
            📚 Explored Concept Tracks
          </h2>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Synced from MongoDB Sessions
          </span>
        </div>

        {dynamicTopics.length > 0 ? (
          <div className="topics-grid">
            {dynamicTopics.map((t) => (
              <div key={t.id} className="topic-card">
                <div className="topic-card-top">
                  <span className="topic-status-badge">{t.status}</span>
                  <span className="topic-pct">{t.progress}%</span>
                </div>
                <h3 className="topic-title">{t.title}</h3>
                <p className="topic-desc">{t.description}</p>

                <div className="topic-progress-bar">
                  <div
                    className="topic-progress-fill"
                    style={{ width: `${t.progress}%` }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    className="btn-launch-topic"
                    onClick={() => handleLaunchTopic(t.id)}
                    style={{ flex: 1.5, marginTop: 0 }}
                  >
                    <span>Resume Session</span>
                    <ArrowRight size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => launchAssessment(t.title)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(0, 242, 254, 0.12)',
                      border: '1px solid rgba(0, 242, 254, 0.35)',
                      color: '#00f2fe',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease'
                    }}
                    title="Ask Ollama for 5 real-time diagnostic questions"
                  >
                    📝 5-Q Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '2.5rem 1.5rem',
            background: 'rgba(13, 22, 42, 0.5)',
            border: '1px dashed rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            textAlign: 'center'
          }}>
            <Brain size={36} style={{ color: '#00f2fe', margin: '0 auto 10px', opacity: 0.8 }} />
            <h3 style={{ color: '#f8fafc', fontSize: '1.05rem', margin: '0 0 6px 0' }}>No Topic Sessions Explored Yet</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', maxWidth: '440px', margin: '0 auto 16px', lineHeight: 1.5 }}>
              Ask any concept in the Chat to start logging real-time pedagogical diagnostics to MongoDB!
            </p>
            <button
              onClick={() => setActiveTab('chat')}
              className="btn-launch-topic"
              style={{ width: 'auto', display: 'inline-flex', padding: '10px 22px' }}
            >
              Start Exploring in Chat <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
