import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, Target, Sparkles, ArrowRight, Search, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { fetchLearningHistory } from '../services/api';
import { useTutor } from '../context/TutorContext';

export default function LearningHistory() {
  const { setActiveTab, setSelectedTopic, handleStudentResponse } = useTutor();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadHistory = async () => {
    setLoading(true);
    const data = await fetchLearningHistory();
    setHistory(data);
    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filtered = history.filter(item => {
    const q = searchTerm.toLowerCase();
    const prompt = (item.studentPrompt || '').toLowerCase();
    const topic = (item.topicId || '').toLowerCase();
    const strategy = (item.strategyUsed || '').toLowerCase();
    return prompt.includes(q) || topic.includes(q) || strategy.includes(q);
  });

  const avgScore = history.length > 0
    ? Math.round(history.reduce((sum, item) => sum + (item.diagnosis?.understandingScore || 50), 0) / history.length)
    : 0;

  const topicsCount = new Set(history.map(item => item.topicId).filter(Boolean)).size;

  return (
    <div className="learning-history-page" style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto', color: '#f8fafc' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.4rem' }}>
            <Clock size={24} style={{ color: '#00f2fe' }} />
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #ffffff, #00f2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Learning History & Session Archive
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
            Every interaction recorded live and persisted in MongoDB with pedagogical diagnostics.
          </p>
        </div>

        <button
          onClick={loadHistory}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0, 242, 254, 0.1)',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            color: '#00f2fe',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.88rem'
          }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#0e1726', border: '1px solid #1e293b', padding: '1.2rem', borderRadius: '12px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Interactions</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>{history.length}</div>
        </div>
        <div style={{ background: '#0e1726', border: '1px solid #1e293b', padding: '1.2rem', borderRadius: '12px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distinct Concepts</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#a855f7', marginTop: '4px' }}>{topicsCount}</div>
        </div>
        <div style={{ background: '#0e1726', border: '1px solid #1e293b', padding: '1.2rem', borderRadius: '12px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Understanding</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>{avgScore}%</div>
        </div>
        <div style={{ background: '#0e1726', border: '1px solid #1e293b', padding: '1.2rem', borderRadius: '12px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Engine</span>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b', marginTop: '8px' }}>Gemma 3 (Local)</div>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: '#64748b' }} />
        <input
          type="text"
          placeholder="Filter by concept (e.g. springboot, recursion, cse), prompt words, or strategy..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 14px 12px 42px',
            background: '#090e17',
            border: '1px solid #1e293b',
            borderRadius: '10px',
            color: '#f8fafc',
            fontSize: '0.92rem',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Interactions List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading records from MongoDB...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', background: '#0e1726', borderRadius: '12px' }}>
          No learning history matches your filter. Start asking questions in Chat to record sessions!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((item, idx) => {
            const score = item.diagnosis?.understandingScore ?? 50;
            const scoreColor = score >= 70 ? '#10b981' : score >= 50 ? '#00f2fe' : '#f59e0b';
            const headline = item.tutorResponse?.headline || item.topicId || 'Exploration';
            const isMisconception = item.diagnosis?.misconceptionDetected;

            return (
              <div
                key={item._id || idx}
                style={{
                  background: '#0e1726',
                  border: '1px solid #1e293b',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  transition: 'border-color 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      background: 'rgba(0, 242, 254, 0.1)',
                      color: '#00f2fe',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      fontWeight: 600
                    }}>
                      {item.topicId || 'General Learning'}
                    </span>
                    <span style={{
                      background: 'rgba(168, 85, 247, 0.1)',
                      color: '#c084fc',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      fontWeight: 600
                    }}>
                      Strategy: {item.strategyUsed || 'Adaptive'}
                    </span>
                    {isMisconception && (
                      <span style={{
                        background: 'rgba(245, 158, 11, 0.1)',
                        color: '#fbbf24',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <AlertTriangle size={12} />
                        Misconception Caught
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: scoreColor,
                      background: 'rgba(255,255,255,0.05)',
                      padding: '4px 10px',
                      borderRadius: '8px'
                    }}>
                      {score}% Mastery
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f1f5f9' }}>
                  Student Prompt: <span style={{ color: '#38bdf8' }}>"{item.studentPrompt}"</span>
                </div>

                <div style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5, background: '#090e17', padding: '10px 14px', borderRadius: '8px', borderLeft: `3px solid ${scoreColor}` }}>
                  <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>{headline}</div>
                  {item.tutorResponse?.coreExplanation
                    ? item.tutorResponse.coreExplanation.slice(0, 220) + '...'
                    : 'Interactive explanation provided by Gemma 3.'}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setSelectedTopic(item.topicId || 'General Learning');
                      setActiveTab('chat');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'transparent',
                      border: 'none',
                      color: '#00f2fe',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      padding: 0
                    }}
                  >
                    <span>Resume Discussion in Chat</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
