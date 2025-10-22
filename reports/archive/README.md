# Documentation Archive

This directory contains historical documentation that has been superseded, completed, or moved to specialized reference directories.

**For current documentation**, see the main [repository README.md](../../README.md).

## Archive Organization

### 📁 2024 Archive
Historical documents from initial project conception and planning phase:
- `DIRECTORY_CLEANUP_REPORT.md` - Initial cleanup analysis
- `MASTER_MD_ORGANIZATION_REPORT.md` - Comprehensive MD organization plan

### 📁 2025 Archive
Completed implementation guides and integration documentation:
- `AI_INTEGRATION_GUIDE.md` - AI integration implementation guide
- `MOBILE_AI_INTEGRATION_FIXED.md` - Mobile AI integration fixes

### 📁 2025-10-18
Snapshot of earlier archive state (preserved for reference)

### 📁 Other Archives
- `roadmaps/` - Detailed roadmaps superseded by consolidated tracking
- `matrices/` - Feature matrices superseded by status reports
- `plans/` - Implementation plans superseded by current documentation

## Finding Current Documentation

| Archived Document | Current Replacement | Location |
|-------------------|---------------------|----------|
| Organization reports | Live documentation | Root directory |
| AI integration guides | Live implementation | `src/agents/` |
| Mobile integration docs | Mobile frontend | `frontend/src/app/mobile/` |

## Current Active Documentation

**Root Directory** (6 core files):
1. [README.md](../../README.md) - Project overview
2. [CLAUDE.md](../../CLAUDE.md) - Coding standards and TDD methodology
3. [AGENT_ENTRY_POINT.md](../../AGENT_ENTRY_POINT.md) - Epic tracking and roadmap
4. [TESTING_STRATEGY.md](../../TESTING_STRATEGY.md) - Comprehensive testing guide
5. [PRODUCTION_DEPLOYMENT_GUIDE.md](../../PRODUCTION_DEPLOYMENT_GUIDE.md) - Deployment instructions
6. [REMOTE_ACCESS.md](../../REMOTE_ACCESS.md) - Remote access configuration

**docs/** (Active development docs):
- [docs/MASTER_TASK_LIST.md](../../docs/MASTER_TASK_LIST.md) - Epic prioritization
- [docs/ADHD_TASK_MANAGEMENT_MASTER.md](../../docs/ADHD_TASK_MANAGEMENT_MASTER.md) - ADHD system vision
- [docs/REPOSITORY_STRUCTURE.md](../../docs/REPOSITORY_STRUCTURE.md) - Codebase structure
- [docs/TECH_STACK.md](../../docs/TECH_STACK.md) - Technology stack

**references/** (Reference material):
- `references/psychology/` - Psychology and behavior references
- `references/biology/` - Biological workflow references
- `references/RedHospitalityCommandCenter/` - External reference project

## Search Tips

Use GitHub's file search or `rg` (ripgrep) to find archived content:

```bash
# Search all archived files
rg "search term" reports/archive/

# Find specific file
rg --files reports/archive/ | rg "filename"
```

---

**Archive Created**: October 22, 2025
**Cleanup Ratio**: 45% reduction in root directory (11 → 6 files)
**Benefit**: Clear navigation with single sources of truth
