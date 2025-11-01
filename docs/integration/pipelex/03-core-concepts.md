## 🧠 Core Concepts

### Pipelex Fundamentals

#### What is a Pipe?

A **pipe** is a single transformation step that takes typed inputs and produces typed outputs.

```toml
[[pipe]]
name = "assess_energy"
input = ["UserEnergyLevel"]
output = "EnergyAssessment"
instruction = """
Analyze the user's current energy level (1-3 scale).
Provide recommendations for task intensity:
- Low (1): Light tasks only (< 15 min)
- Medium (2): Moderate tasks (15-30 min)
- High (3): Complex tasks (30+ min)
"""
provider = "anthropic:claude-3-5-sonnet"
```

#### What is a Concept?

A **concept** is a typed piece of knowledge with validation rules.

```toml
[concept.UserEnergyLevel]
description = "User's current energy level on 1-3 scale"
validation = "Must be integer 1, 2, or 3"

[concept.EnergyAssessment]
description = "Analysis of energy level with task recommendations"
refines = "Text"
```

#### How Pipes Chain Together

```
UserEnergyLevel ─────┐
                     ├─→ [Pipe 1: assess_energy] ─→ EnergyAssessment
TodaySchedule ───────┘                                      │
                                                            │
                                                            ↓
                        [Pipe 2: generate_routine] ─→ RoutinePlan
                                                            │
                                                            ↓
                        [Pipe 3: create_task] ──────→ PlatformTask
```

### Integration Patterns

#### Pattern 1: Context Injection

Platform automatically injects user context into workflows:

```python
# src/workflows/executor.py

async def execute_workflow(workflow_id: UUID, user_id: str) -> Task:
    # Load workflow
    workflow = await get_workflow(workflow_id)
    pipeline = Pipeline.from_file(workflow.plx_file_path)

    # Inject platform context
    user_context = {
        "user_energy": await get_current_energy(user_id),
        "schedule": await get_today_schedule(user_id),
        "zones": await get_compass_zones(user_id),
        "recent_tasks": await get_recent_tasks(user_id, limit=5),
        "preferences": await get_user_preferences(user_id)
    }

    # Execute pipeline
    result = await pipeline.run(user_context)

    # Transform to platform task
    task = transform_workflow_output_to_task(result, user_id)
    return task
```

#### Pattern 2: Output Transformation

Workflow outputs must be converted to platform models:

```python
def transform_workflow_output_to_task(result: PipelineResult, user_id: str) -> Task:
    """Convert Pipelex output to platform Task model."""

    # Extract concepts from result
    routine_plan = result.get_concept("RoutinePlan")

    # Parse AI-generated plan
    steps_data = parse_routine_plan(routine_plan)

    # Create platform task
    task = TaskCreate(
        user_id=user_id,
        title=steps_data["title"],
        description=steps_data["description"],
        priority="high",
        zone_id=get_zone_id_by_name(user_id, "Self"),
        micro_steps=[
            MicroStepCreate(
                description=step["description"],
                estimated_minutes=step["duration"],
                leaf_type=step["type"],
                icon=step.get("icon", "📋")
            )
            for step in steps_data["steps"]
        ]
    )

    return create_task(task)
```

#### Pattern 3: Multi-LLM Support

Users can choose their LLM provider:

```python
# User settings
user_preferences = {
    "llm_provider": "anthropic:claude-3-5-sonnet",  # or "openai:gpt-4", "ollama:llama3"
    "api_key": "sk-...",  # User's own API key (encrypted)
    "max_cost_per_execution": 0.10  # $0.10 limit
}

# Workflow execution respects user settings
pipeline = Pipeline.from_file(workflow.plx_file_path)
pipeline.set_provider(user_preferences["llm_provider"]) 
pipeline.set_credentials(user_preferences["api_key"]) 
pipeline.set_max_cost(user_preferences["max_cost_per_execution"]) 
```
