# Agent-to-Agent Communication Protocol

**Strategic Integration Report**
**Target Timeline**: Week 3-4 (Days 11-20)
**Status**: Design Phase
**Dependencies**: TOOL_AGENT_ARCHITECTURE.md
**Date**: 2025-10-18

---

## Executive Summary

This report defines the **delegation protocol** enabling Main Agents (Task, Focus, Energy, Progress, Gamification) to delegate specialized work to Tool Agents via natural language **Task Notes**.

**Key Concepts**:
- **Task Note**: Natural language request from Main Agent to Tool Agent
- **Delegation Decision**: When Main Agent should delegate vs. handle directly
- **Request/Response Protocol**: Structured communication pattern
- **Discovery Mechanism**: How Main Agents find appropriate Tool Agents
- **Error Handling**: Retry strategies and fallback behaviors

**Integration Points**:
- Extends `UnifiedAgent` with `.delegate()` method
- Uses existing MCP infrastructure for tool routing
- Leverages Memory Layer for delegation history and patterns

---

## Delegation Decision Model

### When Main Agents Should Delegate

**Delegate to Tool Agent when task is**:

1. **Deterministic**: Same input should produce same output
   - ✅ Draft email from template
   - ✅ Format text to specific style
   - ✅ Transform data structure
   - ❌ Creative brainstorming
   - ❌ Strategic planning

2. **Verifiable**: Success can be machine-checked
   - ✅ Email has required fields and tone
   - ✅ Output matches regex/length constraints
   - ✅ Data transformation preserves structure
   - ❌ "Feels right" / subjective quality

3. **Repeatable**: Task pattern recurs frequently
   - ✅ Weekly status email template
   - ✅ Standard apology format
   - ✅ Recurring data export
   - ❌ One-off creative writing

4. **Self-Contained**: All information in the request
   - ✅ Email with recipient, subject, key points
   - ✅ Format instructions with style guide
   - ❌ Requires extensive context from conversation
   - ❌ Needs access to user's calendar/files

**Decision Algorithm** (pseudocode):
```python
def should_delegate(task_description: str, context: ConversationContext) -> bool:
    """Determine if task should be delegated to Tool Agent"""

    # Extract task characteristics
    is_deterministic = analyze_determinism(task_description)
    is_verifiable = has_success_criteria(task_description)
    is_repeatable = check_pattern_frequency(task_description, context.history)
    is_self_contained = all_info_present(task_description)

    # Delegation score
    score = (
        is_deterministic * 0.3 +
        is_verifiable * 0.3 +
        is_repeatable * 0.2 +
        is_self_contained * 0.2
    )

    return score >= 0.6  # Threshold for delegation
```

### Main Agent Capabilities

**Enhanced `UnifiedAgent` with delegation**:

```python
class UnifiedAgent:
    # ... existing methods ...

    async def delegate(
        self,
        task_note: str,
        tool_agent_type: str = "auto",  # Auto-detect or specify
        timeout_seconds: int = 30,
        retry_on_failure: bool = True,
        max_retries: int = 3
    ) -> DelegationResult:
        """
        Delegate task to specialized Tool Agent.

        Args:
            task_note: Natural language task description
            tool_agent_type: "email", "format", "data", or "auto"
            timeout_seconds: Max execution time
            retry_on_failure: Retry with different seeds if fails
            max_retries: Max retry attempts

        Returns:
            DelegationResult with status, artifacts, and metadata

        Example:
            result = await agent.delegate(
                "Draft apology email to alex.chan@company.com about delay. "
                "Mention new ETA Oct 22. Warm tone. Max 120 words.",
                tool_agent_type="email"
            )

            if result.success:
                email_draft = result.artifacts["email_draft"]
                # Use the draft...
        """
        # Implementation details in integration phase
        pass

    async def should_delegate_check(
        self,
        task_description: str
    ) -> DelegationAnalysis:
        """
        Analyze if task should be delegated.

        Returns analysis with recommendation and reasoning.
        """
        pass
```

---

## Task Note Specification

### Format: Structured Natural Language

**Required Elements**:

1. **Goal**: What needs to be accomplished
2. **Constraints**: Limits and requirements
3. **Context**: Necessary information (recipients, dates, etc.)
4. **Verification**: How to check success

