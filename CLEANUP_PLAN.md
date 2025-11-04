# Repository Cleanup Plan

**Generated**: 2025-11-03
**Repository**: Proxy-Agent-Platform
**Current Size**: ~4.5GB
**Potential Reduction**: 1.26GB (28%)

## Executive Summary

The Proxy-Agent-Platform is actively maintained (138 commits in 3 months) but contains **1.2GB of reference materials**, **duplicate database files**, and build artifacts that should be cleaned up. This document provides a prioritized action plan for archiving and removing unnecessary files.

---

## Quick Stats

- **Total Python Files**: 12,732 (most in .venv)
- **Active Code**: ~100 core Python files in src/
- **Documentation**: 182+ markdown files
- **Database Copies**: 6 files (should be 1)
- **Build Artifacts**: .DS_Store (83), __pycache__ (83), node_modules (2.2GB)
- **Reference Projects**: 1.2GB (should not be in version control)

---

## Phase 1: Immediate Cleanup (30 minutes)

### 1.1 Update .gitignore

**Priority**: CRITICAL
**Risk**: None
**Impact**: Prevents future commits of artifacts

```bash
# Add to .gitignore
echo "
# Database files
*.db
*.db-shm
*.db-wal

# macOS
.DS_Store

# Test artifacts
test_memory_db/
.coverage
.pytest_cache/

# Build artifacts
.next/
.expo/
__pycache__/
*.pyc
" >> .gitignore
```

### 1.2 Remove Tracked Artifacts

**Priority**: HIGH
**Risk**: None
**Impact**: Clean repository

```bash
# Remove .DS_Store files (83 files)
find . -name ".DS_Store" -exec git rm -f {} \;

# Remove duplicate database files
git rm -f frontend/proxy_agents_enhanced.db*
git rm -f src/services/tests/proxy_agents_enhanced.db
git rm -f simple_tasks.db

# Commit cleanup
git commit -m "chore: Remove build artifacts and duplicate database files"
```

### 1.3 Clean Local Artifacts

**Priority**: HIGH
**Risk**: None (regenerable)
**Impact**: Free up disk space locally

```bash
# Clean Python cache
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find . -name "*.pyc" -delete

# Clean build directories
rm -rf frontend/.next
rm -rf mobile/.expo
rm -rf .pytest_cache
rm -rf test_memory_db

# Clean coverage data
rm -f .coverage
```

---

## Phase 2: Archive Reference Projects (1 hour)

### 2.1 Remove references/ Directory

**Priority**: HIGH
**Risk**: LOW (external projects, not core code)
**Impact**: Save 1.2GB in repository

**Before Removal - Document References:**

Create `docs/EXTERNAL_REFERENCES.md`:

```markdown
# External Reference Projects

These projects were removed from version control on 2025-11-03 but served as references during development.

## Projects

1. **ultimate-assistant-web** (926MB)
   - Purpose: Reference implementation
   - Location: https://github.com/[owner]/ultimate-assistant-web

2. **ottomator-agents** (118MB)
   - Purpose: Agent patterns reference
   - Location: https://github.com/[owner]/ottomator-agents

3. **claude-task-master** (33MB)
   - Purpose: Task management patterns
   - Location: https://github.com/[owner]/claude-task-master

4. **RedHospitalityCommandCenter** (23MB)
   - Purpose: Knowledge graph implementation
   - Type: Git submodule
   - Location: https://github.com/[owner]/RedHospitalityCommandCenter
```

**Execute Removal:**

```bash
# Create documentation
# (create the file manually or via editor)

# Remove reference directory
git rm -rf references/

# Commit
git commit -m "chore: Remove reference projects from version control

Reference projects moved to external documentation.
See docs/EXTERNAL_REFERENCES.md for links.

Reduces repository size by 1.2GB."
```

### 2.2 Remove Empty Directories

**Priority**: MEDIUM
**Risk**: None
**Impact**: Clean structure

```bash
# Remove empty directories
git rm -rf frontend/src/app/mobile2
git rm -rf credentials
# Note: agent/routers/ has content, verify before removing

git commit -m "chore: Remove empty directories"
```

---

## Phase 3: Documentation Cleanup (2 hours)

