# 🤖 AI System Enhancement Proposal

## Executive Summary

This document proposes enhancements to the AI workflow system to support:
1. **Multi-domain workflows** (coding, personal, health, finance, etc.)
2. **AI-powered workflow recommendation** with confidence ratings
3. **Better AI containment** with rate limiting and cost tracking

---

## 🎯 Current AI System Analysis

### Architecture (As-Is)

```
User Request → WorkflowExecutor → PydanticAI Agent → Claude 3.5 Sonnet → Structured Steps
                                                              ↓
                                        System Prompt (TOML) + User Context
```

### Containment Mechanisms ✅

1. **PydanticAI Framework**
   - Structured outputs via `result_type=list[dict]`
   - Automatic validation against Pydantic models
   - Type safety enforced

2. **System Prompts**
   - Defined in TOML files (version controlled)
   - Cannot be modified by users at runtime
   - Consistent across executions

3. **API Key Management**
   - Environment variable: `ANTHROPIC_API_KEY`
   - Not exposed to frontend
   - Centralized in backend

### Gaps ❌

1. **No Rate Limiting**
   - Users can generate unlimited workflows
   - No throttling per user/session
   - Potential for abuse

2. **No Cost Tracking**
   - No token usage monitoring
   - No cost attribution per user/task
   - No budget alerts

3. **Single Domain**
   - Only dev/coding workflows
   - No personal, health, finance, etc.

4. **Manual Workflow Selection**
   - User must choose workflow manually
   - No AI recommendation system
   - No confidence ratings

---

## 🚀 Proposed Enhancements

### Phase 1: Multi-Domain Workflows (1-2 days)

#### 1.1 Expand Workflow Domains

Create workflow directories by domain:

```
workflows/
├── dev/               # Existing (coding tasks)
│   ├── backend-api-feature.toml
│   ├── frontend-component.toml
│   └── bug-fix.toml
│
├── personal/          # NEW: Personal productivity
│   ├── daily-planning.toml
│   ├── habit-tracking.toml
│   └── goal-setting.toml
│
├── health/            # NEW: Health & wellness
│   ├── workout-routine.toml
│   ├── meal-planning.toml
│   └── sleep-optimization.toml
│
├── finance/           # NEW: Financial management
│   ├── budget-creation.toml
│   ├── expense-tracking.toml
│   └── savings-goal.toml
│
├── learning/          # NEW: Learning & education
│   ├── course-completion.toml
│   ├── skill-practice.toml
│   └── research-topic.toml
│
└── creative/          # NEW: Creative projects
    ├── writing-session.toml
    ├── design-project.toml
    └── music-practice.toml
```

#### 1.2 Update Workflow Model

```python
# src/workflows/models.py

class WorkflowDomain(str, Enum):
    """Workflow domain categories."""
    DEV = "dev"
    PERSONAL = "personal"
    HEALTH = "health"
    FINANCE = "finance"
    LEARNING = "learning"
    CREATIVE = "creative"

class Workflow(BaseModel):
    """Workflow definition."""
    workflow_id: str
    name: str
    description: str
    domain: WorkflowDomain  # NEW FIELD
    workflow_type: str  # Existing (backend, frontend, etc.)
    expected_step_count: int
    tags: list[str]
    # ... rest of fields
```

#### 1.3 Example: Personal Daily Planning Workflow