**Template**:
```
[Action] [object] to [recipient/target] about [topic].
[Constraint 1]. [Constraint 2]. [Constraint N].
[Required elements: X, Y, Z].
```

### Examples by Domain

#### Email Drafting

**Good Task Note**:
```
Draft apology email to alex.chan@company.com about missed project deadline.
Mention new ETA of Oct 22.
Tone: warm-professional.
Length: max 120 words.
Required: apologize, acknowledge impact, provide new timeline.
Subject hint: "Apology for delay"
```

**Why it works**:
- ✅ Clear goal (apology email)
- ✅ Specific recipient
- ✅ All necessary context (deadline, new ETA)
- ✅ Verifiable constraints (tone, length, required elements)
- ✅ Self-contained (no external references needed)

**Bad Task Note**:
```
Email Alex about that thing we talked about earlier.
```

**Why it fails**:
- ❌ Ambiguous goal ("that thing")
- ❌ No recipient email
- ❌ References conversation context ("talked about earlier")
- ❌ No constraints or success criteria

#### Text Formatting

**Good Task Note**:
```
Format this text to professional business style:
"hey can u send me the report thx"

Target: formal email greeting.
Preserve intent, improve clarity.
No abbreviations, proper capitalization.
```

**Why it works**:
- ✅ Clear input and desired output
- ✅ Specific style requirements
- ✅ Verifiable (no abbreviations, capitalization)

#### Data Transformation

**Good Task Note**:
```
Transform CSV data to JSON format.
Input columns: name, email, role.
Output structure: array of objects with camelCase keys.
Validate: all emails match pattern, no duplicates.
```

**Why it works**:
- ✅ Clear transformation spec
- ✅ Defined input/output structures
- ✅ Validation criteria

---

## Request/Response Protocol

### Request Structure

**From Main Agent to Tool Agent Dispatcher**:

```json
{
  "request_id": "uuid",
  "from_agent": {
    "type": "task",
    "instance_id": "uuid",
    "user_id": "alice"
  },
  "task_note": "Draft apology email to alex.chan@company.com...",
  "tool_agent_type": "email",  // or "auto" for discovery
  "priority": "normal",  // "low", "normal", "high", "urgent"
  "timeout_ms": 30000,
  "retry_policy": {
    "enabled": true,
    "max_attempts": 3,
    "backoff_strategy": "linear"
  },
  "metadata": {
    "conversation_id": "uuid",
    "timestamp": "2025-10-18T21:00:00Z"
  }
}
```

### Response Structure

**Success Response**:

```json
{
  "request_id": "uuid",
  "status": "success",
  "tool_agent": {
    "type": "email",
    "instance_id": "uuid"
  },
  "execution": {
    "task_id": "uuid",
    "seed_used": 981234,
    "duration_ms": 412,
    "attempts": 1
  },
  "artifacts": {
    "email_draft": {
      "subject": "Apology for Project Delay",
      "body": "Hi Alex,\n\nI sincerely apologize...",
      "to": "alex.chan@company.com",
      "from": "user@company.com"
    }
  },
  "verifier": {
    "passed": true,
    "score": 0.95,
    "checks": [
      {"name": "contains_oct_22", "passed": true},
      {"name": "max_120_words", "passed": true, "actual": 98},
      {"name": "tone_warm_professional", "passed": true, "score": 0.92}
    ]
  },
  "learned": {
    "new_seed": false,  // Reused existing seed
    "seed_promoted": true,  // Improved seed score
    "confidence": 0.95
  }
}
```

**Failure Response with Retry**:

```json
{
  "request_id": "uuid",
  "status": "retry",
  "tool_agent": {
    "type": "email",
    "instance_id": "uuid"
  },
  "execution": {
    "task_id": "uuid",
    "seed_used": 442211,
    "duration_ms": 389,
    "attempts": 2,
    "max_attempts": 3
  },
  "error": {
    "type": "verification_failed",
    "message": "Email missing required phrase 'Oct 22'",
    "failed_checks": ["contains_oct_22"]
  },
  "retry": {
    "will_retry": true,
    "next_seed": 776655,
    "estimated_wait_ms": 500
  }
}
```

**Final Failure Response**:

