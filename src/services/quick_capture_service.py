"""
Quick Capture Service - Intelligent task capture using UnifiedAgent + Secretary

This service combines the UnifiedAgent system with Secretary intelligence to provide:
1. Auto Mode: AI extrapolation of task details from natural language
2. Clarity Mode: Intelligent question generation for ambiguous tasks
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from src.core.task_models import TaskPriority, TaskStatus
from src.services.secretary_service import SecretaryService

# Python 3.10 compatibility
UTC = timezone.utc

logger = logging.getLogger(__name__)


class QuickCaptureService:
    """Service for intelligent quick capture using AI agents"""

    def __init__(self):
        """Initialize quick capture service"""
        self.secretary = SecretaryService()

    async def analyze_capture(
        self, text: str, user_id: str, voice_input: bool = False
    ) -> dict[str, Any]:
        """
        Analyze captured text using AI and secretary intelligence.

        Args:
            text: Raw input text from user
            user_id: User ID for context
            voice_input: Whether input came from voice

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
            # For now, use smart keyword-based analysis
            # TODO: Integrate with UnifiedAgent when async support is ready
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

    def _analyze_with_keywords(
        self, text: str, user_id: str, voice_input: bool
    ) -> dict[str, Any]:
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

        # Generate reasoning
        reasoning_parts = []
        if priority == "high":
            reasoning_parts.append("Detected urgency keywords")
        if should_delegate:
            reasoning_parts.append(f"Identified as {delegation_type} task")
        if due_date:
            reasoning_parts.append("Extracted due date from text")

        reasoning = "; ".join(reasoning_parts) if reasoning_parts else "Standard task"

        return {
            "title": title or text[:100],
            "priority": priority,
            "confidence": confidence,
            "should_delegate": should_delegate,
            "delegation_type": delegation_type,
            "reasoning": reasoning,
            "tags": tags,
            "due_date": due_date,
        }

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

    async def generate_clarifying_questions(
        self, text: str, user_id: str
    ) -> list[dict[str, Any]]:
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
                questions.append({
                    "question": "Is this urgent (due within 48 hours)?",
                    "type": "boolean",
                    "field": "urgent",
                    "default": False,
                })

            # Ask about importance/priority
            questions.append({
                "question": "How important is this task?",
                "type": "select",
                "field": "priority",
                "options": ["critical", "high", "medium", "low"],
                "default": analysis.get("priority", "medium"),
            })

            # Ask about due date if not detected
            if not analysis.get("due_date"):
                questions.append({
                    "question": "When do you need this done?",
                    "type": "date",
                    "field": "due_date",
                    "default": None,
                })

            # Ask about delegation if detected keywords
            if analysis.get("should_delegate"):
                questions.append({
                    "question": f"Should I delegate this {analysis['delegation_type']} task to an agent?",
                    "type": "boolean",
                    "field": "delegate",
                    "default": True,
                })

            # Ask for additional context
            questions.append({
                "question": "Any additional context or details?",
                "type": "text",
                "field": "context",
                "default": "",
            })

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
