# 🔗 Agent-to-Agent Infrastructure Integration Plan

**Current Status**: Architecture designed but not implemented
**Priority**: High - Unlocks full platform potential
**Timeline**: 3-5 days to implement MVP

---

## 🚨 Current Problem

### What We Have
- ✅ **Agent-to-Agent Communication Protocol** designed (detailed spec in `reports/archive/2025-01-20/completed/AGENT_TO_AGENT_COMMUNICATION.md`)
- ✅ **UnifiedAgent Core** built with MCP, Memory, Config
- ✅ **5 Main Agents** operational (Task, Focus, Energy, Progress, Gamification)
- ✅ **ConversationalTaskAgent** for QuickCapture (basic state machine)

### What We're NOT Using
- ❌ **Delegation Protocol**: Main Agents → Tool Agents
- ❌ **Tool Agent Dispatcher**: Routes delegation requests
- ❌ **Task Notes**: Structured natural language delegation
- ❌ **Agent Discovery**: Auto-discovery of appropriate Tool Agents
- ❌ **Delegation History & Learning**: Memory-based pattern learning

### The Gap
```
# Current (Simple)
User → ConversationalTaskAgent → Task Created
        ↓ (hardcoded Q&A flow)

# Designed (Agent-to-Agent)
User → UnifiedAgent (Task) → Should delegate?
                            → Craft Task Note
                            → Tool Agent Dispatcher
                            → Specialized Tool Agent (Email, Format, etc.)
                            → Verify & Return
       ↓ (uses result or handles directly)
```

---

## 🎯 Integration Strategy

### Phase 1: Enable Delegation in UnifiedAgent (Day 1-2)

**Goal**: Add `.delegate()` method to UnifiedAgent

**Files to Modify**:
1. `src/agents/unified_agent.py`
2. Create `src/agents/tool_agent_dispatcher.py`
3. Create `src/agents/delegation_models.py`

**Implementation**:

```python
# src/agents/delegation_models.py
from pydantic import BaseModel
from typing import Optional, Dict, Any

class DelegationRequest(BaseModel):
    """Request to delegate task to Tool Agent"""
    request_id: str
    task_note: str
    tool_agent_type: str = "auto"  # Auto-discover or specify
    priority: str = "normal"
    timeout_ms: int = 30000
    retry_enabled: bool = True
    max_retries: int = 3
    user_id: str
    conversation_id: Optional[str] = None

class DelegationResult(BaseModel):
    """Result from Tool Agent delegation"""
    request_id: str
    status: str  # "success", "retry", "failed"
    success: bool
    artifacts: Dict[str, Any] = {}
    execution: Dict[str, Any] = {}
    error: Optional[Dict[str, Any]] = None
    reasoning: Optional[str] = None
```

```python
# src/agents/tool_agent_dispatcher.py
class ToolAgentDispatcher:
    """Routes delegation requests to appropriate Tool Agents"""

    def __init__(self, mcp_client, memory_client):
        self.mcp_client = mcp_client
        self.memory_client = memory_client
        self.tool_agents = {}  # Registry of available Tool Agents

    async def dispatch(
        self,
        request: DelegationRequest
    ) -> DelegationResult:
        """
        Route delegation request to appropriate Tool Agent

        1. Discover appropriate Tool Agent (if auto)
        2. Execute with Tool Agent
        3. Verify result
        4. Record in memory for learning
        5. Return result
        """

        # Discover Tool Agent
        if request.tool_agent_type == "auto":
            agent_type = await self.discover_tool_agent(request.task_note)
        else:
            agent_type = request.tool_agent_type

        # Execute delegation (for now, fallback to direct handling)
        # TODO: Implement actual Tool Agent execution

        result = DelegationResult(
            request_id=request.request_id,
            status="success",
            success=True,
            artifacts={"note": "Tool Agent execution pending implementation"},
            execution={"duration_ms": 100},
            reasoning="Delegated to " + agent_type
        )

        # Record in memory
        await self.record_delegation(request, result)

        return result

    async def discover_tool_agent(self, task_note: str) -> str:
        """Auto-discover appropriate Tool Agent type"""

        # Keyword matching (simple version)
        keywords = {
            "email": ["email", "draft", "send", "message"],
            "format": ["format", "style", "transform"],
            "data": ["parse", "extract", "csv", "json"],
            "calendar": ["schedule", "meeting", "calendar"],
        }

        task_lower = task_note.lower()
        for agent_type, kws in keywords.items():
            if any(kw in task_lower for kw in kws):
                return agent_type

        return "general"

    async def record_delegation(
        self,
        request: DelegationRequest,
        result: DelegationResult
    ):
        """Record delegation for learning"""

        if not self.memory_client:
            return

        self.memory_client.add_memory(
            messages=[{
                "role": "system",
                "content": f"Delegated: {request.task_note}. Result: {result.status}"
            }],
            user_id=f"delegation_history_{request.user_id}",
            metadata={
                "tool_agent_type": request.tool_agent_type,
                "success": result.success
            }
        )
```

