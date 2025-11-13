# 🧹 Repository Hygiene Report

**Date**: November 13, 2025
**Scope**: Entire repository structure
**Status**: 🔴 **CRITICAL ISSUES FOUND**

---

## 🚨 Executive Summary

### Critical Issues

| Issue | Severity | Impact |
|-------|----------|--------|
| **Outdated Task Directory** | 🔴 Critical | Confusion about project roadmap |
| **Broken References** | 🔴 Critical | 6+ files point to non-existent directories |
| **Misplaced Database Files** | 🟡 High | Root clutter, not in .gitignore |
| **Empty Reports Structure** | 🟡 High | Misleading directory structure |
| **Test Database Directory** | 🟡 Medium | Redundant with .data/ |
| **Workflow Ambiguity** | 🟡 Medium | Two different "workflows" meanings |

### The Problems

1. **`/tasks/` is outdated** (October 2024, says "0% complete") but **`agent_resources/tasks/`** is current (November 2025, says "~67% complete")
2. **Multiple files reference `reports/current/`** which doesn't exist
3. **Database files at root** instead of `.data/` directory
4. **`/reports/` directory structure** references subdirectories that don't exist
5. **Test database directory** should be temporary/gitignored

---

## 📊 Root Directory Analysis

### Current Structure (12 directories, 13 files)

```
/
├── 📁 agent_resources/      2.1M  ✅ Documentation hub (10/10)
├── 📁 alembic/              100K  ✅ Database migrations
├── 📁 config/               92K   ✅ Configuration files
├── 📁 docs/                 3.3M  ✅ Specialized docs (cleaned)
├── 📁 mobile/               601M  ✅ React Native app
├── 📁 reports/              44K   🔴 BROKEN STRUCTURE
├── 📁 scripts/              92K   ✅ Utility scripts
├── 📁 src/                  7.3M  ✅ Backend source
├── 📁 tasks/                60K   🔴 OUTDATED (Oct 2024)
├── 📁 test_memory_db/       20K   🟡 SHOULD BE TEMP
├── 📁 tests/                364K  🟡 AMBIGUOUS (see notes)
├── 📁 workflows/            24K   🟡 AMBIGUOUS (see notes)
│
├── 📄 proxy_agents_enhanced.db  384K  🔴 SHOULD BE IN .data/
├── 📄 README.md                 24K   🟡 Broken references
├── 📄 START_HERE.md             12K   🟡 Broken references
├── 📄 CLAUDE.md                 20K   ✅ Good
├── 📄 CONTRIBUTING.md           12K   ✅ Good
├── 📄 ARCHITECTURE_OVERVIEW.md  8K    ✅ Good
├── 📄 CHANGELOG.md              4K    ✅ Good
└── ... config files (pyproject.toml, etc.)
```

---

## 🔴 Critical Issue #1: Outdated `/tasks/` Directory

### Problem

**Root `/tasks/`** (60K, Oct 2024):
- Contains epic-based structure from October 2024
- README says "**Overall Progress: 0% Complete**"
- Says "**ready to start Epic 1**"
- Last updated: **October 2, 2024**

**`agent_resources/tasks/`** (current):
- Contains current roadmap
- README says "**Platform Completion: ~67%**"
- References **Epic 7** as current work
- Last updated: **November 10, 2025**

### Impact

**CRITICAL CONFUSION**: Developers don't know which task structure to follow!

### Evidence

`/tasks/README.md`:
```markdown
## 📊 Progress Tracking

### Current Status
- **Overall Progress**: 0% Complete
- **Current Epic**: None (ready to start Epic 1)
- **Next Milestone**: Complete Phase 1.1 (Agent Framework Setup)
```

`agent_resources/tasks/README.md`:
```markdown
## 🚀 Quick Start

**Current Sprint** (Week of Nov 10): Complete Epic 7 Frontend Integration
**Primary Tasks**: Connect TaskBreakdownModal to API, Add "Slice" button, ADHD Mode toggle
```

### Recommendation

**🎯 ARCHIVE `/tasks/` immediately**

```bash
# Archive outdated task structure
mv tasks/ docs/archive/2025-11-13-old-epic-structure/
```

**Rationale**:
- `agent_resources/tasks/` is the single source of truth
- Root `/tasks/` is 13 months outdated
- Keeping both causes dangerous confusion

