# LLM + Knowledge Graph Testing Guide

## Overview

This project includes comprehensive tests for the LLM-powered task capture system with Knowledge Graph integration.

## Test Types

### 1. Unit Tests (Mocked LLM)
**Location**: `src/services/tests/test_llm_capture_service.py`

**Status**: ✅ 18/18 passing

**Run**:
```bash
.venv/bin/python -m pytest src/services/tests/test_llm_capture_service.py -v
```

**What they test**:
- Prompt building with/without KG context
- OpenAI/Anthropic parsing with mocked responses
- Fallback behavior when LLM fails
- Pydantic model validation
- ADHD optimization guidelines in prompts
- JSON schema output format

**Cost**: Free (uses mocks)

---

### 2. Integration Tests (Real LLM)
**Location**: `src/services/tests/test_llm_capture_real.py`

**Status**: ⏭️ Skipped by default (requires OPENAI_API_KEY)

**Quick Run**:
```bash
# Set your API key
export OPENAI_API_KEY='your-key-here'

# Run integration tests
./test_llm_real.sh
```

**Manual Run**:
```bash
export OPENAI_API_KEY='your-key-here'
export LLM_MODEL='gpt-4o-mini'
export RUN_INTEGRATION_TESTS=1

.venv/bin/python -m pytest src/services/tests/test_llm_capture_real.py -v -s
```

**What they test**:
- ✅ Simple task parsing
- ✅ Digital vs Human task classification
- ✅ Knowledge Graph context integration
- ✅ Entity extraction from text
- ✅ Email tasks with KG recipient lookup
- ✅ Urgency detection
- ✅ Compound task handling (ADHD optimization)
- ✅ Time estimation accuracy
- ✅ Due date extraction
- ✅ Tag generation
- ✅ Token usage tracking
- ✅ KG context token impact
- ✅ Error handling

**Cost**: ~$0.001-0.002 per full test run (using gpt-4o-mini)

---

## Cost Breakdown (gpt-4o-mini)

**Pricing**:
- Input: $0.150 / 1M tokens
- Output: $0.600 / 1M tokens
- Average: ~$0.375 / 1M tokens

**Per Test Estimates**:
- Simple task: ~100-200 tokens = $0.00002-0.00005
- With KG context: ~300-500 tokens = $0.0001-0.0002
- Full test suite: ~15 tests = $0.001-0.002

**Monthly Estimates** (if running 10x/day):
- Daily: $0.02
- Monthly: $0.60

---

## Example Test Output

```bash
$ ./test_llm_real.sh

🧪 Running LLM Integration Tests with gpt-4o-mini
==================================================

📋 Configuration:
   Model: gpt-4o-mini
   Provider: openai

✅ Simple task parsing:
   Title: Call Mom Tomorrow at 3 PM
   Priority: medium
   Estimated hours: 0.5
   Confidence: 0.85
   Tokens: 142

✅ Digital task classification:
   Title: Email John About Project Update
   Is digital: True
   Automation type: email
   Reasoning: Task requires sending an email...

✅ KG context integration:
   Title: Turn Off the AC
   Entities: ['AC']
   Automation: home_iot
   Used KG: True
   Reasoning: Device control task. AC found in KG context (air_conditioner, living_room)

✅ Token usage: 158 tokens
   Estimated cost: $0.000059

=================== 15 passed in 8.2s ===================
✅ All integration tests passed!
```

---

## Running Specific Tests

**Single test**:
```bash
export OPENAI_API_KEY='your-key'
export RUN_INTEGRATION_TESTS=1

.venv/bin/python -m pytest \
    src/services/tests/test_llm_capture_real.py::TestRealLLMIntegration::test_kg_context_integration \
    -v -s
```

**Test class**:
```bash
.venv/bin/python -m pytest \
    src/services/tests/test_llm_capture_real.py::TestRealLLMIntegration \
    -v -s
```

---

## Continuous Integration

**GitHub Actions** (example):
```yaml
name: LLM Integration Tests

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: uv sync

      - name: Run mocked tests
        run: |
          .venv/bin/python -m pytest src/services/tests/test_llm_capture_service.py -v

      - name: Run real LLM tests (if API key available)
        if: ${{ secrets.OPENAI_API_KEY }}
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          LLM_MODEL: gpt-4o-mini
          RUN_INTEGRATION_TESTS: 1
        run: |
          .venv/bin/python -m pytest src/services/tests/test_llm_capture_real.py -v
```

---

## Knowledge Graph Test Data

Integration tests use realistic KG context:

**Entities**:
- Devices: AC (air_conditioner), bedroom lights (smart_lights)
- People: Sara (colleague, sara@company.com), Bob (boss, bob@company.com)

**Relationships**:
- Alice OWNS_DEVICE → AC
- Alice OWNS_DEVICE → bedroom lights
- Alice WORKS_WITH → Sara
- Alice WORKS_FOR → Bob

**Test Scenarios**:
1. "turn off the AC" → Should identify AC from KG, classify as home_iot
2. "email sara about meeting" → Should find Sara's email from KG
3. "email bob" → Should identify Bob as boss from KG

---

## Troubleshooting

**Tests skipped**:
```
SKIPPED - Integration tests disabled. Set RUN_INTEGRATION_TESTS=1 to enable.
```
→ Set `export RUN_INTEGRATION_TESTS=1`

**API key error**:
```
OPENAI_API_KEY not set
```
→ Set `export OPENAI_API_KEY='sk-...'`

**Rate limiting**:
→ gpt-4o-mini has high rate limits (500 RPM for Tier 1)
→ Add `time.sleep(0.1)` between tests if needed

**High costs**:
→ Check `LLM_MODEL` is set to `gpt-4o-mini` (not `gpt-4`)
→ Review token usage in test output

---

## Best Practices

1. **Run mocked tests frequently** (free, fast)
2. **Run integration tests before commits** (validate real behavior)
3. **Monitor token usage** (printed in test output)
4. **Use gpt-4o-mini for testing** (20x cheaper than gpt-4)
5. **Review test output** (includes reasoning for debugging)

---

## Next Steps

- [ ] Add GraphService integration tests (already created, need API fix)
- [ ] Add end-to-end capture pipeline tests
- [ ] Add performance benchmarks (latency, throughput)
- [ ] Add test coverage reporting
- [ ] Add Anthropic Claude integration tests
