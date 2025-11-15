# 🚨 LLM Fallback Detection Strategy

**Purpose**: Prevent silent failures when LLM APIs are unavailable or misconfigured

**Status**: ✅ IMPLEMENTED
**Last Updated**: 2025-11-15

## The Problem: Silent Failures Are Dangerous

When LLM API calls fail or API keys are missing, the system **used to silently fall back** to rule-based logic without any indication. This is **EXTREMELY DANGEROUS** because:

❌ **Tests pass** even though AI features aren't working
❌ **Production runs with degraded quality** (rule-based vs AI-generated content)
❌ **No visibility** into when/why fallbacks happen
❌ **Users get worse experience** without knowing
❌ **Costs appear lower** (misleading metrics)

## The Solution: Multi-Layer Detection

We now have **3 layers of fallback detection**:

### Layer 1: Loud Logging (Backend)

**File**: `src/agents/split_proxy_agent.py`

**What it does**:
- Changes `logger.warning()` → `logger.error()` with 🚨 emojis
- Adds detailed reason for fallback via `_get_fallback_reason()`
- Logs task ID for traceability

**Example Log**:
```
ERROR - 🚨 LLM FALLBACK TRIGGERED 🚨 Using rule-based splitting instead of AI.
Reason: OPENAI_API_KEY or LLM_API_KEY not found in environment. Task: abc123
```

**Code**:
```python
else:
    # CRITICAL WARNING: Fallback to rule-based splitting
    reason = self._get_fallback_reason()
    logger.error(
        f"🚨 LLM FALLBACK TRIGGERED 🚨 Using rule-based splitting instead of AI. "
        f"Reason: {reason}. Task: {task.task_id}"
    )
    steps_data = self._split_with_rules(task)
```

### Layer 2: API Response Metadata

**File**: `src/agents/split_proxy_agent.py`

**What it does**:
- Adds `metadata` field to every split response
- Includes `llm_used` boolean flag
- Includes `generation_method` enum

**Response Structure**:
```json
{
  "task_id": "abc123",
  "scope": "multi",
  "micro_steps": [...],
  "metadata": {
    "ai_provider": "openai",
    "llm_used": true,
    "generation_method": "ai_llm"  // or "rule_based_fallback"
  }
}
```

**Generation Methods**:
- `"none"` - SIMPLE scope (no splitting needed)
- `"phase_suggestions"` - PROJECT scope (phase breakdown)
- `"ai_llm"` - ✅ Real LLM API call
- `"rule_based_fallback"` - ⚠️ **FALLBACK USED!**

**Code**:
```python
result["metadata"] = {
    "ai_provider": self.ai_provider if scope == TaskScope.MULTI else None,
    "llm_used": bool(
        scope == TaskScope.MULTI
        and (self.openai_client or self.anthropic_client)
    ),
    "generation_method": self._get_generation_method(scope),
}
```

### Layer 3: E2E Test Assertions

**File**: `tests/e2e/test_e2e_multi_task.py`

**What it does**:
- Checks `metadata` after every split API call
- **FAILS THE TEST** if fallback detected when `use_real_llms=true`
- Adds verification sections to human review report

**Code**:
```python
metadata = split_data.get("metadata", {})
generation_method = metadata.get("generation_method")

if use_real_llms and generation_method == "rule_based_fallback":
    # FAIL THE TEST - Fallback was used when we expected real LLMs!
    error_msg = (
        f"🚨 LLM FALLBACK DETECTED! 🚨\n"
        f"Expected real LLM calls but got rule-based fallback.\n"
        f"Task ID: {task_id}\n"
        f"Metadata: {metadata}\n"
        f"This means API keys are missing or LLM client failed to initialize!"
    )
    assert False, error_msg
```

## Detection Scenarios

### Scenario 1: API Key Missing

**Symptoms**:
```bash
ERROR - 🚨 LLM FALLBACK TRIGGERED 🚨
Reason: OPENAI_API_KEY or LLM_API_KEY not found in environment
```

**E2E Test Behavior**:
- Test **FAILS** with assertion error
- Report shows fallback metadata
- Error message explains missing API key

**Fix**:
```bash
export OPENAI_API_KEY="sk-..."
# or
export ANTHROPIC_API_KEY="sk-ant-..."
```

### Scenario 2: Wrong Provider Selected

**Symptoms**:
```bash
ERROR - 🚨 LLM FALLBACK TRIGGERED 🚨
Reason: Unknown provider 'bedrock' (should be 'openai' or 'anthropic')
```

**Fix**:
```bash
export LLM_PROVIDER="openai"  # or "anthropic"
```

### Scenario 3: Package Not Installed

**Symptoms**:
```bash
ERROR - 🚨 LLM FALLBACK TRIGGERED 🚨
Reason: OpenAI package not installed
```

**Fix**:
```bash
uv add openai
# or
uv add anthropic
```

### Scenario 4: Client Initialization Failed

**Symptoms**:
```bash
ERROR - 🚨 LLM FALLBACK TRIGGERED 🚨
Reason: OpenAI client failed to initialize
```

**Possible Causes**:
- Invalid API key format
- Network/firewall issues
- Package version incompatibility

## E2E Test Configuration

### Environment Variables

```bash
# Require real LLMs (default: true)
E2E_USE_REAL_LLMS=true

# Test will FAIL if this is true and fallback is detected
E2E_GENERATE_REPORTS=true
```

### Test Behavior Matrix

