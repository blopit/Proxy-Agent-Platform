# 📸 Capture Tab Workflow - Visual Documentation

## 🎯 Overview

This document provides a complete visual and systematic breakdown of how the Capture tab transforms natural language input into structured Task objects with optional clarification flows.

---

## 🔄 Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER ENTERS TASK                                  │
│  "Schedule meeting with Sara next week and send her the project docs"   │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Toggle Check:        │
                    │  - auto_mode: true    │
                    │  - ask_for_clarity: ? │
                    └───────────┬───────────┘
                                │
                ┌───────────────┴────────────────┐
                │                                │
                ▼ (ask_for_clarity = false)     ▼ (ask_for_clarity = true)
    ┌───────────────────────┐        ┌────────────────────────┐
    │  AUTO MODE PIPELINE   │        │  CLARIFY MODE PIPELINE │
    └───────────┬───────────┘        └───────────┬────────────┘
                │                                │
                ▼                                ▼
    ┌─────────────────────────┐      ┌──────────────────────────┐
    │ Step 1: LLM Parse       │      │ Step 1: LLM Parse        │
    │ - Action extraction     │      │ - Action extraction      │
    │ - Entity recognition    │      │ - Entity recognition     │
    │ - KG context injection  │      │ - KG context injection   │
    │                         │      │                          │
    │ Result:                 │      │ Result:                  │
    │ {                       │      │ {                        │
    │   action: "schedule",   │      │   action: "schedule",    │
    │   object: "meeting",    │      │   object: "meeting",     │
    │   target: "Sara",       │      │   target: "Sara",        │
    │   when: "next week"     │      │   when: "next week"      │
    │ }                       │      │ }                        │
    └─────────────┬───────────┘      └───────────┬──────────────┘
                  │                              │
                  ▼                              ▼
    ┌─────────────────────────┐      ┌──────────────────────────┐
    │ Step 2: Decompose       │      │ Step 2: Decompose        │
    │ Break into micro-steps  │      │ Break into micro-steps   │
    │ (2-5 min each)          │      │ (2-5 min each)           │
    │                         │      │                          │
    │ Subtasks:               │      │ Subtasks:                │
    │ 1. Find Sara's email    │      │ 1. Find Sara's email     │
    │ 2. Check calendar       │      │ 2. Check calendar        │
    │ 3. Send meeting invite  │      │ 3. Send meeting invite   │
    │ 4. Locate project docs  │      │ 4. Locate project docs   │
    │ 5. Email docs to Sara   │      │ 5. Email docs to Sara    │
    └─────────────┬───────────┘      └───────────┬──────────────┘
                  │                              │
                  ▼                              ▼
    ┌─────────────────────────┐      ┌──────────────────────────┐
    │ Step 3: Classify        │      │ Step 3: Classify         │
    │ Each leaf:              │      │ Each leaf:               │
    │ DIGITAL or HUMAN        │      │ DIGITAL or HUMAN         │
    │                         │      │                          │
    │ 1. HUMAN (contact info) │      │ 1. UNKNOWN (ambiguous)   │
    │ 2. DIGITAL (calendar)   │      │ 2. DIGITAL (calendar)    │
    │ 3. DIGITAL (email send) │      │ 3. UNKNOWN (which email?)│
    │ 4. HUMAN (file search)  │      │ 4. HUMAN (file search)   │
    │ 5. DIGITAL (email send) │      │ 5. UNKNOWN (attachment?) │
    └─────────────┬───────────┘      └───────────┬──────────────┘
                  │                              │
                  ▼                              ▼
    ┌─────────────────────────┐      ┌──────────────────────────┐
    │ Step 4: Estimate        │      │ Step 4: Generate         │
    │ Duration & Energy       │      │ Clarification Questions  │
    │                         │      │                          │
    │ Total: 15 minutes       │      │ For each UNKNOWN:        │
    │ DIGITAL: 3 steps (7min) │      │                          │
    │ HUMAN: 2 steps (8min)   │      │ Q1: "What's Sara's email │
    │ Energy: medium          │      │      address?"           │
    │                         │      │     Options: [text input]│
    │                         │      │                          │
    │                         │      │ Q2: "Which email account │
    │                         │      │      should I use?"      │
    │                         │      │     Options: [personal,  │
    │                         │      │               work, other]│
    │                         │      │                          │
    │                         │      │ Q3: "Which project docs?"│
    │                         │      │     Options: [text input]│
    └─────────────┬───────────┘      └───────────┬──────────────┘
                  │                              │
                  ▼                              ▼
    ┌─────────────────────────┐      ┌──────────────────────────┐
    │ Step 5: Finalize        │      │ Step 5: Present UI       │
    │ Build Task Object       │      │ Show Clarification Modal │
    │                         │      │                          │
    │ Task {                  │      │ ┌────────────────────┐   │
    │   id: "task-123"        │      │ │ Need More Info     │   │
    │   title: "Meeting+Docs" │      │ │                    │   │
    │   micro_steps: [...]    │      │ │ Q1: Sara's email?  │   │
    │   breakdown: {...}      │      │ │ [____________]     │   │
    │   leafType: MIXED       │      │ │                    │   │
    │   automation: {...}     │      │ │ Q2: Email account? │   │
    │ }                       │      │ │ ○ Personal         │   │
    │                         │      │ │ ○ Work             │   │
    │ ✅ SAVED TO DB          │      │ │                    │   │
    └─────────────┬───────────┘      │ │ Q3: Which docs?    │   │
                  │                  │ │ [____________]     │   │
                  ▼                  │ │                    │   │
    ┌─────────────────────────┐      │ │ [Submit Answers]   │   │
    │ Step 6: Display Card    │      │ └────────────────────┘   │
    │ Show in UI with:        │      │                          │
    │ - Task title            │      │ ⏸️  WAIT FOR USER INPUT  │
    │ - Micro-steps (5)       │      └───────────┬──────────────┘
    │ - Time estimate (15min) │                  │
    │ - Action buttons        │                  ▼
    │   • Start Scout         │      ┌──────────────────────────┐
    │   • View Details        │      │ User Submits Answers:    │
    │   • Edit Task           │      │                          │
    │                         │      │ {                        │
    │ 🤖 3 digital steps      │      │   "email": "sara@co.com" │
    │ 👤 2 human steps        │      │   "account": "work"      │
    └─────────────────────────┘      │   "docs": "Q4 Roadmap"   │
                                     │ }                        │
                                     └───────────┬──────────────┘
                                                 │
                                                 ▼
                                     ┌──────────────────────────┐
                                     │ Step 6: Re-Classify      │
                                     │ With new information:    │
                                     │                          │
                                     │ 1. DIGITAL (email known) │
                                     │ 2. DIGITAL (calendar)    │
                                     │ 3. DIGITAL (work email)  │
                                     │ 4. HUMAN (file search)   │
                                     │ 5. DIGITAL (attachment)  │
                                     │                          │
                                     │ All leaves resolved!     │
                                     └───────────┬──────────────┘
                                                 │
                                                 ▼
                                     ┌──────────────────────────┐
                                     │ Step 7: Finalize         │
                                     │ Build Complete Task      │
                                     │                          │
                                     │ ✅ SAVED TO DB           │
                                     │ ✅ SHOW CARD IN UI       │
                                     └──────────────────────────┘