---

## 🔴 Critical Issue #2: Broken References to `reports/current/`

### Problem

**6+ files reference `reports/current/`** which doesn't exist:

1. `README.md`: `**📊 Current Status** [reports/current/](reports/current/)`
2. `START_HERE.md`: References `reports/current/`
3. `reports/README.md`: Describes `current/` and `archive/` structure
4. `CHANGELOG.md`: References reports/current
5. Multiple archived docs reference it

### Actual State

```bash
$ ls -la reports/
total 88
drwxr-xr-x   4 user  staff    128 Nov 10 19:31 .
drwxr-xr-x  49 user  staff   1568 Nov 13 11:27 ..
-rw-r--r--   1 user  staff  33143 Nov 10 19:19 DOCS_REORGANIZATION_REPORT.md
-rw-r--r--   1 user  staff   5024 Nov  6 13:27 README.md
```

**No `current/` directory exists!**
**No `archive/` directory exists!**

### Impact

- 🔴 Broken navigation for users
- 🔴 Misleading documentation structure
- 🔴 README promises reports that don't exist

### Recommendation

**Option A: Remove `/reports/` entirely**
```bash
# Archive the entire reports/ directory
mv reports/ docs/archive/2025-11-13-old-reports-structure/
```

**Rationale**:
- `agent_resources/reports/` already exists for test reports
- Current `/reports/` has no useful content (DOCS_REORGANIZATION_REPORT can be archived)
- Eliminate confusion between two "reports" directories

**Option B: Create proper structure**
```bash
# Create the promised directories
mkdir -p reports/current reports/archive

# Move appropriate files
mv DOCUMENTATION_HYGIENE_REPORT.md reports/current/
mv DOCUMENTATION_HYGIENE_PHASE2_COMPLETE.md reports/current/
```

**Recommendation: Option A** (cleaner, less redundant)

---

## 🟡 High Priority Issue #3: Database Files at Root

### Problem

**Database files at root level**:
```
proxy_agents_enhanced.db  (384K)
test_memory_db/           (20K)
```

### Expected Structure

According to `.data/` directory pattern, databases should be in `.data/`:

```
/.data/
├── proxy_agents_enhanced.db
└── test_memory_db/
```

### Impact

- 🟡 Root directory clutter
- 🟡 Not following project conventions
- 🟡 Database file might be committed to git accidentally

### Recommendation

```bash
# Move database files to .data/
mkdir -p .data
mv proxy_agents_enhanced.db .data/
mv test_memory_db/ .data/

# Update .gitignore if not already present
echo ".data/" >> .gitignore
echo "*.db" >> .gitignore
```

---

## 🟡 Medium Priority Issue #4: `/tests/` vs `src/*/tests/`

### Situation

**Two test locations**:

1. **`/tests/`** (364K) - Root-level test directory
   - Contains: `integration/`, `unit/`, conftest.py, test_*.py files
   - Purpose: Integration and end-to-end tests

2. **`src/*/tests/`** - Inline with code
   - Purpose: Unit tests for specific modules
   - Following vertical slice architecture

### Analysis

**This is INTENTIONAL** based on CLAUDE.md:

> "Follow strict vertical slice architecture with tests living next to the code they test"

**However**: The distinction is unclear. Need documentation.

### Recommendation

**Keep both, but clarify**:

