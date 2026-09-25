/**
 * Strategy Service: Multi-Armed Bandit (MAB) & Dynamic Teaching DNA Engine
 * Adapts pedagogical ratios based on student feedback, response scores, and cognitive barriers.
 */

const DEFAULT_DNA = {
  analogy: 35, // High initial win rate for intuitive metaphors
  visual: 25,
  codeExecution: 20,
  socratic: 10,
  firstPrinciples: 10
};

// Normalization map for strategy keys
const normalizeStrategyKey = (key = '') => {
  const lower = String(key).toLowerCase().replace(/[^a-z]/g, '');
  if (lower.includes('analog')) return 'analogy';
  if (lower.includes('vis')) return 'visual';
  if (lower.includes('code') || lower.includes('exec') || lower.includes('counter')) return 'codeExecution';
  if (lower.includes('socr')) return 'socratic';
  if (lower.includes('first') || lower.includes('princ')) return 'firstPrinciples';
  return 'analogy';
};

/**
 * Upper Confidence Bound (UCB1) selection to choose next dominant strategy
 */
const selectOptimalStrategy = (teachingProfile) => {
  const rewards = teachingProfile?.strategyRewards || {};
  const strategies = ['analogy', 'visual', 'codeExecution', 'socratic', 'firstPrinciples'];
  
  const totalTrials = strategies.reduce((sum, key) => sum + (rewards[key]?.attempts || 1), 0);

  let bestStrategy = 'analogy';
  let bestScore = -Infinity;

  for (const strat of strategies) {
    const stat = rewards[strat] || { attempts: 1, totalReward: 0.6 };
    const avgReward = stat.totalReward / (stat.attempts || 1);
    
    // UCB formula: Q(a) + c * sqrt(ln(N) / N(a))
    const explorationBonus = Math.sqrt((2 * Math.log(totalTrials + 1)) / (stat.attempts || 1));
    const ucbScore = avgReward + 0.35 * explorationBonus;

    if (ucbScore > bestScore) {
      bestScore = ucbScore;
      bestStrategy = strat;
    }
  }

  return bestStrategy;
};

/**
 * Updates Teaching DNA weights dynamically based on score delta & misconception resolution
 */
const updateTeachingDna = (currentDna = DEFAULT_DNA, rawStrategy, scoreDelta, misconceptionDetected) => {
  const activeStrategy = normalizeStrategyKey(rawStrategy);
  const updated = {
    analogy: currentDna.analogy ?? currentDna.analogical ?? 35,
    visual: currentDna.visual ?? 25,
    codeExecution: currentDna.codeExecution ?? 20,
    socratic: currentDna.socratic ?? 10,
    firstPrinciples: currentDna.firstPrinciples ?? 10
  };
  
  let reward = 0.5;
  if (scoreDelta > 15) reward = 0.95;
  else if (scoreDelta > 5) reward = 0.75;
  else if (scoreDelta < -10) reward = 0.2;
  else if (misconceptionDetected) {
    reward = 0.4;
  }

  const boost = (reward - 0.5) * 15;
  updated[activeStrategy] = Math.max(5, (updated[activeStrategy] || 20) + boost);

  // If student has a cognitive blocker, boost analogy and visual cues
  if (misconceptionDetected) {
    updated.analogy = Math.min(55, updated.analogy + 8);
    updated.visual = Math.min(45, updated.visual + 6);
    updated.firstPrinciples = Math.max(5, updated.firstPrinciples - 5);
  }

  // Normalize all 5 dimensions to sum to 100%
  const total = Object.values(updated).reduce((acc, val) => acc + val, 0);
  for (const key of Object.keys(updated)) {
    updated[key] = Math.round((updated[key] / total) * 100);
  }

  const diff = 100 - Object.values(updated).reduce((a, b) => a + b, 0);
  updated[activeStrategy] = Math.max(0, updated[activeStrategy] + diff);

  return {
    dna: updated,
    reward,
    dominantStrategy: Object.keys(updated).reduce((a, b) => updated[a] > updated[b] ? a : b)
  };
};

module.exports = {
  DEFAULT_DNA,
  normalizeStrategyKey,
  selectOptimalStrategy,
  updateTeachingDna
};