```

---

## 🧠 LLM Usage Map

### Where LLM is Called

| Step | LLM Called? | Purpose | Model | Fallback |
|------|-------------|---------|-------|----------|
| 1. Parse Input | ✅ YES | Extract action, object, target, qualifiers from natural language | GPT-4o-mini or Claude | Keyword-based regex parsing (QuickCaptureService) |
| 2. Decompose | ✅ YES | Break compound task into atomic micro-steps (2-5 min each) | GPT-4o-mini or Claude | Manual decomposition rules |
| 3. Classify | ⚠️ HYBRID | Determine DIGITAL vs HUMAN vs UNKNOWN using ClassifierAgent | GPT-4o-mini or Claude | Rule-based classification (keyword matching) |
| 4. Generate Clarifications | ✅ YES | Create contextual questions for UNKNOWN or missing slots | GPT-4o-mini | Template-based questions |
| 5. Estimate Duration | ⚠️ HYBRID | Estimate time/energy for each micro-step | GPT-4o-mini | Fixed estimates (3 min default) |
| 6. Suggest Automation | ✅ YES | Propose tool/agent steps and parameters for DIGITAL tasks | GPT-4o-mini or Claude | None (skip automation plan) |

### LLM Prompt Templates

#### 1. Parse Input Prompt
```python
# File: src/services/llm_capture_service.py (lines 89-134)

