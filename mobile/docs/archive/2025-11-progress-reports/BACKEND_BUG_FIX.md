# Backend API Bug Fix - Capture Endpoint

**Date**: November 4, 2025
**Fixed By**: Claude Code (Mobile Development Session)
**Issue**: Capture API returning 500 error with `'str' object has no attribute 'value'`

---

## Problem

When testing the mobile Capture/Add screen implementation, discovered that the backend `/api/v1/capture/` endpoint was failing with:

```json
{"detail":"Capture failed: 'str' object has no attribute 'value'"}
```

## Root Cause

In `/src/api/capture.py` lines 175-176 and 237-238, the code was calling `.value` on `delegation_mode` and `leaf_type` fields:

```python
delegation_mode=step.delegation_mode.value,  # ❌ WRONG
leaf_type=step.leaf_type.value,              # ❌ WRONG
```

However, the `MicroStep` model in `/src/core/task_models.py` has `model_config = ConfigDict(use_enum_values=True)` (line 190-193), which means:
- Pydantic automatically converts enum objects to their string values
- When you access `step.delegation_mode`, you get `"do"` (a string), not `DelegationMode.DO` (an enum)
- Calling `.value` on a string raises `AttributeError`

## Solution

Removed the `.value` calls since the fields are already strings:

### File: `/src/api/capture.py`

**Line 175-176 (in `/` endpoint)**:
```python
# BEFORE:
delegation_mode=step.delegation_mode.value,
leaf_type=step.leaf_type.value,

# AFTER:
delegation_mode=step.delegation_mode,  # Already a string due to use_enum_values
leaf_type=step.leaf_type,  # Already a string due to use_enum_values
```

**Line 237-238 (in `/clarify` endpoint)**:
```python
# BEFORE:
delegation_mode=step.delegation_mode.value,
leaf_type=step.leaf_type.value,

# AFTER:
delegation_mode=step.delegation_mode,  # Already a string due to use_enum_values
leaf_type=step.leaf_type,  # Already a string due to use_enum_values
```

## Verification

### Test 1: Basic Capture
```bash
curl -s http://localhost:8000/api/v1/capture/ -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "Buy groceries for the week", "user_id": "user_123", "mode": "auto"}'
```

**Result**: ✅ Success
```
Task Title: Buy groceries for the week
Task ID: ad99c3f5-b8d1-47bc-94e1-13711c3a1964
Micro-steps: 5
Ready to save: True
Clarifications: 0
Mode: auto

First step: Check your kitchen and fridge to list what groceries you already have and what you need to buy
```

### Test 2: Response Structure
The API now returns:
```json
{
  "task": {...},
  "micro_steps": [
    {
      "step_id": "177129b8-5b35-48d4-a0fe-9c56dbcbff90",
      "description": "Check your kitchen and fridge...",
      "estimated_minutes": 3,
      "delegation_mode": "do",      // ✅ String, not enum
      "leaf_type": "human",          // ✅ String, not enum
      "icon": null,
      "short_label": null,
      "automation_plan": null,
      "clarification_needs": [],
      "tags": ["📬 Communication", "🤔 Decision", ...]
    }
  ],
  "clarifications": [],
  "ready_to_save": true,
  "mode": "auto"
}
```

## Impact

### What's Now Working ✅
1. **Mobile Capture/Add Screen**: Can now successfully call backend API
2. **POST /api/v1/capture/**: Returns proper task decomposition with micro-steps
3. **POST /api/v1/capture/clarify**: Will work with clarification flow
4. **Enum Consistency**: Aligns with Pydantic's `use_enum_values=True` config

### Related Code
- **Models**: `/src/core/task_models.py` (lines 124-193) - `MicroStep` with `use_enum_values=True`
- **API**: `/src/api/capture.py` (lines 95-252) - Fixed enum access
- **Mobile Service**: `/mobile/src/services/captureService.ts` - Already expects strings
- **Mobile Types**: `/mobile/src/types/capture.ts` - Already typed as strings

## Lessons Learned

1. **Pydantic Config Matters**: Always check `model_config` for `use_enum_values=True`
2. **Type Awareness**: When `use_enum_values=True`, enum fields are already strings
3. **API Contract**: Mobile types were correct - backend API was the issue
4. **TDD Value**: Mobile tests expected strings, which revealed backend bug early

## Next Steps

1. ✅ Backend API fixed and tested
2. ✅ Mobile service expects correct string types
3. ⏭️ Ready for end-to-end mobile app testing
4. ⏭️ Can proceed with manual testing checklist

---

**Files Modified**:
- `/src/api/capture.py` (4 lines changed - removed `.value` calls)

**Status**: ✅ FIXED AND VERIFIED
