# Backend Documentation - Things to Update

**Last Reviewed**: November 10, 2025
**Priority**: High = update soon, Medium = review, Low = minor

---

## 🔴 High Priority Updates

### 1. API Reference Documentation
**File**: `docs/backend/API_COMPLETE_REFERENCE.md`
**Issue**: May be out of date with current endpoints
**Action**:
- Verify all current endpoints in `src/api/routes/` are documented
- Check for deprecated endpoints
- Update OAuth endpoints (Google, Apple, GitHub)
- Add new mobile-specific endpoints if any

### 2. Database Schema Documentation
**File**: `docs/backend/DATABASE_SCHEMA.md`
**Issue**: Check if migration 026 (refresh_tokens) is documented
**Action**:
- Review recent migrations (024, 025, 026)
- Ensure all 11 tables are documented
- Verify entity-specific PK naming is correct
- Add ER diagram if missing

### 3. Backend Status Analysis
**File**: `docs/backend/BACKEND_STATUS_ANALYSIS.md`
**Issue**: May have old completion percentages
**Action**:
- Update completion percentage (currently ~60%)
- Mark BE-00 (delegation) as complete
- Update active development tasks
- Check "What's Working" section accuracy

---

## 🟡 Medium Priority Updates

### 4. OAuth Integration Documentation
**Files**: `docs/guides/GOOGLE_OAUTH_*.md`, `Agent_Resources/docs/authentication/`
**Issue**: Recent OAuth work in mobile may need documentation updates
**Action**:
- Review OAUTH_REFRESH_TOKEN_FIX.md from mobile/docs/archive
- Check if refresh token implementation is documented in backend docs
- Verify OAuth flow diagrams are current

### 5. API Schemas
**Files**: `docs/api/schemas/*.md`
**Issue**: Check if Pydantic v2 updates are reflected
**Action**:
- Verify all schemas use Pydantic v2 syntax
- Check for new request/response models
- Update examples if needed

### 6. Backend Tasks
**File**: `docs/backend/BACKEND_TASKS.md`
**Issue**: May list completed tasks
**Action**:
- Mark BE-00 as complete
- Update with current priorities (BE-01, BE-05, BE-15)
- Remove completed tasks or move to archive

---

## 🟢 Low Priority Updates

### 7. Backend Onboarding
**File**: `docs/backend/BACKEND_ONBOARDING.md`
**Issue**: Verify setup steps are current
**Action**:
- Check if UV setup instructions are correct
- Verify database setup steps
- Confirm environment variable examples

### 8. TDD Guide Examples
**File**: `docs/backend/BACKEND_TDD_GUIDE.md`
**Issue**: Examples may reference old code
**Action**:
- Update code examples to current patterns
- Add recent test examples if better
- Verify coverage requirements (80%+)

---

## 📋 Documentation to Review from Archive

Based on archived completion reports, these may have valuable info to extract:

### From WORK_COMPLETE_2025-11-02.md (archived)
- Check if any Nov 2 work needs documentation updates
- Was only 1 week ago - may have current info

### From BACKEND_DOCUMENTATION_SUMMARY.md (archived)
- Review what was documented
- Ensure current docs match summary

---

## ✅ Recently Updated (Verified Current)

- CLAUDE.md - Updated Nov 6, 2025
- Database paths updated to `.data/databases/`
- Entity-specific PK naming documented

---

## 🔍 How to Verify

```bash
# Check API endpoints match docs
rg "router = APIRouter" src/api/routes/ | wc -l

# Count database tables
ls src/database/migrations/*.sql | wc -l

# Find recent code changes
git log --since="2025-11-01" --oneline -- src/

# Search for TODOs
rg "TODO|FIXME" src/api src/services
```

---

**Next Review**: When BE-01, BE-05, or BE-15 are completed
