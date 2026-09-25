# 🧠 AdaptIQ — Adaptive Pedagogy & AI Tutoring Engine

> **"An AI Teacher That Learns From Its Student"**  
> Powered by **Gemma 3 (Ollama)**, **Google Gemini 2.5**, and **Adaptive Multi-Armed Bandit Pedagogy**.

---

## 🌟 Overview

Traditional AI tutors simply answer questions with static explanations. **AdaptIQ** is fundamentally different: it continuously analyzes student mental models in real-time, diagnoses latent misconceptions (such as *Unwinding Amnesia* or *Missing Base Cases* in recursion), and dynamically mutates its **Teaching DNA** to find the pedagogical strategy that unlocks the learner's understanding.

Instead of permanently labeling students (*e.g.*, *"You are a visual learner"*), AdaptIQ adopts an empirical philosophy: **"The system doesn't assume how the student learns. It discovers what works through interaction."**

---

## 🎯 Architecture & UI Cockpit

```
kalasala/
│
├── adaptiq/
│   │
│   ├── client/                          ← React + Vite frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Navbar.jsx           ← Brand header, status indicator & user profile
│   │   │   │   ├── Sidebar.jsx          ← Navigation & student profile progress
│   │   │   │   ├── LearningStage.jsx    ← Center adaptive card stream, code models & MCQs
│   │   │   │   ├── PedagogyInspector.jsx← Right-side AI Learning Monitor (Gauge, DNA, Win rates)
│   │   │   │   └── ResponseInput.jsx    ← Interactive student prompt bar with demo chips
│   │   │   ├── context/
│   │   │   │   └── TutorContext.jsx     ← Global reactive state for DNA, sessions & scores
│   │   │   ├── pages/
│   │   │   │   ├── SessionRoom.jsx      ← 3-column cockpit learning environment
│   │   │   │   └── Dashboard.jsx        ← Topic mastery & curriculum roadmap
│   │   │   ├── services/
│   │   │   │   └── api.js               ← Resilient API client with offline demo fallbacks
│   │   │   ├── App.jsx
│   │   │   ├── main.jsx
│   │   │   └── index.css                ← Modern futuristic dark cyber-glass design system
│   │   └── package.json
│   │
│   ├── server/                          ← Node + Express + MongoDB backend
│   │   ├── config/
│   │   │   └── database.js              ← MongoDB connection logic with auto-reconnect
│   │   ├── constants/
│   │   │   ├── systemPrompts.js         ← Gemma 3 / Gemini system instructions & JSON Schema
│   │   │   └── defaultCurriculum.js     ← Recursion, Trees & DSA curriculum bank
│   │   ├── controllers/
│   │   │   ├── aiController.js          ← Orchestrates diagnosis & adaptive content return
│   │   │   ├── studentController.js     ← Manages student profile & DNA stats
│   │   │   └── sessionController.js     ← Starts/stops learning chat sessions
│   │   ├── models/
│   │   │   ├── Student.js               ← Student identity & mastery records
│   │   │   ├── TeachingProfile.js       ← Stores dynamic Teaching DNA ratios
│   │   │   ├── Session.js               ← Active session state & scores
│   │   │   └── Interaction.js           ← Stores prompt, answer, score, misconception
│   │   ├── routes/
│   │   │   ├── aiRoutes.js              ← /api/tutor/diagnose, /api/tutor/respond
│   │   │   ├── studentRoutes.js         ← /api/student/:id/dna, curriculum
│   │   │   └── sessionRoutes.js         ← /api/sessions
│   │   ├── services/
│   │   │   ├── ollamaService.js         ← Local Gemma 3 integration via Ollama
│   │   │   ├── aiModelService.js        ← Unified model orchestrator (Gemma 3 → Gemini 2.5 → Groq)
│   │   │   ├── groqFallbackService.js   ← Ultra-fast backup & heuristic generator
│   │   │   ├── diagnosisService.js      ← Evaluates understanding score & misconceptions
│   │   │   └── strategyService.js       ← Multi-Armed Bandit (MAB) / DNA weight updates
│   │   ├── middleware/
│   │   │   └── errorHandler.js          ← Catches API timeouts & malformed requests
│   │   ├── scripts/
│   │   │   └── seedDemoData.js          ← Resets demo state to 35% Recursion error
│   │   ├── server.js                    ← Express entry point
│   │   ├── package.json
│   │   └── .env                         ← API keys & environment configs
│   │
│   ├── README.md
│   └── .gitignore
```

