"""
Workflow Recommender - AI-powered workflow suggestion service.

This is a MICRO-LLM service that only runs when users click the ⭐ suggestion button.
It analyzes tasks and recommends workflows with letter grades (A+ to F).
"""

import logging
import os
from typing import Optional

from pydantic import BaseModel, Field
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel
from pydantic_ai.providers.openai import OpenAIProvider

from src.workflows.models import Workflow

logger = logging.getLogger(__name__)


class WorkflowSuggestion(BaseModel):
    """AI-powered workflow recommendation with letter grade."""

    workflow_id: str = Field(..., description="Workflow identifier")
    grade: str = Field(
        ...,
        description="Letter grade (A+, A, A-, B+, B, B-, C+, C, C-, D, F)",
        pattern="^(A\\+|A-?|B[+-]?|C[+-]?|D|F)$",
    )
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score 0.0-1.0")
    reasoning: str = Field(..., description="Why this workflow fits (or doesn't)")
    pros: list[str] = Field(..., description="Strengths of this workflow for this task")
    cons: list[str] = Field(..., description="Weaknesses or concerns")
    estimated_steps: int = Field(..., gt=0, description="Expected number of steps")
    estimated_time_minutes: int = Field(..., gt=0, description="Total estimated time")


class WorkflowRecommender:
    """
    AI-powered workflow recommendation system.

    Uses OpenAI GPT-4.1-mini to analyze tasks and suggest the best workflows
    with letter grades (A+ to F) based on suitability.
    """

    def __init__(self):
        """Initialize recommender (AI agent created lazily when needed)."""
        # Agent created on-demand in suggest_workflows() to match executor pattern
        pass

    def _get_system_prompt(self) -> str:
        """Get the system prompt for the recommendation agent."""
        return """
You are an expert workflow recommendation system with experience across multiple domains:
coding, personal productivity, health, learning, and creative work.

Your job is to analyze a task and recommend the most suitable workflows with HONEST letter grades.

GRADING RUBRIC:
- A+ (0.95-1.00): Perfect match, highly confident
- A  (0.90-0.94): Excellent match, very suitable
- A- (0.85-0.89): Great match, minor concerns
- B+ (0.80-0.84): Good match, some limitations
- B  (0.75-0.79): Decent match, notable concerns
- B- (0.70-0.74): Okay match, significant limitations
- C+ (0.65-0.69): Marginal match, many concerns
- C  (0.60-0.64): Weak match, questionable fit
- C- (0.55-0.59): Poor match, not recommended
- D  (0.40-0.54): Very poor match, avoid
- F  (0.00-0.39): Completely unsuitable

BE HONEST AND CRITICAL:
- Don't give all A grades - be selective
- Point out real weaknesses and concerns
- Consider user energy, time, and context
- A "B" is a perfectly good grade!
- An "F" means "use a different workflow entirely"

For each workflow, provide:
1. **grade**: Letter grade (A+, A, A-, B+, B, B-, C+, C, C-, D, F)
2. **confidence**: Numeric score matching the grade (0.0-1.0)
3. **reasoning**: 1-2 sentences explaining the grade
4. **pros**: 2-4 specific strengths for THIS task
5. **cons**: 1-3 specific weaknesses or concerns
6. **estimated_steps**: How many steps it will likely generate
7. **estimated_time_minutes**: Total time estimate

Return ALL workflows with grades - even F grades! Users want to see why a workflow is unsuitable.
Sort by grade (best first), but include everything.

Example output:
[
  {
    "workflow_id": "backend_api_feature_tdd",
    "grade": "A",
    "confidence": 0.92,
    "reasoning": "Task requires backend API with TDD methodology. Perfect alignment with workflow strengths.",
    "pros": [
      "Enforces test-driven development",
      "Structured RED-GREEN-REFACTOR phases",
      "Accounts for medium energy level"
    ],
    "cons": [
      "Might be overly rigid for exploratory coding"
    ],
    "estimated_steps": 6,
    "estimated_time_minutes": 180
  },
  {
    "workflow_id": "frontend_component",
    "grade": "C-",
    "confidence": 0.58,
    "reasoning": "Task is backend-focused, not frontend. Workflow would be a poor fit.",
    "pros": [
      "Good for component-based thinking"
    ],
    "cons": [
      "Wrong domain (frontend vs backend)",
      "Storybook-first approach doesn't apply",
      "Would waste time on irrelevant steps"
    ],
    "estimated_steps": 5,
    "estimated_time_minutes": 150
  }
]
"""

    async def suggest_workflows(
        self,
        task_title: str,
        task_description: str,
        available_workflows: list[Workflow],
        user_context: dict,
        llm_api_key: Optional[str] = None,
    ) -> list[WorkflowSuggestion]:
        """
        Get AI-powered workflow suggestions with letter grades.

        Args:
            task_title: Task title
            task_description: Task description (can be empty)
            available_workflows: All available workflow definitions
            user_context: User energy, time, preferences
            llm_api_key: Optional API key override

        Returns:
            List of workflow suggestions sorted by grade (best first)
        """
        # Initialize AI agent (lazy initialization to match executor pattern)
        provider = OpenAIProvider(api_key=llm_api_key or os.getenv("LLM_API_KEY"))
        model = OpenAIModel("gpt-4.1-mini", provider=provider)
        agent = Agent(
            model,
            system_prompt=self._get_system_prompt(),
            output_type=list[WorkflowSuggestion],
        )

        # Build workflow catalog for AI
        workflow_catalog = "\n\n".join(
            [
                f"**{w.workflow_id}**\n"
                f"Name: {w.name}\n"
                f"Domain: {w.domain if hasattr(w, 'domain') else 'dev'}\n"
                f"Type: {w.workflow_type}\n"
                f"Description: {w.description}\n"
                f"Expected Steps: {w.expected_step_count}\n"
                f"Tags: {', '.join(w.tags)}"
                for w in available_workflows
            ]
        )

        # Build user prompt
        prompt = f"""
Analyze this task and recommend workflows with HONEST letter grades (A+ to F).

TASK TO ANALYZE:
Title: {task_title}
Description: {task_description or "No detailed description provided"}

AVAILABLE WORKFLOWS:
{workflow_catalog}

USER CONTEXT:
- Energy Level: {user_context.get('energy', 'medium')} ({user_context.get('energy_numeric', 2)}/3)
- Time of Day: {user_context.get('time_of_day', 'unknown')}
- Available Time: {user_context.get('estimated_hours', 4)} hours
- Recent Tasks: {', '.join(user_context.get('recent_tasks', [])[:3]) or 'None'}

Analyze the task and provide grades for ALL workflows (even if some get F).
Be HONEST - not everything deserves an A!

Consider:
1. Domain match (dev vs personal vs health, etc.)
2. Task type match (API vs component vs planning, etc.)
3. User energy level (does workflow match their capacity?)
4. Time availability (realistic for {user_context.get('estimated_hours', 4)} hours?)
5. Context fit (does it make sense given recent work?)

Return JSON array with ALL workflows graded from best to worst.
"""

        try:
            result = await agent.run(prompt)

            # Sort by confidence (highest first)
            suggestions = sorted(result.output, key=lambda s: s.confidence, reverse=True)

            logger.info(
                f"Generated {len(suggestions)} workflow suggestions for task: {task_title}"
            )

            return suggestions

        except Exception as e:
            logger.error(f"Failed to generate workflow suggestions: {e}")
            raise


# Grade to color mapping for UI
GRADE_COLORS = {
    "A+": "#859900",  # Green
    "A": "#859900",
    "A-": "#859900",
    "B+": "#b58900",  # Yellow
    "B": "#b58900",
    "B-": "#b58900",
    "C+": "#cb4b16",  # Orange
    "C": "#cb4b16",
    "C-": "#cb4b16",
    "D": "#dc322f",  # Red
    "F": "#dc322f",
}


def get_grade_color(grade: str) -> str:
    """Get color hex for a letter grade."""
    return GRADE_COLORS.get(grade, "#586e75")  # Default gray


def get_grade_emoji(grade: str) -> str:
    """Get emoji for a letter grade."""
    if grade in ["A+", "A", "A-"]:
        return "🌟"
    elif grade in ["B+", "B", "B-"]:
        return "✨"
    elif grade in ["C+", "C", "C-"]:
        return "⚠️"
    elif grade == "D":
        return "❌"
    else:  # F
        return "🚫"
