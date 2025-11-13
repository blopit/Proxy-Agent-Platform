# 🧩 Task-Splitting System Design (Auto-Chunker)

## Overview

A comprehensive design for implementing an ADHD-first task-splitting system that breaks down large, fuzzy goals into 2-5 minute actionable micro-steps with intelligent delegation capabilities.

## 🎯 Core Concept

**Visual Metaphor:** Task as a tree
- **Trunk** = main goal ("Launch new website")
- **Branches** = 3-7 medium steps ("Design", "Write copy", "Deploy")
- **Twigs** = 2-5 min micro-steps ("Open Figma", "Sketch header", "Create folder /website")

## 🧠 Core Algorithm

### 1. Intent Detection
Parse natural language task → extract *verb*, *object*, *context*
- Example: "Email client about invoice" → verb: *email*, object: *client*, context: *finance*

### 2. Scope Estimation
Use token count + semantic embeddings to classify as:
- **Simple** (≤ 1 action)
- **Multi-step** (2-7 actions)
- **Project** (> 7 actions)

### 3. Tree Expansion
- If multi-step → generate 3-7 sub-steps via LLM prompt
- If project → create thematic clusters and spawn subtasks recursively

### 4. Micro-Step Slicer
Each sub-step → chunked into 2-5 minute actions
- Pattern: [Verb + Object + Constraint]
- Label each twig with:
  - 🧍 Do Now
  - 🤝 Do with Me
  - 🤖 Delegate to Agent
  - 🗑 Delete / Defer

### 5. Delegation Engine
Detect automatable tasks via keyword + tool mapping → pass to UnifiedAgent

## 🧾 Product Requirements Document (PRD)

### User Stories
- **As an ADHD user**, when I add a vague task, I want the system to show me one tiny step I can do right now
- **As a busy user**, I want digital tasks to be auto-delegated to agents
- **As a reflective user**, I want to see progress and earn XP as I finish micro-steps

### Functional Requirements

| Module | Description |
|--------|-------------|
| **Parser** | NLP layer extracting verbs, objects, context |
| **Scope Classifier** | Estimate task size and decide whether to split |
| **Splitter Engine** | Generate 3-7 sub-tasks, then micro-steps (2-5 min) |
| **Delegation Detector** | Identify automatable twigs (email, research, schedule) |
| **ADHD Mode View** | Show only one micro-step + 5 min Rescue timer |
| **XP Integration** | Award XP/streaks for each micro-step |
| **Seed Manager** | Store successful splits for deterministic re-use |

### Non-Functional Requirements
- **Latency:** < 2s per split operation
- **Explainability:** Display reasoning for splits
- **Privacy:** Local store for sensitive context
- **Accessibility:** Voice input + Siri/Assistant shortcuts

### UI Flow
1. User adds task → Quick Capture
2. AI shows split preview (tree or list)
3. User taps "Slice → 2-5m"
4. One micro-step appears in Focus panel
5. User can tap "Delegate" to send to Agent
6. Completion → XP + next twig auto-loads

## 📊 Data Model

```typescript
Task {
  id: string
  title: string
  description: string
  context: string
  priority: "low"|"medium"|"high"
  scope: "simple"|"multi"|"project"
  subtasks: SubTask[]
}

SubTask {
  id: string
  parentId: string
  title: string
  microSteps: MicroStep[]
}

MicroStep {
  id: string
  parentId: string
  action: string
  duration_est: number // minutes
  mode: "do"|"do_with_me"|"delegate"|"delete"
  delegated_to?: string // agent id
  xp_value: number
}
```

## 🏗️ Architecture

- **Frontend:** React + Next.js + Tailwind
- **Backend:** FastAPI + PydanticAI + Postgres
- **Memory:** Mem0 + Qdrant vector store
- **Agents:** Task, Focus, Energy, Progress, Gamification
- **New Component:** Split Proxy (micro-step engine)

## 📈 Success Metrics

| Metric | Target |
|--------|--------|
| Avg. time to first action | < 60s |
| % tasks delegated | > 20% |
| Avg. micro-step completion rate | > 70% |
| Subjective focus improvement | +30% |

## 🚀 Future Enhancements

- Auto-chunk from calendar events
- Smart recovery: suggest easiest next twig after break
- Gamified streaks: "Split 10 tasks today = +100 XP"
- Voice-to-Split: verbal input → instant micro-steps

## 🎯 Goals

- **Reduce task paralysis** → auto-convert vague tasks into concrete 2-5 min steps
- **Enable delegation** → flag micro-steps for digital agent execution
- **Visual clarity** → show only one micro-step at a time in ADHD mode
- **Feedback loop** → reward completion with XP and dopamine hits
