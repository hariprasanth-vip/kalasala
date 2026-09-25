/**
 * Default Curriculum Definition for AdaptIQ
 * Focus topics: Recursion & Binary Trees
 */

const defaultCurriculum = [
  {
    topicId: 'recursion-foundations',
    name: 'Recursion Foundations',
    category: 'Algorithms & Data Structures',
    difficulty: 'Intermediate',
    description: 'Master recursive decomposition, base cases, call stacks, and visualization of self-referential functions.',
    milestones: [
      {
        id: 'rec-1',
        title: 'Anatomy of Recursion: Base vs Recursive Case',
        description: 'Understand the stopping condition and the step reducing problem size.',
        completed: true,
        masteryScore: 85
      },
      {
        id: 'rec-2',
        title: 'Call Stack Visualization & Stack Frames',
        description: 'Trace memory frames during winding and unwinding phases.',
        completed: false,
        masteryScore: 35 // Demo seed: 35% error rate on stack frame comprehension
      },
      {
        id: 'rec-3',
        title: 'Recursion with Accumulators & Return Values',
        description: 'How return values bubble up from leaf frames.',
        completed: false,
        masteryScore: 20
      },
      {
        id: 'rec-4',
        title: 'Tree Recursion & Branching',
        description: 'Handling multiple self-calls per frame (Fibonacci, Permutations).',
        completed: false,
        masteryScore: 0
      }
    ],
    knownMisconceptions: [
      {
        tag: 'missing_base_case',
        name: 'Infinite Stack Overflow / Missing Base Condition',
        cue: 'Student assumes the function knows when to terminate without explicit condition.'
      },
      {
        tag: 'unwinding_amnesia',
        name: 'Ignoring the Unwinding / Return Phase',
        cue: 'Student believes work stops immediately when base case is hit, forgetting paused frames must resume and return.'
      },
      {
        tag: 'state_mutation_confusion',
        name: 'Assuming Local Variables Persist Across Frames',
        cue: 'Student confuses separate stack frame scopes with a single mutable global variable.'
      }
    ],
    initialChallenge: {
      prompt: "Explain what happens in memory when `factorial(3)` executes. Specifically, what happens after `factorial(1)` returns 1?",
      targetConcept: "Stack frame unwinding and multiplication on return",
      codeSnippet: `function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}`
    },
    practiceBank: [
      {
        id: 'mcq-rec-1',
        question: 'When `factorial(3)` reaches `factorial(1)` returning 1, what is the next step the CPU takes?',
        options: [
          'The entire program terminates and prints 1',
          'It resumes the paused frame for n=2 and calculates 2 * 1 = 2',
          'It re-runs factorial(3) from the beginning',
          'It allocates a brand new stack frame for n=0'
        ],
        correctIndex: 1,
        explanation: 'Stack frames unwind in LIFO (Last-In, First-Out) order. Factorial(2) was waiting for the result of factorial(1), so it resumes and evaluates 2 * 1.'
      },
      {
        id: 'mcq-rec-2',
        question: 'Which of the following will happen if a recursive function lacks a base case?',
        options: [
          'It returns null immediately',
          'The compiler will optimize it into a loop automatically',
          'Stack Overflow Exception / Maximum call stack exceeded',
          'It evaluates to Infinity without error'
        ],
        correctIndex: 2,
        explanation: 'Without a base case, calls keep allocating frames until available stack memory is exhausted.'
      }
    ]
  },
  {
    topicId: 'binary-trees-traversal',
    name: 'Binary Trees & Traversals',
    category: 'Algorithms & Data Structures',
    difficulty: 'Intermediate',
    description: 'Explore hierarchical structures, pre-order, in-order, and post-order depth-first traversals.',
    milestones: [
      {
        id: 'tree-1',
        title: 'Tree Nodes, Roots, and Leaf Anatomy',
        description: 'Grasping node pointer links and subtree abstractions.',
        completed: false,
        masteryScore: 40
      },
      {
        id: 'tree-2',
        title: 'DFS Traversals: Pre, In, and Post-Order',
        description: 'Comparing visit order vs traversal order.',
        completed: false,
        masteryScore: 10
      },
      {
        id: 'tree-3',
        title: 'Binary Search Tree (BST) Invariant',
        description: 'Left < Root < Right properties and searching in O(log n).',
        completed: false,
        masteryScore: 0
      }
    ],
    knownMisconceptions: [
      {
        tag: 'bst_local_vs_global_invariant',
        name: 'Local vs Global BST Property',
        cue: 'Student checks left < node < right only on immediate parent-child rather than entire subtrees.'
      }
    ],
    initialChallenge: {
      prompt: "In an In-Order traversal of a Binary Search Tree, what property will the output sequence always exhibit?",
      targetConcept: "In-order traversal of BST yields sorted keys",
      codeSnippet: `function inOrder(node) {\n  if (!node) return;\n  inOrder(node.left);\n  console.log(node.val);\n  inOrder(node.right);\n}`
    },
    practiceBank: [
      {
        id: 'mcq-tree-1',
        question: 'What is the output ordering when doing an In-Order traversal on a valid Binary Search Tree?',
        options: [
          'Decreasing order',
          'Strictly non-decreasing (sorted) order',
          'Breadth-first layer by layer',
          'Random order depending on memory layout'
        ],
        correctIndex: 1,
        explanation: 'Because In-Order traverses Left subtree (all smaller) -> Root -> Right subtree (all larger), it naturally yields sorted order.'
      }
    ]
  }
];

module.exports = {
  defaultCurriculum
};