### 3.1 Archive Superseded Documentation

**Priority**: MEDIUM
**Risk**: LOW
**Impact**: Clearer current status

```bash
# Move superseded epic report
git mv EPIC_7_COMPLETE_95_PERCENT.md docs/archive/EPIC_7_COMPLETE_95_PERCENT_2025-11-02.md

# Commit
git commit -m "docs: Archive superseded Epic 7 status report"
```

### 3.2 Consolidate Mobile Documentation

**Priority**: MEDIUM
**Risk**: LOW
**Impact**: Single source of truth

**Action**: Create `mobile/STATUS.md` by merging:
- `mobile/CONVERSION_STATUS.md`
- `mobile/COMPONENTS_CONVERTED.md`
- `mobile/SESSION_2_SUMMARY.md`
- `mobile/STORYBOOK_SETUP_SUMMARY.md`

**After merging:**

```bash
# Remove individual status files
git rm mobile/CONVERSION_STATUS.md mobile/COMPONENTS_CONVERTED.md
git rm mobile/SESSION_2_SUMMARY.md mobile/STORYBOOK_SETUP_SUMMARY.md

git commit -m "docs(mobile): Consolidate status docs into single STATUS.md"
```

### 3.3 Create Documentation Index

**Priority**: MEDIUM
**Risk**: None
**Impact**: Easier navigation

Create `docs/INDEX.md` with categorized links to all 182+ docs:

```markdown
# Documentation Index

## Getting Started
- [README](../README.md) - Project overview
- [START_HERE](../START_HERE.md) - Quick start guide
- [Installation Guide](installation.md)

## Architecture
- [Repository Structure](REPOSITORY_STRUCTURE.md)
- [Tech Stack](TECH_STACK.md)
- [Database Design](database/README.md)

## Development
- [Developer Guide](frontend/DEVELOPER_GUIDE.md)
- [Testing Guide](testing/TESTING.md)
- [CLAUDE.md](../CLAUDE.md) - AI coding guidelines

## Components
- [Frontend Documentation](frontend/README.md)
- [Mobile Documentation](mobile/README.md)
- [Backend API](api/README.md)

## Status & Progress
- [Epic 7 Complete](../EPIC_7_COMPLETE_100_PERCENT.md)
- [Mobile Status](../mobile/STATUS.md)

## Archive
- [Archived Documentation](archive/README.md)
```

---

## Phase 4: Code Cleanup (4-8 hours)

### 4.1 Resolve API Duplication

**Priority**: MEDIUM
**Risk**: MEDIUM (requires understanding usage)
**Impact**: Clearer API structure

**Investigation Required:**

```bash
# Find usages of simple_tasks.py
rg "from.*simple_tasks import" --type py
rg "simple_tasks\." --type py
```

**Options:**
1. **Option A**: Remove `simple_tasks.py` if only used in demos
2. **Option B**: Document clearly in code comments when to use each
3. **Option C**: Merge functionality into main `tasks.py`

**Recommendation**: Investigate usage, then decide. Add to CLAUDE.md:

```python
# API Endpoint Usage Guidelines

## Task APIs
- `/src/api/tasks.py` - Full-featured task management API (USE THIS)
- `/src/api/simple_tasks.py` - Simplified API for demos/testing only

When to use:
- Production code → tasks.py
- Demos/examples → simple_tasks.py
- Tests → Either, prefer tasks.py for integration tests
```

### 4.2 Complete Mobile Component Migration

**Priority**: HIGH
**Risk**: MEDIUM (active development area)
**Impact**: Single component structure

**Status**: 8/51 components converted (16%)

**Action Plan:**
1. Track remaining 43 components to convert
2. Convert in batches of 5-10
3. When all converted, remove old structure:

```bash
# After all components migrated
git rm -rf mobile/src/components/

git commit -m "refactor(mobile): Complete component migration to new structure

All 51 components now in mobile/components/
Removed old mobile/src/components/ structure"
```

### 4.3 Remove Version Suffixes

**Priority**: LOW
**Risk**: HIGH (only after confirming v2 fully replaces v1)
**Impact**: Cleaner naming

**After confirming v2 is stable:**

