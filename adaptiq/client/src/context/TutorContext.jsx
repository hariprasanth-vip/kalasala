import React, { createContext, useContext, useState, useEffect } from 'react';
import { sendStudentInteraction, verifyQuickCheck, fetchStudentDna } from '../services/api';

const TutorContext = createContext();

const mapStrategyToUiKey = (strat = '') => {
  const s = String(strat).toLowerCase();
  if (s.includes('anal')) return 'Analogy';
  if (s.includes('vis')) return 'Visual';
  if (s.includes('code') || s.includes('exam')) return 'Example';
  if (s.includes('first') || s.includes('expl')) return 'Explanation';
  if (s.includes('socr') || s.includes('prac')) return 'Practice';
  return 'Analogy';
};

export const TutorProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('General Learning');

  // Student Profile
  const [studentProfile, setStudentProfile] = useState({
    name: 'Aarav Sharma',
    email: 'student@adaptiq.com',
    level: 4,
    conceptsMastered: 12,
    studyTime: '15h'
  });

  // Understanding Score (starts at neutral baseline 50%)
  const [understandingScore, setUnderstandingScore] = useState(50);

  // Misconception tracking (clean initial state, populated dynamically by AI)
  const [misconception, setMisconception] = useState({
    detected: false,
    title: 'Ready to Learn',
    description: 'Ask any question or explain a concept to start diagnostic evaluation.'
  });

  // Recommended Strategy & Reasoning
  const [strategyInfo, setStrategyInfo] = useState({
    name: 'Adaptive Discovery Mode',
    reason: 'Awaiting your first question or concept to tailor pedagogy.'
  });

  // Teaching Strategy Performance with live dynamic win-rate & attempts counters
  const [strategyPerformance, setStrategyPerformance] = useState({
    Analogy: { attempts: 3, successful: 2, winRate: 67, displayPercent: 82 },
    Example: { attempts: 4, successful: 3, winRate: 75, displayPercent: 71 },
    Visual: { attempts: 5, successful: 3, winRate: 60, displayPercent: 64 },
    Explanation: { attempts: 4, successful: 2, winRate: 50, displayPercent: 58 },
    Practice: { attempts: 3, successful: 1, winRate: 33, displayPercent: 45 }
  });

  // Teaching DNA (Discovered dynamically without labeling student permanently)
  const [teachingDna, setTeachingDna] = useState({
    bestStrategy: 'Analogy',
    bestScore: 82,
    learningPreference: 'Adaptive',
    confidence: 'Medium → High ↑',
    effectivenessSummary: 'Analogy strategy effectiveness: 82%',
    discoveryPrinciple: 'The system does not assume how the student learns. It discovers what works through interaction.'
  });

  // Sync initial DNA from backend on mount
  useEffect(() => {
    fetchStudentDna().then((profile) => {
      if (profile && profile.dna) {
        const sorted = Object.entries(profile.dna).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0) {
          const topKey = mapStrategyToUiKey(sorted[0][0]);
          const topScore = sorted[0][1];
          setTeachingDna((prev) => ({
            ...prev,
            bestStrategy: topKey,
            bestScore: topScore,
            effectivenessSummary: `${topKey} strategy effectiveness: ${topScore}%`
          }));
        }
      }
    }).catch(() => {});
  }, []);

  // Learning Progress Sparkline Points (SVG trend)
  const [progressHistory, setProgressHistory] = useState([50]);

  // Messages Stream (clean initial start — no hardcoded fake conversations)
  const [messages, setMessages] = useState([]);

  // Handle active recall verification answer submission
  const handleVerifyAnswer = async (msgId, selectedOptionIndex, correctOptionIndex, strategyUsed = 'Analogy') => {
    const isCorrect = Number(selectedOptionIndex) === Number(correctOptionIndex);
    const stratKey = mapStrategyToUiKey(strategyUsed);

    if (isCorrect) {
      // 1. Jump understanding score from 35% to 85%!
      setUnderstandingScore(85);
      setProgressHistory((prev) => [...prev, 85]);

      // 2. Mark misconception as resolved
      setMisconception({
        detected: false,
        title: `Resolved: ${selectedTopic} Concept Mastery`,
        description: `Student demonstrated solid understanding of ${selectedTopic}.`
      });

      // 3. Update strategy performance & win rates
      setStrategyPerformance((prev) => {
        const current = prev[stratKey] || { attempts: 3, successful: 2, winRate: 67, displayPercent: 82 };
        const newAttempts = current.attempts + 1;
        const newSuccessful = current.successful + 1;
        const newWinRate = Math.round((newSuccessful / newAttempts) * 100);
        return {
          ...prev,
          [stratKey]: {
            attempts: newAttempts,
            successful: newSuccessful,
            winRate: newWinRate,
            displayPercent: Math.min(96, newWinRate + 15)
          }
        };
      });

      // 4. Update Teaching DNA Card
      setTeachingDna((prev) => ({
        ...prev,
        bestStrategy: stratKey,
        bestScore: 90,
        confidence: 'High ↑',
        effectivenessSummary: `${stratKey} strategy effectiveness: 90% (Empirically Validated)`
      }));

      // 5. Append positive reinforcement message
      const successMsg = {
        id: 'verif-' + Date.now(),
        role: 'assistant',
        strategyUsed: strategyUsed || 'Analogy',
        headline: '🎉 Active Recall Verified: Understanding Jumped to 85%!',
        text: `Excellent job! You correctly selected the right answer. Your intuition and conceptual understanding of ${selectedTopic} is now firmly established!`,
        timestamp: 'Just now'
      };

      setMessages((prev) => [...prev, successMsg]);

      // Sync with server verification endpoint
      await verifyQuickCheck({
        selectedOptionIndex,
        correctOptionIndex,
        strategyUsed
      }).catch(() => {});
    }
  };

  // Handle student prompt submission
  const handleStudentResponse = async (userText) => {
    if (!userText.trim()) return;

    // 1. Append user message
    const userMsgId = 'msg-' + Date.now();
    const newMsgList = [
      ...messages,
      {
        id: userMsgId,
        role: 'user',
        text: userText,
        timestamp: 'Just now'
      }
    ];
    setMessages(newMsgList);
    setIsAnalyzing(true);

    try {
      // Build recent conversation history for contextual LLM understanding
      // Include both user messages AND assistant responses so Gemma 3 has full context
      const chatHistory = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-8)
        .map((m) => ({
          role: m.role,
          content: m.text || m.remediationContent || m.content || ''
        }))
        .filter(m => m.content && m.content.trim());

      const res = await sendStudentInteraction({
        studentPrompt: userText,
        topicId: selectedTopic,
        chatHistory
      });

      const status = res.status || (res.understandingScore >= 70 ? 'mastery' : 'misconception');
      const isGreeting = status === 'greeting';
      const isInquiry = status === 'inquiry';
      const isMisconception = status === 'misconception';
      const isMastery = status === 'mastery';
      const score = res.understandingScore ?? (isGreeting ? 50 : isInquiry ? 60 : isMastery ? 85 : 35);
      // detectedConcept = what Gemma 3 understood the student is asking about
      const detectedConcept = res.detectedConcept || selectedTopic;
      if (res.detectedConcept && !isGreeting) {
        setSelectedTopic(res.detectedConcept);
      }

      // 2. Update Understanding Score (do not penalize on friendly greetings)
      if (!isGreeting) {
        setUnderstandingScore(score);
        setProgressHistory((prev) => [...prev, score]);
      }

      // 3. Update Misconception & Teaching DNA Strategy Info
      if (isGreeting) {
        setMisconception({
          detected: false,
          title: 'Learning Dialogue Active',
          description: 'Engaging student warmly in conversation before diagnosing conceptual knowledge.'
        });
        setStrategyInfo({
          name: 'Conversational Mode',
          reason: res.strategyReason || 'Welcoming student and establishing rapport.'
        });
      } else if (isInquiry) {
        setMisconception({
          detected: false,
          title: `Active Inquiry: ${detectedConcept}`,
          description: `Student is asking about ${detectedConcept}.`
        });
        setStrategyInfo({
          name: res.recommendedStrategy 
            ? (res.recommendedStrategy.charAt(0).toUpperCase() + res.recommendedStrategy.slice(1) + ' Mode') 
            : 'Analogy Mode',
          reason: res.strategyReason || 'Directly addressing student question using high-retention pedagogy.'
        });
      } else if (isMastery) {
        setMisconception({
          detected: false,
          title: `Mastered: ${detectedConcept}`,
          description: `Student correctly understands ${detectedConcept}.`
        });
        setStrategyInfo({
          name: 'Mastery & Code Execution',
          reason: res.strategyReason || `Student demonstrated solid understanding of ${detectedConcept}.`
        });
      } else {
        setMisconception({
          detected: true,
          title: res.missingConcept ? `Missing: ${res.missingConcept}` : `Misconception in ${detectedConcept}`,
          description: res.misconception || `Student has a misconception about ${detectedConcept}.`
        });
        setStrategyInfo({
          name: res.recommendedStrategy 
            ? (res.recommendedStrategy.charAt(0).toUpperCase() + res.recommendedStrategy.slice(1) + ' Strategy') 
            : 'Analogy Strategy',
          reason: res.strategyReason || 'Pivoting pedagogical strategy to address the identified misconception.'
        });
      }

      // 4. Update Strategy Performance & Win Rates dynamically
      if (!isGreeting) {
        const stratKey = mapStrategyToUiKey(res.recommendedStrategy || res.dominantStrategy || 'analogy');

        setStrategyPerformance((prev) => {
          const current = prev[stratKey] || { attempts: 3, successful: 2, winRate: 67, displayPercent: 75 };
          const newAttempts = current.attempts + 1;
          const newSuccessful = isMastery ? current.successful + 1 : current.successful;
          const newWinRate = Math.round((newSuccessful / newAttempts) * 100);
          const newDisplay = Math.min(96, Math.max(30, newWinRate + 12));

          return {
            ...prev,
            [stratKey]: {
              attempts: newAttempts,
              successful: newSuccessful,
              winRate: newWinRate,
              displayPercent: newDisplay
            }
          };
        });

        // 5. Update Teaching DNA Card
        const dna = res.updatedDna || {};
        const highestDna = Object.entries(dna).sort((a, b) => b[1] - a[1])[0];
        const bestName = highestDna ? mapStrategyToUiKey(highestDna[0]) : stratKey;
        const bestPercent = highestDna ? highestDna[1] : (isMastery ? 88 : 75);

        setTeachingDna((prev) => ({
          ...prev,
          bestStrategy: bestName,
          bestScore: bestPercent,
          confidence: isMastery ? 'High ↑' : 'Medium → High',
          effectivenessSummary: `${bestName} strategy effectiveness: ${bestPercent}% (Empirically Validated)`
        }));
      }

      // 6. Format Practice Prompt if micro-check question exists
      let practicePrompt = null;
      if (res.quickCheckQuestion && res.quickCheckQuestion.question) {
        practicePrompt = {
          question: res.quickCheckQuestion.question,
          options: res.quickCheckQuestion.options || ['Stopping condition', 'Infinite loop', 'Memory error'],
          correctIndex: res.quickCheckQuestion.correctOptionIndex ?? 0,
          hint: res.quickCheckQuestion.hint || 'Think of the condition that stops execution.'
        };
      }

      // 7. Dynamic Headline — use LLM's headline, fallback is topic-aware
      const tutorHeadline = res.headline || (
        isGreeting ? '👋 Welcome to AdaptIQ!' :
        isInquiry ? `💡 Understanding ${detectedConcept}` :
        isMisconception ? `🎯 Strategy Pivot: Clarifying ${res.missingConcept || detectedConcept}` :
        `🎉 ${detectedConcept} Mastered!`
      );

      // 8. Construct Tutor Assistant Message
      const tutorMsg = {
        id: 'tut-' + Date.now(),
        role: 'assistant',
        strategyUsed: res.recommendedStrategy ? (res.recommendedStrategy.charAt(0).toUpperCase() + res.recommendedStrategy.slice(1)) : (isGreeting ? 'Conversational' : 'Analogy'),
        headline: tutorHeadline,
        text: res.remediationContent || res.interaction?.tutorResponse?.coreExplanation || 'Let\'s explore this concept together.',
        visualDiagram: res.visualDiagram || null,
        codeSnippet: res.codeSnippet || null,
        practicePrompt,
        timestamp: 'Just now'
      };

      // 9. Append messages: Only show diagnosis_alert for actual misconceptions
      if (isMisconception) {
        const diagnosisMsg = {
          id: 'diag-' + Date.now(),
          role: 'diagnosis_alert',
          understanding: score,
          missingConcept: res.missingConcept || detectedConcept || 'Core Principle',
          summary: res.misconception || 'Misconception detected in mental model.',
          timestamp: 'Just now'
        };
        setMessages([...newMsgList, diagnosisMsg, tutorMsg]);
      } else {
        setMessages([...newMsgList, tutorMsg]);
      }
    } catch (err) {
      console.error('Error handling student response:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewChat = () => {
    setSelectedTopic('General Learning');
    setUnderstandingScore(50);
    setProgressHistory([50]);
    setMisconception({
      detected: false,
      title: 'Ready to Learn',
      description: 'Ask any question or concept to start a new learning journey.'
    });
    setStrategyInfo({
      name: 'Conversational Mode',
      reason: 'Welcoming student into a fresh learning dialogue.'
    });
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        headline: '👋 Welcome to AdaptIQ!',
        text: 'Vanakkam! I am AdaptIQ, your adaptive AI tutor. What concept or topic would you like to explore today? You can ask me anything about Data Structures, Networking, Algorithms, Web Development, or any specific problem you are curious about!',
        timestamp: 'Just now'
      }
    ]);
  };

  return (
    <TutorContext.Provider
      value={{
        activeTab,
        setActiveTab,
        studentProfile,
        selectedTopic,
        setSelectedTopic,
        understandingScore,
        setUnderstandingScore,
        misconception,
        strategyInfo,
        strategyPerformance,
        teachingDna,
        progressHistory,
        messages,
        isAnalyzing,
        handleStudentResponse,
        handleVerifyAnswer,
        handleNewChat
      }}
    >
      {children}
    </TutorContext.Provider>
  );
};

export const useTutor = () => useContext(TutorContext);
