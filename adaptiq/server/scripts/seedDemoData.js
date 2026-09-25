/**
 * Seed Demo Data Script for AdaptIQ
 * Resets demo state to 35% Recursion error (Unwinding Amnesia),
 * perfectly configured for live judging and interactive demos!
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Student = require('../models/Student');
const TeachingProfile = require('../models/TeachingProfile');
const Session = require('../models/Session');
const Interaction = require('../models/Interaction');

const seedData = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/adaptiq';
  console.log('🌱 Starting AdaptIQ Demo State Seeding...');

  try {
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 4000 });
    console.log('Connected to MongoDB.');

    // Clear existing demo records
    await Student.deleteMany({});
    await TeachingProfile.deleteMany({});
    await Session.deleteMany({});
    await Interaction.deleteMany({});

    // 1. Create Demo Student
    const student = await Student.create({
      _id: new mongoose.Types.ObjectId('65f000000000000000000001'),
      name: 'Aarav Sharma',
      email: 'aarav.sharma@kalasala.edu',
      gradeLevel: 'Undergraduate CS - Year 2',
      currentTopicId: 'recursion-foundations',
      overallMastery: 35,
      activeMisconceptions: [
        {
          tag: 'unwinding_amnesia',
          topicId: 'recursion-foundations',
          detectedAt: new Date(),
          resolved: false
        }
      ]
    });
    console.log(`✅ Demo Student created: ${student.name} (${student._id})`);

    // 2. Create Teaching Profile with 35% Visual-bias
    const profile = await TeachingProfile.create({
      studentId: student._id,
      dna: {
        socratic: 15,
        analogical: 25,
        firstPrinciples: 15,
        visual: 35, // Emphasized visual stack breakdown
        codeExecution: 10
      },
      strategyRewards: {
        socratic: { attempts: 2, totalReward: 0.8 },
        analogical: { attempts: 3, totalReward: 1.8 },
        firstPrinciples: { attempts: 2, totalReward: 0.6 },
        visual: { attempts: 4, totalReward: 3.2 },
        codeExecution: { attempts: 1, totalReward: 0.4 }
      },
      cognitiveLoad: 58,
      learningPace: 'steady'
    });
    console.log('✅ Demo Teaching Profile & DNA initialized (Visual bias: 35%).');

    // 3. Create Active Session at 35% Score
    const session = await Session.create({
      _id: new mongoose.Types.ObjectId('65f000000000000000000002'),
      studentId: student._id,
      topicId: 'recursion-foundations',
      title: 'Recursion Call Stacks & Return Flow',
      status: 'active',
      currentScore: 35, // Demo Seed: 35% Recursion Error
      dominantStrategy: 'visual',
      totalInteractions: 1,
      startedAt: new Date()
    });
    console.log(`✅ Demo Session created with 35% baseline score (${session._id})`);

    // 4. Create Initial Interaction showing the Misconception
    await Interaction.create({
      sessionId: session._id,
      studentId: student._id,
      topicId: 'recursion-foundations',
      studentPrompt: 'I ran factorial(3), and it returned 1 because factorial(1) hits the base case. Then the program stops right?',
      diagnosis: {
        understandingScore: 35,
        misconceptionDetected: true,
        misconceptionKey: 'unwinding_amnesia',
        diagnosisSummary: 'Student displays "Unwinding Amnesia": assuming execution halts once base case returns 1, forgetting suspended stack frames must resume.',
        confidenceScore: 0.94
      },
      strategyUsed: 'visual',
      dnaSnapshot: profile.dna,
      tutorResponse: {
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
        codeSnippet: `function factorial(n) {\n  if (n <= 1) return 1; // Base case returns 1\n  return n * factorial(n - 1); // Pauses here until child call resolves!\n}`,
        socraticCheck: 'If Frame 1 returns 1, which frame wakes up first: factorial(2) or factorial(3)?',
        practicePrompt: {
          question: 'What is the exact value received by the paused factorial(3) call when its child factorial(2) finishes unwinding?',
          options: ['1', '2', '6', 'undefined'],
          correctIndex: 1,
          hint: 'Remember: factorial(2) evaluates 2 * 1 before passing its result up.'
        }
      },
      modelSource: 'heuristic-engine',
      createdAt: new Date()
    });
    console.log('✅ Demo Interaction record seeded.');

    console.log('\n🎯 DEMO STATE SEEDED SUCCESSFULLY!');
    console.log('Student is primed at 35% Recursion error with Unwinding Amnesia.');
    console.log('Live demo is ready to show the student submitting:');
    console.log('"Oh! So factorial(2) wakes up and multiplies 2 * 1 to get 2, then passes 2 up to factorial(3)!"');
    console.log('...and watch the gauge jump from 35% to 85%+ with dynamic DNA adaptation!\n');

    process.exit(0);
  } catch (err) {
    console.warn(`⚠️  MongoDB Seed warning: ${err.message}`);
    console.log('💡 In-memory fallback state is already pre-configured to this exact 35% Recursion demo baseline.');
    process.exit(0);
  }
};

seedData();
