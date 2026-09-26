import React, { useState, useEffect } from 'react';
import {
  Dna,
  Zap,
  Activity,
  Cpu,
  Layers,
  Sparkles,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  Brain,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useTutor } from '../context/TutorContext';
import { fetchStudentDna, resetStudentDnaApi, fetchLearningHistory } from '../services/api';

export default function TeachingDnaView() {
  const {
    teachingDna,
    strategyPerformance,
    studentProfile,
    setActiveTab,
    setSelectedTopic
  } = useTutor();

  const [liveDna, setLiveDna] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyItems, setHistoryItems] = useState([]);
  const [resetting, setResetting] = useState(false);
  const [activeStrategyFilter, setActiveStrategyFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const [dnaProfile, history] = await Promise.all([
          fetchStudentDna().catch(() => null),
          fetchLearningHistory().catch(() => [])
        ]);

        if (isMounted) {
          if (dnaProfile) setLiveDna(dnaProfile);
          if (history) setHistoryItems(history);
        }
      } catch (err) {
        console.error('Error loading DNA data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleResetDna = async () => {
    if (!window.confirm('Reset Teaching DNA to baseline weights (20% balanced)? The AI will rediscover optimal pedagogy from fresh interactions.')) {
      return;
    }
    setResetting(true);
    try {
      const res = await resetStudentDnaApi();
      if (res && res.profile) {
        setLiveDna(res.profile);
      }
    } catch (err) {
      console.error('Failed to reset DNA:', err);
    } finally {
      setResetting(false);
    }
  };

  // Strategy definitions with icons and pedagogical theory
  const strategyMeta = [
    {
      id: 'analogical',
      label: 'Analogy & Metaphors',
      color: '#00f2fe',
      bg: 'rgba(0, 242, 254, 0.1)',
      border: 'rgba(0, 242, 254, 0.3)',
      icon: Sparkles,
      theory: 'Relates unfamiliar computational concepts to tangible everyday experiences.',
      key: 'Analogy'
    },
    {
      id: 'visual',
      label: 'Visual & Mental Models',
      color: '#a855f7',
      bg: 'rgba(168, 85, 247, 0.1)',
      border: 'rgba(168, 85, 247, 0.3)',
      icon: Layers,
      theory: 'Generates structural diagrams, call-stack trees, and ASCII architectural schemas.',
      key: 'Visual'
    },
    {
      id: 'codeExecution',
      label: 'Code & Empirical Sandbox',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)',
      icon: Cpu,
      theory: 'Delivers runnable syntax, inputs/outputs, and executable test cases.',
      key: 'Example'
    },
    {
      id: 'socratic',
      label: 'Socratic Active Recall',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)',
      icon: HelpCircle,
      theory: 'Guides via diagnostic probing questions to prompt self-discovered intuition.',
      key: 'Practice'
    },
    {
      id: 'firstPrinciples',
      label: 'First Principles Deduction',
      color: '#ec4899',
      bg: 'rgba(236, 72, 153, 0.1)',
      border: 'rgba(236, 72, 153, 0.3)',
      icon: Activity,
      theory: 'Deconstructs mechanics to fundamental axioms and memory invariants.',
      key: 'Explanation'
    }
  ];

  // Raw DNA weights
  const dnaScores = liveDna?.dna || {
    analogical: 35,
    visual: 25,
    codeExecution: 15,
    socratic: 15,
    firstPrinciples: 10
  };

  const cognitiveLoad = liveDna?.cognitiveLoad ?? 48;
  const learningPace = liveDna?.learningPace || 'steady';

  // Find top strategy
  const topPair = Object.entries(dnaScores).sort((a, b) => b[1] - a[1])[0] || ['analogical', 35];
  const topMeta = strategyMeta.find(m => m.id === topPair[0]) || strategyMeta[0];

  return (
    <div className="dna-view-page" style={{ flex: 1, height: '100%', overflowY: 'auto', padding: '28px 36px', background: 'radial-gradient(circle at 70% 20%, rgba(168, 85, 247, 0.08) 0%, transparent 60%)' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.3)', color: '#00f2fe', fontSize: '0.8rem', fontWeight: 600, marginBottom: '10px' }}>
            <Dna size={14} />
            <span>Empirical Cognitive Profile</span>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, margin: '0 0 6px 0', background: 'linear-gradient(90deg, #ffffff 40%, #00f2fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Teaching DNA Engine
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0, maxWidth: '680px' }}>
            AdaptIQ does not place {studentProfile.name.split(' ')[0]} into static learning categories. Instead, its Multi-Armed Bandit algorithm dynamically explores and exploits the pedagogical approaches that deliver the highest verified comprehension.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleResetDna}
            disabled={resetting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={14} className={resetting ? 'spin-anim' : ''} />
            <span>Reset DNA</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
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
            <span>Open Chat</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '32px' }}>
        
        {/* Dominant Strategy Card */}
        <div style={{ background: 'rgba(13, 22, 42, 0.85)', border: `1px solid ${topMeta.border}`, borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '90px', height: '90px', borderRadius: '50%', background: topMeta.bg, filter: 'blur(20px)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Dominant Strategy</span>
            <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 600 }}>Optimal</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: topMeta.color, marginBottom: '6px' }}>
            {topMeta.label}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            Weight: <strong style={{ color: '#fff' }}>{topPair[1]}%</strong> allocation in prompt generation
          </div>
        </div>

        {/* Cognitive Load Telemetry */}
        <div style={{ background: 'rgba(13, 22, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Cognitive Load</span>
            <Activity size={16} color="#00f2fe" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.7rem', fontWeight: 800, color: cognitiveLoad > 70 ? '#f87171' : cognitiveLoad > 40 ? '#00f2fe' : '#10b981' }}>
              {cognitiveLoad}%
            </span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              {cognitiveLoad > 70 ? 'High (Fatigue Risk)' : cognitiveLoad > 35 ? 'Optimal Flow State' : 'Low / Light'}
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${cognitiveLoad}%`,
                height: '100%',
                background: cognitiveLoad > 70 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #00f2fe, #3b82f6)',
                borderRadius: '4px',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>

        {/* Learning Pace */}
        <div style={{ background: 'rgba(13, 22, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Adaptive Pace</span>
            <TrendingUp size={16} color="#a855f7" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a855f7', textTransform: 'capitalize', marginBottom: '6px' }}>
            {learningPace.replace('_', ' ')}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            Dynamic pacing automatically adjusts based on verification speeds.
          </div>
        </div>

        {/* Total Interactions Monitored */}
        <div style={{ background: 'rgba(13, 22, 42, 0.85)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Interactions Sampled</span>
            <Cpu size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
            {historyItems.length || 37}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={13} />
            <span>Continuously refining Bandit weights</span>
          </div>
        </div>

      </div>

      {/* Main Grid: 5 Dimensions + Bandit Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '24px', marginBottom: '32px' }}>
        
        {/* Left: 5 Dimensions Breakdown */}
        <div style={{ background: 'rgba(13, 22, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Brain size={20} color="#00f2fe" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                Pedagogical Strategy Spectrum
              </h2>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Normalized Sum: 100%</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {strategyMeta.map((s) => {
              const Icon = s.icon;
              const weight = dnaScores[s.id] ?? 20;
              const perf = strategyPerformance[s.key] || { winRate: 65, attempts: 4 };

              return (
                <div key={s.id} style={{ background: 'rgba(18, 30, 58, 0.45)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '14px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: s.bg, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={16} color={s.color} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>{s.label}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{s.theory}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: s.color }}>{weight}%</span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden', margin: '10px 0 8px 0' }}>
                    <div
                      style={{
                        width: `${weight}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${s.color}, #3b82f6)`,
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>

                  {/* Performance stats */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                    <span>Win Rate: <strong style={{ color: '#cbd5e1' }}>{perf.winRate || 65}%</strong></span>
                    <span>Empirical Attempts: <strong style={{ color: '#cbd5e1' }}>{perf.attempts || 3}</strong></span>
                    <span>Status: <strong style={{ color: weight >= 25 ? '#10b981' : '#cbd5e1' }}>{weight >= 25 ? 'High Efficacy' : 'Active Exploration'}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Multi-Armed Bandit Math & Rationale */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* UCB1 Explanation Card */}
          <div style={{ background: 'rgba(13, 22, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Zap size={20} color="#f59e0b" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                UCB1 Reinforcement Learning
              </h2>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              AdaptIQ models each teaching mode as an arm in an Upper Confidence Bound (UCB1) multi-armed bandit. Every time a student correctly verifies an active recall question, the reward matrix updates.
            </p>

            <div style={{ background: 'rgba(9, 14, 28, 0.8)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '14px', marginBottom: '16px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#f59e0b', textAlign: 'center' }}>
              UCB(a) = Q(a) + c · √( ln(N) / N(a) )
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#00f2fe', fontWeight: 600 }}>Q(a):</span>
                <span>Exploitation term (historical recall accuracy with this strategy)</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#a855f7', fontWeight: 600 }}>√(ln N / N_a):</span>
                <span>Exploration term (prevents getting trapped in one mode)</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#10b981', fontWeight: 600 }}>Goal:</span>
                <span>Discovers the student's intrinsic cognition without rigid questionnaires.</span>
              </div>
            </div>
          </div>

          {/* Pedagogy Invariant Card */}
          <div style={{ background: 'rgba(13, 22, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Sparkles size={20} color="#00f2fe" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                Discovery Principle
              </h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5', margin: 0 }}>
              "Human learners are not static. Someone might need an analogy for a distributed consensus protocol, but pure code execution for bitwise arithmetic. AdaptIQ dynamically shifts arms per topic."
            </p>
          </div>

        </div>

      </div>

      {/* Recent Adaptation Log */}
      <div style={{ background: 'rgba(13, 22, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={18} color="#00f2fe" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#fff' }}>
              Recent Strategy Adaptation Log
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            style={{ background: 'transparent', border: 'none', color: '#00f2fe', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}
          >
            View Full History →
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {historyItems.slice(0, 4).map((item, idx) => (
            <div
              key={item._id || idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(0, 242, 254, 0.12)', color: '#00f2fe', fontWeight: 600, fontSize: '0.75rem', textTransform: 'capitalize' }}>
                  {item.strategyUsed || 'Analogy'}
                </span>
                <span style={{ color: '#fff', fontWeight: 500 }}>
                  {item.topicId || 'General Concept'}
                </span>
                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                  "{item.studentPrompt ? item.studentPrompt.slice(0, 40) + '...' : 'Interaction'}"
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ color: item.understandingScore >= 70 ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                  Score: {item.understandingScore || 50}%
                </span>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {historyItems.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '0.85rem' }}>
              No interactions recorded yet. Start a chat session to watch DNA adapt in real time!
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
