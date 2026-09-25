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
  const { messages, isAnalyzing, understandingScore, misconception, handleVerifyAnswer, handleStudentResponse } = useTutor();
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
        </div>
      </div>

      {/* Stream of Interactive Pedagogical Cards */}
      <div className="messages-stream">
        {/* ChatGPT / Gemini style clean initial welcome screen */}
        {messages.length === 0 && (
          <div className="empty-chat-welcome" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2.5rem 1rem',
            textAlign: 'center',
            maxWidth: '680px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: '1.6rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #ffffff 0%, #00f2fe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.6rem'
            }}>
              What would you like to explore today?
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', maxWidth: '500px', lineHeight: 1.5, marginBottom: '2rem' }}>
              Ask any question, share what you understand, or pick a starter below. AdaptIQ will adapt its teaching strategy directly to your cognitive style.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '0.85rem',
              width: '100%'
            }}>
              {[
                {
                  icon: '🌐',
                  title: 'Computer Networks',
                  prompt: 'Networking concept puriyala. Diagram vechu explain panna easy-a irukku.',
                  desc: 'Explain networking layers with visual topology'
                },
                {
                  icon: '🔄',
                  title: 'Recursion Foundations',
                  prompt: 'Explain how recursion works with a simple real-world analogy.',
                  desc: 'Discover base cases with the staircase metaphor'
                },
                {
                  icon: '🔍',
                  title: 'Binary Search',
                  prompt: 'How does Binary Search divide and conquer an array?',
                  desc: 'Trace mid-points and logarithmic efficiency'
                },
                {
                  icon: '📦',
                  title: 'Data Structures',
                  prompt: 'What is the key difference between an Array and a Linked List?',
                  desc: 'Memory allocation, contiguous blocks & pointers'
                }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleStudentResponse && handleStudentResponse(item.prompt)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    textAlign: 'left',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.4)';
                    e.currentTarget.style.background = 'rgba(0, 242, 254, 0.06)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f1f5f9', marginBottom: '0.25rem' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.35 }}>
                      {item.desc}
                    </div>
                  </div>
                </button>
              ))}
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

                {/* Core Explanation Text */}
                <div className="tutor-card-body">
                  <p className="explanation-paragraph" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>

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