```python
# src/agents/unified_agent.py (add delegation capabilities)

class UnifiedAgent:
    def __init__(self, ...):
        # ... existing init ...
        self.tool_agent_dispatcher = None
        self.delegation_history = []

    @classmethod
    async def create(cls, agent_type: str, enable_delegation: bool = True, ...):
        # ... existing create code ...

        # Initialize Tool Agent Dispatcher
        if enable_delegation:
            instance.tool_agent_dispatcher = ToolAgentDispatcher(
                mcp_client=mcp_client,
                memory_client=memory_client
            )

        return instance

    async def delegate(
        self,
        task_note: str,
        tool_agent_type: str = "auto",
        **kwargs
    ) -> DelegationResult:
        """
        Delegate task to specialized Tool Agent

        Example:
            result = await agent.delegate(
                "Draft apology email to alex@company.com about delay"
            )
        """

        if not self.tool_agent_dispatcher:
            raise RuntimeError("Delegation not enabled")

        request = DelegationRequest(
            request_id=str(uuid4()),
            task_note=task_note,
            tool_agent_type=tool_agent_type,
            user_id=kwargs.get("user_id", ""),
            conversation_id=kwargs.get("conversation_id"),
            **kwargs
        )

        result = await self.tool_agent_dispatcher.dispatch(request)

        # Record in agent history
        self.delegation_history.append({
            "task_note": task_note,
            "result": result,
            "timestamp": datetime.now()
        })

        return result

    def should_delegate(self, user_message: str) -> bool:
        """
        Determine if message should be delegated to Tool Agent

        Heuristics:
        - Contains action verbs (draft, send, format, schedule)
        - Has specific requirements (email address, date, format)
        - Is deterministic (same input → same output expected)
        """

        # Simple heuristic for MVP
        delegation_keywords = [
            "draft", "send", "email", "format", "schedule",
            "transform", "convert", "extract", "parse"
        ]

        msg_lower = user_message.lower()
        return any(kw in msg_lower for kw in delegation_keywords)
```

---

### Phase 2: Update QuickCapture to Use Delegation (Day 2-3)

**Goal**: Replace ConversationalTaskAgent with UnifiedAgent + delegation

**Current Flow**:
```python
# src/api/tasks.py
agent = ConversationalTaskAgent(user_id=user_id)
response = await agent.start_conversation(message)
```

**New Flow**:
```python
# src/api/tasks.py
from src.agents.unified_agent import UnifiedAgent

# Create UnifiedAgent (task type)
agent = await UnifiedAgent.create(
    "task",
    enable_delegation=True,
    enable_memory=True,
    enable_mcp=True
)

# Check if should delegate
if agent.should_delegate(message):
    # Extract task note from user message
    task_note = await agent.extract_task_note(message)

    # Delegate to appropriate Tool Agent
    result = await agent.delegate(
        task_note=task_note,
        user_id=user_id
    )

    if result.success:
        # Use delegated result
        response = format_delegation_response(result)
    else:
        # Fallback to conversational flow
        response = await conversational_fallback(message)
else:
    # Use conversational agent for Q&A
    response = await conversational_flow(message)
```