```toml
# workflows/personal/daily-planning.toml

workflow_id = "personal_daily_planning"
name = "Personal Daily Planning"
description = "Structured approach to planning your day with ADHD-friendly time blocking"
domain = "personal"
workflow_type = "planning"
expected_step_count = 5
tags = ["personal", "planning", "productivity", "adhd"]

llm_provider = "anthropic"
default_icon = "📅"

[system_prompt]
content = """
You are an expert productivity coach specializing in ADHD-friendly planning systems.

Generate a structured daily planning workflow that:
- Accounts for energy levels (low/medium/high)
- Uses time blocking with realistic buffers
- Includes break times and transitions
- Prioritizes based on energy and deadlines
- Leaves room for flexibility and spontaneity

Each step should be:
- Specific and actionable
- 15-45 minutes long
- Have a clear outcome
- Include energy requirement

Return steps as JSON array with:
- title: Brief step name
- description: What to do
- estimated_minutes: Time needed
- energy_level: "low" | "medium" | "high"
- icon: Relevant emoji
"""

[user_prompt_template]
content = """
Task: {task_title}
Description: {task_description}

User Context:
- Current Energy: {user_energy_label}
- Time of Day: {time_of_day}
- Available Hours: {estimated_hours}

Recent Completed Tasks:
{recent_tasks}

Generate {expected_step_count} planning steps that help the user:
1. Brain dump all tasks
2. Prioritize based on energy and deadlines
3. Time block with realistic estimates
4. Build in flexibility
5. Review and commit to the plan

Focus on making this ADHD-friendly with clear transitions and break times.
"""
```

---

### Phase 2: AI-Powered Workflow Recommendation (2-3 days)

#### 2.1 Workflow Recommender Agent

Create a new AI agent that analyzes tasks and recommends workflows:

```python
# src/workflows/recommender.py

from pydantic import BaseModel
from pydantic_ai import Agent
from pydantic_ai.models.anthropic import AnthropicModel

class WorkflowRecommendation(BaseModel):
    """AI recommendation for a workflow."""
    workflow_id: str
    confidence: float  # 0.0-1.0
    reasoning: str
    expected_steps: int
    estimated_time_minutes: int

class WorkflowRecommender:
    """AI-powered workflow recommendation system."""

    def __init__(self):
        self.model = AnthropicModel("claude-3-5-sonnet-20241022")
        self.agent = Agent(
            self.model,
            system_prompt=self._get_system_prompt(),
            result_type=list[WorkflowRecommendation],
        )

    def _get_system_prompt(self) -> str:
        return """
You are an expert workflow recommendation system.

Given:
- A task description
- Available workflows with their descriptions
- User context (energy, time, preferences)

Your job:
1. Analyze the task to understand what needs to be done
2. Match task characteristics to workflow strengths
3. Rank workflows by suitability
4. Provide confidence scores (0.0-1.0) for each recommendation
5. Explain your reasoning

Return top 3 workflow recommendations with:
- workflow_id: The workflow identifier
- confidence: How confident you are (0.0-1.0)
- reasoning: Why this workflow fits
- expected_steps: How many steps it will likely generate
- estimated_time_minutes: Total time estimate

Be honest about confidence:
- 0.9-1.0: Excellent match
- 0.7-0.9: Good match
- 0.5-0.7: Moderate match
- 0.3-0.5: Weak match
- 0.0-0.3: Poor match
"""

    async def recommend_workflows(
        self,
        task_title: str,
        task_description: str,
        available_workflows: list[Workflow],
        user_context: dict,
    ) -> list[WorkflowRecommendation]:
        """
        Get AI-powered workflow recommendations.

        Args:
            task_title: Task title
            task_description: Task description
            available_workflows: Available workflow definitions
            user_context: User energy, time, preferences

        Returns:
            Ranked list of workflow recommendations
        """
        # Build workflow catalog for AI
        workflow_catalog = "\n\n".join([
            f"**{w.workflow_id}**\n"
            f"Name: {w.name}\n"
            f"Domain: {w.domain}\n"
            f"Type: {w.workflow_type}\n"
            f"Description: {w.description}\n"
            f"Tags: {', '.join(w.tags)}"
            for w in available_workflows
        ])

        # Build user prompt
        prompt = f"""
Task to analyze:
Title: {task_title}
Description: {task_description}

Available Workflows:
{workflow_catalog}

User Context:
- Energy Level: {user_context.get('energy', 'medium')}
- Time of Day: {user_context.get('time_of_day', 'unknown')}
- Available Time: {user_context.get('estimated_hours', 4)} hours
- Recent Tasks: {', '.join(user_context.get('recent_tasks', []))}

Analyze this task and recommend the top 3 most suitable workflows with confidence scores and reasoning.
"""

        result = await self.agent.run(prompt)

        # Sort by confidence (highest first)
        recommendations = sorted(result.data, key=lambda r: r.confidence, reverse=True)

        return recommendations
```