| `use_real_llms` | Fallback Detected | Test Outcome |
|-----------------|-------------------|--------------|
| `true` | ❌ No | ✅ PASS |
| `true` | ✅ Yes | ❌ **FAIL** |
| `false` | ❌ No | ✅ PASS |
| `false` | ✅ Yes | ✅ PASS (expected) |

### Running Tests with Fallback Detection

```bash
# Full validation - fails if fallbacks detected
E2E_USE_REAL_LLMS=true E2E_GENERATE_REPORTS=true uv run pytest tests/e2e/test_e2e_multi_task.py -v

# Allow fallbacks (for testing fallback logic)
E2E_USE_REAL_LLMS=false uv run pytest tests/e2e/test_e2e_multi_task.py -v
```

## Monitoring Fallbacks in Production

### Option 1: Log Aggregation

**Setup**: Send logs to centralized logging (DataDog, CloudWatch, etc.)

**Alert Rule**:
```
ERROR logs containing "🚨 LLM FALLBACK TRIGGERED 🚨"
```

**Action**: Page on-call engineer immediately

### Option 2: Metrics

**Track**:
- `llm_calls_total` (counter)
- `llm_fallback_total` (counter)
- `llm_fallback_rate` (gauge) = fallback / total

**Alert**: If `llm_fallback_rate > 5%` for 5 minutes

### Option 3: API Response Inspection

**Client-Side Check**:
```typescript
const result = await splitTask(taskId);

if (result.metadata.generation_method === "rule_based_fallback") {
  // Show warning to user
  console.error("AI features degraded - using fallback");
  showToast("Some AI features are temporarily unavailable");

  // Report to error tracking
  Sentry.captureMessage("LLM fallback detected", {
    level: "warning",
    extra: { metadata: result.metadata }
  });
}
```

## Fallback Reason Reference

| Reason | Fix | Priority |
|--------|-----|----------|
| "No LLM libraries installed" | `uv add openai anthropic` | 🔴 Critical |
| "OPENAI_API_KEY not found" | Add API key to `.env` | 🔴 Critical |
| "ANTHROPIC_API_KEY not found" | Add API key to `.env` | 🔴 Critical |
| "OpenAI package not installed" | `uv add openai` | 🔴 Critical |
| "Anthropic package not installed" | `uv add anthropic` | 🔴 Critical |
| "OpenAI client failed to initialize" | Check API key validity | 🟠 High |
| "Anthropic client failed to initialize" | Check API key validity | 🟠 High |
| "Unknown provider" | Set `LLM_PROVIDER` correctly | 🟠 High |

## Testing the Detection System

### Test 1: Verify Detection Works

```bash
# Remove API key temporarily
unset OPENAI_API_KEY
unset LLM_API_KEY

# Run test - should FAIL with clear message
E2E_USE_REAL_LLMS=true uv run pytest tests/e2e/test_e2e_multi_task.py -v

# Expected output:
# AssertionError: 🚨 LLM FALLBACK DETECTED! 🚨
# Expected real LLM calls but got rule-based fallback.
```

### Test 2: Verify LLMs Work

```bash
# Restore API key
export OPENAI_API_KEY="sk-..."

# Run test - should PASS
E2E_USE_REAL_LLMS=true uv run pytest tests/e2e/test_e2e_multi_task.py -v

# Check report for verification
cat tests/e2e/reports/multi-task_flow_*.md | grep "AI Generation Verified"
```

### Test 3: Verify Metadata

```bash
# Make API call and check metadata
curl -X POST http://localhost:8000/api/v1/tasks/{task_id}/split \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"user_id": "user123"}' | jq '.metadata'

# Should show:
# {
#   "ai_provider": "openai",
#   "llm_used": true,
#   "generation_method": "ai_llm"
# }
```

## Benefits of This Strategy

✅ **No Silent Failures** - Fallbacks are loud and visible
✅ **Test Coverage** - E2E tests enforce LLM usage
✅ **Debuggability** - Detailed reason for every fallback
✅ **Monitoring Ready** - Easy to alert on fallbacks
✅ **User Transparency** - Clients can detect degraded mode
✅ **Cost Visibility** - Know when you're not using LLMs

## Migration Checklist

For existing deployments:

- [ ] Update `split_proxy_agent.py` with enhanced logging
- [ ] Deploy backend with metadata in responses
- [ ] Update E2E tests with fallback assertions
- [ ] Set up monitoring for fallback logs
- [ ] Add client-side fallback detection
- [ ] Document API key setup in deployment guide
- [ ] Test fallback detection in staging
- [ ] Verify alerts trigger correctly

## FAQ

### Q: What if I WANT to use fallbacks?

Set `E2E_USE_REAL_LLMS=false` in tests. The system still logs fallbacks, but tests won't fail.

### Q: Will this break existing code?

No. The `metadata` field is additive. Existing code ignores it.

### Q: What's the performance impact?

Negligible. `_get_fallback_reason()` only runs on fallback path (error case).

### Q: Can I use different LLM providers?

Yes! Set `LLM_PROVIDER=openai` or `LLM_PROVIDER=anthropic`. More providers coming soon.

### Q: What if the LLM call fails mid-request?

The agent catches exceptions and logs them. Check `_split_with_openai()` for error handling.

---

**Status**: ✅ IMPLEMENTED & TESTED
**Last Verified**: 2025-11-15
**Maintainer**: Proxy Agent Platform Team