**Benefits**:
- ✅ Leverages UnifiedAgent architecture
- ✅ Uses delegation for deterministic tasks
- ✅ Falls back to conversational for clarification
- ✅ Records delegation history for learning
- ✅ Enables future Tool Agent expansion

---

### Phase 3: Create First Tool Agent - Email Draft (Day 3-4)

**Goal**: Implement one real Tool Agent to prove the architecture

**Create**:
1. `src/agents/tool_agents/base_tool_agent.py`
2. `src/agents/tool_agents/email_tool_agent.py`
3. `config/agents/email_tool.yaml`

**Implementation**:

```python
# src/agents/tool_agents/base_tool_agent.py
from abc import ABC, abstractmethod

class BaseToolAgent(ABC):
    """Base class for all Tool Agents"""

    def __init__(self, agent_type: str):
        self.agent_type = agent_type
        self.execution_history = []

    @abstractmethod
    async def execute(
        self,
        task_note: str,
        seed: Optional[int] = None
    ) -> Dict[str, Any]:
        """Execute task deterministically"""
        pass

    @abstractmethod
    async def verify(
        self,
        task_note: str,
        output: Dict[str, Any]
    ) -> VerificationResult:
        """Verify output meets requirements"""
        pass
```

```python
# src/agents/tool_agents/email_tool_agent.py
from src.agents.tool_agents.base_tool_agent import BaseToolAgent
from src.agents.unified_agent import UnifiedAgent

class EmailToolAgent(BaseToolAgent):
    """Tool Agent for drafting emails deterministically"""

    def __init__(self):
        super().__init__("email")
        self.llm_agent = None  # Will use UnifiedAgent for generation

    async def execute(
        self,
        task_note: str,
        seed: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Draft email based on task note

        Task Note format:
        "Draft [type] email to [recipient] about [topic].
         [Constraints]. [Required elements]."
        """

        # Parse task note
        parsed = self.parse_task_note(task_note)

        # Use UnifiedAgent with email config to generate
        if not self.llm_agent:
            self.llm_agent = await UnifiedAgent.create("email_tool")

        # Generate email with seed for determinism
        result = await self.llm_agent.run(
            user_message=task_note,
            seed=seed
        )

        # Extract email components
        email_draft = {
            "subject": self.extract_subject(result.data),
            "body": self.extract_body(result.data),
            "to": parsed.get("recipient"),
            "from": parsed.get("sender", "user@company.com")
        }

        return email_draft

    async def verify(
        self,
        task_note: str,
        output: Dict[str, Any]
    ) -> VerificationResult:
        """Verify email meets requirements"""

        checks = []

        # Check required fields
        checks.append({
            "name": "has_subject",
            "passed": bool(output.get("subject"))
        })

        checks.append({
            "name": "has_body",
            "passed": bool(output.get("body"))
        })

        # Check word count if specified
        if "max" in task_note and "words" in task_note:
            max_words = self.extract_max_words(task_note)
            word_count = len(output.get("body", "").split())
            checks.append({
                "name": f"max_{max_words}_words",
                "passed": word_count <= max_words,
                "actual": word_count
            })

        # Check tone if specified
        if "tone:" in task_note.lower():
            tone_check = await self.verify_tone(
                output.get("body"),
                self.extract_tone(task_note)
            )
            checks.append(tone_check)

        all_passed = all(c["passed"] for c in checks)

        return VerificationResult(
            passed=all_passed,
            checks=checks,
            score=sum(c["passed"] for c in checks) / len(checks)
        )
```

**Config**:
```yaml
# config/agents/email_tool.yaml
name: "Email Tool Agent"
type: "email_tool"
description: "Deterministic email drafting with verification"

model_provider: "anthropic"
model_name: "claude-3-5-sonnet-20241022"

system_prompt:
  template: |
    You are an email drafting specialist.

    Given a task note, draft a professional email that:
    1. Follows all specified constraints
    2. Includes all required elements
    3. Matches the requested tone
    4. Stays within word limits

    Task Note: {task_note}

    Return ONLY the email in this format:
    Subject: [subject line]

    [email body]

behavior:
  temperature: 0.3  # Low for determinism
  max_tokens: 1000
```