```bash
# Example (DO NOT RUN without verification):
# git mv src/services/task_service_v2.py src/services/task_service.py
# git rm src/services/task_service_v1.py
# Update all imports
```

### 4.4 Address TODOs

**Priority**: MEDIUM
**Risk**: None (documentation task)
**Impact**: Clear action items

**Action**: Create GitHub issues for the 42 TODOs found

```bash
# Extract TODOs with context
rg "TODO|FIXME|DEPRECATED" --type py -C 2 > TODO_AUDIT.txt

# Then create issues:
# - High priority: TODOs in core files (task_models.py, tasks.py)
# - Medium priority: Service-level TODOs
# - Low priority: Test TODOs

# After creating issues, optionally add issue numbers:
# TODO(#123): Implement feature X
```

---

## Phase 5: Test Organization (2-4 hours)

### 5.1 Consolidate Test Structure

**Priority**: LOW
**Risk**: MEDIUM (affects test discovery)
**Impact**: Consistent structure

**Current State:**
- `/tests/` - 8 root-level test files
- `/src/*/tests/` - 48 co-located test files

**Recommendation**: Prefer co-located tests (per CLAUDE.md)

**Action**:
1. Move `/tests/` contents to appropriate `src/*/tests/` locations
2. Update test discovery in `pytest.ini` if needed
3. Update CI/CD pipelines

```bash
# Example migration (verify paths first):
# git mv tests/test_models.py src/core/tests/
# git mv tests/test_api.py src/api/tests/
```

---

## Detailed Removal Checklist

### Safe to Remove (Low Risk)

- [x] Build Artifacts
  - [ ] 83 `.DS_Store` files
  - [ ] 83 `__pycache__/` directories
  - [ ] `frontend/.next/`
  - [ ] `mobile/.expo/`
  - [ ] `.pytest_cache/`
  - [ ] `.coverage`

- [x] Duplicate Databases
  - [ ] `frontend/proxy_agents_enhanced.db`
  - [ ] `frontend/proxy_agents_enhanced.db-shm`
  - [ ] `frontend/proxy_agents_enhanced.db-wal`
  - [ ] `src/services/tests/proxy_agents_enhanced.db`
  - [ ] `simple_tasks.db`

- [x] Empty Directories
  - [ ] `frontend/src/app/mobile2/`
  - [ ] `credentials/`

- [x] Reference Projects (1.2GB)
  - [ ] `references/ultimate-assistant-web/`
  - [ ] `references/ottomator-agents/`
  - [ ] `references/claude-task-master/`
  - [ ] `references/RedHospitalityCommandCenter/` (submodule)

### Verify Before Removing (Medium Risk)

- [ ] Superseded Documentation
  - [ ] `EPIC_7_COMPLETE_95_PERCENT.md` (verify 100% version is complete)
  - [ ] Individual mobile status files (after consolidation)

- [ ] Legacy Frontend Routes
  - [ ] `frontend/src/app/mobile/` (verify no active dependencies)
  - [ ] `frontend/src/app/demo/chevron/` (confirm demo-only)

- [ ] API Files
  - [ ] `src/api/simple_tasks.py` (audit usage first)
  - [ ] Old database schema files (verify migrations complete)

### Do Not Remove (High Risk)

- [x] Core Code
  - [x] `src/` directory
  - [x] `mobile/` directory
  - [x] `frontend/` directory
  - [x] `alembic/` migrations

- [x] Active Documentation
  - [x] `README.md`
  - [x] `START_HERE.md`
  - [x] `CLAUDE.md`
  - [x] `docs/` (active files)

- [x] Configuration
  - [x] `pyproject.toml`
  - [x] `package.json` files
  - [x] `pytest.ini`
  - [x] `.gitignore`

---

## Execution Timeline

### Week 1: Immediate Wins

**Day 1** (30 minutes)
- [ ] Update `.gitignore`
- [ ] Remove tracked artifacts (.DS_Store, duplicate DBs)
- [ ] Clean local build artifacts
- [ ] Commit: "chore: Remove build artifacts and duplicates"

