"""
LLM Capture Service - Structured task parsing with Knowledge Graph context

Replaces keyword-based parsing with LLM-powered structured extraction.
Uses KG context to auto-populate fields and reduce clarification questions.
"""

import json
import logging
import os

from pydantic import BaseModel, Field

from src.knowledge.models import KGContext

# Try to import LLM clients
try:
    import openai

    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import anthropic

    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

logger = logging.getLogger(__name__)


class ParsedTask(BaseModel):
    """Structured task parsed from LLM"""

    title: str = Field(..., description="Clean task title")
    description: str = Field(..., description="Full task description")
    priority: str = Field(
        default="medium", description="Task priority: critical, high, medium, low"
    )
    estimated_hours: float = Field(
        default=0.25,
        description="Estimated time in hours (MUST estimate realistically - 15min default only as fallback)",
        ge=0.0,
        le=100.0,
    )
    due_date: str | None = Field(None, description="Due date in ISO format (YYYY-MM-DD)")
    tags: list[str] = Field(default_factory=list, description="Task tags")
    entities: list[str] = Field(
        default_factory=list, description="Mentioned entities (people, devices, etc.)"
    )
    is_digital: bool = Field(default=False, description="Can this be automated by AI?")
    automation_type: str | None = Field(
        None, description="Type of automation: email, calendar, home_iot, research, web"
    )
    confidence: float = Field(default=0.7, description="Parsing confidence (0-1)", ge=0.0, le=1.0)


class TaskParseResult(BaseModel):
    """Result of LLM parsing with metadata"""

    task: ParsedTask
    reasoning: str = Field(..., description="Explanation of parsing decisions")
    used_kg_context: bool = Field(
        default=False, description="Whether KG context influenced parsing"
    )
    tokens_used: int = Field(default=0, description="Total tokens consumed")
    provider: str = Field(default="unknown", description="LLM provider used")


