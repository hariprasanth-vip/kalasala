import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Lightbulb,
  Eye,
  Code2,
  CheckCircle2,
  TrendingUp,
  Dna,
  ChevronRight,
  Target,
  Sparkles,
  Info
} from 'lucide-react';
import { useTutor } from '../context/TutorContext';

export default function PedagogyInspector() {
  const {
    selectedTopic,
    understandingScore,
    misconception,
    strategyInfo,
    strategyPerformance,
    teachingDna,
    progressHistory
  } = useTutor();

  const [expandedStrategy, setExpandedStrategy] = useState(null);
  const [showMisconceptionDetail, setShowMisconceptionDetail] = useState(true);

  // SVG Radial Gauge Calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (understandingScore / 100) * circumference;

  // Dynamic color for gauge based on score
  const getScoreColor = (score) => {
    if (score < 40) return '#f59e0b'; // Amber / Warning
    if (score < 70) return '#00f2fe'; // Cyan / Transition
    return '#10b981'; // Neon Emerald / High Mastery
  };

  // Sparkline SVG coordinates
  const sparkWidth = 240;
  const sparkHeight = 44;
  const minVal = 0;
  const maxVal = 100;
  const points = progressHistory.map((val, idx) => {
    const x = (idx / Math.max(1, progressHistory.length - 1)) * sparkWidth;
    const y = sparkHeight - ((val - minVal) / (maxVal - minVal)) * (sparkHeight - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  const strategyIcons = {
    Analogy: Lightbulb,
    Example: Code2,
    Visual: Eye,
    Explanation: Info,
    Practice: Target,
    'Code Execution': Code2,
    'First Principles': Info,
    'Socratic': Target
  };

  const strategyColors = {
    Analogy: '#00f2fe',
    Example: '#a855f7',
    Visual: '#f59e0b',
    Explanation: '#3b82f6',
    Practice: '#10b981',
    'Code Execution': '#a855f7',
    'First Principles': '#3b82f6',
    'Socratic': '#10b981'
  };

  return (
    <aside className="pedagogy-inspector">
      {/* Header */}
      <div className="inspector-header">
        <div className="inspector-title-wrap">
          <Activity size={18} className="accent-blue" />
          <h2 className="inspector-title">Pedagogy Dashboard</h2>
        </div>
        <ChevronRight size={16} className="chevron-muted" />
      </div>

      <div className="inspector-scroll-area">
        {/* 1. Understanding Score Radial Gauge */}
        <div className="gauge-card">
          <div className="gauge-container">
            <svg className="radial-gauge-svg" width="140" height="140" viewBox="0 0 140 140">
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f2fe" />
                  <stop offset="60%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor={getScoreColor(understandingScore)} />
                </linearGradient>
              </defs>
              {/* Background circle */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="gauge-bg"
                strokeWidth="10"
              />
              {/* Animated Progress circle */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="gauge-progress"
                stroke="url(#scoreGradient)"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
              />
            </svg>

            {/* Gauge Center Content */}
            <div className="gauge-center-text">
              <span className="gauge-percentage">{understandingScore}%</span>
              <span className="gauge-label">Understanding</span>
            </div>
          </div>

          <div className="gauge-subcaption">
            <span className="concept-pill">Current Concept: {selectedTopic || 'General Learning'}</span>
          </div>
        </div>

        {/* 2. Misconception Alert Card */}
        <div className={`misconception-card ${misconception.detected ? 'detected' : 'resolved'}`}>
          <div
            className="misconception-header"
            onClick={() => setShowMisconceptionDetail(!showMisconceptionDetail)}
          >
            <div className="misconception-title-group">
              <div className="misconception-icon-wrap">
                {misconception.detected ? (
                  <AlertTriangle size={18} className="warn-icon" />
                ) : (
                  <CheckCircle2 size={18} className="success-icon" />
                )}
              </div>
              <div className="misconception-texts">
                <span className="misconception-tag">
                  {misconception.detected ? '⚠ MISCONCEPTION' : '✓ CONCEPT RESOLVED'}
                </span>
                <span className="misconception-main-title">{misconception.title}</span>
              </div>
            </div>
            <ChevronRight
              size={16}
              className={`chevron-arrow ${showMisconceptionDetail ? 'open' : ''}`}
            />
          </div>

          {showMisconceptionDetail && (
            <div className="misconception-body">
              <p className="misconception-desc">{misconception.description}</p>
              <div className="misconception-meta">
                <span className="judges-badge">Judges Live View: Cognitive Gap Detected</span>
              </div>
            </div>
          )}
        </div>

        {/* 3. Recommended Strategy & Pedagogical Reason */}
        <div className="strategy-decision-card">
          <div className="strategy-decision-header">
            <Target size={16} className="accent-cyan" />
            <span className="strategy-decision-badge">🎯 CURRENT STRATEGY</span>
          </div>
          <div className="strategy-active-name">{strategyInfo.name}</div>
          <div className="strategy-reason-box">
            <span className="reason-label">Why?</span>
            <span className="reason-text">{strategyInfo.reason}</span>
          </div>
        </div>

        {/* 4. Teaching Strategy Performance (Dynamic Win-Rates) */}
        <div className="performance-section">
          <div className="performance-header">
            <div className="perf-title-group">
              <Dna size={16} className="accent-purple" />
              <h3 className="section-title">Teaching Strategy Performance</h3>
            </div>
            <ChevronRight size={14} className="chevron-muted" />
          </div>

          <div className="strategy-bars-list">
            {Object.entries(strategyPerformance).map(([key, data]) => {
              const Icon = strategyIcons[key] || Activity;
              const color = strategyColors[key] || '#00f2fe';
              const isExpanded = expandedStrategy === key;

              return (
                <div
                  key={key}
                  className="strategy-item-card"
                  onClick={() => setExpandedStrategy(isExpanded ? null : key)}
                >
                  <div className="strategy-item-top">
                    <div className="strategy-name-group">
                      <Icon size={14} style={{ color }} />
                      <span className="strategy-item-name">{key}</span>
                    </div>
                    <span className="strategy-percentage" style={{ color }}>
                      {data.displayPercent}%
                    </span>
                  </div>

                  <div className="strategy-bar-bg">
                    <div
                      className="strategy-bar-fill"
                      style={{
                        width: `${data.displayPercent}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}66`
                      }}
                    />
                  </div>

                  {/* Dynamic interactive trials breakdown */}
                  <div className="strategy-trials-row">
                    <span className="trials-stat">{data.attempts} attempts</span>
                    <span className="trials-dot">•</span>
                    <span className="trials-stat">{data.successful} successful</span>
                    <span className="trials-dot">•</span>
                    <span className="win-rate-badge">Win rate: {data.winRate}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. 🧬 Teaching DNA Card */}
        <div className="teaching-dna-card">
          <div className="dna-card-header">
            <div className="dna-title-group">
              <Sparkles size={16} className="accent-teal" />
              <span className="dna-badge-text">🧬 TEACHING DNA</span>
            </div>
            <span className="dna-pill-tag">Dynamic</span>
          </div>

          <div className="dna-content-grid">
            <div className="dna-stat-cell">
              <span className="cell-label">Best performing strategy</span>
              <div className="cell-value-highlight">
                <Lightbulb size={16} className="accent-amber" />
                <span>{teachingDna.bestStrategy}</span>
                <span className="cell-score">({teachingDna.bestScore}%)</span>
              </div>
            </div>

            <div className="dna-stat-cell">
              <span className="cell-label">Learning preference</span>
              <span className="cell-text-value">{teachingDna.learningPreference}</span>
            </div>

            <div className="dna-stat-cell">
              <span className="cell-label">Confidence</span>
              <span className="cell-text-value accent-green">{teachingDna.confidence}</span>
            </div>
          </div>

          <div className="dna-philosophy-banner">
            <div className="principle-tick">✓ Non-stereotyping discovery</div>
            <p className="philosophy-text">
              The system doesn't assume how the student learns. It discovers what works through interaction:
            </p>
            <div className="effectiveness-code">
              {teachingDna.effectivenessSummary}
            </div>
          </div>
        </div>

        {/* 6. Learning Progress Sparkline */}
        <div className="sparkline-card">
          <div className="sparkline-header">
            <TrendingUp size={16} className="accent-teal" />
            <span className="sparkline-title">Learning Progress ↗</span>
          </div>

          <div className="sparkline-svg-wrap">
            <svg width={sparkWidth} height={sparkHeight} className="sparkline-svg">
              <defs>
                <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polyline
                fill="none"
                stroke="#00f2fe"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
              {/* Highlight dot on last point */}
              {progressHistory.length > 0 && (
                <circle
                  cx={sparkWidth}
                  cy={
                    sparkHeight -
                    ((progressHistory[progressHistory.length - 1] - minVal) /
                      (maxVal - minVal)) *
                      (sparkHeight - 8) -
                    4
                  }
                  r="4"
                  fill="#00f2fe"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}
            </svg>
          </div>
          <div className="sparkline-footer">
            <span>Session Start: {progressHistory[0] ?? 20}%</span>
            <span className="accent-cyan">Current: {understandingScore}%</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