Create `/tests/README.md`:
```markdown
# Integration & End-to-End Tests

This directory contains integration and E2E tests that span multiple modules.

**Test Organization**:
- `/tests/` - Integration & E2E tests
- `src/*/tests/` - Unit tests (next to code)

See [testing guide](../agent_resources/testing/README.md) for details.
```

---

## 🟡 Medium Priority Issue #5: `/workflows/` vs `docs/workflows/`

### Situation

**Two "workflows" directories with different purposes**:

1. **`/workflows/`** (24K) - Contains `.toml` files
   - `dev/backend-api-feature.toml`
   - `dev/bug-fix.toml`
   - `dev/frontend-component.toml`
   - `personal/daily-planning.toml`
   - Purpose: AI coding workflow configurations

2. **`docs/workflows/`** (2 files) - Contains markdown docs
   - `AI_CODING_WORKFLOWS.md`
   - `HUMAN_TESTING_PROCESS.md`
   - Purpose: Documentation about workflows

### Analysis

**Different purposes, but naming is confusing.**

### Recommendation

**Rename root `/workflows/` to clarify purpose**:

```bash
# Rename to make purpose explicit
mv workflows/ workflow-configs/
# or
mv workflows/ .ai-workflows/
```

Then update references and add README:

```markdown
# AI Workflow Configurations

TOML configuration files for AI-assisted development workflows.

**See also**: [docs/workflows/](docs/workflows/) for workflow documentation.
```

---

## 📋 Detailed Findings

### ✅ Well-Organized Directories

| Directory | Size | Purpose | Status |
|-----------|------|---------|--------|
| `agent_resources/` | 2.1M | Documentation hub | ✅ 10/10 efficiency |
| `alembic/` | 100K | Database migrations | ✅ Proper structure |
| `config/` | 92K | Configuration files | ✅ Well organized |
| `docs/` | 3.3M | Specialized documentation | ✅ Recently cleaned |
| `mobile/` | 601M | React Native app | ✅ Proper structure |
| `scripts/` | 92K | Utility scripts | ✅ Good organization |
| `src/` | 7.3M | Backend source code | ✅ Vertical slice architecture |

### 🔴 Problem Directories

| Directory | Issue | Recommendation |
|-----------|-------|----------------|
| `tasks/` | Outdated (Oct 2024), superseded | Archive to docs/archive/ |
| `reports/` | Broken structure, empty subdirs | Archive entire directory |
| `test_memory_db/` | Should be temporary | Move to .data/ |

### 🟡 Ambiguous Directories

| Directory | Issue | Recommendation |
|-----------|-------|----------------|
| `tests/` | Purpose unclear vs src/*/tests/ | Add README explaining |
| `workflows/` | Confusing vs docs/workflows/ | Rename to workflow-configs/ |

### 🔴 Misplaced Files

| File | Issue | Recommendation |
|------|-------|----------------|
| `proxy_agents_enhanced.db` | Database at root | Move to .data/ |

---

## 🔗 Broken Reference Analysis

### Files with Broken References