class LLMCaptureService:
    """Service for LLM-powered task parsing with KG context"""

    def __init__(self):
        """Initialize LLM capture service"""
        self.openai_client = None
        self.anthropic_client = None

        # Initialize OpenAI
        openai_key = os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY")
        if OPENAI_AVAILABLE and openai_key:
            self.openai_client = openai.AsyncOpenAI(api_key=openai_key)
            logger.info("OpenAI client initialized for LLM capture")

        # Initialize Anthropic
        anthropic_key = os.getenv("LLM_API_KEY") or os.getenv("ANTHROPIC_API_KEY")
        if ANTHROPIC_AVAILABLE and anthropic_key:
            self.anthropic_client = anthropic.AsyncAnthropic(api_key=anthropic_key)
            logger.info("Anthropic client initialized for LLM capture")

    async def parse(
        self,
        text: str,
        user_id: str,
        kg_context: KGContext | None = None,
        provider: str | None = None,
    ) -> TaskParseResult:
        """
        Parse task from natural language using LLM with KG context.

        Args:
            text: Raw user input (brain dump)
            user_id: User ID for context
            kg_context: Knowledge Graph context (optional)
            provider: LLM provider to use (openai, anthropic, or None for auto)

        Returns:
            TaskParseResult with parsed task and metadata

        Raises:
            ValueError: If no LLM provider is available
        """
        # Build prompt with KG context
        prompt = self._build_prompt(text, kg_context)

        # Determine provider
        if not provider:
            provider = self._select_provider()

        # Call LLM
        try:
            if provider == "openai" and self.openai_client:
                result = await self._parse_with_openai(prompt, text, kg_context)
            elif provider == "anthropic" and self.anthropic_client:
                result = await self._parse_with_anthropic(prompt, text, kg_context)
            else:
                raise ValueError(f"Provider {provider} not available or not initialized")

            return result

        except Exception as e:
            logger.error(f"LLM parsing failed: {e}")
            raise

    def _select_provider(self) -> str:
        """Select best available LLM provider"""
        if self.openai_client:
            return "openai"
        elif self.anthropic_client:
            return "anthropic"
        else:
            raise ValueError("No LLM provider available")

    def _build_prompt(self, text: str, kg_context: KGContext | None = None) -> str:
        """
        Build structured prompt with KG context injection.

        Template follows ADHD-friendly design:
        - Clear instructions
        - Context first (KG facts)
        - User input clearly separated
        - Structured output format
        """
        prompt_parts = [
            "You are a task parsing assistant for an ADHD-friendly productivity system.",
            "",
            "**Your Goal:**",
            "Parse the user's brain dump into a structured task. Use the Knowledge Graph context to fill in missing information and reduce the need for clarification questions.",
            "",
        ]

        # Add KG context if available
        if kg_context and (kg_context.entities or kg_context.facts):
            prompt_parts.append("**Context from Knowledge Graph:**")
            prompt_parts.append(kg_context.format_for_prompt())
            prompt_parts.append("")
            prompt_parts.append(
                "Use this context to infer missing details (devices, contacts, locations)."
            )
            prompt_parts.append("")

        # Add user input
        prompt_parts.extend(
            [
                "**User Input:**",
                f'"{text}"',
                "",
                "**Instructions:**",
                "1. Extract a clean, actionable task title",
                "2. Determine priority: critical, high, medium, low",
                "3. Estimate time in hours (0.1 to 100)",
                "4. Extract due date if mentioned (ISO format YYYY-MM-DD)",
                "5. Identify relevant tags",
                "6. List entities mentioned (people, devices, locations)",
                "7. Determine if this can be automated (is_digital=true) or requires human action (is_digital=false)",
                "8. If digital, identify automation_type: email, calendar, home_iot, research, web",
                "",
                "**ADHD Optimization Rules:**",
                "- Break compound tasks into single actions (e.g., 'email Sara and turn off AC' → focus on first action)",
                "- Provide realistic time estimates based on task complexity (5 min task = 0.08 hours, 15 min = 0.25 hours, 30 min = 0.5 hours, 1 hour = 1.0 hours, etc.)",
                "- Consider task complexity: simple email (0.1 hrs), research (1-2 hrs), writing (2-4 hrs), projects (4+ hrs)",
                "- Tag urgency clearly",
                "- Use context to avoid asking questions (e.g., if user has one AC, assume that device)",
                "",
                "**Output Format:**",
                "Return JSON matching this schema:",
                "```json",
                "{",
                '  "task": {',
                '    "title": "Clean task title",',
                '    "description": "Full description",',
                '    "priority": "medium",',
                '    "estimated_hours": 0.25,  // ESTIMATE REALISTICALLY: 0.08 (5min), 0.25 (15min), 0.5 (30min), 1.0 (1hr), etc.',
                '    "due_date": null,',
                '    "tags": ["tag1", "tag2"],',
                '    "entities": ["entity1", "entity2"],',
                '    "is_digital": false,',
                '    "automation_type": null,',
                '    "confidence": 0.8',
                "  },",
                '  "reasoning": "Explanation of parsing decisions"',
                "}",
                "```",
            ]
        )

        return "\n".join(prompt_parts)

    async def _parse_with_openai(
        self, prompt: str, original_text: str, kg_context: KGContext | None
    ) -> TaskParseResult:
        """Parse using OpenAI (GPT-4 or GPT-4o-mini)"""
        try:
            model = os.getenv("LLM_MODEL", "gpt-4o-mini")

            response = await self.openai_client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.3,
                max_tokens=1000,
            )

            # Extract JSON
            content = response.choices[0].message.content
            parsed = json.loads(content)

            # Validate with Pydantic
            task = ParsedTask(**parsed["task"])
            reasoning = parsed.get("reasoning", "Parsed using OpenAI structured output")

            return TaskParseResult(
                task=task,
                reasoning=reasoning,
                used_kg_context=kg_context is not None,
                tokens_used=response.usage.total_tokens,
                provider="openai",
            )

        except Exception as e:
            logger.error(f"OpenAI parsing error: {e}")
            raise

    async def _parse_with_anthropic(
        self, prompt: str, original_text: str, kg_context: KGContext | None
    ) -> TaskParseResult:
        """Parse using Anthropic Claude"""
        try:
            model = os.getenv("LLM_MODEL", "claude-3-5-sonnet-20241022")

            response = await self.anthropic_client.messages.create(
                model=model,
                max_tokens=1024,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
            )

            # Extract JSON from response
            content = response.content[0].text

            # Handle markdown-wrapped JSON
            if "```json" in content:
                json_str = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                json_str = content.split("```")[1].split("```")[0].strip()
            else:
                json_str = content

            parsed = json.loads(json_str)

            # Validate with Pydantic
            task = ParsedTask(**parsed["task"])
            reasoning = parsed.get("reasoning", "Parsed using Anthropic structured output")

            # Calculate token usage (Anthropic provides input/output tokens)
            tokens_used = response.usage.input_tokens + response.usage.output_tokens

            return TaskParseResult(
                task=task,
                reasoning=reasoning,
                used_kg_context=kg_context is not None,
                tokens_used=tokens_used,
                provider="anthropic",
            )

        except Exception as e:
            logger.error(f"Anthropic parsing error: {e}")
            raise

    def create_fallback_result(
        self, text: str, kg_context: KGContext | None = None
    ) -> TaskParseResult:
        """
        Create fallback result when LLM parsing fails.

        Uses simple heuristics similar to keyword-based parsing.
        """
        # Basic keyword detection
        priority = "medium"
        if any(word in text.lower() for word in ["urgent", "asap", "critical", "emergency"]):
            priority = "high"

        # Detect automation potential
        is_digital = any(
            word in text.lower() for word in ["email", "schedule", "calendar", "research", "browse"]
        )

        automation_type = None
        if "email" in text.lower():
            automation_type = "email"
        elif any(word in text.lower() for word in ["schedule", "calendar", "meeting"]):
            automation_type = "calendar"
        elif any(word in text.lower() for word in ["research", "look up", "find out"]):
            automation_type = "research"

        task = ParsedTask(
            title=text[:100].strip(),
            description=text,
            priority=priority,
            estimated_hours=0.5,
            tags=["quick-capture", "fallback"],
            is_digital=is_digital,
            automation_type=automation_type,
            confidence=0.5,
        )

        return TaskParseResult(
            task=task,
            reasoning="Fallback parsing using keyword detection (LLM unavailable)",
            used_kg_context=False,
            tokens_used=0,
            provider="fallback",
        )