---

### Phase 4: Test & Iterate (Day 4-5)

**Test Scenarios**:

1. **Simple Delegation**:
   ```
   User: "Draft an email to alex@company.com apologizing for the delay"
   Expected: UnifiedAgent → Email Tool Agent → Draft returned
   ```

2. **Conversational Fallback**:
   ```
   User: "I need to create a task"
   Expected: UnifiedAgent → ConversationalTaskAgent (no delegation)
   ```

3. **Delegation with Retry**:
   ```
   User: "Draft email... max 100 words"
   Email Tool generates 150 words → Verification fails → Retry with new seed
   ```

4. **Learning from History**:
   ```
   User repeats similar email request
   Expected: Faster discovery, better seed selection
   ```

---

## 🎯 Benefits of Full Integration

### For Users
- ✅ **Smarter Task Creation**: AI understands complex requests
- ✅ **Consistent Results**: Deterministic execution for repeated tasks
- ✅ **Faster Execution**: Delegation to specialized agents
- ✅ **Transparent Reasoning**: See why agent made decisions

### For Development
- ✅ **Extensible**: Easy to add new Tool Agents
- ✅ **Testable**: Deterministic execution enables reliable testing
- ✅ **Scalable**: Delegation pattern handles complexity
- ✅ **Maintainable**: Clear separation of concerns

### For Platform
- ✅ **Production-Ready**: Architected for reliability
- ✅ **Learning System**: Improves over time with memory
- ✅ **Future-Proof**: Designed for agent ecosystem expansion

---

## 📋 Implementation Checklist

### Phase 1: Enable Delegation
- [ ] Create `delegation_models.py`
- [ ] Create `tool_agent_dispatcher.py`
- [ ] Add `.delegate()` to `UnifiedAgent`
- [ ] Add delegation history tracking
- [ ] Test delegation request/response flow

### Phase 2: Update QuickCapture
- [ ] Replace ConversationalTaskAgent with UnifiedAgent
- [ ] Add delegation check in API endpoint
- [ ] Implement fallback to conversational
- [ ] Test Auto mode with delegation
- [ ] Test Ask Questions mode with fallback

### Phase 3: First Tool Agent
- [ ] Create `base_tool_agent.py`
- [ ] Create `email_tool_agent.py`
- [ ] Create `email_tool.yaml` config
- [ ] Implement email parsing
- [ ] Implement email verification
- [ ] Test end-to-end email drafting

### Phase 4: Test & Iterate
- [ ] Write integration tests
- [ ] Test all delegation scenarios
- [ ] Measure performance (latency, success rate)
- [ ] Document usage patterns
- [ ] Create migration guide

---

## 🚀 Quick Start (MVP in 1 Day)

**Minimal Implementation** to prove the concept:

1. **Add `.delegate()` stub to UnifiedAgent** (30 min)
   - Returns mock result
   - Logs delegation attempt

2. **Update QuickCapture API** (1 hour)
   - Check `should_delegate()`
   - Call `.delegate()` for simple cases
   - Return mock "Email Agent would handle this"

3. **Test with frontend** (30 min)
   - User types "Draft email..."
   - See delegation message
   - Confirm architecture works

4. **Document & Plan** (1 hour)
   - Document what works
   - List next steps
   - Plan Tool Agent implementation

**Total MVP**: 3 hours to prove delegation works!

---

## 📞 Next Steps

1. **Review this plan** with team
2. **Decide on timeline** (MVP in 1 day vs. full in 5 days)
3. **Start Phase 1** - Enable delegation in UnifiedAgent
4. **Test incrementally** - Don't wait for full implementation

---

**Status**: Plan ready for execution
**Priority**: High - Unlocks full platform potential
**Risk**: Low - Well-architected, incremental approach
**Timeline**: 1 day (MVP) or 5 days (full implementation)

*This integration will transform the platform from single-agent to multi-agent architecture, enabling scalable, reliable, and intelligent task execution.*
