import React, { useState, useEffect } from 'react';
import {
  X,
  Brain,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Award,
  BookOpen,
  Cpu,
  Target
} from 'lucide-react';
import { useTutor } from '../context/TutorContext';
import { fetchTopicAssessment, submitTopicAssessmentApi } from '../services/api';

export default function AssessmentModal({ isOpen, onClose, topic }) {
  const {
    selectedTopic,
    studentProfile,
    setStudentProfile,
    setUnderstandingScore
  } = useTutor();

  const currentTopic = topic || selectedTopic || 'Computer Science';

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch 5 questions from Ollama in real-time
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const loadQuestions = async () => {
      setLoading(true);
      setErrorMessage('');
      setCurrentIndex(0);
      setSelectedAnswers({});
      setIsCompleted(false);
      setResults(null);

      try {
        const res = await fetchTopicAssessment(currentTopic);
        if (isMounted) {
          if (res && res.success && Array.isArray(res.questions) && res.questions.length > 0) {
            setQuestions(res.questions);
          } else {
            setErrorMessage(res?.message || 'Could not load questions from Ollama. Ensure Ollama is active.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage('Failed to connect to AI engine: ' + err.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadQuestions();
    return () => { isMounted = false; };
  }, [isOpen, currentTopic]);

  if (!isOpen) return null;

  const handleSelectOption = (optIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentIndex]: optIndex
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishAssessment();
    }
  };

  const finishAssessment = async () => {
    setSubmitting(true);
    let correctCount = 0;

    questions.forEach((q, idx) => {
      if (Number(selectedAnswers[idx]) === Number(q.correctIndex)) {
        correctCount += 1;
      }
    });

    const percentage = Math.round((correctCount / questions.length) * 100);

    try {
      // 1. Submit to backend & MongoDB
      const res = await submitTopicAssessmentApi({
        studentId: studentProfile._id || '65f000000000000000000001',
        topicId: currentTopic,
        correctCount,
        totalQuestions: questions.length,
        answers: selectedAnswers
      });

      // 2. Update Live Understanding Score in Cockpit
      setUnderstandingScore(percentage);

      // 3. If passed (>= 70%), increment concepts mastered
      if (percentage >= 70) {
        setStudentProfile((prev) => {
          const updated = {
            ...prev,
            conceptsMastered: prev.conceptsMastered + 1,
            overallMastery: Math.max(prev.overallMastery || 40, percentage)
          };
          localStorage.setItem('adaptiq_student_profile', JSON.stringify(updated));
          return updated;
        });
      }

      setResults({
        correctCount,
        total: questions.length,
        percentage,
        feedback: res?.feedback || `You scored ${percentage}% on ${currentTopic}.`
      });
      setIsCompleted(true);
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setResults({
        correctCount,
        total: questions.length,
        percentage,
        feedback: `Completed with ${correctCount}/${questions.length} correct (${percentage}%).`
      });
      setIsCompleted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentIndex];
  const isAnswered = selectedAnswers[currentIndex] !== undefined;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          background: 'linear-gradient(145deg, #0e1a38 0%, #070d1e 100%)',
          border: '1px solid rgba(0, 242, 254, 0.35)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(0, 242, 254, 0.15)',
          padding: '32px',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={submitting}
          style={{
            position: 'absolute',
            top: '22px',
            right: '22px',
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '8px'
          }}
        >
          <X size={20} />
        </button>

        {/* LOADING STATE */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: '#00f2fe' }}>
              <RefreshCw size={28} className="spin-anim" />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: '0 0 8px 0' }}>
              Querying Ollama (Gemma 3)...
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto', lineHeight: '1.5' }}>
              Generating 5 real-time diagnostic questions for <strong style={{ color: '#00f2fe' }}>"{currentTopic}"</strong> directly from local AI. Zero pre-stored questions.
            </p>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && errorMessage && (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#f87171' }}>
              <XCircle size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              Generation Notice
            </h3>
            <p style={{ color: '#f87171', fontSize: '0.88rem', marginBottom: '20px' }}>{errorMessage}</p>
            <button
              onClick={onClose}
              style={{ padding: '10px 20px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.08)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
            >
              Close
            </button>
          </div>
        )}

        {/* RESULTS SCORECARD STATE */}
        {!loading && !errorMessage && isCompleted && results && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: results.percentage >= 70 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', border: `1px solid ${results.percentage >= 70 ? '#10b981' : '#f59e0b'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: results.percentage >= 70 ? '#10b981' : '#f59e0b' }}>
              <Award size={36} />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', background: 'rgba(0, 242, 254, 0.1)', color: '#00f2fe', fontSize: '0.78rem', fontWeight: 600, marginBottom: '8px' }}>
              <Cpu size={13} />
              <span>Gemma 3 Diagnostic Complete</span>
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
              {results.percentage >= 70 ? '🎉 Concept Mastered!' : '🎯 Diagnostic Evaluation Complete'}
            </h2>

            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: results.percentage >= 70 ? '#10b981' : '#f59e0b', margin: '10px 0' }}>
              {results.correctCount} / {results.total} ({results.percentage}%)
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.5', maxWidth: '480px', margin: '0 auto 24px auto' }}>
              {results.feedback}
            </p>

            {/* Question Breakdown list */}
            <div style={{ maxHeight: '220px', overflowY: 'auto', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', paddingRight: '6px' }}>
              {questions.map((q, idx) => {
                const isCorrect = Number(selectedAnswers[idx]) === Number(q.correctIndex);
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                      fontSize: '0.85rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: '#fff' }}>Q{idx + 1}: {q.question}</span>
                      <span style={{ color: isCorrect ? '#10b981' : '#f87171', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                        {isCorrect ? '✓ Correct' : '✗ Missed'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{q.explanation}</div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #00f2fe 0%, #3b82f6 100%)',
                border: 'none',
                color: '#060b18',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0, 242, 254, 0.3)'
              }}
            >
              Apply Score & Return to Chat
            </button>
          </div>
        )}

        {/* ACTIVE QUESTION STEPPER */}
        {!loading && !errorMessage && !isCompleted && currentQ && (
          <div>
            {/* Header / Progress bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.82rem', padding: '3px 10px', borderRadius: '12px', background: 'rgba(0, 242, 254, 0.12)', color: '#00f2fe', fontWeight: 700 }}>
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>• {currentTopic}</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Generated via Gemma 3</span>
            </div>

            {/* Progress track */}
            <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden', marginBottom: '22px' }}>
              <div
                style={{
                  width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #00f2fe, #3b82f6)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>

            {/* Question Text */}
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', lineHeight: '1.45', margin: '0 0 20px 0' }}>
              {currentQ.question}
            </h3>

            {/* Options list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = selectedAnswers[currentIndex] === oIdx;
                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => handleSelectOption(oIdx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: isSelected ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isSelected ? '#00f2fe' : 'rgba(255, 255, 255, 0.08)'}`,
                      color: isSelected ? '#fff' : '#cbd5e1',
                      fontSize: '0.9rem',
                      fontWeight: isSelected ? 600 : 400,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    <span
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: isSelected ? '#00f2fe' : 'rgba(255, 255, 255, 0.06)',
                        color: isSelected ? '#060b18' : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        flexShrink: 0
                      }}
                    >
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span style={{ flex: 1 }}>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={onClose}
                style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Exit Assessment
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!isAnswered || submitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  background: isAnswered ? 'linear-gradient(135deg, #00f2fe 0%, #3b82f6 100%)' : 'rgba(255, 255, 255, 0.06)',
                  border: 'none',
                  color: isAnswered ? '#060b18' : '#64748b',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: isAnswered ? 'pointer' : 'not-allowed',
                  boxShadow: isAnswered ? '0 4px 14px rgba(0, 242, 254, 0.25)' : 'none'
                }}
              >
                <span>{currentIndex === questions.length - 1 ? (submitting ? 'Evaluating...' : 'Submit & Calculate Score') : 'Next Question'}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
