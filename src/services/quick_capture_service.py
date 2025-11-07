"""
Quick Capture Service - Intelligent task capture using UnifiedAgent + Secretary

This service combines the UnifiedAgent system with Secretary intelligence to provide:
1. Auto Mode: AI extrapolation of task details from natural language
2. Clarity Mode: Intelligent question generation for ambiguous tasks
"""

import logging
from datetime import UTC, datetime, timedelta
from typing import Any

from src.core.settings import get_settings
from src.knowledge.models import KGContext
from src.services.llm_capture_service import LLMCaptureService
from src.services.secretary_service import SecretaryService

# Python 3.10 compatibility
UTC = UTC

logger = logging.getLogger(__name__)


class QuickCaptureService:
    """Service for intelligent quick capture using AI agents"""

    def __init__(self):
        """Initialize quick capture service"""
        self.secretary = SecretaryService()
        self.llm_service = LLMCaptureService()
        self.settings = get_settings()

    async def analyze_capture(
        self,
        text: str,
        user_id: str,
        voice_input: bool = False,
        kg_context: KGContext | None = None,
    ) -> dict[str, Any]:
        """
        Analyze captured text using AI and secretary intelligence.

        Args:
            text: Raw input text from user
            user_id: User ID for context
            voice_input: Whether input came from voice
            kg_context: Knowledge Graph context (optional)

        Returns:
            Dictionary with analysis results including:
            - title: Extracted task title
            - priority: Suggested priority
            - category: Urgency/importance category
            - confidence: Confidence score (0-100)
            - should_delegate: Whether task should be delegated
            - reasoning: Explanation of analysis
            - tags: Suggested tags
        """
        try:
            # Try LLM parsing first (if enabled)
            if self.settings.llm_capture_enabled:
                try:
                    llm_result = await self.llm_service.parse(text, user_id, kg_context=kg_context)
                    # Convert LLM result to analysis format
                    analysis = self._llm_result_to_analysis(
                        llm_result, voice_input, kg_context is not None
                    )
                except Exception as e:
                    logger.warning(f"LLM parsing failed: {e}")
                    if self.settings.llm_capture_fallback:
                        # Fallback to keyword-based analysis
                        analysis = self._analyze_with_keywords(text, user_id, voice_input)
                    else:
                        raise
            else:
                # Use keyword-based analysis
                analysis = self._analyze_with_keywords(text, user_id, voice_input)

            # Use secretary to categorize
            category = self._categorize_task(analysis)

            return {
                "title": analysis["title"],
                "description": text,
                "priority": analysis["priority"],
                "category": category,
                "confidence": analysis["confidence"],
                "should_delegate": analysis["should_delegate"],
                "delegation_type": analysis["delegation_type"],
                "reasoning": analysis["reasoning"],
                "tags": analysis["tags"],
                "due_date": analysis.get("due_date"),
            }

        except Exception as e:
            logger.error(f"Error analyzing capture: {e}")
            # Return basic analysis on error
            return {
                "title": text[:100],
                "description": text,
                "priority": "medium",
                "category": "this_week",
                "confidence": 50,
                "should_delegate": False,
                "delegation_type": None,
                "reasoning": "Basic keyword analysis",
                "tags": ["quick-capture"],
            }

    def _llm_result_to_analysis(
        self, llm_result, voice_input: bool, used_kg: bool
    ) -> dict[str, Any]:
        """
        Convert LLMCaptureService result to QuickCaptureService analysis format.

        Args:
            llm_result: TaskParseResult from LLMCaptureService
            voice_input: Whether input came from voice
            used_kg: Whether Knowledge Graph context was used

        Returns:
            Analysis dict compatible with existing format
        """
        task = llm_result.task

        # Convert confidence from 0-1 to 0-100
        confidence = int(task.confidence * 100)

        # Build tags - only add voice tag, remove system tags
        tags = list(task.tags)
        if voice_input and "voice" not in tags:
            tags.append("voice")
        # Remove system tags that were previously added
        tags = [tag for tag in tags if tag not in ["kg-enhanced", "llm-openai", "llm-anthropic"]]

        # Determine delegation
        should_delegate = task.is_digital
        delegation_type = task.automation_type

        # Add delegation tag
        if should_delegate and delegation_type:
            tags.append(f"delegate-{delegation_type}")

        # Parse due date to datetime if present
        due_date = None
        if task.due_date:
            try:
                due_date = datetime.fromisoformat(task.due_date)
            except ValueError:
                logger.warning(f"Invalid due date format: {task.due_date}")

        # Build reasoning
        reasoning_parts = [llm_result.reasoning]
        if used_kg:
            reasoning_parts.append("Enhanced with Knowledge Graph context")
        if should_delegate:
            reasoning_parts.append(f"Identified as {delegation_type} task")

        # Round estimated_hours to 2 decimal places for Task model validation
        estimated_hours = task.estimated_hours
        if estimated_hours is not None:
            estimated_hours = round(float(estimated_hours), 2)

        return {
            "title": task.title,
            "priority": task.priority,
            "confidence": confidence,
            "should_delegate": should_delegate,
            "delegation_type": delegation_type,
            "reasoning": "; ".join(reasoning_parts),
            "tags": tags,
            "due_date": due_date,
            "estimated_hours": estimated_hours,
            "entities": task.entities,
        }

    def _analyze_with_keywords(self, text: str, user_id: str, voice_input: bool) -> dict[str, Any]:
        """
        Smart keyword-based analysis (placeholder for AI integration).

        This will be replaced with UnifiedAgent integration.
        """
        text_lower = text.lower()

        # Detect priority
        priority = "medium"
        confidence = 70

        if any(word in text_lower for word in ["urgent", "asap", "critical", "emergency"]):
            priority = "high"
            confidence = 90
        elif any(word in text_lower for word in ["important", "priority", "must"]):
            priority = "high"
            confidence = 80
        elif any(word in text_lower for word in ["low", "maybe", "someday", "later"]):
            priority = "low"
            confidence = 75

        # Detect delegation keywords
        should_delegate = False
        delegation_type = None

        delegation_keywords = {
            "email": ["email", "send email", "draft email", "reply", "message"],
            "research": ["research", "look up", "find out", "investigate", "google"],
            "calendar": ["schedule", "meeting", "calendar", "book", "arrange"],
            "web": ["browse", "web", "website", "online", "check site"],
            "document": ["write", "document", "draft", "create doc", "notes"],
        }

        for dtype, keywords in delegation_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                should_delegate = True
                delegation_type = dtype
                confidence = min(confidence + 10, 95)
                break

        # Extract due date (timezone-naive for compatibility with Task model)
        due_date = None
        if "tomorrow" in text_lower:
            due_date = (datetime.now(UTC) + timedelta(days=1)).replace(
                hour=9, minute=0, second=0, microsecond=0, tzinfo=None
            )
        elif "today" in text_lower:
            due_date = datetime.now(UTC).replace(
                hour=23, minute=59, second=0, microsecond=0, tzinfo=None
            )
        elif "this week" in text_lower:
            # End of current week (Sunday)
            days_until_sunday = (6 - datetime.now(UTC).weekday()) % 7
            due_date = (datetime.now(UTC) + timedelta(days=days_until_sunday)).replace(
                hour=23, minute=59, second=0, microsecond=0, tzinfo=None
            )

        # Clean title (remove time/priority keywords)
        title = text
        for word in [
            "tomorrow",
            "today",
            "urgent",
            "asap",
            "important",
            "this week",
            "high priority",
        ]:
            title = title.lower().replace(word, "").strip()
        title = " ".join(title.split())  # Clean extra spaces

        # Generate tags
        tags = ["quick-capture"]
        if voice_input:
            tags.append("voice")
        if should_delegate:
            tags.append(f"delegate-{delegation_type}")
        if priority == "high":
            tags.append("urgent")

        # Estimate time based on task complexity keywords
        estimated_hours = self._estimate_time_from_keywords(text_lower, delegation_type)

        # Generate reasoning
        reasoning_parts = []
        if priority == "high":
            reasoning_parts.append("Detected urgency keywords")
        if should_delegate:
            reasoning_parts.append(f"Identified as {delegation_type} task")
        if due_date:
            reasoning_parts.append("Extracted due date from text")
        reasoning_parts.append(f"Estimated {estimated_hours} hours based on task complexity")

        reasoning = "; ".join(reasoning_parts) if reasoning_parts else "Standard task"

        return {
            "title": title or text[:100],
            "priority": priority,
            "confidence": confidence,
            "should_delegate": should_delegate,
            "delegation_mode": delegation_type,
            "reasoning": reasoning,
            "tags": tags,
            "due_date": due_date,
            "estimated_hours": estimated_hours,
        }

    def _estimate_time_from_keywords(self, text_lower: str, delegation_type: str | None) -> float:
        """
        Estimate task duration based on keywords and complexity.

        Args:
            text_lower: Lowercase task text
            delegation_type: Type of delegation (email, research, etc.)

        Returns:
            Estimated hours (rounded to 2 decimals)
        """
        # Quick tasks (5-10 minutes = 0.08-0.17 hours)
        quick_keywords = [
            "quick",
            "send",
            "reply",
            "check",
            "turn on",
            "turn off",
            "set",
            "adjust",
            "call",
            "text",
            "message",
        ]

        # Short tasks (15-30 minutes = 0.25-0.5 hours)
        short_keywords = [
            "email",
            "draft",
            "review",
            "organize",
            "clean",
            "file",
            "update",
            "fix",
            "schedule",
            "book",
        ]

        # Medium tasks (30-60 minutes = 0.5-1 hour)
        medium_keywords = [
            "write",
            "create",
            "design",
            "plan",
            "research",
            "analyze",
            "prepare",
            "meeting",
            "presentation",
            "document",
        ]

        # Long tasks (1-2 hours)
        long_keywords = [
            "develop",
            "build",
            "implement",
            "project",
            "workshop",
            "training",
            "deep dive",
            "comprehensive",
        ]

        # Very long tasks (2+ hours)
        very_long_keywords = [
            "major",
            "complete",
            "overhaul",
            "redesign",
            "migrate",
            "full",
            "entire",
            "all",
        ]

        # Count word complexity
        word_count = len(text_lower.split())

        # Estimate based on keywords (check from longest to shortest)
        if any(kw in text_lower for kw in very_long_keywords):
            return round(2.0 + (word_count / 50) * 0.5, 2)  # 2-3 hours
        elif any(kw in text_lower for kw in long_keywords):
            return round(1.0 + (word_count / 40) * 0.3, 2)  # 1-1.5 hours
        elif any(kw in text_lower for kw in medium_keywords):
            return round(0.5 + (word_count / 30) * 0.2, 2)  # 30-45 min
        elif any(kw in text_lower for kw in short_keywords):
            return round(0.25 + (word_count / 20) * 0.15, 2)  # 15-30 min
        elif any(kw in text_lower for kw in quick_keywords):
            return round(0.1 + (word_count / 15) * 0.1, 2)  # 5-15 min

        # Delegation-based estimation
        if delegation_type:
            delegation_times = {
                "email": 0.25,  # 15 minutes
                "calendar": 0.17,  # 10 minutes
                "web": 0.33,  # 20 minutes
                "research": 0.75,  # 45 minutes
                "document": 1.0,  # 1 hour
                "home_iot": 0.08,  # 5 minutes
            }
            return round(delegation_times.get(delegation_type, 0.5), 2)

        # Default: 30 minutes for unrecognized tasks
        # But adjust for word count (longer description = more complex)
        base_time = 0.5
        if word_count > 20:
            base_time = 0.75  # 45 min for longer descriptions
        elif word_count > 10:
            base_time = 0.5  # 30 min
        else:
            base_time = 0.25  # 15 min for very short

        return round(base_time, 2)

    def _categorize_task(self, analysis: dict[str, Any]) -> str:
        """
        Categorize task using secretary logic.

        Returns one of: main_priority, urgent_tasks, important_tasks, this_week
        """
        priority = analysis.get("priority", "medium")
        due_date = analysis.get("due_date")

        # Determine urgency (due within 48 hours)
        is_urgent = False
        if due_date:
            # Use timezone-naive datetime for comparison (due_date is naive)
            now_naive = datetime.now(UTC).replace(tzinfo=None)
            hours_until_due = (due_date - now_naive).total_seconds() / 3600
            is_urgent = hours_until_due <= 48

        # Determine importance
        is_important = priority in ["high", "critical"]

        # Categorize using Eisenhower matrix
        if is_urgent and is_important:
            return "main_priority"  # Do First
        elif is_urgent:
            return "urgent_tasks"  # Urgent but not important
        elif is_important:
            return "important_tasks"  # Important but not urgent
        else:
            return "this_week"  # Neither urgent nor important

    async def generate_clarifying_questions(self, text: str, user_id: str) -> list[dict[str, Any]]:
        """
        Generate intelligent clarifying questions for ambiguous tasks.

        Args:
            text: Raw input text
            user_id: User ID for context

        Returns:
            List of question dictionaries with:
            - question: The question text
            - type: Question type (boolean, select, date, text)
            - field: Which task field this populates
            - options: Available options (for select type)
        """
        try:
            # Analyze what we already know
            analysis = self._analyze_with_keywords(text, user_id, False)

            questions = []

            # Ask about urgency if not clear
            if analysis["confidence"] < 80:
                questions.append(
                    {
                        "question": "Is this urgent (due within 48 hours)?",
                        "type": "boolean",
                        "field": "urgent",
                        "default": False,
                    }
                )

            # Ask about importance/priority
            questions.append(
                {
                    "question": "How important is this task?",
                    "type": "select",
                    "field": "priority",
                    "options": ["critical", "high", "medium", "low"],
                    "default": analysis.get("priority", "medium"),
                }
            )

            # Ask about due date if not detected
            if not analysis.get("due_date"):
                questions.append(
                    {
                        "question": "When do you need this done?",
                        "type": "date",
                        "field": "due_date",
                        "default": None,
                    }
                )

            # Ask about delegation if detected keywords
            if analysis.get("should_delegate"):
                questions.append(
                    {
                        "question": f"Should I delegate this {analysis['delegation_type']} task to an agent?",
                        "type": "boolean",
                        "field": "delegate",
                        "default": True,
                    }
                )

            # Ask for additional context
            questions.append(
                {
                    "question": "Any additional context or details?",
                    "type": "text",
                    "field": "context",
                    "default": "",
                }
            )

            return questions

        except Exception as e:
            logger.error(f"Error generating questions: {e}")
            # Return minimal questions on error
            return [
                {
                    "question": "How important is this task?",
                    "type": "select",
                    "field": "priority",
                    "options": ["high", "medium", "low"],
                    "default": "medium",
                }
            ]