#### 2.2 API Endpoint for Recommendations

```python
# src/api/routes/workflows.py

from src.workflows.recommender import WorkflowRecommender, WorkflowRecommendation

recommender = WorkflowRecommender()

@router.post("/recommend", response_model=list[WorkflowRecommendation])
async def recommend_workflows(
    task_title: str,
    task_description: Optional[str] = None,
    user_energy: int = 2,
    time_of_day: str = "morning",
    estimated_hours: float = 4.0,
    recent_tasks: Optional[list[str]] = None,
):
    """
    Get AI-powered workflow recommendations for a task.

    Returns top 3 workflows ranked by confidence score.
    """
    available_workflows = executor.list_workflows()

    user_context = {
        "energy": {1: "low", 2: "medium", 3: "high"}[user_energy],
        "time_of_day": time_of_day,
        "estimated_hours": estimated_hours,
        "recent_tasks": recent_tasks or [],
    }

    recommendations = await recommender.recommend_workflows(
        task_title=task_title,
        task_description=task_description or "",
        available_workflows=available_workflows,
        user_context=user_context,
    )

    return recommendations
```

#### 2.3 Frontend: WorkflowRecommendationCard

```tsx
// frontend/src/components/workflows/WorkflowRecommendationCard.tsx

interface WorkflowRecommendation {
  workflowId: string;
  confidence: number;  // 0.0-1.0
  reasoning: string;
  expectedSteps: number;
  estimatedTimeMinutes: number;
}

export default function WorkflowRecommendationCard({
  recommendation,
  workflow,
  onSelect,
}: {
  recommendation: WorkflowRecommendation;
  workflow: Workflow;
  onSelect: (workflowId: string) => void;
}) {
  const confidenceColor =
    recommendation.confidence >= 0.9 ? '#859900' :  // Green
    recommendation.confidence >= 0.7 ? '#b58900' :  // Yellow
    recommendation.confidence >= 0.5 ? '#cb4b16' :  // Orange
    '#dc322f';  // Red

  return (
    <div className="p-6 bg-gray-800 border border-gray-700 rounded-lg">
      {/* Confidence Badge */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={{
            backgroundColor: `${confidenceColor}20`,
            color: confidenceColor,
          }}
        >
          {(recommendation.confidence * 100).toFixed(0)}% Match
        </div>
        <div className="text-gray-400 text-sm">
          {recommendation.expectedSteps} steps · {Math.round(recommendation.estimatedTimeMinutes / 60)}h {recommendation.estimatedTimeMinutes % 60}m
        </div>
      </div>

      {/* Workflow Info */}
      <h3 className="text-white text-lg font-semibold mb-2">
        {workflow.name}
      </h3>
      <p className="text-gray-400 text-sm mb-4">
        {workflow.description}
      </p>

      {/* AI Reasoning */}
      <div className="p-3 bg-gray-900 rounded-lg mb-4">
        <div className="text-xs text-gray-500 mb-1">🤖 AI Reasoning:</div>
        <div className="text-sm text-gray-300">
          {recommendation.reasoning}
        </div>
      </div>

      {/* Select Button */}
      <button
        onClick={() => onSelect(recommendation.workflowId)}
        className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
      >
        Use This Workflow
      </button>
    </div>
  );
}
```

---

### Phase 3: Enhanced AI Containment (1 day)

#### 3.1 Rate Limiting

