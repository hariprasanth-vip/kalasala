/**
 * Groq Fallback Service
 * Provides sub-second ultra-fast inference backup when Gemini rate limits or latency thresholds are exceeded.
 */

const callGroqTutor = async (prompt, systemPrompt, strategy = 'visual') => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured.');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Groq API HTTP ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
};

const generateHeuristicTutorResponse = (strategy, promptText = '') => {
  const isRecursion = /recursion|factorial|stack|return/i.test(promptText);

  if (strategy === 'visual') {
    return {
      strategyUsed: 'visual',
      headline: 'Visualizing the Call Stack: The Winding & Unwinding Journey',
      coreExplanation: 'Recursion is not a single loop; it is a stack of frozen moments. Every time factorial(n) invokes factorial(n - 1), the active function pauses mid-sentence and places an activation frame onto the execution stack. When factorial(1) hits the base case, it doesn’t end the story—it begins the return descent.',
      visualDiagram: `
┌──────────────────────────────────────────────┐
│ [Frame 3] factorial(3)  PAUSED waiting for n=2 │
│   └─ returns: 3 * [waiting for factorial(2)]  │
├──────────────────────────────────────────────┤
│ [Frame 2] factorial(2)  PAUSED waiting for n=1 │
│   └─ returns: 2 * [waiting for factorial(1)]  │
├──────────────────────────────────────────────┤
│ [Frame 1] factorial(1)  ACTIVE BASE CASE      │
│   └─ returns: 1  ──────┐                      │
└────────────────────────│─────────────────────┘
                         ▼
             UNWINDING RESOLUTION:
             Frame 2 resumes: 2 * 1 = 2
             Frame 3 resumes: 3 * 2 = 6!
      `.trim(),
      analogyMetaphor: 'Think of cafeteria lunch trays being stacked one on top of another. You can only wash the tray on the very top before you can reach the trays underneath.',
      codeSnippet: `function factorial(n) {\n  if (n <= 1) return 1; // Base case: returns 1 up the ladder\n  return n * factorial(n - 1); // Pauses here until child call resolves!\n}`,
      socraticCheck: 'If Frame 1 returns 1, which frame wakes up first: factorial(2) or factorial(3)?',
      practicePrompt: {
        question: 'What is the exact value received by the paused factorial(3) call when its child factorial(2) finishes unwinding?',
        options: ['1', '2', '6', 'undefined'],
        correctIndex: 1,
        hint: 'Remember: factorial(2) evaluates 2 * 1 before passing its result up.'
      }
    };
  }

  if (strategy === 'analogical') {
    return {
      strategyUsed: 'analogical',
      headline: 'The Matryoshka Nesting Doll Principle',
      coreExplanation: 'Imagine you have a giant Russian nesting doll labeled "n=3". To inspect it, you must open it to find a doll inside labeled "n=2", and inside that, a solid wooden pebble "n=1". The pebble is the base case—you cannot open it any further. But you cannot leave the dolls open on the table! You must snap the inner doll shut, hand its height to the middle doll, and seal them up.',
      visualDiagram: `[Doll 3: ?] ──opens──> [Doll 2: ?] ──opens──> [Doll 1: 1 (Solid Pebble)]
                                                          │
[Final Size: 6] <──snaps── [Size: 2*1=2] <──passes 1──────┘`,
      analogyMetaphor: 'A chain of delegated messengers who each wait in an anteroom until their apprentice returns with an envelope.',
      codeSnippet: `// Each nested doll waits for its inner doll's answer\nconst size = doll(3); // waits for doll(2)\n// doll(2) waits for doll(1) -> returns 1\n// doll(2) computes 2 * 1 -> returns 2\n// doll(3) computes 3 * 2 -> returns 6`,
      socraticCheck: 'Why can’t you seal the outermost doll before the inner doll is put back inside?',
      practicePrompt: {
        question: 'In the doll analogy, what does the solid wooden pebble represent?',
        options: ['An infinite loop', 'The Base Case stopping condition', 'A memory leak', 'The main program argument'],
        correctIndex: 1,
        hint: 'It is the doll that cannot be opened any further.'
      }
    };
  }

  // Default socratic / first-principles
  return {
    strategyUsed: strategy || 'socratic',
    headline: 'Socratic Inquiry: The Anatomy of Return Flow',
    coreExplanation: 'Let’s examine what happens at the exact boundary of execution. When a function reaches a `return` statement, control is transferred back to the exact instruction pointer where it was invoked. In `return n * factorial(n - 1)`, notice the multiplication operator `*` is waiting.',
    visualDiagram: `Call Step:  f(3) -> f(2) -> f(1) [Base Case Hit]\nUnwind Step: f(1) returns 1 -> f(2) calculates 2*1=2 -> f(3) calculates 3*2=6`,
    analogyMetaphor: 'A bookmark in a mystery novel while you flip to the glossary to look up an ancient word.',
    codeSnippet: `// Notice the multiplication cannot happen until the call finishes\nreturn n * factorial(n - 1);`,
    socraticCheck: 'Can the CPU perform `n * ...` before `factorial(n - 1)` has yielded a concrete number?',
    practicePrompt: {
      question: 'Why does the multiplication in `return n * factorial(n-1)` happen AFTER the recursive call instead of before?',
      options: [
        'Because JavaScript evaluates operations from right to left always',
        'Because one operand is the return value of an unfinished function call',
        'Because base cases override arithmetic precedence',
        'Because the compiler defers all multiplication to the end of the script'
      ],
      correctIndex: 1,
      hint: 'You cannot multiply by a number that has not yet been computed!'
    }
  };
};

module.exports = {
  callGroqTutor,
  generateHeuristicTutorResponse
};