**Day 2** (1 hour)
- [ ] Document reference projects in `docs/EXTERNAL_REFERENCES.md`
- [ ] Remove `references/` directory
- [ ] Commit: "chore: Remove reference projects (save 1.2GB)"
- [ ] Push to remote

**Day 3** (2 hours)
- [ ] Archive `EPIC_7_COMPLETE_95_PERCENT.md`
- [ ] Consolidate mobile status docs into `mobile/STATUS.md`
- [ ] Commit: "docs: Consolidate and archive documentation"

### Week 2: Documentation Organization

**Day 1** (2 hours)
- [ ] Create `docs/INDEX.md` with categorized links
- [ ] Review and update `CLAUDE.md` with Epic 7 patterns
- [ ] Update `docs/REPOSITORY_STRUCTURE.md` with current state

**Day 2** (2 hours)
- [ ] Audit mobile docs for old structure references
- [ ] Update installation docs if needed
- [ ] Create migration guide if API changes needed

### Week 3-4: Code Cleanup

**Ongoing** (spread over 2 weeks)
- [ ] Complete mobile component migration (43 remaining)
- [ ] Audit and document simple_tasks.py vs tasks.py usage
- [ ] Create GitHub issues for 42 TODOs
- [ ] Plan test structure consolidation

---

## Expected Outcomes

### Immediate Benefits (Week 1)

✅ **Repository Size**: Reduce by 1.26GB (28%)
✅ **Cleaner Git History**: No more accidental commits of artifacts
✅ **Faster Clone Times**: Smaller repository
✅ **Clear Status**: Up-to-date documentation only

### Medium-Term Benefits (Month 1)

✅ **Single Component Structure**: mobile/ fully migrated
✅ **Organized Documentation**: Easy to navigate with INDEX.md
✅ **Tracked TODOs**: All action items in GitHub issues
✅ **Clear API Guidelines**: Documented usage patterns

### Long-Term Benefits (Quarter 1)

✅ **Maintainable Codebase**: No duplicate/legacy code
✅ **Clear Test Structure**: Consistent co-located tests
✅ **Professional Repository**: Easy for new contributors

---

## Risk Mitigation

### Before Any Deletion

1. **Create Backup Branch**
   ```bash
   git checkout -b backup/pre-cleanup
   git push origin backup/pre-cleanup
   ```

2. **Document Removals**
   - Every removal should reference this document
   - Major removals should have issue tickets

3. **Test After Cleanup**
   ```bash
   # After each phase, verify:
   uv run pytest  # All tests still pass
   cd frontend && npm run build  # Frontend builds
   cd mobile && npm run build  # Mobile builds
   ```

### Rollback Plan

If issues arise:
```bash
# Revert last commit
git revert HEAD

# Or restore from backup
git reset --hard backup/pre-cleanup
```

---

## Maintenance

### Weekly Checks

```bash
# Check for new artifacts
find . -name ".DS_Store" | wc -l
find . -name "__pycache__" -type d | wc -l

# Check for duplicate databases
find . -name "*.db" -type f

# Review large files
git ls-files | xargs ls -lh | sort -k5 -hr | head -20
```

### Monthly Audits

- Review TODOs: `rg "TODO|FIXME" --type py`
- Check documentation accuracy
- Verify test coverage: `uv run pytest --cov`
- Review repository size: `du -sh .git`

---

## Questions & Decisions Needed

### Before Proceeding

1. **Reference Projects**: Confirm links to external repos for EXTERNAL_REFERENCES.md
2. **simple_tasks.py**: Audit usage - keep, remove, or merge?
3. **Mobile Migration**: What's the timeline for converting remaining 43 components?
4. **Version Suffixes**: When can v2 files replace v1?
5. **Test Structure**: Prefer root tests/ or co-located src/*/tests/?

### Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-11-03 | Create CLEANUP_PLAN.md | Document archival strategy |
| TBD | | |

---

## References

- [CLAUDE.md](CLAUDE.md) - Development guidelines
- [REPOSITORY_STRUCTURE.md](docs/REPOSITORY_STRUCTURE.md) - Current structure
- [.gitignore](.gitignore) - Ignored patterns

---

**Last Updated**: 2025-11-03
**Next Review**: 2025-11-10 (after Phase 1 completion)
