# Agent Resources - Navigation Hub

**Last Updated**: November 13, 2025
**Purpose**: Central documentation hub for AI agents and developers
**Organization**: Purpose-based directory structure for easy navigation

---

## 🗺️ Quick Navigation

| Category | Purpose | Quick Links |
|----------|---------|-------------|
| 📋 **[tasks/](tasks/)** | Task specifications & requirements | [Backend](tasks/backend/) • [Frontend](tasks/frontend/) |
| 📊 **[status/](status/)** | Current progress & completion tracking | [Backend](status/backend/) • [Frontend](status/frontend/) • [Overall](status/STATUS.md) |
| 🗺️ **[planning/](planning/)** | Roadmaps & sprint plans | [Current Sprint](planning/current_sprint.md) • [Next 5](planning/next_5_tasks.md) |
| 📚 **[reference/](reference/)** | Technical reference & API docs | [Backend API](reference/backend/) • [Frontend](reference/frontend/) |
| 📝 **[sessions/](sessions/)** | Work session logs & history | [Latest](sessions/2025-11-13_BE-01-03.md) |
| 🚀 **[quickstart/](quickstart/)** | Getting started guides | [Quickstart](quickstart/QUICKSTART.md) |

---

## 🎯 Common Workflows

### For AI Agents - Starting a New Task
1. Check **[planning/next_5_tasks.md](planning/next_5_tasks.md)** for priorities
2. Read task spec in **[tasks/backend/](tasks/backend/)** or **[tasks/frontend/](tasks/frontend/)**
3. Check dependencies in **[status/](status/)**
4. Implement following TDD (RED → GREEN → REFACTOR)
5. Update status and log session in **[sessions/](sessions/)**

### For AI Agents - Continuing Partial Work
1. Check **[status/](status/)** for current progress
2. Look for "What's Left" or "Next Steps" section
3. Pick up where previous agent left off

---

## 🔍 Finding Information

| Question | Where to Look |
|----------|---------------|
| What tasks exist? | [`tasks/README.md`](tasks/README.md) |
| What's done/pending? | [`status/STATUS.md`](status/STATUS.md) |
| What should I work on? | [`planning/next_5_tasks.md`](planning/next_5_tasks.md) |
| How do I call an API? | [`reference/backend/`](reference/backend/) |
| What was done recently? | [`sessions/`](sessions/) |
| How do I get started? | [`quickstart/QUICKSTART.md`](quickstart/QUICKSTART.md) |

---

## 📁 Directory Structure

```
agent_resources/
├── tasks/          ← Task specifications (WHAT to build)
├── status/         ← Current progress (WHERE we are)
├── planning/       ← Roadmaps & sprints (WHAT'S next)
├── reference/      ← Technical docs (HOW it works)
├── sessions/       ← Work logs (WHAT was done)
└── quickstart/     ← Onboarding (HOW to start)
```

See full navigation guide and detailed workflows above.