```json
{
  "request_id": "uuid",
  "status": "failed",
  "tool_agent": {
    "type": "email",
    "instance_id": "uuid"
  },
  "execution": {
    "attempts": 3,
    "seeds_tried": [981234, 442211, 776655]
  },
  "error": {
    "type": "max_attempts_exceeded",
    "message": "All seeds failed verification within budget",
    "suggestions": [
      "Clarify Task Note constraints",
      "Check if task is too complex for Tool Agent",
      "Consider handling directly in Main Agent"
    ]
  },
  "fallback": {
    "recommended": "handle_directly",
    "reasoning": "Task may require creative judgment beyond deterministic execution"
  }
}
```

---

## Communication Flow

### Sequence Diagram: Successful Delegation

```
User          Task Agent        Dispatcher      Email Tool Agent    Seed Manager
 │                │                  │                  │                  │
 │ "Email Alex   │                  │                  │                  │
 │  about delay" │                  │                  │                  │
 │───────────────>│                  │                  │                  │
 │                │                  │                  │                  │
 │                │ Analyze request  │                  │                  │
 │                │ → should delegate│                  │                  │
 │                │                  │                  │                  │
 │                │ Craft Task Note  │                  │                  │
 │                │                  │                  │                  │
 │                │ Delegation Req   │                  │                  │
 │                │─────────────────>│                  │                  │
 │                │                  │                  │                  │
 │                │                  │ Route to Email   │                  │
 │                │                  │─────────────────>│                  │
 │                │                  │                  │                  │
 │                │                  │                  │ Lookup seed      │
 │                │                  │                  │─────────────────>│
 │                │                  │                  │                  │
 │                │                  │                  │<── seed=981234 ──│
 │                │                  │                  │                  │
 │                │                  │                  │ Execute (det.)   │
 │                │                  │                  │ Verify output    │
 │                │                  │                  │ ✓ Success        │
 │                │                  │                  │                  │
 │                │                  │                  │ Promote seed     │
 │                │                  │                  │─────────────────>│
 │                │                  │                  │                  │
 │                │                  │<── Success + ────│                  │
 │                │                  │    Email Draft   │                  │
 │                │                  │                  │                  │
 │                │<── Success Resp──│                  │                  │
 │                │    + Artifacts   │                  │                  │
 │                │                  │                  │                  │
 │                │ Review draft     │                  │                  │
 │                │ Approve & use    │                  │                  │
 │                │                  │                  │                  │
 │<── "Email sent"│                  │                  │                  │
 │    + summary   │                  │                  │                  │
 │                │                  │                  │                  │
```

### Sequence Diagram: Retry on Failure

```
Task Agent      Dispatcher      Email Tool Agent    Seed Manager
    │                │                  │                  │
    │ Task Note      │                  │                  │
    │───────────────>│                  │                  │
    │                │                  │                  │
    │                │──────────────────>│                  │
    │                │                  │                  │
    │                │                  │ seed=442211      │
    │                │                  │<─────────────────│
    │                │                  │                  │
    │                │                  │ Execute          │
    │                │                  │ Verify           │
    │                │                  │ ✗ FAIL (missing  │
    │                │                  │   "Oct 22")      │
    │                │                  │                  │
    │                │                  │ Penalize seed    │
    │                │                  │─────────────────>│
    │                │                  │                  │
    │                │                  │ Next seed?       │
    │                │                  │<── try 776655 ───│
    │                │                  │                  │
    │                │                  │ Execute (retry)  │
    │                │                  │ Verify           │
    │                │                  │ ✓ SUCCESS        │
    │                │                  │                  │
    │                │<─── Success ─────│                  │
    │<── Success ────│                  │                  │
    │   (attempt 2)  │                  │                  │
    │                │                  │                  │
```

---

## Tool Agent Discovery

### Auto-Discovery Mechanism

**When `tool_agent_type="auto"`**, the dispatcher uses these strategies:

#### 1. Keyword Matching

```python
TOOL_AGENT_KEYWORDS = {
    "email": ["email", "draft", "send", "message", "reply", "forward"],
    "format": ["format", "style", "transform", "convert", "structure"],
    "data": ["parse", "transform", "extract", "data", "csv", "json"],
    "calendar": ["schedule", "meeting", "calendar", "appointment"],
    "report": ["report", "summary", "analytics", "dashboard"]
}

def discover_tool_agent(task_note: str) -> str:
    """Match keywords to find appropriate Tool Agent type"""
    task_lower = task_note.lower()

    scores = {}
    for agent_type, keywords in TOOL_AGENT_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in task_lower)
        if score > 0:
            scores[agent_type] = score

    if not scores:
        return "general"  # Fallback

    return max(scores, key=scores.get)
```