system_prompt = """
You are a task parsing assistant. Extract structured information from natural language.

Knowledge Graph Context:
{kg_context}

Return JSON with:
{
  "task": {
    "title": "Short title (3-5 words)",
    "description": "Full description",
    "priority": "low|medium|high",
    "estimated_hours": 0.5,
    "tags": ["tag1", "tag2"]
  },
  "action": "primary verb",
  "object": "what's being acted upon",
  "target": "who/what is the recipient",
  "when": "temporal info",
  "where": "location if relevant",
  "context": "additional details",
  "confidence": 0.85
}
"""

user_prompt = f"""
Parse this task: "{user_input}"

Extract:
- Action (main verb)
- Object (what's being acted upon)
- Target (recipient/destination)
- Temporal info (when)
- Context (why, how, constraints)
"""
```

#### 2. Decompose Task Prompt
```python
# File: src/agents/capture_agent.py (conceptual - not in current codebase)

system_prompt = """
You are a task decomposition expert. Break tasks into micro-steps of 2-5 minutes each.

Rules:
1. Each step must be atomic (one clear action)
2. Steps must be sequential (one leads to next)
3. Each step should be DIGITAL (automatable) or HUMAN (requires judgment)
4. Aim for 3-7 micro-steps total
5. Use active voice ("Check email" not "Email is checked")

Return JSON array:
[
  {
    "step_id": "uuid",
    "description": "Action to take",
    "estimated_minutes": 3,
    "leaf_type": "DIGITAL|HUMAN|UNKNOWN",
    "dependencies": ["step_id_1"],
    "required_info": ["email_address", "project_name"]
  }
]
"""

user_prompt = f"""
Break this task into 2-5 minute micro-steps:

Task: {task_title}
Description: {task_description}
Context: {task_context}

Ensure each step is:
- Specific and actionable
- 2-5 minutes in duration
- Clearly labeled as DIGITAL or HUMAN
"""
```

#### 3. Generate Clarification Questions Prompt
```python
# File: src/services/quick_capture_service.py (lines 317-397)

system_prompt = """
You generate clarification questions for ambiguous task information.

For each missing or unclear piece of info, create:
{
  "field": "technical_field_name",
  "question": "Natural language question",
  "options": ["option1", "option2"] or null for free text,
  "required": true|false
}

Guidelines:
- Ask only essential questions
- Provide multiple-choice when possible
- Keep questions under 10 words
- Use friendly, conversational tone
"""

user_prompt = f"""
Task: {task_description}
Micro-steps: {steps}

Missing information:
{missing_fields}

Generate 1-3 clarification questions to resolve ambiguities.
"""
```

---

## 🎨 UI Component Structure

### Component Hierarchy
```
MobilePage
├── CaptureMode (Input Area)
│   ├── Textarea (natural language input)
│   ├── Toggle: Auto Mode
│   ├── Toggle: Ask for Clarity  ← NEW: Need to make visible
│   ├── Submit Button (Cmd+Enter)
│   └── Drop Animation (on submit)
│
├── ProgressiveLoader (3-stage animation)
│   ├── Stage 1: "Analyzing your task..." 🧠
│   ├── Stage 2: "Breaking it down..." 🔨
│   └── Stage 3: "Almost done..." ✨
│
├── TaskBreakdownModal (Results Display)
│   ├── Header: Task Title
│   ├── Breakdown Stats (total time, step counts)
│   ├── MicroStepList
│   │   ├── MicroStepCard (DIGITAL) 🤖
│   │   └── MicroStepCard (HUMAN) 👤
│   └── Action Buttons
│       ├── "Start Scout Mode"
│       └── "View Full Details"
│
└── ClarificationModal  ← NEW: Need to build
    ├── Header: "Need More Info"
    ├── QuestionList
    │   ├── TextQuestion (free input)
    │   ├── ChoiceQuestion (radio buttons)
    │   └── MultiSelectQuestion (checkboxes)
    ├── Progress Indicator (e.g., "2 of 3 questions")
    └── Submit Button
```

### New Components to Build

#### 1. ClarificationModal.tsx
```typescript
// frontend/src/components/mobile/modals/ClarificationModal.tsx

