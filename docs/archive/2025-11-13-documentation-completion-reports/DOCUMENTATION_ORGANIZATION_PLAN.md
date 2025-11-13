# Documentation Organization Plan

**Created**: November 10, 2025
**Status**: In Progress

---

## Overview

This document outlines the plan to organize useful documentation from `/docs` (root) into `/agent_resources` while archiving or removing outdated content.

---

## Analysis Summary

### Current State

**agent_resources/** (well-organized for AI agents):
- ✅ architecture/ - System design docs
- ✅ backend/ - Backend-specific docs
- ✅ frontend/ - Frontend-specific docs
- ✅ testing/ - Testing docs
- ✅ project/ - Project management, tasks, roadmaps
- ✅ docs/ - Core documentation (authentication, onboarding, providers)

**docs/** (root) contains 26 directories with mixed utility:
- 📁 Useful: getting-started, references, design, guides (partial), api
- 📁 Redundant: architecture, backend, frontend, testing, status, tasks
- 📁 Outdated: roadmap, task-splitting, workflow-templates, mvp, user-guide, etc.

---

## Organization Plan

### Phase 1: Move Useful Documentation

#### 1.1 Getting Started Documentation
**Source**: `/docs/getting-started/`
**Destination**: `/agent_resources/docs/getting-started/`
**Action**: Move entire directory

**Files**:
- `BACKEND_DEVELOPER_START.md` (Last updated: Oct 28)
- `FRONTEND_DEVELOPER_START.md` (Last updated: Nov 5)
- `installation.md` (Last updated: Nov 1)

**Justification**: Essential onboarding docs, recently updated, no equivalent in agent_resources

#### 1.2 Reference Documentation
**Source**: `/docs/references/`
**Destination**: `/agent_resources/docs/references/`
**Action**: Move entire directory

**Files**:
- `ADHD_TASK_MANAGEMENT_MASTER.md` (44KB, core ADHD research)
- `PROJECT_VISION_SYNTHESIS.md` (41KB, project vision)
- `TECH_STACK.md` (9KB, technology reference)
- `REPOSITORY_STRUCTURE.md` (9KB, codebase structure)
- `EXTERNAL_REFERENCES.md` (8KB, external links)

**Justification**: Core project knowledge, all agents need access

#### 1.3 Design Documentation
**Source**: `/docs/design/`
**Destination**: `/agent_resources/architecture/design/`
**Action**: Move entire directory

**Files** (all ADHD-focused system designs):
- `ANTI_PROCRASTINATION_SYSTEM_DESIGN.md` (28KB)
- `ARCHITECTURE_DEEP_DIVE.md` (39KB)
- `CAPTURE_HIERARCHY_SYSTEM_REPORT.md` (33KB)
- `CHAMPS_FRAMEWORK.md` (20KB)
- `ENERGY_ESTIMATION_DESIGN.md` (28KB)
- `EXTENDED_TASK_METADATA.md` (28KB)
- `MAPPER_SUBTABS_BRAINSTORM.md` (22KB)
- `NAMING_CONVENTIONS.md` (14KB) ⚠️ **Important for database/API**
- `PROGRESS_BAR_SYSTEM_DESIGN.md` (16KB)
- `TEMPORAL_ARCHITECTURE.md` (22KB)
- `TEMPORAL_KG_DESIGN.md` (14KB)
- `TEMPORAL_KG_SUMMARY.md` (15KB)

**Justification**: Architecture/design docs belong with architecture resources

#### 1.4 Implementation Guides (Selective)
**Source**: `/docs/guides/`
**Destination**: `/agent_resources/docs/guides/`
**Action**: Move useful guides only

**Keep and Move**:
- ✅ `AGENT_DEVELOPMENT_ENTRY_POINT.md` - Agent dev guide
- ✅ `BEAST_LOOP_SYSTEM.md` - System workflow
- ✅ `TASK_CARD_BREAKDOWN.md` - Task implementation
- ✅ `FOCUS_MODE_GUIDE.md` - Feature guide
- ✅ `HUMAN_AGENT_WORKFLOW.md` - Workflow guide

**Archive (OAuth docs - already covered in agent_resources/docs/authentication)**:
- 📦 `EMAIL_OAUTH_INTEGRATION.md` - Redundant with auth docs
- 📦 `GMAIL_OAUTH_MOBILE_SETUP.md` - Redundant
- 📦 `GOOGLE_OAUTH_*.md` (5 files) - Redundant

**Archive (Dogfooding - outdated)**:
- 📦 `DOGFOODING_*.md` (4 files) - Outdated
- 📦 `CHATGPT_VIDEO_TASK_WORKFLOW.md` - Outdated
- 📦 `break_addiction_workflow.md` - Outdated
- 📦 `EXPO_MIGRATION_PLAN.md` - Completed migration

#### 1.5 API Documentation
**Source**: `/docs/api/`
**Destination**: `/agent_resources/backend/api/`
**Action**: Move entire directory

**Files**:
- `API_REFERENCE.md`
- `IMPLEMENTATION_SUMMARY.md`
- `openapi.json`
- `openapi.yaml`
- `TASK_API_SPEC_V2.md`
- `schemas/` directory
- `README.md`

**Justification**: API docs are backend-specific

---

### Phase 2: Consolidate Status Reports

**Source**: `/docs/status/`
**Destination**: Evaluate each file

**Action Plan**:
- ✅ **Keep in agent_resources/STATUS.md** (already comprehensive)
- 📦 **Archive to docs/archive/2025-11-10-status-reports/**:
  - `CURRENT_STATUS_AND_NEXT_STEPS.md` (Superseded by STATUS.md)
  - `NEXT_TASKS_PRIORITIZED.md` (Superseded by tasks/roadmap)
  - `DOGFOODING_STATUS.md` (Historical)
  - `DOGFOODING_BUGS_FOUND.md` (Historical)
  - `TDD_STATUS.md` (Historical)
  - Other dated status files

- ⚠️ **Review and potentially keep**:
  - `NEXT_STEPS.md` (Nov 7) - Recent, check for unique content
  - `IMPROVEMENT_OPPORTUNITIES.md` (Nov 7) - May have actionable items
  - `TECHNICAL_DEBT.md` (Nov 6) - May have actionable items
  - `TEST_SUITE_IMPROVEMENTS.md` (Nov 4) - May have actionable items

---

### Phase 3: Archive Outdated Documentation

#### 3.1 Old Planning Documents
**Source**: Multiple directories
**Destination**: `/docs/archive/2025-11-10-deprecated-planning/`

**Directories to Archive**:
- 📦 `/docs/roadmap/` - Old roadmaps (replaced by agent_resources/tasks)
- 📦 `/docs/task-splitting/` - Old task planning
- 📦 `/docs/mvp/` - Old MVP planning
- 📦 `/docs/workflow-templates/` - Check if used
- 📦 `/docs/workflows/` - Check against guides
- 📦 `/docs/user-guide/` - Likely outdated
- 📦 `/docs/components/` - Check if still relevant

#### 3.2 Development Documentation (Check for Overlap)
**Action**: Review for unique content before archiving

**Directories**:
- `/docs/development/` - Check against agent_resources
- `/docs/devops/` - Check if deployment docs needed
- `/docs/integration/` - Check against providers docs

---

### Phase 4: Remove Redundant Directories

#### 4.1 Fully Redundant Directories

**After verification, remove**:
- `/docs/architecture/` → Content covered in agent_resources/architecture/
- `/docs/backend/` → Content covered in agent_resources/backend/
- `/docs/frontend/` → Content covered in agent_resources/frontend/
- `/docs/testing/` → Content covered in agent_resources/testing/
- `/docs/tasks/` → Content covered in agent_resources/tasks/

**Process**:
1. Read each README to understand content
2. Compare with agent_resources equivalent
3. If unique content exists, move to agent_resources
4. If fully redundant, archive then remove
5. Update any cross-references

#### 4.2 Mobile Documentation
**Source**: `/docs/mobile/`
**Action**: Consolidate with frontend

**Justification**: Mobile is frontend (React Native/Expo)

---

### Phase 5: Update Cross-References

#### 5.1 Update README Files

**Files to Update**:
- `/agent_resources/README.md` - Add new doc references
- `/agent_resources/docs/README.md` - Update structure
- `/agent_resources/architecture/README.md` - Add design docs
- `/agent_resources/backend/README.md` - Add API docs
- `/docs/INDEX.md` - Update to reflect new organization

#### 5.2 Fix Broken Links

**Search for**: Links to moved documentation
**Update in**:
- All README files
- CLAUDE.md
- START_HERE.md
- Root README.md

---

## Execution Order

1. ✅ Create this plan document
2. 📋 Create directory structure in agent_resources
3. 📋 Phase 1: Move useful docs (getting-started, references, design, guides, api)
4. 📋 Phase 2: Consolidate status reports
5. 📋 Phase 3: Archive outdated documentation
6. 📋 Phase 4: Remove redundant directories
7. 📋 Phase 5: Update cross-references and README files
8. 📋 Test: Verify no broken links
9. 📋 Commit: Create organized commit

---

## Success Criteria

- ✅ All useful docs organized in agent_resources
- ✅ No duplicate documentation
- ✅ Outdated docs archived or removed
- ✅ All README files updated
- ✅ No broken links
- ✅ Clear navigation for AI agents
- ✅ Git history preserved

---

## Risk Mitigation

1. **No deletions without backup**: All "removed" docs first moved to archive
2. **Verify before moving**: Read README of each directory first
3. **Test links**: Check cross-references after each phase
4. **Commit frequently**: Commit after each phase for easy rollback
5. **Document decisions**: Note justification for each move/archive/delete

---

## File Tracking

### Files Moved (To Be Updated)
- [ ] Getting Started (3 files)
- [ ] References (5 files)
- [ ] Design (12 files)
- [ ] Guides (5 files, 15 archived)
- [ ] API (7+ files)

### Files Archived (To Be Updated)
- [ ] Status reports (10+ files)
- [ ] Roadmap docs
- [ ] Old planning docs
- [ ] Outdated workflows
- [ ] Redundant guides

### Directories Removed (After Verification)
- [ ] /docs/architecture/
- [ ] /docs/backend/
- [ ] /docs/frontend/
- [ ] /docs/testing/
- [ ] /docs/tasks/
- [ ] /docs/mobile/ (consolidate with frontend)

---

**Next Step**: Execute Phase 1 - Create directory structure and move useful docs
