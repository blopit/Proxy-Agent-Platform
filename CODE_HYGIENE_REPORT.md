# Code Hygiene Report

**Generated**: 2025-10-29
**Status**: 🟡 Action Required
**Priority**: Medium

---

## Executive Summary

The codebase has accumulated technical debt across several areas:
- **1.8 GB** of removable files (references, build artifacts, duplicate databases)
- **2 database adapters** running in parallel (old + enhanced)
- **157 documentation files** with potential duplicates
- **Archive directory** (612 KB) that should be reviewed or removed

**Estimated Cleanup Time**: 2-3 hours
**Disk Space Recoverable**: ~1.8 GB

---

## 🚨 Critical Issues

### 1. Duplicate Database Adapters

**Issue**: Two database adapter systems coexist
**Impact**: Confusion, maintenance burden, potential bugs

| File | Status | Usage | Action |
|------|--------|-------|--------|
| `src/database/adapter.py` | ⚠️ OLD | Used in 2 files | **MIGRATE** |
| `src/database/enhanced_adapter.py` | ✅ NEW | Actively used | **KEEP** |

**Files Still Using Old Adapter**:
```python
src/tests/test_agents.py         # Line: from src.database.adapter import DatabaseAdapter
src/agents/registry.py           # Line: from src.database.adapter import DatabaseAdapter
```

**Recommendation**:
1. Migrate `src/agents/registry.py` to `EnhancedDatabaseAdapter`
2. Migrate `src/tests/test_agents.py` to `EnhancedDatabaseAdapter`
3. Delete `src/database/adapter.py`
4. Delete old database `proxy_agents.db` (20KB, unused)

---

### 2. Duplicate Databases (540 KB Total)

**Issue**: Multiple database files scattered across the project

| Location | Size | Last Modified | Status |
|----------|------|---------------|--------|
| `./proxy_agents_enhanced.db` | 300 KB | Oct 29 (ACTIVE) | ✅ KEEP |
| `./proxy_agents.db` | 20 KB | Oct 21 | ❌ DELETE |
| `./simple_tasks.db` | 12 KB | Oct 21 | ❌ DELETE |
| `./frontend/proxy_agents_enhanced.db` | ? | ? | ❌ DELETE |
| `./src/proxy_agents_enhanced.db` | ? | ? | ❌ DELETE |
| `./src/proxy_agents.db` | ? | ? | ❌ DELETE |
| `./src/services/tests/proxy_agents_enhanced.db` | ? | Test artifact | ⚠️ AUTO-GENERATED |

**Database WAL Files** (Write-Ahead Log):
```
./src/proxy_agents_enhanced.db-shm
./src/proxy_agents_enhanced.db-wal
```
These are SQLite temp files - should be in `.gitignore`

**Recommendation**:
```bash
# Keep only root database
rm -f proxy_agents.db simple_tasks.db
rm -f frontend/proxy_agents_enhanced.db
rm -f src/proxy_agents_enhanced.db src/proxy_agents.db
rm -f src/proxy_agents_enhanced.db-shm src/proxy_agents_enhanced.db-wal

# Update .gitignore to exclude WAL files
echo "*.db-shm" >> .gitignore
echo "*.db-wal" >> .gitignore
```

---

## 🟡 Medium Priority Issues

### 3. Archive Directory (612 KB)

**Issue**: Archive directory contains old code and docs

```
archive/
├── backend/          # Old backend services (complex routers)
├── frontend/         # Unknown frontend artifacts
├── design-docs/      # Old design documents
├── reports/          # Old reports
└── README.md         # 3.4 KB explanation
```

**Contents**:
- `energy_router_complex.py` - Old energy service
- `focus_router_complex.py` - Old focus service
- `gamification_router_complex.py` - Old gamification service
- `shopping_list_service.py` - Shopping list feature (?)

**Recommendation**:
1. **Review** `archive/README.md` to understand what's archived
2. **Decision**: Either:
   - Delete entirely if truly obsolete
   - Move to separate git branch for history
   - Keep if contains valuable reference code