interface ClarificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  clarifications: ClarificationQuestion[];
  onSubmit: (answers: Record<string, string>) => void;
  taskTitle: string;
}

// Display types:
// - Text input: <input type="text" />
// - Single choice: <RadioGroup />
// - Multiple choice: <CheckboxGroup />
// - Date picker: <DatePicker />
```

#### 2. ClarificationQuestion Component
```typescript
// frontend/src/components/mobile/ClarificationQuestion.tsx

interface QuestionProps {
  field: string;
  question: string;
  options?: string[];
  required: boolean;
  value: string | string[];
  onChange: (value: string | string[]) => void;
}

// Renders appropriate input based on options:
// - No options → Text input
// - 2-5 options → Radio buttons
// - 6+ options → Dropdown select
```

---

## 🔀 State Flow Diagram

### Frontend State Management
```
┌─────────────────────────────────────────────────────────────────┐
│                     MobilePage State                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  captureText: string                                             │
│  autoMode: boolean                                               │
│  askForClarity: boolean  ← Currently exists but not visible     │
│  loadingStage: 'analyzing'|'breaking_down'|'almost_done'|null   │
│  capturedTask: QuickCaptureResponse | null                       │
│  showBreakdown: boolean                                          │
│  showClarification: boolean  ← NEW: Add this                     │
│  clarificationAnswers: Record<string, string>  ← NEW: Add this   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

State Transitions:
─────────────────

1. IDLE → CAPTURING
   Trigger: User clicks submit
   Actions:
   - Clear captureText
   - Set loadingStage = 'analyzing'
   - Call API

2. CAPTURING → CAPTURED_NO_CLARIFICATION
   Trigger: API returns needs_clarification = false
   Actions:
   - Set capturedTask
   - Set showBreakdown = true
   - Set loadingStage = null

3. CAPTURING → NEEDS_CLARIFICATION
   Trigger: API returns needs_clarification = true
   Actions:
   - Set capturedTask
   - Set showClarification = true  ← NEW
   - Set loadingStage = null

4. NEEDS_CLARIFICATION → CLARIFYING
   Trigger: User submits answers
   Actions:
   - Set loadingStage = 'analyzing'
   - Call /api/v1/capture/clarify
   - Set clarificationAnswers

5. CLARIFYING → CAPTURED_WITH_CLARIFICATION
   Trigger: Clarification API returns
   Actions:
   - Update capturedTask with refined data
   - Set showClarification = false
   - Set showBreakdown = true
   - Set loadingStage = null

6. * → IDLE
   Trigger: User closes modal or navigates away
   Actions:
   - Reset all state to defaults
```

---

## 🔌 API Integration Flow

### Request/Response Cycles

#### Cycle 1: Initial Capture (ask_for_clarity = true)
```
Frontend                                    Backend
   │                                           │
   │  POST /api/v1/mobile/quick-capture        │
   │  {                                        │
   │    text: "Send email to Sara",            │
   │    auto_mode: true,                       │
   │    ask_for_clarity: true  ←━━━━━━━┓      │
   │  }                                 ┃      │
   ├──────────────────────────────────→│      │
   │                                    ┃      │
   │                          Determine mode   │
   │                          mode = CLARIFY ←┛
   │                                    │      │
   │                          Run CaptureAgent │
   │                          - Parse           │
   │                          - Decompose       │
   │                          - Classify        │
   │                          - Generate Qs  ←┐│
   │                                    │      ││
   │  CaptureResponse                   │      ││
   │  {                                 │      ││
   │    task: {...},                    │      ││
   │    micro_steps: [...],             │      ││
   │    needs_clarification: true, ←━━━━━━━━━┛│
   │    clarifications: [               │      │
   │      {                             │      │
   │        field: "email_recipient",   │      │
   │        question: "Who is Sara?",   │      │
   │        options: null               │      │
   │      }                             │      │
   │    ]                               │      │
   │  }                                 │      │
   │←──────────────────────────────────┤      │
   │                                    │      │
   │  Display ClarificationModal        │      │
   │                                           │
