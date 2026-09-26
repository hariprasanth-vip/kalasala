import React, { useState } from 'react';
import { Sparkles, Paperclip, Send, Mic } from 'lucide-react';
import { useTutor } from '../context/TutorContext';

export default function ResponseInput() {
  const { handleStudentResponse, isAnalyzing, launchAssessment, selectedTopic } = useTutor();
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isAnalyzing) return;
    const textToSend = inputText.trim();
    setInputText('');
    handleStudentResponse(textToSend);
  };

  const handleQuickChip = (chipText) => {
    setInputText(chipText);
  };

  return (
    <div className="response-input-container">
      {/* Quick Demo Guidance Chips */}
      <div className="quick-chips-row">
        <button
          type="button"
          className="demo-chip assessment-chip"
          onClick={() => launchAssessment(selectedTopic)}
          style={{
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.22), rgba(168, 85, 247, 0.22))',
            border: '1px solid #00f2fe',
            color: '#00f2fe',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
          title="Ask Ollama to generate 5 real-time diagnostic questions"
        >
          <span>📝 Take 5-Q Diagnostic Quiz (Ollama)</span>
        </button>

        {selectedTopic && selectedTopic !== 'General Learning' && (
          <span style={{
            fontSize: '0.8rem',
            color: '#94a3b8',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00f2fe' }}></span>
            Topic: <strong style={{ color: '#f1f5f9' }}>{selectedTopic}</strong>
          </span>
        )}
      </div>

      {/* Main Input Bar */}
      <form onSubmit={handleSubmit} className="input-bar-form">
        <div className="input-bar-wrapper">
          <div className="sparkle-icon-wrap">
            <Sparkles size={18} className="sparkle-blue" />
          </div>

          <input
            type="text"
            className="student-text-input"
            placeholder="Ask a question or share your response..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isAnalyzing}
          />

          <div className="input-actions-right">
            <button
              type="button"
              className="icon-action-btn"
              title="Attach code snippet or file"
            >
              <Paperclip size={18} />
            </button>
            <button
              type="submit"
              className={`send-button-glow ${isAnalyzing || !inputText.trim() ? 'disabled' : ''}`}
              disabled={isAnalyzing || !inputText.trim()}
              title="Submit response"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
