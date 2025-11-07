# Technical Debt Tracker

This document tracks TODOs, FIXMEs, and HACKs found in the codebase that should be converted to GitHub issues for systematic resolution.

## 🔴 Critical Priority

### 1. Implement Actual Capture Statistics
**File**: `src/api/capture.py:348`
**Type**: TODO
**Description**: Replace mock data with actual capture statistics
```python
"total_captures": 0,  # TODO: Implement actual stats
```
**Impact**: Users cannot track their capture history
**Effort**: Medium (requires database queries and aggregation)
**GitHub Issue**: TBD

## 🟡 High Priority

### 2. Task Service v2 Improvements
**File**: `src/services/task_service_v2.py`
**Type**: TODO
**Description**: Multiple TODOs related to task service enhancements
**Impact**: Service functionality gaps
**Effort**: Various
**GitHub Issue**: TBD

### 3. Test Configuration Issues
**File**: `tests/conftest.py`
**Type**: TODO/FIXME
**Description**: Test fixture improvements needed
**Impact**: Test reliability
**Effort**: Low-Medium
**GitHub Issue**: TBD

### 4. API Route Enhancements
**Files**: `src/api/simple_tasks.py`, `src/api/tasks.py`, `src/api/rewards.py`
**Type**: TODO
**Description**: Various API endpoint improvements and missing features
**Impact**: Incomplete API functionality
**Effort**: Medium
**GitHub Issue**: TBD

## 🟢 Medium Priority

### 5. Task Models Validation
**File**: `src/core/task_models.py`
**Type**: TODO
**Description**: Additional model validation rules needed
**Impact**: Data integrity
**Effort**: Low
**GitHub Issue**: TBD

### 6. Integration Routes
**File**: `src/api/routes/integrations.py`
**Type**: TODO
**Description**: OAuth integration improvements
**Impact**: Third-party integration reliability
**Effort**: Medium
**GitHub Issue**: TBD

### 7. Workflow Router
**File**: `src/api/routes/workflows.py`
**Type**: TODO
**Description**: Workflow execution enhancements
**Impact**: Workflow system completeness
**Effort**: Medium
**GitHub Issue**: TBD

### 8. Service Layer Improvements
**Files**: `src/services/task_service.py`, `src/services/performance_service.py`, `src/services/cache_service.py`
**Type**: TODO/FIXME
**Description**: Service optimization and feature additions
**Impact**: Performance and functionality
**Effort**: Various
**GitHub Issue**: TBD

## 📋 Low Priority (Archive/Examples)

### 9. Archive Code Cleanup
**Files**: `archive/backend/services/*`
**Type**: TODO
**Description**: TODOs in archived code
**Impact**: None (archived)
**Action**: Can be ignored or removed during next cleanup

### 10. Example Code TODOs
**Files**: `examples/use-cases/*`
**Type**: TODO
**Description**: TODOs in example/template code
**Impact**: Low (examples only)
**Action**: Address when examples are updated

## 📊 Summary Statistics

- **Total TODOs found**: 26 files
- **Critical**: 1
- **High Priority**: 8
- **Medium Priority**: 8
- **Low Priority (Archive/Examples)**: 9

## 🎯 Recommended Action Plan

1. **Week 1**: Create GitHub issues for all Critical and High Priority items
2. **Week 2**: Assign issues to team members based on expertise
3. **Week 3**: Begin systematic resolution starting with Critical items
4. **Week 4**: Review Medium Priority items and prioritize based on user impact

## 📝 Creating GitHub Issues

Use the following template for each TODO:

```markdown
## Description
[TODO description from code]

## Location
- File: `[file path]`
- Line: [line number]

## Impact
[User/system impact]

## Effort Estimate
[Low/Medium/High]

## Acceptance Criteria
- [ ] TODO resolved with proper implementation
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Code review completed
```

## 🔄 Maintenance

This document should be updated:
- After each sprint/release
- When new TODOs are added
- When TODOs are resolved
- During quarterly technical debt reviews

---

**Last Updated**: 2025-11-06
**Next Review**: 2025-11-13