```

#### Cycle 2: Submit Clarification Answers
```
Frontend                                    Backend
   │                                           │
   │  POST /api/v1/capture/clarify             │
   │  {                                        │
   │    task_id: "task-123",                   │
   │    answers: {                             │
   │      email_recipient: "sara@company.com"  │
   │    }                                      │
   │  }                                        │
   ├──────────────────────────────────→│      │
   │                                    │      │
   │                          Update task with │
   │                          clarified info   │
   │                          Re-classify steps│
   │                          Update automation│
   │                                    │      │
   │  CaptureResponse (updated)         │      │
   │  {                                 │      │
   │    task: {...},                    │      │
   │    micro_steps: [...],  ← Updated  │      │
   │    needs_clarification: false, ←┐  │      │
   │    clarifications: []            │  │      │
   │  }                               │  │      │
   │←──────────────────────────────────┤  │      │
   │                                  │  │      │
   │  Hide ClarificationModal         │  │      │
   │  Show TaskBreakdownModal         │  │      │
   │                                  └──┘      │
```

---

## 📊 Data Flow Visualization

### Task Object Evolution

#### Stage 1: Initial Parse
```json
{
  "title": "Send email to Sara",
  "description": "Send email to Sara about the project",
  "priority": "medium",
  "estimated_hours": 0.25,
  "tags": ["email", "communication"],
  "micro_steps": []
}
```

#### Stage 2: After Decomposition
```json
{
  "title": "Send email to Sara",
  "micro_steps": [
    {
      "step_id": "step-1",
      "description": "Find Sara's email address",
      "estimated_minutes": 3,
      "leaf_type": "UNKNOWN",  ← Missing info
      "icon": "❓"
    },
    {
      "step_id": "step-2",
      "description": "Draft email about project",
      "estimated_minutes": 5,
      "leaf_type": "HUMAN",
      "icon": "👤"
    },
    {
      "step_id": "step-3",
      "description": "Send email",
      "estimated_minutes": 2,
      "leaf_type": "UNKNOWN",  ← Needs email to be known
      "icon": "❓"
    }
  ],
  "breakdown": {
    "total_steps": 3,
    "digital_count": 0,
    "human_count": 1,
    "unknown_count": 2,  ← Triggers clarification
    "total_minutes": 10
  }
}
```

#### Stage 3: Clarification Questions Generated
```json
{
  "needs_clarification": true,
  "clarifications": [
    {
      "field": "email_recipient",
      "question": "What is Sara's email address?",
      "options": null,
      "required": true,
      "step_ids": ["step-1", "step-3"]  ← Which steps need this
    },
    {
      "field": "email_account",
      "question": "Which email account should I use?",
      "options": ["personal@gmail.com", "work@company.com"],
      "required": true,
      "step_ids": ["step-3"]
    }
  ]
}
```

#### Stage 4: After Clarification (Final)
```json
{
  "title": "Send email to Sara",
  "micro_steps": [
    {
      "step_id": "step-1",
      "description": "Find Sara's email address",
      "estimated_minutes": 0,  ← Resolved, no longer needed
      "leaf_type": "RESOLVED",
      "icon": "✅",
      "metadata": {
        "clarified_value": "sara@company.com"
      }
    },
    {
      "step_id": "step-2",
      "description": "Draft email about project",
      "estimated_minutes": 5,
      "leaf_type": "HUMAN",
      "icon": "👤"
    },
    {
      "step_id": "step-3",
      "description": "Send email to sara@company.com from work@company.com",
      "estimated_minutes": 2,
      "leaf_type": "DIGITAL",  ← Now automatable!
      "icon": "🤖",
      "automation": {
        "type": "email_send",
        "params": {
          "to": "sara@company.com",
          "from": "work@company.com",
          "subject": "Project Update"
        }
      }
    }
  ],
  "breakdown": {
    "total_steps": 2,  ← One step resolved
    "digital_count": 1,
    "human_count": 1,
    "unknown_count": 0,
    "total_minutes": 7
  }
}
```

---

## 🎭 UI/UX Flow - Visual Mockups

### Screen 1: Capture Mode (Default)
```
┌────────────────────────────────────────────┐
│  🎯 Capture                                 │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ What needs to get done?              │ │
│  │                                      │ │
│  │ Send email to Sara about project     │ │
│  │                                      │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Toggles:                                  │
│  [✓] Auto Mode                             │
│  [ ] Ask for Clarity  ← Currently hidden   │
│                                            │
│  Press Cmd+Enter to capture                │
│                                            │
└────────────────────────────────────────────┘
```

### Screen 2: Progressive Loading
```
┌────────────────────────────────────────────┐
│  🎯 Capture                                 │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │                                      │ │
│  │     🧠 Analyzing your task...        │ │
│  │                                      │ │
│  │     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░            │ │
│  │                                      │ │
│  └──────────────────────────────────────┘ │
│                                            │
└────────────────────────────────────────────┘
```

### Screen 3A: Breakdown (No Clarification Needed)
```
┌────────────────────────────────────────────┐
│  Task Breakdown                         [X]│
├────────────────────────────────────────────┤
│  Send email to Sara                        │
│  ⏱️  7 minutes • 🤖 1 digital • 👤 1 human  │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ 👤 Draft email about project         │ │
│  │    5 min • HUMAN                     │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ 🤖 Send email to sara@company.com    │ │
│  │    2 min • DIGITAL                   │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  [Start Scout Mode]  [View Details]        │
│                                            │
└────────────────────────────────────────────┘
```

### Screen 3B: Clarification Modal (ask_for_clarity = true)
```
┌────────────────────────────────────────────┐
│  Need More Info                         [X]│
├────────────────────────────────────────────┤
│  To help you better, I need to know:       │
│                                            │
│  Question 1 of 2                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                            │
│  What is Sara's email address?             │
│  ┌──────────────────────────────────────┐ │
│  │ sara@company.com                     │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  Which email account should I use?         │
│  ○ personal@gmail.com                      │
│  ● work@company.com  ← Selected            │
│                                            │
│  [Skip] [Submit Answers]                   │
│                                            │
└────────────────────────────────────────────┘
```

### Screen 4: Updated Breakdown (After Clarification)
```
┌────────────────────────────────────────────┐
│  Task Breakdown - Updated               [X]│
├────────────────────────────────────────────┤
│  Send email to Sara                        │
│  ⏱️  7 minutes • 🤖 1 digital • 👤 1 human  │
│                                            │
│  ✅ Resolved: Sara's email found            │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ 👤 Draft email about project         │ │
│  │    5 min • HUMAN                     │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ 🤖 Send email to sara@company.com    │ │
│  │    from work@company.com             │ │
│  │    2 min • DIGITAL • READY           │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  [Start Scout Mode]  [View Details]        │
│                                            │
└────────────────────────────────────────────┘
```

---

## 🛠️ Implementation Checklist

### Backend (Already Complete ✅)
- [x] LLM parsing service (OpenAI + Anthropic)
- [x] Task decomposition logic
- [x] Clarification question generator
- [x] `/api/v1/mobile/quick-capture` endpoint
- [x] `/api/v1/capture/clarify` endpoint
- [x] Database schema for tasks and micro_steps
- [x] CaptureAgent with full pipeline
- [x] QuickCaptureService with fallback

### Frontend (Needs Work 🚧)

#### Phase 1: Make Clarification Toggle Visible
- [ ] Unhide `askForClarity` toggle in CaptureMode.tsx
- [ ] Add UI styling for toggle button
- [ ] Wire toggle state to API request
- [ ] Test toggle affects API response

#### Phase 2: Build Clarification Modal
- [ ] Create `ClarificationModal.tsx` component
- [ ] Create `ClarificationQuestion.tsx` component
- [ ] Add state management for answers
- [ ] Handle text input questions
- [ ] Handle single-choice questions (radio)
- [ ] Handle multi-choice questions (checkboxes)
- [ ] Add validation for required fields
- [ ] Add progress indicator (e.g., "2 of 3")

#### Phase 3: API Integration
- [ ] Add `submitClarification()` to api.ts
- [ ] Handle clarification response in useCaptureFlow
- [ ] Show ClarificationModal when `needs_clarification = true`
- [ ] Submit answers to `/api/v1/capture/clarify`
- [ ] Update TaskBreakdownModal with refined task

#### Phase 4: Enhanced TaskBreakdownModal
- [ ] Show "✅ Resolved" badges for clarified steps
- [ ] Highlight DIGITAL steps as "READY" after clarification
- [ ] Add "Refine Task" button to re-open clarifications
- [ ] Display automation plans for DIGITAL steps

#### Phase 5: Testing & Polish
- [ ] Test ask_for_clarity = true flow end-to-end
- [ ] Test ask_for_clarity = false flow (existing)
- [ ] Test error handling (LLM failure, network error)
- [ ] Test clarification skip/cancel flow
- [ ] Add loading states during clarification submission
- [ ] Add success/error toasts

---

## 🧪 Testing Scenarios

### Test Case 1: Simple Task (No Clarification)
```
Input: "Buy milk tomorrow"
Toggle: ask_for_clarity = false