**Action**: User should review and decide

---

### 4. References Directory (1.2 GB!)

**Issue**: Massive references directory with external code

```
references/
├── references/ottomator-agents/    # External agent examples
│   ├── graphiti-agent/
│   ├── streambuzz-agent/
│   ├── docling-rag-agent/
│   └── ~voiceflow-dialog-api-integration~/
└── RedHospitalityCommandCenter/    # Submodule?
```

**Impact**:
- Bloats repository size
- Slows git operations
- Not part of actual codebase

**Recommendation**:
1. **Move to separate repo**: Create `proxy-agent-references` repo
2. **Document URLs**: Keep README with links to original sources
3. **Git submodule**: If needed for reference, use submodules
4. **Local only**: Add to `.gitignore` if for dev reference only

**Immediate Action**:
```bash
# Check if in git
git status references/

# If committed, consider:
# 1. Move to separate repo
# 2. Add to .gitignore
# 3. Document original sources
```

---

### 5. Config Directory (92 KB)

**Issue**: Unclear if config system is actively used

```
config/
├── config_loader.py          # Config loading system
├── agent_config_schema.py    # Agent configuration schema
├── test_config_basic.py      # Basic test
└── __init__.py
```

**Questions**:
1. Is this config system used anywhere?
2. Replaced by `src/core/settings.py`?
3. Needed for future features?

**Recommendation**:
```bash
# Check usage
grep -r "from config" src --include="*.py"
grep -r "import config" src --include="*.py"

# If unused:
# - Move to archive OR
# - Delete if replaced by src/core/settings.py
```

---

### 6. Frontend Build Artifacts (244 MB)

**Issue**: Build artifacts committed to git (or just locally built)

| Directory | Size | Status |
|-----------|------|--------|
| `frontend/storybook-static/` | 9 MB | Build artifact |
| `frontend/.next/` | 235 MB | Build artifact |
| `frontend/node_modules/` | 1.6 GB | Dependencies |

**Git Status Check Needed**:
```bash
git status frontend/storybook-static/
git status frontend/.next/
```

**Recommendation**:
1. **If in git**: Remove and add to `.gitignore`
2. **If local only**: Already in `.gitignore`, all good!

**Should be in `.gitignore`**:
```
frontend/.next/
frontend/storybook-static/
frontend/node_modules/
```

---

### 7. Test Files with "Basic" Naming

**Issue**: Non-standard test file naming

```
src/memory/test_memory_basic.py
src/agents/test_unified_basic.py
src/mcp/test_mcp_basic.py
```

**Standard**: Tests should be in `tests/` directory and named `test_*.py`

**Recommendation**:
1. Move to respective `tests/` directories
2. Rename to `test_<feature>.py` (remove "basic")
3. Or delete if superseded by proper tests

**Migration**:
```bash
# Example
mv src/memory/test_memory_basic.py src/memory/tests/test_memory_client.py
mv src/agents/test_unified_basic.py src/agents/tests/test_unified_agent.py
mv src/mcp/test_mcp_basic.py src/mcp/tests/test_mcp.py
```

---

### 8. Python Cache Directories (29 instances)

**Issue**: 29 `__pycache__` directories in src/

**Status**: Should be in `.gitignore` (they are: `__pycache__/`)

**Action**:
```bash
# Clean them
find src -type d -name "__pycache__" -exec rm -rf {} +

# Verify gitignore
grep "__pycache__" .gitignore  # ✅ Already there
```

---

## 🟢 Low Priority Issues

### 9. Documentation Proliferation (157 files)

**Issue**: Large number of markdown files - possible duplicates

**Breakdown**:
- Design docs: ~50 files in `docs/design/`
- Task specs: 36 files in `docs/tasks/`
- Root docs: ~20 files
- Other: ~50 files

**Potential Issues**:
- Duplicate information
- Outdated docs not updated
- No clear index/navigation

