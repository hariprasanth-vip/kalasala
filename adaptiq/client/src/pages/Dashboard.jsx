import React from 'react';
import { Brain, Sparkles, BookOpen, Award, ArrowRight } from 'lucide-react';
import { useTutor } from '../context/TutorContext';

export default function Dashboard() {
  const { studentProfile, setActiveTab, understandingScore } = useTutor();

  const topics = [
    {
      id: 'recursion-foundations',
      title: 'Recursion Foundations',
      description: 'Master base cases, stack frames, and return value unwinding.',
      progress: understandingScore,
      status: 'In Progress'
    },
    {
      id: 'binary-trees-traversal',
      title: 'Binary Trees & Traversals',
      description: 'Understand DFS, Pre/In/Post order traversals, and BST invariants.',
      progress: 25,
      status: 'Upcoming'
    },
    {
      id: 'dynamic-programming',
      title: 'Dynamic Programming Memoization',
      description: 'Overlapping subproblems, state caching, and bottom-up tabulation.',
      progress: 10,
      status: 'Locked'
    }
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1 className="dash-title">Welcome back, {studentProfile.name.split(' ')[0]} 👋</h1>
        <p className="dash-subtitle">
          Your adaptive AI tutor is ready to diagnose and accelerate your learning journey.
        </p>
      </div>

      <div className="topics-grid">
        {topics.map((t) => (
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

            <button
              className="btn-launch-topic"
              onClick={() => setActiveTab('chat')}
            >
              <span>Resume Session</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