---

## ⚡ Right-Side Panel: "AI Learning Monitor"

The Right-Side panel is the core pedagogical window designed for judges and instructors:

1. **Understanding Radial Gauge**:
   - Live circular SVG gauge displaying current concept understanding (e.g. `37%`).
   - Automatically recalibrates after every student response turn.
2. **Misconception Card**:
   - `⚠ MISCONCEPTION: Missing Base Case`
   - Highlights: *"The student understands self-calling but thinks recursion must continue forever."*
   - Shows judges in real-time how the AI identifies cognitive barriers.
3. **Recommended Strategy & Rationale**:
   - `🎯 CURRENT STRATEGY: Analogy`
   - Dynamically details **why** the strategy was selected (*e.g., "Previous explanation was not effective"*).
4. **Teaching Strategy Performance**:
   - Dynamic win-rates and empirical trial metrics:
     - **Analogy**: 82% (3 attempts, 2 successful, Win rate: 67%)
     - **Visual**: 64% (5 attempts, 3 successful, Win rate: 60%)
     - **Example**: 71% (4 attempts, 3 successful, Win rate: 75%)
     - **Explanation**: 58% (4 attempts, 2 successful, Win rate: 50%)
     - **Practice**: 45% (3 attempts, 1 successful, Win rate: 33%)
5. **🧬 Teaching DNA**:
   - Real-time pedagogical weighting without labeling students permanently:
     - `💡 Best performing: Analogy (82%)`
     - `Learning preference: Adaptive`
     - `Confidence: Medium → High ↑`
     - Principle: `✅ Analogy strategy effectiveness: 82%`
6. **Learning Progress Sparkline**:
   - Continuous visual graph mapping cognitive growth across turns.

---

## 🚀 Quickstart & Live Demo Instructions

### 1. Backend Setup & Demo Seeding

```bash
cd adaptiq/server

# Install dependencies (already prepared)
npm install

# Seed the live demo state (resets student to 35% Recursion error)
npm run seed

# Start server
npm run dev
# Server runs on http://localhost:5000
```

### 2. Frontend Client Setup

```bash
cd adaptiq/client

# Start Vite development server
npm run dev
# Client runs on http://localhost:5173
```

### 3. Live Judging Walkthrough

1. Open `http://localhost:5173` in your browser.
2. Note the **AI Learning Monitor** on the right side:
   - Initial Understanding Gauge is at **37%**.
   - Misconception card flags **Missing Base Case**.
   - Current strategy adapted to **Analogy** (Russian nesting doll / elevator metaphor).
3. In the bottom prompt bar, click the glowing quick chip:
   > *"Oh! So factorial(2) wakes up, multiplies 2 \* 1 = 2, and passes 2 up to factorial(3)!"*
4. Click **Send** (`Enter`).
5. **Watch the live breakthrough**:
   - The pulse animation activates: `"ANALYZING RESPONSE & UPDATING TEACHING DNA..."`
   - The radial gauge jumps to **86%+**!
   - The misconception alert transforms into a green **"✓ CONCEPT RESOLVED"** badge!
   - Strategy performance and Teaching DNA adapt dynamically!

---

## 🤖 Multi-Model Orchestration (Gemma 3 & Beyond)

AdaptIQ features an enterprise-grade failover pipeline:
1. **Local Gemma 3** via Ollama (`http://127.0.0.1:11434` with model `gemma3`) for zero-latency, private offline inference.
2. **Google Gemini 2.5 Flash** for deep cognitive diagnosis and structured JSON schema compliance.
3. **Groq Llama-3.3-70B** for sub-second cloud fallback.
4. **Pedagogical Heuristic Engine** ensuring 100% offline resilience and zero demo crashes.