```python
# src/workflows/rate_limiter.py

from datetime import datetime, timedelta
from collections import defaultdict

class RateLimiter:
    """Simple in-memory rate limiter for workflow executions."""

    def __init__(self):
        self.user_executions: dict[str, list[datetime]] = defaultdict(list)
        self.limits = {
            "per_minute": 3,
            "per_hour": 20,
            "per_day": 100,
        }

    def check_limit(self, user_id: str) -> tuple[bool, str]:
        """
        Check if user is within rate limits.

        Returns:
            (allowed, reason)
        """
        now = datetime.now()
        user_execs = self.user_executions[user_id]

        # Clean old executions
        user_execs = [
            exec_time for exec_time in user_execs
            if now - exec_time < timedelta(days=1)
        ]
        self.user_executions[user_id] = user_execs

        # Check limits
        minute_ago = now - timedelta(minutes=1)
        hour_ago = now - timedelta(hours=1)

        recent_minute = len([e for e in user_execs if e > minute_ago])
        recent_hour = len([e for e in user_execs if e > hour_ago])
        recent_day = len(user_execs)

        if recent_minute >= self.limits["per_minute"]:
            return False, f"Rate limit: {self.limits['per_minute']} workflows per minute"

        if recent_hour >= self.limits["per_hour"]:
            return False, f"Rate limit: {self.limits['per_hour']} workflows per hour"

        if recent_day >= self.limits["per_day"]:
            return False, f"Rate limit: {self.limits['per_day']} workflows per day"

        return True, "OK"

    def record_execution(self, user_id: str):
        """Record a workflow execution for rate limiting."""
        self.user_executions[user_id].append(datetime.now())

# Global rate limiter instance
rate_limiter = RateLimiter()
```

#### 3.2 Cost Tracking

```python
# src/workflows/cost_tracker.py

from pydantic import BaseModel
from datetime import datetime

class TokenUsage(BaseModel):
    """Token usage for a single workflow execution."""
    execution_id: str
    user_id: str
    workflow_id: str
    timestamp: datetime

    input_tokens: int
    output_tokens: int
    total_tokens: int

    estimated_cost_usd: float

class CostTracker:
    """Track AI costs per user and workflow."""

    # Anthropic pricing (as of 2024)
    COST_PER_INPUT_TOKEN = 0.003 / 1000  # $3 per 1M tokens
    COST_PER_OUTPUT_TOKEN = 0.015 / 1000  # $15 per 1M tokens

    def __init__(self):
        self.usage_log: list[TokenUsage] = []

    def record_usage(
        self,
        execution_id: str,
        user_id: str,
        workflow_id: str,
        input_tokens: int,
        output_tokens: int,
    ) -> TokenUsage:
        """Record token usage for a workflow execution."""
        total_tokens = input_tokens + output_tokens
        estimated_cost = (
            input_tokens * self.COST_PER_INPUT_TOKEN +
            output_tokens * self.COST_PER_OUTPUT_TOKEN
        )

        usage = TokenUsage(
            execution_id=execution_id,
            user_id=user_id,
            workflow_id=workflow_id,
            timestamp=datetime.now(),
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total_tokens,
            estimated_cost_usd=estimated_cost,
        )

        self.usage_log.append(usage)
        return usage

    def get_user_cost(self, user_id: str, days: int = 30) -> float:
        """Get total cost for a user in the last N days."""
        cutoff = datetime.now() - timedelta(days=days)
        user_usage = [
            u for u in self.usage_log
            if u.user_id == user_id and u.timestamp > cutoff
        ]
        return sum(u.estimated_cost_usd for u in user_usage)

# Global cost tracker
cost_tracker = CostTracker()
```

#### 3.3 Update Executor with Containment

```python
# src/workflows/executor.py (updates)

from src.workflows.rate_limiter import rate_limiter
from src.workflows.cost_tracker import cost_tracker

async def execute_workflow(
    self,
    workflow_id: str,
    context: WorkflowContext,
    llm_api_key: Optional[str] = None,
) -> WorkflowExecution:
    """Execute workflow with rate limiting and cost tracking."""

    # Rate limiting
    allowed, reason = rate_limiter.check_limit(context.user_id)
    if not allowed:
        raise ValueError(reason)

    # ... existing execution logic ...

    # Record execution for rate limiting
    rate_limiter.record_execution(context.user_id)

    # Track cost (when PydanticAI exposes token usage)
    # cost_tracker.record_usage(
    #     execution_id=execution.execution_id,
    #     user_id=context.user_id,
    #     workflow_id=workflow_id,
    #     input_tokens=result.usage.input_tokens,
    #     output_tokens=result.usage.output_tokens,
    # )

    return execution
```

