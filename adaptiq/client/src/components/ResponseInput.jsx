import React, { useState } from 'react';
import { Sparkles, Paperclip, Send, Mic } from 'lucide-react';
import { useTutor } from '../context/TutorContext';

export default function ResponseInput() {
  const { handleStudentResponse, isAnalyzing } = useTutor();
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
        <span className="chips-label">Quick Prompts:</span>
        <button
          type="button"
          className="demo-chip misconception-chip"
          onClick={() =>
            handleQuickChip(
              "Networking concept puriyala. Diagram vechu explain panna easy-a irukku."
            )
          }
        >
          🌐 "Networking concept puriyala..."
        </button>
        <button
          type="button"
          className="demo-chip misconception-chip"
          onClick={() =>
            handleQuickChip(
              "Idhu thannai thaane mudive illama call pannitte irukkum (Recursion means calling itself forever)"
            )
          }
        >
          💡 "Idhu thannai thaane mudive illama call..."
        </button>
        <button
          type="button"
          className="demo-chip breakthrough-chip"
          onClick={() =>
            handleQuickChip(
              "Oru staircase-la ground floor thaan Base Case, ground floor reach aana udane stop aagi return aagum!"
            )
          }
        >
          ✨ "Staircase-la ground floor thaan Base Case..."
        </button>
        <button
          type="button"
          className="demo-chip"
          onClick={() =>
            handleQuickChip(
              "Vanakkam! Let's start learning computer networks today."
            )
          }
        >
          👋 "Vanakkam! Let's start learning..."
        </button>
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