Expected:
1. Parse → { action: "buy", object: "milk", when: "tomorrow" }
2. Decompose → ["Add to shopping list", "Set reminder"]
3. Classify → [DIGITAL, DIGITAL]
4. No clarification needed
5. Show breakdown modal immediately
```

### Test Case 2: Ambiguous Task (With Clarification)
```
Input: "Send email"
Toggle: ask_for_clarity = true

Expected:
1. Parse → { action: "send", object: "email" }
2. Decompose → ["Draft email", "Send email"]
3. Classify → [HUMAN, UNKNOWN] ← Missing recipient
4. Generate question: "Who should I send the email to?"
5. Show clarification modal
6. User answers: "john@example.com"
7. Re-classify → [HUMAN, DIGITAL]
8. Show updated breakdown
```

### Test Case 3: Complex Task (Multiple Clarifications)
```
Input: "Schedule meeting next week"
Toggle: ask_for_clarity = true

Expected Clarifications:
Q1: "Who should attend the meeting?"
Q2: "What day next week? (Mon-Fri)"
Q3: "What time works best?"
Q4: "How long should the meeting be?"

After answers:
- Task refined with specific details
- Steps updated with meeting info
- Calendar automation plan generated
```

---

## 📚 Key Files Reference

### Frontend
- [CaptureMode.tsx](frontend/src/components/mobile/modes/CaptureMode.tsx) - Input component
- [api.ts](frontend/src/lib/api.ts) - API client (needs clarify method)
- [capture.ts](frontend/src/types/capture.ts) - TypeScript types
- [task-schema.ts](frontend/src/types/task-schema.ts) - Extended task types
- [useCaptureFlow.ts](frontend/src/hooks/useCaptureFlow.ts) - Capture logic hook

### Backend
- [tasks.py](src/api/tasks.py) - Lines 763-901: quick-capture endpoint
- [capture.py](src/api/capture.py) - Lines 188-243: clarify endpoint
- [quick_capture_service.py](src/services/quick_capture_service.py) - Lines 317-397: question generator
- [llm_capture_service.py](src/services/llm_capture_service.py) - LLM parsing
- [capture_agent.py](src/agents/capture_agent.py) - Full capture pipeline

### Tests
- [test_adhd_ux_flow.sh](test_adhd_ux_flow.sh) - Integration test
- [test_capture_comprehensive.sh](test_capture_comprehensive.sh)
- [test_capture_final.sh](test_capture_final.sh)

---

## 🎯 Next Steps

1. **Review this document** with your team
2. **Decide on clarification UI design** (modal vs inline vs wizard)
3. **Start with Phase 1** (unhide toggle)
4. **Build ClarificationModal** (Phase 2)
5. **Wire up API integration** (Phase 3)
6. **Test thoroughly** with real ADHD use cases
7. **Iterate based on user feedback**

---

## 💡 Design Considerations

### ADHD-Friendly UX Principles
1. **Minimize cognitive load** - One question at a time (vs all at once)
2. **Progressive disclosure** - Show clarifications only when needed
3. **Clear progress indicators** - "2 of 3 questions"
4. **Escape hatches** - Always allow "Skip" or "Do this later"
5. **Immediate feedback** - Show how answers refine the task
6. **Visual hierarchy** - Use icons, colors, spacing to guide attention
7. **Reduce decision fatigue** - Provide smart defaults and suggestions

### Accessibility
- [ ] Keyboard navigation (Tab, Enter, Esc)
- [ ] Screen reader support (ARIA labels)
- [ ] Focus management (auto-focus first question)
- [ ] Error messages (clear, actionable)
- [ ] Color contrast (WCAG AA compliance)

---

**Last Updated**: 2025-10-23
**Version**: 1.0
**Status**: Backend Complete ✅ | Frontend Needs Implementation 🚧