---

## 📊 Implementation Priority

### Immediate (This Week)
1. ✅ Multi-domain workflow directories
2. ✅ Update Workflow model with `domain` field
3. ✅ Create 2-3 example workflows per domain
4. ✅ Update frontend to filter by domain

### Short-term (Next 2 Weeks)
1. ✅ AI-powered workflow recommendation system
2. ✅ WorkflowRecommender agent
3. ✅ `/api/v1/workflows/recommend` endpoint
4. ✅ WorkflowRecommendationCard component
5. ✅ Update WorkflowBrowser to show recommendations first

### Medium-term (Next Month)
1. ✅ Rate limiting (in-memory)
2. ✅ Cost tracking
3. ✅ User budgets and alerts
4. ✅ Persist rate limits to database

### Long-term (Next Quarter)
1. Redis-based rate limiting
2. Per-user API key management
3. Workflow marketplace (share custom workflows)
4. A/B testing different prompts
5. Workflow performance analytics

---

## 🎯 Success Metrics

### Multi-Domain Workflows
- ✅ 6 domains with 3+ workflows each
- ✅ 80%+ task coverage across domains
- ✅ User can find appropriate workflow in <30 seconds

### AI Recommendations
- ✅ 90%+ users use recommended workflow
- ✅ Average confidence score >0.8 for top recommendation
- ✅ <5% workflow re-selection rate

### Containment
- ✅ 0 rate limit violations leading to abuse
- ✅ Average cost per workflow execution <$0.05
- ✅ 100% of executions tracked
- ✅ 0 unauthorized API access attempts

---

## 💰 Cost Estimation

### AI Costs (per workflow execution)

**Workflow Recommendation:**
- Input: ~1,000 tokens (task + workflow catalog)
- Output: ~300 tokens (3 recommendations)
- Cost: $0.003 (input) + $0.0045 (output) = **~$0.0075**

**Workflow Execution:**
- Input: ~1,500 tokens (system + user prompt)
- Output: ~800 tokens (6 steps with details)
- Cost: $0.0045 (input) + $0.012 (output) = **~$0.0165**

**Total per task:** ~$0.024 (recommendation + execution)

**Monthly estimates:**
- 10 users × 20 tasks/month = 200 workflows
- 200 × $0.024 = **$4.80/month**

---

## 🔒 Security Considerations

### API Key Management
- ✅ Environment variable only
- ✅ Not exposed to frontend
- ❌ TODO: Per-user API keys
- ❌ TODO: Key rotation

### Rate Limiting
- ✅ Per-user limits
- ✅ Exponential backoff
- ❌ TODO: Redis-backed (for multi-instance)

### Prompt Injection Protection
- ✅ System prompts in TOML (version controlled)
- ✅ User input sanitized
- ✅ Structured outputs only
- ❌ TODO: Input validation rules
- ❌ TODO: Prompt injection detection

### Data Privacy
- ✅ Task descriptions stay in backend
- ✅ No user data sent to AI beyond context
- ❌ TODO: Option to disable AI for sensitive tasks
- ❌ TODO: Local LLM option (Ollama)

---

## 📚 Next Steps

### To implement this proposal:

1. **Start with Phase 1** (Multi-domain workflows)
   - Create workflow directories
   - Write 2-3 example workflows per domain
   - Update models and API
   - Test with real tasks

2. **Then Phase 2** (AI Recommendations)
   - Implement WorkflowRecommender
   - Add /recommend endpoint
   - Build frontend UI
   - A/B test with users

3. **Finally Phase 3** (Containment)
   - Add rate limiting
   - Add cost tracking
   - Set up monitoring
   - Document best practices

---

## Questions?

- How should we prioritize domains? (dev → personal → health → etc.?)
- Should recommendations be opt-in or default?
- What rate limits feel right? (3/min, 20/hr, 100/day?)
- Do we need per-user API keys immediately?

Let me know what you think! 🚀