**Reference to `reports/current/`** (doesn't exist):
1. `README.md` line 19
2. `START_HERE.md` (multiple references)
3. `reports/README.md` (entire structure)
4. `CHANGELOG.md`
5. Archived docs

**Reference to `/tasks/`** (outdated):
- Various docs reference root `/tasks/` which is 13 months old

### Impact

- 🔴 Users click broken links
- 🔴 Confusion about project structure
- 🔴 Developers use wrong task tracking
- 🔴 Misleading documentation

---

## 🎯 Recommended Action Plan

### Phase 1: Critical Fixes (30 minutes)

**1. Archive Outdated `/tasks/` Directory**
```bash
# Archive old epic structure
mkdir -p docs/archive/2025-11-13-old-epic-structure
mv tasks/ docs/archive/2025-11-13-old-epic-structure/

git add -A
git commit -m "chore: archive outdated /tasks/ directory (Oct 2024)"
```

**Impact**: Eliminate critical confusion about project roadmap

---

**2. Remove/Archive `/reports/` Directory**
```bash
# Archive broken reports structure
mkdir -p docs/archive/2025-11-13-old-reports
mv reports/ docs/archive/2025-11-13-old-reports/

git add -A
git commit -m "chore: archive broken /reports/ directory structure"
```

**Impact**: Remove broken references, eliminate redundancy with agent_resources/reports/

---

**3. Move Database Files to `.data/`**
```bash
# Create .data directory if needed
mkdir -p .data

# Move database files
mv proxy_agents_enhanced.db .data/
mv test_memory_db/ .data/

# Update .gitignore
echo "" >> .gitignore
echo "# Database files" >> .gitignore
echo ".data/" >> .gitignore
echo "*.db" >> .gitignore

git add -A
git commit -m "chore: move database files to .data/"
```

**Impact**: Clean root directory, prevent accidental commits of data

---

### Phase 2: Fix Broken References (30 minutes)

**4. Update README.md**

Remove broken reference:
```diff
- **📊 Current Status** [reports/current/](reports/current/)
+ **📊 Current Status** [agent_resources/STATUS.md](agent_resources/STATUS.md)
```

**5. Update START_HERE.md**

Replace references to:
- `/tasks/` → `agent_resources/tasks/`
- `reports/current/` → `agent_resources/STATUS.md`

**6. Update other files referencing broken paths**

---

### Phase 3: Clarify Ambiguous Directories (15 minutes)

**7. Add `/tests/README.md`**
```markdown
# Integration & End-to-End Tests

Integration tests that span multiple modules.

- `/tests/` - Integration & E2E tests
- `src/*/tests/` - Unit tests next to code

See [testing guide](../agent_resources/testing/README.md).
```

**8. Rename `/workflows/` to `/workflow-configs/`**
```bash
mv workflows/ workflow-configs/
# Update any references
```

Or add README explaining the difference.

---

### Phase 4: Create Summary Document (15 minutes)

**9. Update this report with completion status**

---

## 📊 Expected Outcomes

### After Phase 1

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Outdated Directories** | 2 | 0 | 100% eliminated |
| **Broken References** | 6+ files | 0 | 100% fixed |
| **Root Clutter** | 3 files/dirs | 0 | 100% cleaned |
| **Confusion** | High | Low | Clarity achieved |

### After All Phases

```
Root Directory Structure (Clean):
/
├── 📁 agent_resources/      ✅ Primary documentation
├── 📁 alembic/              ✅ Migrations
├── 📁 config/               ✅ Config
├── 📁 docs/                 ✅ Specialized docs
├── 📁 mobile/               ✅ Mobile app
├── 📁 scripts/              ✅ Scripts
├── 📁 src/                  ✅ Backend
├── 📁 tests/                ✅ Integration tests (with README)
├── 📁 workflow-configs/     ✅ AI workflows (renamed)
├── 📁 .data/                ✅ Databases (moved here)
│
└── Core files (README, CLAUDE.md, etc.)
```

**Result**: Clean, unambiguous structure with zero broken references!

---

## 🎯 Success Criteria

### Repository Hygiene Achieved When:

- ✅ No outdated directories at root
- ✅ No broken references in documentation
- ✅ Clear single source of truth for tasks (agent_resources/tasks/)
- ✅ Database files in proper location (.data/)
- ✅ Ambiguous directories clarified with READMEs
- ✅ All root directories have clear purpose
- ✅ Easy to navigate and understand structure

---

## 📝 Project Roadmap Summary

### Current Reality (from agent_resources/tasks/)

**Platform Completion**: ~67%
**Current Sprint**: Epic 7 Frontend Integration (Week of Nov 10-15)
**Active Work**: Wiring TaskBreakdownModal to Split Proxy Agent API

### Recent Completions

- Epic 1: Core Proxy Agents (✅ 100%)
- Epic 2: Gamification System (✅ 100%)
- Epic 3: Mobile Integration (✅ 100%)
- Epic 4: Real-time Dashboard (🟡 60%)
- Epic 6: Testing & Quality (🟡 99% - 887 tests)
- Epic 7: ADHD Task Splitting (🟡 77%)

### Next Up

- **BE-15**: Integration Tests (10h)
- **FE-03**: Mapper Restructure (7h)
- **BE-03 + FE-07**: Focus Sessions (9h)

**See**: [agent_resources/tasks/roadmap/](agent_resources/tasks/roadmap/) for complete roadmap.

---

## 📞 Questions & Clarifications

### Q: Why keep `/tests/` separate from `src/*/tests/`?

**A**: Different purposes:
- `/tests/` = Integration & E2E tests (span multiple modules)
- `src/*/tests/` = Unit tests (next to code, vertical slice architecture)

Both are intentional per CLAUDE.md guidelines.

### Q: What about the root workflow files?

**A**: `/workflows/` contains TOML configuration files for AI workflows.
- Different from `docs/workflows/` which documents workflows
- Recommend renaming to `workflow-configs/` for clarity

### Q: Where should new status reports go?

**A**:
- Quick status: `agent_resources/STATUS.md`
- Test reports: `agent_resources/reports/`
- Project reports: Create `docs/reports/` or keep in agent_resources/

---

**Created**: November 13, 2025
**Author**: Repository Hygiene Audit
**Status**: 🔴 **ACTION REQUIRED**
**Priority**: CRITICAL - Fix Phase 1 immediately

**Next Steps**: Execute Phase 1 actions (see Action Plan above)
