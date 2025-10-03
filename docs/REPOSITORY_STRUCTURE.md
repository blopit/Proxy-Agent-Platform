# 📁 Repository Structure

## 🎯 Clean Repository Overview

The Proxy Agent Platform repository is now organized for optimal development workflow with clear separation of concerns and proper project management structure.

```
Proxy-Agent-Platform/
├── 📋 Project Management
│   ├── tasks/                          # Epic and task management
│   │   ├── README.md                   # Task system overview
│   │   └── epics/                      # Epic breakdown
│   │       ├── EPIC_BREAKDOWN.md       # High-level epic summary
│   │       ├── epic-1-core-proxy-agents/
│   │       ├── epic-2-gamification-system/
│   │       ├── epic-3-mobile-integration/
│   │       ├── epic-4-realtime-dashboard/
│   │       ├── epic-5-learning-optimization/
│   │       └── epic-6-testing-quality/
│   └── docs/                           # Project documentation
│       ├── PROJECT_STRUCTURE.md        # This file
│       ├── MASTER_TASK_LIST.md         # Overall progress tracking
│       └── architecture/               # Technical specifications
│
├── 🐍 Python Backend
│   ├── agent/                          # FastAPI server (PydanticAI)
│   │   ├── agents/                     # Proxy agent implementations
│   │   ├── routers/                    # API route handlers
│   │   ├── alembic/                    # Database migrations
│   │   ├── database.py                 # Database configuration
│   │   ├── main.py                     # FastAPI app entry point
│   │   └── requirements.txt            # Python dependencies
│   └── proxy_agent_platform/          # Core platform modules
│       ├── agents/                     # Agent type definitions
│       ├── api/                        # API layer
│       ├── gamification/               # XP and rewards system
│       ├── mobile/                     # Mobile integration
│       ├── models/                     # Data models
│       └── services/                   # Business logic
│
├── ⚛️ React Frontend
│   └── frontend/                       # Next.js application
│       ├── src/
│       │   ├── app/                    # App router pages
│       │   └── components/             # React components
│       ├── public/                     # Static assets
│       └── package.json                # Node.js dependencies
│
├── 🧪 Testing & Quality
│   └── tests/                          # Test suite
│       ├── agents/                     # Agent tests
│       ├── integration/                # Integration tests
│       ├── performance/                # Performance tests
│       └── conftest.py                 # Test configuration
│
├── 🔧 Infrastructure
│   ├── .claude/                        # Claude Code configuration
│   │   ├── agents/                     # Claude Code subagents
│   │   ├── commands/                   # Custom Claude commands
│   │   └── settings.local.json         # Local settings
│   ├── mcp_servers/                    # MCP server implementations
│   ├── references/                     # Reference implementations
│   ├── scripts/                        # Utility scripts
│   └── credentials/                    # Credential templates
│
└── 📄 Configuration
    ├── CLAUDE.md                       # Development guidelines
    ├── IDEA.md                         # Project vision
    ├── README.md                       # Project overview
    ├── package.json                    # Node.js workspace config
    ├── pyproject.toml                  # Python project config
    ├── pytest.ini                     # Test configuration
    ├── .gitignore                      # Git ignore rules
    └── .env.example                    # Environment template
```

## 🎯 Directory Purposes

### **📋 Project Management**
- **`tasks/`**: Comprehensive epic and task breakdown system
- **`docs/`**: Technical documentation and architecture specs

### **🐍 Backend Development**
- **`agent/`**: FastAPI server with PydanticAI proxy agents
- **`proxy_agent_platform/`**: Core platform modules and business logic

### **⚛️ Frontend Development**
- **`frontend/`**: Next.js application with CopilotKit integration

### **🧪 Quality Assurance**
- **`tests/`**: Comprehensive test suite with multiple test types

### **🔧 Development Tools**
- **`.claude/`**: Claude Code configuration and subagents
- **`mcp_servers/`**: MCP server implementations
- **`references/`**: Reference code from similar projects

## 🚀 Development Workflow

### **1. Task Management**
- Start with `tasks/README.md` for epic overview
- Follow epic-specific task lists for detailed implementation
- Use TodoWrite tool for daily task tracking

### **2. Implementation**
- Follow CLAUDE.md standards for all code
- Implement agents in `agent/agents/`
- Build frontend components in `frontend/src/components/`
- Write tests in parallel with implementation

### **3. Quality Assurance**
- Run tests with `uv run pytest`
- Check code quality with `uv run ruff check`
- Ensure documentation stays current

## 🎯 Epic System Integration with Claude Code

**Yes, the epic system works excellently with Claude Code implementation!**

### **Advantages:**
✅ **Clear Task Breakdown**: Each epic has detailed, actionable tasks
✅ **TodoWrite Integration**: Daily task tracking works with epic system
✅ **Progressive Implementation**: Can focus on one epic at a time
✅ **Clear Dependencies**: Epic dependencies clearly mapped
✅ **Measurable Progress**: Concrete deliverables and acceptance criteria

### **Claude Code Workflow:**
1. **Epic Selection**: Choose current epic from `tasks/epics/`
2. **Task Tracking**: Use TodoWrite for individual task progress
3. **Implementation**: Follow task specifications with Claude Code tools
4. **Quality Gates**: Automated testing and quality checks
5. **Progress Updates**: Regular epic completion tracking

### **Best Practices:**
- Use TodoWrite for immediate tasks (daily/weekly)
- Update epic progress weekly in master task list
- Follow CLAUDE.md coding standards throughout
- Implement test-driven development approach
- Regular code reviews using Claude Code agents

The epic system provides the strategic roadmap while Claude Code provides the tactical implementation capabilities - they complement each other perfectly for systematic platform development.

---

**Repository Status**: ✅ Clean and organized
**Next Step**: Begin Epic 1 - Core Proxy Agents
**Ready for**: Systematic implementation following task breakdown