**Recommendation**:
1. Create `docs/INDEX.md` - Master index of all docs
2. Review for duplicates
3. Archive outdated docs to `docs/archive/`
4. Maintain single source of truth

**Not urgent** - defer to future sprint

---

### 10. Seed Script Duplication

**Files**:
```
src/database/seeds/seed_development_tasks.py    # 36 development tasks
src/database/seeds/seed_dogfooding_tasks.py     # Dogfooding tasks (new)
src/database/seed_data.py                       # Old seed system?
```

**Recommendation**:
1. Check if `seed_data.py` is still used
2. If not, delete it
3. Document relationship between the two seed scripts

---

## 📋 Action Plan

### Immediate (30 minutes)

```bash
# 1. Clean duplicate databases
rm -f proxy_agents.db simple_tasks.db
rm -f frontend/proxy_agents_enhanced.db
rm -f src/proxy_agents_enhanced.db src/proxy_agents.db
rm -f src/proxy_agents_enhanced.db-shm src/proxy_agents_enhanced.db-wal

# 2. Update .gitignore
echo "*.db-shm" >> .gitignore
echo "*.db-wal" >> .gitignore

# 3. Clean pycache
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null

# 4. Verify gitignore for build artifacts
git check-ignore frontend/.next/ frontend/storybook-static/
```

### Short Term (2-3 hours)

1. **Migrate Old Adapter** (1 hour)
   - Update `src/agents/registry.py`
   - Update `src/tests/test_agents.py`
   - Delete `src/database/adapter.py`
   - Run all tests

2. **Review Archive** (30 min)
   - Read `archive/README.md`
   - Decide: keep, delete, or branch
   - Document decision

3. **References Cleanup** (30 min)
   - Check git status
   - Move to separate repo OR add to .gitignore
   - Document original sources

4. **Config Review** (30 min)
   - Check if config/ is used
   - Merge with src/core/settings.py if overlap
   - Delete or document purpose

### Medium Term (Next Sprint)

1. **Documentation Audit**
   - Create `docs/INDEX.md`
   - Review for duplicates
   - Archive outdated docs
   - Establish doc maintenance process

2. **Test File Standardization**
   - Move `test_*_basic.py` files to tests/ dirs
   - Ensure all tests follow conventions
   - Update test discovery patterns

---

## 🎯 Expected Outcomes

After cleanup:

| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| **Disk Space** | ~2 GB | ~200 MB | ~1.8 GB |
| **Database Files** | 9 files | 1 file | 8 files |
| **Database Adapters** | 2 systems | 1 system | Simpler |
| **Confusing Directories** | 3 (archive, references, config) | 0-1 | Clarity |
| **Test File Locations** | Mixed | Standardized | Consistency |

---

## 🔍 How to Verify

### Database Adapter Migration
```bash
# After migration, this should return nothing:
grep -r "from src.database.adapter import" src --include="*.py"
```

### Database File Cleanup
```bash
# Should show only 1 database:
find . -name "*.db" -not -path "*/node_modules/*" | grep -v test
# Expected: ./proxy_agents_enhanced.db
```

### Build Artifacts Not in Git
```bash
git status | grep -E "\.next|storybook-static"
# Expected: nothing (if properly ignored)
```

---

## 📚 References

- **Database Migration Guide**: See BE-00 implementation
- **Git Best Practices**: Keep repo lean, use .gitignore
- **Python Best Practices**: Tests in tests/, no __pycache__ in git

---

## ✅ Next Steps

1. **User Review**: Review this report and decide on archive/references
2. **Execute Immediate**: Run immediate cleanup commands
3. **Schedule Short Term**: Add to next sprint (2-3 hours)
4. **Track Progress**: Use dogfooding system to track cleanup tasks!

**Recommendation**: Create tasks in the system for cleanup work and dogfood the cleanup process! 🐕

---

**Report Status**: Ready for Review
**Action Required**: User decision on archive/ and references/
