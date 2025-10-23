# Archive Directory

This directory contains historical documentation that has been completed or superseded by newer designs.

## Purpose

Documents are archived when:
1. **Completed**: Feature/phase is fully implemented and shipped
2. **Superseded**: Replaced by newer architecture/design
3. **Historical**: No longer actively maintained but kept for reference

## Structure

```
archive/
├── design-docs/
│   ├── agent-architecture/    # Agent system refactoring (Complete)
│   └── ux-implementation/     # ADHD UX features (Shipped)
└── reports/
    ├── testing/               # Testing strategies and guides
    └── analysis/              # Historical analysis documents
```

## Contents

### design-docs/agent-architecture/
**Period**: Early 2025
**Status**: Complete - agents refactored and stable

- AGENT_ARCHITECTURE_AUDIT.md
- AGENT_ARCHITECTURE_QUICK_REFERENCE.md
- AGENT_ENTRY_POINT.md
- AGENT_MIGRATION_ROADMAP.md
- ARCHITECTURE_AUDIT_INDEX.md
- ARCHITECTURE_VERIFICATION_SUMMARY.md

**Context**: These documents represent the discovery and refactoring phase of the agent architecture. The work is complete and the current agent system is documented in the main codebase.

### design-docs/ux-implementation/
**Period**: Mid 2025
**Status**: Shipped - features in production

- ADHD_UX_INTEGRATION_COMPLETE.md
- AI_EMOJI_GENERATION.md
- ASYNC_JOB_TIMELINE_DESIGN.md
- CAPTURE_PROGRESS_DESIGN.md
- CAPTURE_TAB_DESIGN.md
- CAPTURE_WORKFLOW_VISUAL.md
- FINAL_ICON_AND_PROGRESS_FIXES.md
- INTEGRATION_COMPLETE.md
- MICRO_STEP_PROGRESS_BAR.md
- TWO_ENTITY_MODEL_COMPLETE.md
- TWO_PHASE_PROGRESS_DESIGN.md

**Context**: These documents detail the design and implementation of ADHD-optimized UX features including progress indicators, visual feedback, and capture workflows. All features have been implemented and are live.

### reports/testing/
**Period**: Various
**Status**: Reference materials

- TESTING_LLM.md
- TESTING_STRATEGY.md
- PRODUCTION_DEPLOYMENT_GUIDE.md
- REMOTE_ACCESS.md

**Context**: General testing and deployment documentation. Kept for reference but not actively maintained.

### reports/analysis/
**Period**: Various
**Status**: Historical analysis

- CAPTURE_SYSTEM_ANALYSIS.md

**Context**: Analysis documents whose findings have been incorporated into current designs.

## Using Archived Documents

### When to Reference
- Understanding historical context
- Reviewing past design decisions
- Learning from implementation journey
- Compliance/audit requirements

### When NOT to Reference
- Current development work (use active docs instead)
- New feature planning (use FUTURE_ROADMAP_REPORT.md)
- Implementation (use INTEGRATION_GUIDE.md)

## Active Documentation

For current documentation, see:
- **[PROJECT_REPORTS_INDEX.md](../PROJECT_REPORTS_INDEX.md)** - Main documentation index
- **[FUTURE_ROADMAP_REPORT.md](../FUTURE_ROADMAP_REPORT.md)** - Current roadmap

## Maintenance

### Archive Policy
- Documents moved to archive after 6 months of completion
- No active updates to archived docs (read-only)
- Retained indefinitely for historical reference
- Can be restored if needed

### Last Archived
**Date**: October 23, 2025
**By**: Development Team
**Reason**: Phase 1 (Temporal KG) complete, cleaning up for Phase 2

---

**Note**: If you need to restore an archived document or have questions about historical decisions, refer to git history or contact the development team.
