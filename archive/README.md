# 📦 Archive Directory

This directory contains historical documentation that has been completed, superseded by newer designs, or is no longer actively maintained but kept for reference.

## Purpose

Documents are archived when:
1. **Completed**: Feature/phase is fully implemented and shipped
2. **Superseded**: Replaced by newer architecture/design decisions
3. **Historical**: No longer actively maintained but valuable for context
4. **Cleanup/Migration**: One-time reports about repository organization

## Structure

```
archive/
├── README.md (this file)
├── design-docs/
│   ├── agent-architecture/    # Agent system refactoring (Complete)
│   ├── ux-implementation/     # ADHD UX features (Shipped)
│   ├── backend/               # Backend architecture (Historical)
│   └── migrations/            # Migration documents
├── reports/
│   ├── testing/               # Testing strategies and guides
│   └── analysis/              # Historical analysis documents
└── YYYY-MM-DD/                # Date-based cleanup reports
    └── cleanup-reports/       # Repository cleanup documentation
```

## Recent Archives

### 2025-11-06 - Repository Reorganization
**Path**: `2025-11-06/cleanup-reports/`
**Status**: Completed cleanup

Documents archived during major repository reorganization:
- `CLEANUP_COMPLETED.md` - Initial cleanup completion report
- `DEEP_CLEANUP_REPORT.md` - Deep analysis of codebase organization
- `FINAL_SCAN_REPORT.md` - Final validation of cleanup work

**Context**: Major repository reorganization to improve navigation and organization. All cleanup work complete, documents archived for historical reference.

## Historical Archives

### design-docs/agent-architecture/
**Period**: Early 2025
**Status**: Complete - agents refactored and stable

Documents:
- AGENT_ARCHITECTURE_AUDIT.md
- AGENT_ARCHITECTURE_QUICK_REFERENCE.md
- AGENT_ENTRY_POINT.md
- AGENT_MIGRATION_ROADMAP.md
- ARCHITECTURE_AUDIT_INDEX.md
- ARCHITECTURE_VERIFICATION_SUMMARY.md

**Context**: Discovery and refactoring phase of the agent architecture. Work is complete and current agent system is documented in the main codebase.

### design-docs/ux-implementation/
**Period**: Mid 2025
**Status**: Shipped - features in production

Documents:
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

**Context**: Design and implementation of ADHD-optimized UX features including progress indicators, visual feedback, and capture workflows. All features implemented and live.

### reports/testing/
**Period**: Various
**Status**: Reference materials

Documents:
- TESTING_LLM.md
- TESTING_STRATEGY.md
- PRODUCTION_DEPLOYMENT_GUIDE.md
- REMOTE_ACCESS.md

**Context**: General testing and deployment documentation. Kept for reference but not actively maintained. See current testing docs in `docs/testing/`.

### reports/analysis/
**Period**: Various
**Status**: Historical analysis

Documents:
- CAPTURE_SYSTEM_ANALYSIS.md

**Context**: Analysis documents whose findings have been incorporated into current designs.

## Using Archived Documents

### ✅ When to Reference
- Understanding historical context and evolution
- Reviewing past design decisions and rationale
- Learning from implementation journey
- Compliance and audit requirements
- Onboarding new team members (historical context)
- Researching why certain decisions were made

### ❌ When NOT to Reference
- Current development work (use `docs/` instead)
- New feature planning (use `docs/status/` and `reports/current/`)
- Implementation guides (use `docs/guides/` and `docs/getting-started/`)
- API documentation (use `docs/api/`)
- Active testing strategies (use `docs/testing/`)

## Active Documentation

For current, actively maintained documentation:

- **[docs/INDEX.md](../docs/INDEX.md)** - Documentation hub
- **[reports/current/](../reports/current/)** - Current status reports
- **[START_HERE.md](../START_HERE.md)** - New developer guide
- **[docs/status/](../docs/status/)** - Current project status
- **[docs/guides/](../docs/guides/)** - Active how-to guides

## Archival Policy

### When to Archive

Documents should be archived when:
- ✅ Feature/phase is fully complete (6+ months)
- ✅ Superseded by newer designs or docs
- ✅ Historical value only (no active reference)
- ✅ One-time reports (cleanup, migration)

Documents should NOT be archived if:
- ❌ Still actively referenced
- ❌ Contains current API/architecture info
- ❌ Part of active development docs
- ❌ Less than 3 months old (unless superseded)

### How to Archive

```bash
# 1. Create archive directory with today's date
mkdir -p archive/$(date +%Y-%m-%d)/category-name

# 2. Move documents to archive
mv path/to/doc.md archive/$(date +%Y-%m-%d)/category-name/

# 3. Update this README.md with entry

# 4. Update any links pointing to archived docs

# 5. Commit changes
git add archive/ path/to/moved/docs
git commit -m "docs: archive completed documentation for $(date +%Y-%m-%d)"
```

## Archive Maintenance

### Regular Maintenance
- **Quarterly Review**: Check for docs to archive (every 3 months)
- **Annual Cleanup**: Remove truly obsolete docs (keep 2+ years)
- **Link Validation**: Ensure no active docs link to archives
- **Index Updates**: Keep this README current

### Archive Integrity
- Documents are read-only once archived
- No updates to archived content (preserve historical accuracy)
- Can be restored to active docs if needed
- Git history always available for deeper investigation

## Finding Archived Content

### By Date
```bash
# List all dated archives
ls -la archive/ | grep "^d.*20"

# View specific date's archives
ls archive/2025-11-06/
```

### By Topic
```bash
# Search for specific topic
grep -r "search term" archive/

# Find by filename
find archive/ -name "*keyword*"
```

### By Category
```bash
# Design documents
ls archive/design-docs/

# Reports
ls archive/reports/

# Specific category
ls archive/design-docs/agent-architecture/
```

## Archive History

| Date | Category | Reason | Documents |
|------|----------|--------|-----------|
| 2025-11-06 | Cleanup Reports | Repository reorganization complete | 3 reports |
| 2025-10-23 | Temporal KG | Phase 1 complete, Phase 2 starting | Multiple design docs |
| 2025-Mid | UX Implementation | ADHD features shipped to production | 11 design docs |
| 2025-Early | Agent Architecture | Agent refactoring complete | 6 architecture docs |

## Restoration

If you need to restore an archived document to active documentation:

```bash
# 1. Copy from archive
cp archive/YYYY-MM-DD/category/doc.md docs/appropriate-location/

# 2. Update the document (add current date, update content)

# 3. Update navigation (docs/INDEX.md, etc.)

# 4. Commit with clear message
git commit -m "docs: restore and update [doc name] from archive"
```

## Questions?

- **Looking for current docs?** See [docs/INDEX.md](../docs/INDEX.md)
- **Need historical context?** Browse subdirectories above
- **Want to archive something?** Follow archival policy above
- **Can't find something?** Check git history: `git log --all --full-history -- path/to/file`

---

**Last Major Update**: November 6, 2025
**Maintained By**: Development Team
**Review Schedule**: Quarterly

---

**Navigation**: [↑ Project Root](../) | [📚 Active Docs](../docs/INDEX.md) | [📊 Current Reports](../reports/current/)

*Archives preserve our development journey. When in doubt, check active docs first!*