#### 2. Capability Matching

```python
async def match_by_capability(task_spec: TaskSpec) -> str:
    """Match task to Tool Agent by required capabilities"""

    required_caps = extract_capabilities(task_spec)
    # e.g., ["email_draft", "tone_control", "template"]

    tool_agents = await get_available_tool_agents()

    best_match = None
    best_score = 0

    for agent in tool_agents:
        overlap = len(set(required_caps) & set(agent.capabilities))
        if overlap > best_score:
            best_score = overlap
            best_match = agent.type

    return best_match or "general"
```

#### 3. Learning from History

```python
async def discover_by_history(task_note: str, user_id: str) -> str:
    """Use Memory Layer to find similar past delegations"""

    # Compute task signature
    sig = compute_task_signature(task_note)

    # Search memory for similar tasks
    memories = memory_client.search_memories(
        query=task_note,
        user_id=f"delegation_history_{user_id}",
        limit=5
    )

    # Find most successful Tool Agent for similar tasks
    for mem in memories:
        if mem.get("success_rate", 0) > 0.8:
            return mem["tool_agent_type"]

    return "auto"  # Continue with other strategies
```

---

## Integration with UnifiedAgent

### Extended UnifiedAgent Class

```python
# src/agents/unified_agent.py

class UnifiedAgent:
    # ... existing code ...

    def __init__(self, ...):
        # ... existing init ...
        self.delegation_history = []
        self.tool_agent_dispatcher = None  # Initialized in create()

    @classmethod
    async def create(cls, agent_type: str, ...):
        # ... existing create code ...

        # NEW: Initialize Tool Agent Dispatcher
        if enable_delegation:
            dispatcher = ToolAgentDispatcher(
                mcp_client=mcp_client,
                memory_client=memory_client
            )
            instance.tool_agent_dispatcher = dispatcher

        return instance

    async def run(self, user_message: str, user_id: str, **context_vars):
        # ... existing run logic ...

        # NEW: Check if delegation is beneficial
        if self.should_delegate(user_message):
            task_note = self.extract_task_note(user_message)
            delegation_result = await self.delegate(task_note)

            if delegation_result.success:
                # Use Tool Agent result
                return self.format_response(delegation_result)
            else:
                # Fallback to direct handling
                return await self._handle_directly(user_message)

        # ... existing response generation ...

    async def delegate(self, task_note: str, ...):
        """Delegate to Tool Agent - NEW METHOD"""

        if not self.tool_agent_dispatcher:
            raise RuntimeError("Delegation not enabled for this agent")

        result = await self.tool_agent_dispatcher.dispatch(
            task_note=task_note,
            from_agent=self.config.type,
            user_id=user_id,
            ...
        )

        # Log delegation
        self.delegation_history.append({
            "task_note": task_note,
            "result": result,
            "timestamp": datetime.now()
        })

        return result

    def should_delegate(self, user_message: str) -> bool:
        """Determine if message warrants delegation - NEW METHOD"""

        # Heuristics based on agent type and message content
        # Task Agent: delegate specific actions (email, format)
        # Focus Agent: delegate calendar/schedule tasks
        # Energy Agent: delegate report generation
        # etc.

        pass

    def extract_task_note(self, user_message: str) -> str:
        """Convert user message to Tool Agent Task Note - NEW METHOD"""

        # Use LLM to extract and format Task Note
        # Ensure all required elements present

        pass
```

---

## Error Handling Strategies

### Retry Logic

**When Tool Agent fails**:

1. **Verification Failure**: Try next seed (up to budget)
2. **Timeout**: Retry with same seed but extended timeout
3. **Parse Error**: Return to Main Agent for Task Note clarification
4. **Resource Unavailable**: Queue and retry after delay

**Retry Budget**:
- Normal priority: 3 attempts
- High priority: 5 attempts
- Urgent: 8 attempts (full seed search)

### Fallback Behaviors

**If all retries exhausted**:

