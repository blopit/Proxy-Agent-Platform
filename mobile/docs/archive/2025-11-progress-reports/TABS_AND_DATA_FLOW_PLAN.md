# Mobile App - Tabs, Sub-tabs & Data Flow Plan

**Created:** November 5, 2025
**Purpose:** Comprehensive architecture plan for tab navigation, provider integration, and suggestion workflow

---

## 📑 Table of Contents

1. [Tab Structure Overview](#tab-structure-overview)
2. [Sub-tab Architecture](#sub-tab-architecture)
3. [Provider Connection Flow](#provider-connection-flow)
4. [Suggestion Generation Flow](#suggestion-generation-flow)
5. [Complete Data Flow Diagrams](#complete-data-flow-diagrams)
6. [Screen-by-Screen Journey](#screen-by-screen-journey)
7. [Implementation Status](#implementation-status)
8. [Next Steps](#next-steps)

---

## 📱 Tab Structure Overview

### Primary Navigation (5 Biological Modes)

```
┌─────────────────────────────────────────────────────────────┐
│                    Bottom Tab Bar                            │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│ 🎯 Capture│ 🔍 Scout │ 🎨 Hunter│ 📅 Today │ 🗺️ Mapper       │
│  (Cyan)  │  (Blue)  │ (Orange) │(Magenta) │  (Violet)       │
└──────────┴──────────┴──────────┴──────────┴─────────────────┘
```

| Tab | ID | Icon | Color | Purpose | Optimal Energy/Time |
|-----|-----|------|-------|---------|---------------------|
| **Capture** | `capture` | Plus | #2aa198 (Cyan) | Quick brain dump, provider connections | Always available |
| **Scout** | `scout` | Search | #268bd2 (Blue) | Explore/filter tasks, forager mode | Morning/afternoon, energy > 60% |
| **Hunter** | `hunter` | Target | #cb4b16 (Orange) | Deep focus, predator pursuit flow | Morning, energy > 70% |
| **Today** | `today` | Calendar | #d33682 (Magenta) | Daily task planning | Any time |
| **Mapper** | `mapper` | Map | #6c71c4 (Violet) | Visual task landscape, memory consolidation | Evening/night |

**Features:**
- Yellow dot "optimal indicator" when conditions match user's energy/time
- Date badge on Today tab (e.g., "15" for 15th)
- Chevron background effect on active tab
- Icons always visible, labels optional

---

## 🗂️ Sub-tab Architecture

### Capture Tab → 3 Sub-tabs

```
Capture (Main Tab)
├── Add (Default)     - Brain dump & decomposition
├── Clarify          - AI clarification workflow
└── Connect          - Provider integrations
```

#### Sub-tab 1: Add (`/capture/add`)

**Purpose:** Quick task capture with AI decomposition

**Layout:**
```
┌────────────────────────────────────────┐
│  [Profile Switcher]     [Energy Gauge] │
├────────────────────────────────────────┤
│                                        │
│  What needs to get done?               │
│  ┌──────────────────────────────────┐ │
│  │ Type or speak...                 │ │ ← Text/Voice Input
│  │                                  │ │
│  │                                  │ │
│  └──────────────────────────────────┘ │
│  [🎤 Voice] [🤖 AI Assist] [📎 Attach]│
│                                        │
│  Recent suggestions:                   │
│  ┌──────────────────────────────────┐ │
│  │ 📧 Reply to Sarah's email    [+]│ │ ← SuggestionCard
│  │ 📅 Schedule team meeting     [+]│ │
│  └──────────────────────────────────┘ │
│                                        │
│             [Capture Task]             │ ← Primary Action
└────────────────────────────────────────┘
```

**Data Flow:**
1. User types or speaks task description
2. → `POST /api/v1/capture/` with query
3. ← Returns `{ task, micro_steps, clarifications }`
4. If clarifications exist → Navigate to Clarify tab
5. Else → Show micro-steps preview modal → Save

**Components:**
- Text input with bionic text preview
- Voice recording button (Web Speech API)
- SuggestionCard list (from providers)
- TaskBreakdownModal (preview before save)

---

#### Sub-tab 2: Clarify (`/capture/clarify`)

**Purpose:** Answer AI questions to refine task breakdown

**Layout:**
```
┌────────────────────────────────────────┐
│  Help me understand better...          │
├────────────────────────────────────────┤
│                                        │
│  Q1: When is this due?                 │
│  ○ Today  ○ This week  ○ This month   │
│                                        │
│  Q2: Who needs to be involved?         │
│  ┌──────────────────────────────────┐ │
│  │ e.g., Sarah, Dev Team            │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Q3: What's blocking this?             │
│  ○ Waiting for approval               │
│  ○ Need more information              │
│  ○ No blockers                        │
│                                        │
│         [Skip] [Submit Answers]        │
└────────────────────────────────────────┘
```

**Data Flow:**
1. Receive clarifications from Add screen
2. Display 1-5 questions (radio, text, or checkbox)
3. User answers → `POST /api/v1/capture/clarify`
4. ← Returns refined micro_steps
5. → Show TaskBreakdownModal → Save

**Components:**
- Dynamic question renderer (based on type)
- Progress indicator (e.g., "2 of 4")
- Skip button (uses original decomposition)

---

#### Sub-tab 3: Connect (`/capture/connect`)

**Purpose:** Manage email/calendar provider integrations

**Layout:**
```
┌────────────────────────────────────────┐
│  Connected Providers                   │
├────────────────────────────────────────┤
│                                        │
│  Email Services                        │
│  ┌──────────────────────────────────┐ │
│  │ 📧 Gmail                     ✓  │ │ ← ConnectionElement
│  │ work@gmail.com                   │ │
│  └──────────────────────────────────┘ │
│  ┌──────────────────────────────────┐ │
│  │ 📧 Outlook         [Connect]    │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Calendar Services                     │
│  ┌──────────────────────────────────┐ │
│  │ 📅 Google Calendar  [Connect]   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Workspace Apps                        │
│  ┌──────────────────────────────────┐ │
│  │ 💬 Slack            [Connect]   │ │
│  │ 📝 Notion           [Connect]   │ │
│  │ 📋 Trello           [Connect]   │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Note: Connections are per-profile    │
└────────────────────────────────────────┘
```

**Data Flow:**
1. Load integrations: `GET /api/v1/integrations?user_id={id}`
2. Display ConnectionElement for each provider
3. User clicks "Connect" → OAuth flow starts
4. After success → Reload integrations list
5. Connected providers automatically sync

**Components:**
- ConnectionElement (shows status, email, actions)
- Section headers (Email, Calendar, Workspace)
- Help text explaining per-profile isolation

**Provider States:**
- `disconnected` - Show "Connect" button
- `connecting` - Show loading spinner
- `connected` - Show email + checkmark
- `error` - Show "Retry" button + error message
- `token_expired` - Show "Reconnect" button

---

### Scout Tab → Task List

**Layout:**
```
┌────────────────────────────────────────┐
│  [Filter: All ▾] [Sort: Priority ▾]   │
├────────────────────────────────────────┤
│                                        │
│  📧 From Gmail (3)                     │
│  ┌──────────────────────────────────┐ │
│  │ Reply to Sarah's email      [+] │ │ ← Suggested task
│  │ 📧 HIGH • 2 min                  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Your Tasks (12)                       │
│  ┌──────────────────────────────────┐ │
│  │ 🎯 Fix authentication bug        │ │ ← Regular task
│  │ 3 steps • 45 min                 │ │
│  └──────────────────────────────────┘ │
│  ┌──────────────────────────────────┐ │
│  │ 📝 Write documentation           │ │
│  │ 5 steps • 2 hrs                  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  [+ Quick Add]                         │
└────────────────────────────────────────┘
```

**Data Flow:**
1. Load suggested tasks: `GET /api/v1/integrations/suggested-tasks`
2. Load user tasks: `GET /api/v1/tasks?user_id={id}`
3. Merge and display by sections
4. User taps suggestion → Approve modal
5. User taps task → Task detail screen

---

### Hunter Tab → Focus Mode

**Layout:**
```
┌────────────────────────────────────────┐
│  Current Focus                         │
│  [25:00]  ●●●○○ (3/5 Pomodoros)      │
├────────────────────────────────────────┤
│                                        │
│  🎯 Fix authentication bug             │
│                                        │
│  Next Step:                            │
│  ┌──────────────────────────────────┐ │
│  │ 1. Add JWT validation            │ │
│  │    Estimated: 15 min             │ │
│  └──────────────────────────────────┘ │
│                                        │
│  [← Previous]    [Done ✓]   [Next →] │
│                                        │
│  Progress:                             │
│  ▓▓▓▓▓▓░░░░░░░░░░ 40%                │
│                                        │
│       [Start Focus Session]            │
└────────────────────────────────────────┘
```

---

### Today Tab → Daily Planning

**Layout:**
```
┌────────────────────────────────────────┐
│  Tuesday, Nov 5                        │
│  Energy: ▓▓▓▓▓▓▓▓░░ 80% (Good!)      │
├────────────────────────────────────────┤
│                                        │
│  Morning (Optimal for deep work)       │
│  ┌──────────────────────────────────┐ │
│  │ 🎯 [9:00] Fix auth bug      45m │ │
│  │ 📝 [10:00] Write docs       2h  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Afternoon (Great for exploration)     │
│  ┌──────────────────────────────────┐ │
│  │ 📧 [2:00] Reply to emails   30m │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Evening (Memory consolidation)        │
│  ┌──────────────────────────────────┐ │
│  │ 🗺️ [8:00] Review progress  15m │ │
│  └──────────────────────────────────┘ │
│                                        │
│       [Add to Today]                   │
└────────────────────────────────────────┘
```

---

### Mapper Tab → Visual Overview

**Layout:**
```
┌────────────────────────────────────────┐
│  Task Landscape                        │
│  [Week ▾] [Month] [All]               │
├────────────────────────────────────────┤
│                                        │
│     ┌─────┐                           │
│     │Task1│──→ ┌─────┐                │
│     └─────┘    │Task2│                │
│                └─────┘                │
│                   ↓                   │
│                ┌─────┐                │
│     ┌─────┐   │Task3│                │
│     │Task4│   └─────┘                │
│     └─────┘                           │
│                                        │
│  Completed: 45%                        │
│  In Progress: 3 tasks                  │
│  Blocked: 1 task                       │
└────────────────────────────────────────┘
```

---

## 🔌 Provider Connection Flow

### Complete OAuth Journey

```
┌──────────────────────────────────────────────────────────┐
│                   PROVIDER CONNECTION FLOW                │
└──────────────────────────────────────────────────────────┘

Step 1: User Initiates Connection
─────────────────────────────────
Screen: /capture/connect
User taps: [Connect] on Gmail ConnectionElement

  Frontend: initiateGmailOAuth(userId)
       ↓
  API: POST /api/v1/integrations/gmail/authorize
       ↓
  Backend:
    1. Generate state token (CSRF protection)
    2. Build OAuth URL with scopes
    3. Store state in memory
       ↓
  Response: { authorization_url, state }
       ↓
  Frontend: WebBrowser.openAuthSessionAsync(url, redirect_uri)


Step 2: User Grants Permissions
────────────────────────────────
  Browser opens: accounts.google.com/o/oauth2/v2/auth
  User sees: "Proxy Agent wants to access your Gmail"
  User clicks: [Allow]
       ↓
  Google redirects:
    http://localhost:8000/api/v1/integrations/gmail/callback
    ?code=4/0AeanS0Zx...
    &state=abc123...


Step 3: Backend Token Exchange
───────────────────────────────
  API: GET /api/v1/integrations/gmail/callback?code=...&state=...
       ↓
  Backend:
    1. Validate state (prevent CSRF)
    2. Exchange code for access_token + refresh_token
    3. Get user email from Gmail API
    4. Encrypt tokens with Fernet
    5. Store in database:
       - integration_id
       - user_id
       - provider='gmail'
       - provider_user_id=email
       - access_token (encrypted)
       - refresh_token (encrypted)
       - token_expires_at
       - status='active'
       ↓
  Redirect: proxyagent://oauth/callback
            ?success=true
            &provider=gmail
            &integration_id=123


Step 4: Mobile App Deep Link
─────────────────────────────
  Mobile: Linking.addEventListener('url')
       ↓
  Parse URL: success=true, provider=gmail
       ↓
  UI Updates:
    1. Show success toast
    2. ConnectionElement status → 'connected'
    3. Display email address
    4. Reload integration list
       ↓
  API: GET /api/v1/integrations?user_id={id}
       ↓
  Response: [{ integration_id, provider, provider_user_id, ... }]


Step 5: Automatic Sync (Background)
────────────────────────────────────
  Triggered by: Manual button or scheduled job
       ↓
  API: POST /api/v1/integrations/{integration_id}/sync
       ↓
  Backend:
    1. Decrypt access_token
    2. Fetch emails from Gmail API
    3. Filter: unread, from last 24h
    4. For each email:
       - Generate task suggestion with LLM
       - Store in integration_tasks table
       - status='pending'
       - ai_confidence, ai_reasoning
       ↓
  Response: { synced_count: 15, new_suggestions: 3 }
       ↓
  Frontend: Show badge on Scout tab (3 new)
```

---

## 🤖 Suggestion Generation Flow

### From Provider Data → Task Suggestion

```
┌──────────────────────────────────────────────────────────┐
│              SUGGESTION GENERATION PIPELINE               │
└──────────────────────────────────────────────────────────┘

Input: Gmail Email
──────────────────
{
  "id": "18c5a2f...",
  "threadId": "18c5a2f...",
  "subject": "URGENT: Production bug in auth service",
  "from": "sarah@company.com",
  "date": "2025-11-05T14:30:00Z",
  "snippet": "Hey, users can't log in. Getting 500 errors...",
  "labels": ["UNREAD", "IMPORTANT"]
}

     ↓

LLM Analysis (GPT-4)
────────────────────
System Prompt:
  "You are a task extraction assistant. Analyze this email
   and suggest an actionable task if needed."

Email Content → LLM Processing
  ↓
  Extracts:
    - Action verb: "Fix"
    - Subject: "authentication bug"
    - Priority: HIGH (keywords: urgent, production)
    - Deadline: ASAP (production issue)
    - Tags: ["bug", "urgent", "backend"]
  ↓
  Generates:
    - Title: "Fix production authentication bug"
    - Description: "Users getting 500 errors on login..."
    - Confidence: 0.95
    - Reasoning: "Email marked urgent + production issue"

     ↓

Store as Pending Suggestion
────────────────────────────
Database: integration_tasks table
{
  "integration_task_id": "uuid-123",
  "integration_id": "gmail-456",
  "provider_item_type": "email",
  "provider_item_id": "18c5a2f...",
  "suggested_title": "Fix production authentication bug",
  "suggested_description": "Users getting 500 errors...",
  "suggested_priority": "HIGH",
  "suggested_tags": ["bug", "urgent", "backend"],
  "suggested_deadline": "2025-11-05T23:59:59Z",
  "ai_confidence": 0.95,
  "ai_reasoning": "Email marked urgent + production issue",
  "provider_item_snapshot": { ...original email JSON... },
  "status": "pending",
  "created_at": "2025-11-05T14:31:00Z"
}

     ↓

Surface in Scout Tab
────────────────────
API: GET /api/v1/integrations/suggested-tasks
     ?user_id=user-789
     &limit=50

Response:
[
  {
    "integration_task_id": "uuid-123",
    "suggested_title": "Fix production authentication bug",
    "suggested_priority": "HIGH",
    "ai_confidence": 0.95,
    "provider": "gmail",
    "created_at": "2025-11-05T14:31:00Z"
  },
  ...
]

     ↓

Display as SuggestionCard
─────────────────────────
<SuggestionCard
  text="Fix production authentication bug"
  sources={[{ icon: Mail, color: '#EA4335' }]}
  metadata="URGENT"
  onAdd={() => approveTask('uuid-123')}
  onDismiss={() => dismissTask('uuid-123')}
/>
```

---

## 🔄 Complete Data Flow Diagrams

### Diagram 1: Capture → Save Flow

```
┌─────────────┐
│   User      │
│ Types Task  │
└──────┬──────┘
       │
       ↓ Voice/Text Input
┌─────────────────────────────┐
│  /capture/add               │
│  TextInput: "Fix auth bug"  │
└──────┬──────────────────────┘
       │
       ↓ Tap "Capture Task"
┌──────────────────────────────────────┐
│  POST /api/v1/capture/               │
│  Body: { query: "Fix auth bug" }     │
└──────┬───────────────────────────────┘
       │
       ↓ LLM Processing
┌───────────────────────────────────────┐
│  Backend: AI Task Decomposition       │
│  1. Parse intent                      │
│  2. Generate micro-steps               │
│  3. Identify clarifications needed     │
└──────┬────────────────────────────────┘
       │
       ↓ Response
┌────────────────────────────────────────┐
│  CaptureResponse {                     │
│    task: { title, description, ... }   │
│    micro_steps: [                      │
│      { description, estimated_min },   │
│      ...                               │
│    ],                                  │
│    clarifications: [                   │
│      { question, type, options },      │
│      ...                               │
│    ]                                   │
│  }                                     │
└──────┬─────────────────────────────────┘
       │
       ├─→ Has Clarifications?
       │      ↓ YES
       │   ┌─────────────────────────┐
       │   │ Navigate to /clarify    │
       │   │ Show questions          │
       │   └────┬────────────────────┘
       │        │
       │        ↓ User Answers
       │   ┌──────────────────────────────┐
       │   │ POST /api/v1/capture/clarify │
       │   │ Body: { answers: [...] }     │
       │   └────┬─────────────────────────┘
       │        │
       │        ↓ Refined micro-steps
       │
       └─→ NO Clarifications
              ↓
       ┌────────────────────────┐
       │ Show TaskBreakdownModal│
       │ Preview micro-steps    │
       │ [Cancel] [Save Task]   │
       └────┬───────────────────┘
            │
            ↓ User Confirms
       ┌─────────────────────────────┐
       │ POST /api/v1/capture/save   │
       │ Body: {                     │
       │   task: {...},              │
       │   micro_steps: [...],       │
       │   user_id, project_id       │
       │ }                           │
       └────┬────────────────────────┘
            │
            ↓ Database Write
       ┌──────────────────────────┐
       │ Tasks Table: new task    │
       │ MicroSteps Table: steps  │
       └────┬─────────────────────┘
            │
            ↓ Success
       ┌──────────────────────┐
       │ Navigate to /scout   │
       │ Show success toast   │
       │ Task appears in list │
       └──────────────────────┘
```

---

### Diagram 2: Provider → Suggestion → Task Flow

```
┌──────────────┐
│  Gmail API   │
│  (External)  │
└──────┬───────┘
       │ OAuth Token
       ↓
┌────────────────────────────────┐
│  IntegrationService.sync()     │
│  1. Fetch unread emails        │
│  2. Filter last 24h            │
│  3. For each email → LLM       │
└──────┬─────────────────────────┘
       │
       ↓ Email Batch
┌─────────────────────────────────────────┐
│  LLM Task Extraction                    │
│  Input: Email subject + body            │
│  Output: {                              │
│    title, description, priority,        │
│    tags, deadline, confidence           │
│  }                                      │
└──────┬──────────────────────────────────┘
       │
       ↓ Save Suggestions
┌──────────────────────────────────────────┐
│  Database: integration_tasks             │
│  status='pending'                        │
│  15 new suggestions created              │
└──────┬───────────────────────────────────┘
       │
       ↓ User Opens App
┌─────────────────────────────────────┐
│  /scout Screen                      │
│  GET /api/v1/integrations/          │
│      suggested-tasks                │
└──────┬──────────────────────────────┘
       │
       ↓ Suggestions Loaded
┌──────────────────────────────────────┐
│  Display SuggestionCard List         │
│  [📧 Reply to Sarah [+]] [X]        │
│  [📧 Review PR #123 [+]] [X]        │
└──────┬───────────────────────────────┘
       │
       ├─→ User Taps [X] (Dismiss)
       │      ↓
       │   ┌────────────────────────────────────┐
       │   │ POST /api/v1/integrations/tasks/   │
       │   │      {id}/dismiss                  │
       │   └────┬───────────────────────────────┘
       │        │
       │        ↓ Update status
       │   ┌────────────────────────┐
       │   │ status='dismissed'     │
       │   │ Remove from UI         │
       │   └────────────────────────┘
       │
       └─→ User Taps [+] (Approve)
              ↓
       ┌─────────────────────────────────┐
       │  Show Approval Modal            │
       │  "Add this task?"               │
       │  [Edit] [Cancel] [Add to Scout] │
       └────┬────────────────────────────┘
            │
            ↓ User Confirms
       ┌──────────────────────────────────────┐
       │ POST /api/v1/integrations/tasks/     │
       │      {id}/approve                    │
       │ Body: { task_id: "new-task-uuid" }   │
       └────┬─────────────────────────────────┘
            │
            ↓ Create Task + Link
       ┌────────────────────────────────────┐
       │ 1. Create task in tasks table      │
       │ 2. Update integration_task:        │
       │    - status='approved'             │
       │    - linked_task_id                │
       │ 3. Create micro-steps if LLM       │
       │    suggested breakdown             │
       └────┬───────────────────────────────┘
            │
            ↓ Success
       ┌──────────────────────────────┐
       │ Task appears in Scout list   │
       │ Suggestion removed from top  │
       │ Show "✓ Added!" toast        │
       └──────────────────────────────┘
```

---

### Diagram 3: Energy-Aware Task Routing

```
┌──────────────────┐
│  User opens app  │
│  Time: 9:00 AM   │
│  Energy: 85%     │
└────┬─────────────┘
     │
     ↓ Check Energy + Time
┌─────────────────────────────────┐
│  BiologicalTabs Component       │
│  Calculate optimal modes:       │
│  - Morning + High Energy        │
│  → Hunter (Optimal!) 🟡         │
│  → Scout (Optimal!) 🟡          │
│  - Capture (Always) ⚪          │
└────┬────────────────────────────┘
     │
     ↓ Show Indicators
┌─────────────────────────────────────────┐
│  Tab Bar:                               │
│  🎯 Capture  🔍 Scout🟡  🎨 Hunter🟡   │
└────┬────────────────────────────────────┘
     │
     ↓ User Taps Scout
┌──────────────────────────────────┐
│  /scout Screen                   │
│  GET /api/v1/tasks               │
│    ?optimal_for_energy=85        │
│    &optimal_for_time=morning     │
└────┬─────────────────────────────┘
     │
     ↓ Smart Filtering
┌────────────────────────────────────────┐
│  Backend: Filter tasks by:             │
│  - Complexity matches energy           │
│  - High energy → Complex tasks first   │
│  - Morning → Deep work tasks           │
└────┬───────────────────────────────────┘
     │
     ↓ Prioritized List
┌─────────────────────────────────────┐
│  Suggested for you now:             │
│  ┌───────────────────────────────┐ │
│  │ 🧠 Fix auth bug (45 min)     │ │ High complexity
│  │ 📝 Write docs (2 hrs)        │ │
│  └───────────────────────────────┘ │
│                                     │
│  Later today:                       │
│  ┌───────────────────────────────┐ │
│  │ 📧 Reply to emails (30 min)  │ │ Low complexity
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🎬 Screen-by-Screen Journey

### Journey: From Disconnected → Task Created from Email

**Starting Point:** New user, no providers connected

---

#### Screen 1: Capture Tab → Connect Sub-tab

```
Path: /capture/connect
State: All providers disconnected

User sees:
┌────────────────────────────────────────┐
│  Connected Providers                   │
├────────────────────────────────────────┤
│  Email Services                        │
│  📧 Gmail            [Connect]         │ ← User taps
│  📧 Outlook          [Connect]         │
│                                        │
│  Note: Connections are per-profile     │
└────────────────────────────────────────┘

Action: Tap [Connect] on Gmail
```

---

#### Screen 2: OAuth Browser (External)

```
System browser opens
URL: accounts.google.com/o/oauth2/v2/auth

Google shows:
┌────────────────────────────────────────┐
│  Proxy Agent wants to access:          │
│  • Read your email messages            │
│  • View your email metadata            │
│                                        │
│  [Cancel]              [Allow]         │ ← User taps
└────────────────────────────────────────┘

Action: User taps [Allow]
```

---

#### Screen 3: Redirect Processing

```
Backend processes:
1. Receive code + state
2. Exchange for tokens
3. Encrypt and store
4. Redirect to app

Deep link: proxyagent://oauth/callback?success=true&provider=gmail

App resumes
```

---

#### Screen 4: Connection Success

```
Path: /capture/connect (returns here)
State: Gmail now connected

User sees:
┌────────────────────────────────────────┐
│  Connected Providers                   │
├────────────────────────────────────────┤
│  Email Services                        │
│  📧 Gmail                          ✓   │
│  work@gmail.com                        │ ← Email shown
│  [Disconnect]                          │
│                                        │
│  📧 Outlook          [Connect]         │
└────────────────────────────────────────┘

Toast: "✓ Gmail connected successfully!"

Background: Automatic sync starts
```

---

#### Screen 5: Background Sync (Invisible)

```
Backend processing:
POST /api/v1/integrations/{id}/sync

Actions:
1. Fetch 50 recent unread emails
2. LLM analyzes each email
3. Creates 12 task suggestions
4. Stores as status='pending'

Duration: ~30 seconds
```

---

#### Screen 6: Scout Tab (Badge Appears)

```
Path: /scout
State: 12 new suggestions ready

Tab bar shows:
🎯 Capture  🔍 Scout (12)  🎨 Hunter  📅 Today  🗺️ Mapper
                 ↑
           Badge appears!

User taps Scout tab
```

---

#### Screen 7: Scout Tab → Suggestions

```
Path: /scout
State: Loading suggestions + tasks

User sees:
┌────────────────────────────────────────┐
│  [Filter ▾]  [Sort ▾]                 │
├────────────────────────────────────────┤
│  📧 From Gmail (12)                    │
│  ┌──────────────────────────────────┐ │
│  │ 📧 Reply to Sarah's email  [+][X]│ │ ← User taps [+]
│  │ HIGH • 2 min                     │ │
│  └──────────────────────────────────┘ │
│  ┌──────────────────────────────────┐ │
│  │ 📧 Review PR #123          [+][X]│ │
│  │ MED • 15 min                     │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Your Tasks (3)                        │
│  ...                                   │
└────────────────────────────────────────┘

Action: Tap [+] on "Reply to Sarah's email"
```

---

#### Screen 8: Approval Modal

```
Modal appears over Scout screen

User sees:
┌────────────────────────────────────────┐
│  Add this task?                        │
├────────────────────────────────────────┤
│                                        │
│  📧 Reply to Sarah's email             │
│                                        │
│  From: sarah@company.com               │
│  Priority: HIGH                        │
│  Estimated: 2 min                      │
│                                        │
│  AI Suggestion:                        │
│  "Email marked urgent and requires     │
│   immediate response about project     │
│   deadline."                           │
│                                        │
│  Confidence: 95%                       │
│                                        │
│  [Edit Task]  [Cancel]  [Add to Scout] │ ← User taps
└────────────────────────────────────────┘

Action: Tap [Add to Scout]
```

---

#### Screen 9: Task Created

```
Path: /scout (modal dismissed)
State: Task approved and created

Backend:
1. POST /api/v1/integrations/tasks/{id}/approve
2. Create task in tasks table
3. Update integration_task status='approved'
4. Link task_id to integration_task

Frontend:
1. Reload task list
2. Show success feedback
3. Remove from suggestions

User sees:
┌────────────────────────────────────────┐
│  [Filter ▾]  [Sort ▾]                 │
├────────────────────────────────────────┤
│  📧 From Gmail (11)                    │ ← Count decreased
│  ┌──────────────────────────────────┐ │
│  │ 📧 Review PR #123          [+][X]│ │
│  │ MED • 15 min                     │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Your Tasks (4)                        │ ← Count increased
│  ┌──────────────────────────────────┐ │
│  │ 📧 Reply to Sarah's email        │ │ ← New task!
│  │ 1 step • 2 min                   │ │
│  └──────────────────────────────────┘ │
│  ...                                   │
└────────────────────────────────────────┘

Toast: "✓ Task added to your list!"

Journey Complete! ✓
```

---

## 📊 Implementation Status

### ✅ Completed (100%)

**Backend:**
- OAuth flow (Gmail, Google Calendar, Slack)
- Token encryption/storage
- Integration CRUD operations
- Suggestion generation endpoint
- Approve/dismiss endpoints
- Sync endpoint
- CSRF protection with state tokens

**Frontend:**
- Tab navigation (5 biological modes)
- Capture/Add screen with AI decomposition
- Capture/Clarify screen (Q&A flow)
- Capture/Connect screen (OAuth)
- ConnectionElement component
- SuggestionCard component
- OAuth service (Google, Apple, GitHub, Microsoft)
- Deep link handling
- Profile context (per-profile isolation)

**Components:**
- BiologicalTabs (energy-aware indicators)
- ChevronStep, ChevronButton, ChevronElement
- TaskCardBig, SuggestionCard
- Badge, Button, Card (base UI)
- BionicText (ADHD-friendly reading)
- All 29 components with Storybook stories

---

### ⏭️ Next to Build

**High Priority:**

1. **Scout Tab Full Implementation**
   - Task list with suggestions section
   - Filter/sort controls
   - Approve modal for suggestions
   - Integration with suggestion endpoints
   - Loading states and error handling
   - **Estimated:** 8-12 hours

2. **Suggestion List Component**
   - Dedicated component for suggestion management
   - Batch approve/dismiss
   - Filter by provider
   - Confidence score display
   - **Estimated:** 4-6 hours

3. **Hunter Mode UI**
   - Focus timer (Pomodoro)
   - Current task display
   - Step-by-step navigation
   - Progress tracking
   - **Estimated:** 6-8 hours

4. **Today View UI**
   - Daily task timeline
   - Energy-based scheduling
   - Drag-and-drop reordering
   - Time block visualization
   - **Estimated:** 8-10 hours

5. **Mapper View UI**
   - Visual task graph
   - Dependency visualization
   - Interactive node editing
   - Progress overlay
   - **Estimated:** 12-16 hours

**Medium Priority:**

6. **Additional OAuth Providers**
   - Slack (backend ready, needs frontend)
   - Outlook (UI ready, needs backend)
   - Notion, Trello (UI stories exist)
   - **Estimated:** 2-3 hours each

7. **Token Refresh Flow**
   - Automatic token refresh
   - Expired token detection
   - Re-auth prompt
   - **Estimated:** 4-6 hours

8. **Sync Status Indicators**
   - Last sync timestamp
   - Sync in progress spinner
   - Error state display
   - Manual sync button
   - **Estimated:** 3-4 hours

9. **Suggestion Quality Improvements**
   - User feedback loop (helpful/not helpful)
   - Learning from dismissals
   - Priority calibration
   - **Estimated:** 6-8 hours

---

### 🔮 Future Enhancements

**Phase 2:**
- Calendar integration (view tasks in calendar)
- Bi-directional sync (create Gmail events from tasks)
- Smart notification timing
- Email response drafting
- Attachment handling
- Task templates from emails

**Phase 3:**
- Multi-account support per provider
- Advanced filters (by sender, keyword, thread)
- Bulk operations (archive all suggestions)
- Integration analytics dashboard
- Custom integration rules

---

## 🎯 Key Design Decisions

### 1. **Per-Profile Isolation**
- Each profile has separate provider connections
- Work email doesn't leak into personal profile
- Complete data separation at database level

### 2. **Suggestion ≠ Task**
- Suggestions stored separately (integration_tasks table)
- Only become tasks on approval
- Can be dismissed without cluttering task list
- Preserves original provider data for reference

### 3. **Energy-Aware UI**
- Biological tabs show optimal indicators
- Task routing based on energy + time
- Scout suggests appropriate complexity
- Reduces decision fatigue

### 4. **ADHD-Optimized Capture**
- 2-second target: voice → saved
- Minimal friction (no forms)
- AI handles decomposition
- Optional clarifications (can skip)

### 5. **Security First**
- Tokens encrypted at rest (Fernet)
- CSRF protection (state tokens)
- Tokens never exposed in API responses
- OAuth redirect validation

### 6. **Mobile-First Performance**
- Optimistic UI updates
- Background syncing
- Lazy loading (on-demand)
- Minimal bundle size

---

## 📝 API Endpoint Summary

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/v1/integrations/{provider}/authorize` | POST | Start OAuth | ✅ Done |
| `/api/v1/integrations/{provider}/callback` | GET | OAuth callback | ✅ Done |
| `/api/v1/integrations/` | GET | List integrations | ✅ Done |
| `/api/v1/integrations/{id}/disconnect` | POST | Remove integration | ✅ Done |
| `/api/v1/integrations/{id}/status` | GET | Health check | ✅ Done |
| `/api/v1/integrations/{id}/sync` | POST | Manual sync | ✅ Done |
| `/api/v1/integrations/suggested-tasks` | GET | Get suggestions | ✅ Done |
| `/api/v1/integrations/tasks/{id}/approve` | POST | Approve suggestion | ✅ Done |
| `/api/v1/integrations/tasks/{id}/dismiss` | POST | Dismiss suggestion | ✅ Done |
| `/api/v1/capture/` | POST | Decompose task | ✅ Done |
| `/api/v1/capture/save` | POST | Save task | ✅ Done |
| `/api/v1/capture/clarify` | POST | Clarifications | ✅ Done |
| `/api/v1/tasks` | GET | List tasks | ✅ Done |

---

## 🚀 Recommended Implementation Order

1. **Scout Tab UI** (Highest Impact)
   - Users see value immediately
   - Connects provider → suggestion → task
   - Validates entire flow end-to-end

2. **Suggestion Management**
   - Approve/dismiss workflows
   - Batch operations
   - Filter controls

3. **Today View**
   - Daily planning essential
   - Energy-aware scheduling
   - High user engagement

4. **Hunter Mode**
   - Focus session timer
   - Step navigation
   - Progress tracking

5. **Mapper View**
   - Visual overview
   - Dependency management
   - Memory consolidation

---

**This plan provides a complete roadmap from provider connection → suggestion generation → task creation, with all screens, data flows, and components mapped out!** 🎉

Last Updated: November 5, 2025
