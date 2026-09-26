import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Target,
  TrendingUp,
  Bot,
  User,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Code,
  Terminal,
  HelpCircle
} from 'lucide-react';
import { useTutor } from '../context/TutorContext';

export default function LearningStage() {
  const {
    messages,
    isAnalyzing,
    understandingScore,
    misconception,
    handleVerifyAnswer,
    handleStudentResponse,
    launchAssessment,
    selectedTopic
  } = useTutor();
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittedQuiz, setSubmittedQuiz] = useState({});

  const handleSelectOption = (msgId, optIndex) => {
    setSelectedAnswers((prev) => ({ ...prev, [msgId]: optIndex }));
  };

  const handleSubmitQuiz = (msgId, correctIndex, strategyUsed) => {
    const isCorrect = Number(selectedAnswers[msgId]) === Number(correctIndex);
    setSubmittedQuiz((prev) => ({ ...prev, [msgId]: { checked: true, isCorrect } }));
    if (handleVerifyAnswer) {
      handleVerifyAnswer(msgId, selectedAnswers[msgId], correctIndex, strategyUsed);
    }
  };

  return (
    <main className="learning-stage">
      {/* Top Hero Brand Header matching Image 2 */}
      <div className="stage-hero-banner">
        <div className="stage-hero-content">
          <div className="hero-brain-icon-glow">
            <Brain size={56} className="hero-brain-svg" />
          </div>
          <h1 className="hero-title">AdaptIQ</h1>
          <p className="hero-subtitle">AI Teacher That Learns From Its Student</p>

          <div className="hero-badges-row">
            <div className="hero-badge">
              <Sparkles size={14} className="badge-icon-cyan" />
              <span>Personalized</span>
            </div>
            <div className="hero-badge">
              <Target size={14} className="badge-icon-blue" />
              <span>Adaptive</span>
            </div>
            <div className="hero-badge">
              <TrendingUp size={14} className="badge-icon-purple" />
              <span>Always Learning</span>
            </div>
          </div>

          <div style={{ marginTop: '14px' }}>
            <button
              type="button"
              onClick={() => launchAssessment(selectedTopic)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.15), rgba(168, 85, 247, 0.15))',
                border: '1px solid rgba(0, 242, 254, 0.4)',
                color: '#00f2fe',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0, 242, 254, 0.15)',
                transition: 'all 0.2s ease'
              }}
              title="Generate 5 real-time diagnostic questions from Ollama"
            >
              <Brain size={14} />
              <span>📝 Test Understanding with 5 Dynamic Questions (Gemma 3)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stream of Interactive Pedagogical Cards */}
      <div className="messages-stream">
        {/* Modern clean AI welcome screen - Zero static cards */}
        {messages.length === 0 && (
          <div className="empty-chat-welcome" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 1.5rem 2rem',
            textAlign: 'center',
            maxWidth: '620px',
            margin: '0 auto'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.18), rgba(168, 85, 247, 0.18))',
              border: '1px solid rgba(0, 242, 254, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              boxShadow: '0 12px 36px rgba(0, 242, 254, 0.15)'
            }}>
              <Sparkles size={32} style={{ color: '#00f2fe' }} />
            </div>

            <h2 style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffffff 0%, #00f2fe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.75rem',
              letterSpacing: '-0.02em'
            }}>
              What would you like to explore today?
            </h2>

            <p style={{
              color: '#94a3b8',
              fontSize: '0.98rem',
              maxWidth: '480px',
              lineHeight: 1.6,
              margin: '0 0 1.5rem 0'
            }}>
              Ask any Computer Science question, algorithm doubt, code structure, or concept. AdaptIQ dynamically evaluates your mental model and personalizes its pedagogical strategy in real-time.
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              fontSize: '0.82rem'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
              <span>Gemma 3 AI Model Active & Ready</span>
            </div>
          </div>
        )}
        {messages.map((msg) => {
          // Render Diagnosis Alert Card
          if (msg.role === 'diagnosis_alert') {
            return (
              <div key={msg.id} className="diagnosis-pill-card">
                <div className="diag-pill-header">
                  <div className="diag-score-tag">
                    Your understanding: <span className="score-val">{msg.understanding}%</span>
                  </div>
                  <div className="diag-missing-tag">
                    Missing concept: <span className="concept-val">{msg.missingConcept}</span>
                  </div>
                </div>
                {msg.summary && <p className="diag-summary-text">{msg.summary}</p>}
              </div>
            );
          }

          // Render User Message
          if (msg.role === 'user') {
            return (
              <div key={msg.id} className="message-row user-row">
                <div className="message-bubble user-bubble">
                  <p className="bubble-text">{msg.text}</p>
                </div>
                <div className="avatar-wrap user-avatar">
                  <User size={16} />
                </div>
              </div>
            );
          }

          // Render Assistant / Tutor Adaptive Card
          return (
            <div key={msg.id} className="message-row assistant-row">
              <div className="avatar-wrap tutor-avatar">
                <Bot size={18} />
              </div>

              <div className="tutor-card">
                {/* Header with strategy indicator */}
                <div className="tutor-card-header">
                  <div className="tutor-headline-group">
                    {msg.strategyUsed && (
                      <span className="strategy-tag">
                        <Lightbulb size={12} /> {msg.strategyUsed} Mode
                      </span>
                    )}
                    <h3 className="tutor-headline">{msg.headline || 'AdaptIQ Explanation'}</h3>
                  </div>
                  <span className="card-timestamp">{msg.timestamp || 'Just now'}</span>
                </div>

                {/* Core Explanation Text (Cleaned of duplicate embedded diagrams/questions) */}
                <div className="tutor-card-body">
                  <p className="explanation-paragraph" style={{ whiteSpace: 'pre-wrap' }}>
                    {msg.text
                      ? msg.text
                          .replace(/(?:\*{0,2}(?:Active Recall|Practice|Quick Check|Diagnostic|Self-Check|Concept Check)\s*(?:Practice\s*)?Question\s*:?\*{0,2}[\s\S]*)/i, '')
                          .replace(/(?:\*{0,2}(?:ASCII\s*(?:Structural\s*)?Diagram|Visual\s*(?:Concept\s*)?Diagram|Flowchart|Diagram)\s*:?\*{0,2}\s*(?:```[\s\S]*?```|`[\s\S]*?`))/i, '')
                          .replace(/\n+(?:(?:[-*•]\s*)?[a-dA-D1-4][.)\]]\s*.+\n?){2,}$/i, '')
                          .replace(/```(?:ascii|text)?\s*[\s\S]*?[/\\|+_]{2,}[\s\S]*?```/gi, '')
                          .trim()
                      : ''}
                  </p>

                  {/* Visual Diagram Box */}
                  {msg.visualDiagram && (
                    <div className="diagram-box">
                      <div className="diagram-header">
                        <Terminal size={14} />
                        <span>Visual Concept Diagram / Flow</span>
                      </div>
                      <pre className="diagram-code">{msg.visualDiagram}</pre>
                    </div>
                  )}

                  {/* Code Snippet Box */}
                  {msg.codeSnippet && (
                    <div className="code-box">
                      <div className="code-box-header">
                        <Code size={14} />
                        <span>Code / Structural Model</span>
                      </div>
                      <pre className="code-snippet-pre">
                        <code>{msg.codeSnippet}</code>
                      </pre>
                    </div>
                  )}

                  {/* Socratic Check Probing Question */}
                  {msg.socraticCheck && (
                    <div className="socratic-prompt-box">
                      <HelpCircle size={16} className="socratic-icon" />
                      <div className="socratic-content">
                        <span className="socratic-label">Socratic Reflection:</span>
                        <p className="socratic-question">{msg.socraticCheck}</p>
                      </div>
                    </div>
                  )}

                  {/* Interactive Practice Micro-Check Widget */}
                  {msg.practicePrompt && (
                    <div className="practice-quiz-widget">
                      <div className="quiz-header">
                        <span className="quiz-pill">Instant Active Recall Check</span>
                      </div>
                      <p className="quiz-question">{msg.practicePrompt.question}</p>

                      <div className="quiz-options-list">
                        {msg.practicePrompt.options.map((opt, oIdx) => {
                          const isSelected = selectedAnswers[msg.id] === oIdx;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectOption(msg.id, oIdx)}
                              className={`quiz-opt-btn ${isSelected ? 'selected' : ''}`}
                            >
                              <span className="opt-letter">
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className="opt-text">{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="quiz-action-row">
                        <button
                          onClick={() =>
                            handleSubmitQuiz(msg.id, msg.practicePrompt.correctIndex, msg.strategyUsed)
                          }
                          disabled={selectedAnswers[msg.id] === undefined}
                          className="btn-check-quiz"
                        >
                          Check Answer & Verify Mastery
                        </button>

                        {submittedQuiz[msg.id] && (
                          <div
                            className={`quiz-feedback-pill ${
                              submittedQuiz[msg.id].isCorrect ? 'correct' : 'incorrect'
                            }`}
                          >
                            {submittedQuiz[msg.id].isCorrect ? (
                              <>
                                <CheckCircle2 size={16} />
                                <span>Correct! Excellent intuition.</span>
                              </>
                            ) : (
                              <>
                                <XCircle size={16} />
                                <span>Hint: {msg.practicePrompt.hint}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Dynamic Analyzing Response Pulsing Indicator */}
        {isAnalyzing && (
          <div className="analyzing-pulse-container">
            <div className="pulse-dots-wrap">
              <span className="pulse-dot"></span>
              <span className="pulse-dot"></span>
              <span className="pulse-dot"></span>
            </div>
            <span className="analyzing-text">
              ANALYZING RESPONSE & UPDATING TEACHING DNA...
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