```python
async def handle_delegation_failure(
    result: DelegationResult,
    original_message: str
):
    """Graceful degradation when Tool Agent fails"""

    if result.error_type == "verification_failed":
        # Tool Agent executed but output didn't pass checks
        # Main Agent can try to use partial result or handle directly
        return await self.handle_with_tool_agent_context(
            original_message,
            partial_result=result.artifacts
        )

    elif result.error_type == "parse_error":
        # Task Note was ambiguous
        # Main Agent should refine and retry or handle directly
        refined_note = await self.refine_task_note(original_message, result.error_message)
        return await self.delegate(refined_note)

    else:
        # Other failures: handle directly without delegation
        return await self._handle_directly(original_message)
```

---

## Delegation History & Learning

### Tracking Successful Patterns

**Store in Memory Layer**:

```python
async def record_delegation(
    task_note: str,
    tool_agent_type: str,
    result: DelegationResult,
    user_id: str
):
    """Record delegation for learning"""

    memory_client.add_memory(
        messages=[{
            "role": "system",
            "content": f"Delegated task to {tool_agent_type}: {task_note}. "
                      f"Result: {result.status}. Success: {result.success}"
        }],
        user_id=f"delegation_history_{user_id}",
        metadata={
            "task_signature": compute_signature(task_note),
            "tool_agent_type": tool_agent_type,
            "success": result.success,
            "duration_ms": result.execution.duration_ms
        }
    )
```

### Learning Delegation Patterns

**Main Agent learns**:
1. Which types of requests to delegate
2. Which Tool Agent types work best for patterns
3. How to craft better Task Notes
4. When to retry vs. fallback

---

## Use Cases

### Use Case 1: Task Agent Delegates Email

**Scenario**: User asks Task Agent to create a task and send an email

**Flow**:
```
User: "Create a task to follow up with Alex about the delay,
       then send him an apology email"

Task Agent:
1. Creates task directly (internal capability)
2. Recognizes email request → delegate to Email Tool Agent
3. Crafts Task Note:
   "Draft apology email to alex.chan@company.com about project delay.
    Mention new ETA Oct 22. Warm-professional tone. Max 120 words.
    Required: apologize, acknowledge impact, new timeline."
4. Delegates to Email Tool Agent
5. Receives verified draft
6. Shows draft to user for approval
7. Sends if approved
8. Updates task with "email sent" note
```

### Use Case 2: Progress Agent Delegates Report

**Scenario**: User asks for weekly progress report

**Flow**:
```
User: "Generate my weekly progress report"

Progress Agent:
1. Gathers progress data (directly)
2. Recognizes formatting task → delegate
3. Task Note:
   "Format weekly progress report.
    Input: 12 tasks completed, 3 in progress, 2 blocked.
    Output: Professional summary, bullet points, metrics.
    Include completion rate calculation.
    Max 300 words."
4. Delegates to Format Tool Agent
5. Receives formatted report
6. Adds insights and recommendations (Main Agent capability)
7. Returns complete report to user
```

### Use Case 3: Focus Agent Delegates Calendar Block

**Scenario**: User starts a focus session

**Flow**:
```
User: "Start a 2-hour deep work session"

Focus Agent:
1. Starts Pomodoro timer (directly)
2. Recognizes calendar task → delegate
3. Task Note:
   "Block calendar for 2 hours from now.
    Event title: 'Deep Work Session'
    Description: 'Focus time - no interruptions'
    Status: Busy
    Reminders: off"
4. Delegates to Calendar Tool Agent
5. Receives confirmation
6. Informs user: "Focus session started, calendar blocked"
```

---

## Success Metrics

### Delegation Effectiveness

**Measure**:
- Delegation success rate (% of delegations that succeed)
- Average attempts before success
- Fallback rate (% that require Main Agent handling)
- User satisfaction with delegated results

**Targets**:
- 90%+ first-attempt success after Week 4
- <5% fallback rate
- <2 average attempts per delegation

### Performance

**Measure**:
- Delegation latency (time from request to result)
- Tool Agent execution time
- Total request-to-response time

**Targets**:
- <500ms delegation overhead
- <3s Tool Agent execution
- <5s total for simple tasks

---

## Next Steps

1. Read **TASK_ENVELOPE_DESIGN.md** for TaskSpec schema details
2. Read **SEED_LEARNING_SYSTEM.md** for determinism and learning
3. Implement delegation protocol in Week 3-4

---

*Next Report: TASK_ENVELOPE_DESIGN.md - Self-contained task specification and verification*
