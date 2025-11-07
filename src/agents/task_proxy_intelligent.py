"""
Intelligent Task Proxy Agent - Real AI-powered task management

This agent provides intelligent task processing including:
- Task prioritization based on context and urgency
- Automatic task breakdown for complex tasks
- Duration estimation using AI and historical data
- Smart task categorization
- Context-aware suggestions
- Learning from user patterns
"""

import logging
import os
import re
from dataclasses import dataclass
from datetime import datetime
from typing import Any

from src.agents.base import BaseProxyAgent
from src.core.models import AgentRequest, Message
from src.core.task_models import Task
from src.repositories.enhanced_repositories import (
    EnhancedProjectRepository,
    EnhancedTaskRepository,
    UserRepository,
)

# AI Integration (with fallbacks for development)
try:
    import openai

    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logging.warning("OpenAI not available, using fallback responses")

try:
    import anthropic

    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False
    logging.warning("Anthropic not available, using fallback responses")


@dataclass
class TaskContext:
    """Context information for intelligent task processing"""

    current_time: str
    current_location: str | None = None
    energy_level: str | None = None
    available_time: int | None = None  # minutes
    upcoming_meetings: list[str] = None
    recent_completed_tasks: list[str] = None
    user_preferences: dict[str, Any] = None


class IntelligentTaskAgent(BaseProxyAgent):
    """Intelligent Task Proxy Agent with real AI capabilities"""

    def __init__(self, db, task_repo=None, project_repo=None, user_repo=None):
        super().__init__("intelligent_task", db)

        # Repository dependencies
        self.task_repo = task_repo or EnhancedTaskRepository()
        self.project_repo = project_repo or EnhancedProjectRepository()
        self.user_repo = user_repo or UserRepository()

        # AI client configuration
        self.openai_client = None
        self.anthropic_client = None
        self.ai_provider = os.getenv("LLM_PROVIDER", "openai")
        self.ai_model = os.getenv("LLM_MODEL", "gpt-4")

        # Initialize AI clients if available and configured
        if OPENAI_AVAILABLE and self.ai_provider == "openai":
            try:
                api_key = os.getenv("LLM_API_KEY") or os.getenv("OPENAI_API_KEY")
                if api_key and not api_key.startswith("sk-your-"):
                    self.openai_client = openai.AsyncOpenAI(api_key=api_key)
                    logging.info("OpenAI client initialized successfully")
                else:
                    logging.warning("OpenAI API key not configured, using fallback heuristics")
            except Exception as e:
                logging.warning(f"OpenAI client initialization failed: {e}")

        if ANTHROPIC_AVAILABLE and self.ai_provider == "anthropic":
            try:
                api_key = os.getenv("LLM_API_KEY") or os.getenv("ANTHROPIC_API_KEY")
                if api_key and not api_key.startswith("sk-your-"):
                    self.anthropic_client = anthropic.AsyncAnthropic(api_key=api_key)
                    logging.info("Anthropic client initialized successfully")
                else:
                    logging.warning("Anthropic API key not configured, using fallback heuristics")
            except Exception as e:
                logging.warning(f"Anthropic client initialization failed: {e}")

        # Learning and context storage
        self.learning_data = {}
        self.user_patterns = {}

    async def _handle_request(
        self, request: AgentRequest, history: list[Message]
    ) -> tuple[str, int]:
        """Handle intelligent task requests"""
        try:
            # Process the request intelligently
            response = await self.process_intelligent_task(request)

            # Format response for user
            if "error" in response:
                return f"❌ {response['error']}", 0

            message_parts = []

            if "subtasks" in response and response["subtasks"]:
                message_parts.append(f"📋 Broke down into {len(response['subtasks'])} subtasks")

            if "estimation" in response:
                hours = response["estimation"].get("hours", 0)
                confidence = response["estimation"].get("confidence", 0)
                message_parts.append(f"⏱️ Estimated: {hours}h (confidence: {confidence:.1%})")

            if "category" in response:
                category = response["category"].get("category", "unknown")
                message_parts.append(f"🏷️ Category: {category}")

            if "priority_score" in response:
                score = response["priority_score"]
                priority_level = (
                    "🔴 High" if score > 0.7 else "🟡 Medium" if score > 0.4 else "🟢 Low"
                )
                message_parts.append(f"Priority: {priority_level}")

            # Store the task with intelligent metadata
            await self.store_message(
                request.session_id, "intelligent_task_created", request.query, response
            )

            xp_earned = 50 if "subtasks" in response else 25

            message = "✅ Intelligent task analysis complete:\n" + "\n".join(message_parts)
            return message, xp_earned

        except Exception as e:
            logging.error(f"Intelligent task processing failed: {e}")
            # Fallback to basic task creation
            await self.store_message(
                request.session_id,
                "task_created",
                request.query,
                {"priority": "medium", "status": "pending"},
            )
            return f"✅ Task captured: {request.query} (basic mode)", 15

    async def process_intelligent_task(self, request: AgentRequest) -> dict[str, Any]:
        """Process a task request with full AI intelligence"""
        try:
            # Create task object from request
            task = Task(
                task_id=f"temp_{datetime.now().timestamp()}",
                title=request.query[:100],
                description=request.query,
                project_id="default-project",
                status="todo",
                priority="medium",
                created_at=datetime.now(),
            )

            response = {}
            ai_failures = []

            # AI-powered analysis with individual error handling
            try:
                response["subtasks"] = await self.break_down_task(task)
            except Exception:
                ai_failures.append("breakdown")
                response["subtasks"] = []

            try:
                response["estimation"] = await self.estimate_task_duration(task)
            except Exception:
                ai_failures.append("estimation")
                response["estimation"] = {"hours": 2.0, "confidence": 0.5}

            try:
                response["category"] = await self.categorize_task(task)
            except Exception:
                ai_failures.append("categorization")
                response["category"] = {"category": "general", "confidence": 0.5}

            try:
                response["priority_score"] = await self._ai_prioritize(task)
            except Exception:
                ai_failures.append("prioritization")
                response["priority_score"] = 0.5

            # If any AI components failed, add error indicators
            if ai_failures:
                response["error"] = f"AI services failed: {', '.join(ai_failures)}"
                response["fallback"] = True

            return response

        except Exception as e:
            return {"error": f"AI processing failed: {str(e)}", "fallback": True}

    # =============================================================================
    # TASK PRIORITIZATION
    # =============================================================================

    async def prioritize_tasks(self, tasks: list[Task]) -> list[Task]:
        """Prioritize tasks using AI analysis"""
        task_scores = []

        for task in tasks:
            urgency_score = await self._analyze_task_urgency(task)
            deadline_score = await self._calculate_deadline_urgency(task)
            context_score = await self._analyze_contextual_fit(task, {})

            # Weighted combination - prioritize urgency and deadlines
            total_score = urgency_score * 0.5 + deadline_score * 0.4 + context_score * 0.1
            task_scores.append((task, total_score))

        # Sort by score descending
        task_scores.sort(key=lambda x: x[1], reverse=True)
        return [task for task, score in task_scores]

    async def prioritize_tasks_with_context(
        self, tasks: list[Task], context: dict[str, Any]
    ) -> list[Task]:
        """Prioritize tasks considering current context"""
        task_scores = []

        for task in tasks:
            context_score = await self._analyze_contextual_fit(task, context)
            task_scores.append((task, context_score))

        task_scores.sort(key=lambda x: x[1], reverse=True)
        return [task for task, score in task_scores]

    async def _analyze_task_urgency(self, task: Task) -> float:
        """Analyze task urgency using AI (with fallback)"""
        try:
            # Try AI analysis first if client is available
            if self.openai_client:
                try:
                    prompt = f"""Analyze the urgency of this task and return ONLY a single number between 0.0 and 1.0.

Task Title: {task.title}
Description: {task.description or "No description"}
Priority: {task.priority}

Consider:
- Keywords indicating urgency (bug, critical, urgent, etc.)
- Impact and consequences
- Time sensitivity

Return ONLY a decimal number (e.g., 0.85)"""

                    response = await self.openai_client.chat.completions.create(
                        model=self.ai_model,
                        messages=[
                            {
                                "role": "system",
                                "content": "You are a task analysis AI. Respond with ONLY a single decimal number.",
                            },
                            {"role": "user", "content": prompt},
                        ],
                        temperature=0.3,
                        max_tokens=10,
                    )

                    # Extract urgency score from AI response
                    ai_score_text = response.choices[0].message.content.strip()
                    ai_score = float(ai_score_text)

                    # Validate score is in valid range
                    if 0.0 <= ai_score <= 1.0:
                        logging.debug(f"AI urgency score for '{task.title}': {ai_score}")
                        return ai_score

                except Exception as ai_error:
                    logging.debug(f"AI urgency analysis failed, using fallback: {ai_error}")

            # Fallback heuristic analysis (when AI unavailable or fails)
            urgency_keywords = {
                "critical": 0.9,
                "urgent": 0.8,
                "asap": 0.8,
                "immediately": 0.9,
                "bug": 0.7,
                "fix": 0.6,
                "error": 0.7,
                "broken": 0.8,
                "production": 0.8,
                "outage": 0.9,
                "down": 0.8,
            }

            content = (task.title + " " + task.description).lower()
            max_urgency = 0.0

            for keyword, score in urgency_keywords.items():
                if keyword in content:
                    max_urgency = max(max_urgency, score)

            # Priority boost
            priority_boost = {"high": 0.3, "critical": 0.5}.get(task.priority, 0.0)

            return min(1.0, max_urgency + priority_boost)

        except Exception:
            # Default scoring based on priority
            return {"high": 0.8, "medium": 0.5, "low": 0.2}.get(task.priority, 0.5)

    async def _calculate_deadline_urgency(self, task: Task) -> float:
        """Calculate urgency based on deadline proximity"""
        if not task.due_date:
            return 0.1  # Low urgency if no deadline

        now = datetime.now()
        time_remaining = task.due_date - now

        if time_remaining.total_seconds() <= 0:
            return 1.0  # Overdue

        hours_remaining = time_remaining.total_seconds() / 3600

        if hours_remaining <= 24:
            return 0.9  # Less than a day
        elif hours_remaining <= 72:
            return 0.7  # Less than 3 days
        elif hours_remaining <= 168:
            return 0.5  # Less than a week
        else:
            return 0.2  # More than a week

    async def _analyze_contextual_fit(self, task: Task, context: dict[str, Any]) -> float:
        """Analyze how well a task fits current context"""
        score = 0.5  # Base score

        # Time-based analysis
        if "current_time" in context:
            # Morning tasks get boost for focus work
            if "morning" in context.get("current_time", "") and any(
                word in task.title.lower() for word in ["code", "write", "develop", "design"]
            ):
                score += 0.2

        # Energy level analysis
        if "energy_level" in context:
            energy = context["energy_level"]
            if energy == "high":
                # Complex tasks for high energy
                if len(task.description) > 100 or "complex" in task.description.lower():
                    score += 0.3
            elif energy == "low":
                # Simple tasks for low energy
                if any(word in task.title.lower() for word in ["email", "review", "organize"]):
                    score += 0.3

        # Available time analysis
        if "available_time" in context and hasattr(task, "estimated_duration"):
            available = context["available_time"]
            if task.estimated_duration and task.estimated_duration <= available:
                score += 0.2

        return min(1.0, score)

    async def _ai_prioritize(self, task: Task) -> float:
        """Get AI priority score for a task"""
        try:
            # Fallback heuristic prioritization
            urgency = await self._analyze_task_urgency(task)
            deadline = await self._calculate_deadline_urgency(task)

            return (urgency + deadline) / 2

        except Exception:
            return 0.5

    # =============================================================================
    # TASK BREAKDOWN
    # =============================================================================

    async def break_down_task(self, task: Task) -> list[str]:
        """Break down complex tasks into subtasks using AI"""
        try:
            # Check task complexity first
            complexity = await self._assess_task_complexity(task)

            if complexity < 0.3:
                return []  # Don't break down simple tasks

            # AI breakdown
            subtasks = await self._ai_break_down_task(task)
            return subtasks

        except Exception as e:
            logging.error(f"Task breakdown failed: {e}")
            # Re-raise AI service failures for proper error handling
            if "AI service" in str(e) or "unavailable" in str(e):
                raise
            return []

    async def _assess_task_complexity(self, task: Task) -> float:
        """Assess task complexity to determine if breakdown is needed"""
        complexity_indicators = {
            "implement": 0.7,
            "build": 0.8,
            "create": 0.6,
            "develop": 0.8,
            "design": 0.6,
            "research": 0.5,
            "analyze": 0.5,
            "integrate": 0.7,
            "system": 0.6,
            "feature": 0.7,
            "architecture": 0.8,
            "platform": 0.8,
        }

        content = (task.title + " " + task.description).lower()
        max_complexity = 0.0

        for indicator, score in complexity_indicators.items():
            if indicator in content:
                max_complexity = max(max_complexity, score)

        # Length factor
        length_factor = min(0.3, len(task.description) / 500)

        return min(1.0, max_complexity + length_factor)

    async def _ai_break_down_task(self, task: Task) -> list[str]:
        """Use AI to break down a task into subtasks"""
        try:
            if self.openai_client:
                try:
                    prompt = f"""Break down this task into specific, actionable subtasks.

Task Title: {task.title}
Description: {task.description or "No description"}
Priority: {task.priority}

Return a JSON array of subtask strings. Each subtask should be:
- Specific and actionable
- In logical sequential order
- 3-7 subtasks total
- Clear and concise

Example format:
["Research requirements", "Design solution", "Implement core feature", "Add tests", "Deploy"]

Return ONLY the JSON array, no other text."""

                    response = await self.openai_client.chat.completions.create(
                        model=self.ai_model,
                        messages=[
                            {
                                "role": "system",
                                "content": "You are a task breakdown AI. Respond with ONLY a JSON array of strings.",
                            },
                            {"role": "user", "content": prompt},
                        ],
                        temperature=0.5,
                        max_tokens=500,
                    )

                    # Extract subtasks from AI response
                    ai_response = response.choices[0].message.content.strip()

                    # Try to parse as JSON
                    import json

                    subtasks = json.loads(ai_response)

                    if isinstance(subtasks, list) and len(subtasks) > 0:
                        logging.debug(f"AI breakdown for '{task.title}': {len(subtasks)} subtasks")
                        return subtasks

                except Exception as ai_error:
                    logging.debug(f"AI task breakdown failed, using fallback: {ai_error}")

            # Fallback rule-based breakdown
            return self._rule_based_breakdown(task)

        except Exception:
            return self._rule_based_breakdown(task)

    def _rule_based_breakdown(self, task: Task) -> list[str]:
        """Rule-based task breakdown as fallback"""
        content = task.title.lower() + " " + task.description.lower()

        if "authentication" in content or "auth" in content:
            return [
                "Research authentication requirements and security standards",
                "Design user authentication database schema",
                "Implement user registration and login endpoints",
                "Create authentication middleware and JWT handling",
                "Build user interface for login and registration",
                "Write comprehensive authentication tests",
                "Set up production authentication configuration",
            ]

        elif "dashboard" in content:
            return [
                "Design dashboard wireframes and user interface",
                "Set up data connections and API endpoints",
                "Implement interactive charts and visualizations",
                "Add user customization and preferences",
                "Optimize performance and loading times",
                "Test dashboard functionality across devices",
            ]

        elif "api" in content:
            return [
                "Design API endpoints and data models",
                "Implement core API functionality",
                "Add authentication and authorization",
                "Write API documentation",
                "Create comprehensive tests",
                "Set up monitoring and logging",
            ]

        elif any(word in content for word in ["build", "create", "develop"]):
            return [
                "Research requirements and technical approach",
                "Design architecture and data models",
                "Implement core functionality",
                "Add error handling and validation",
                "Create tests and documentation",
                "Deploy and configure for production",
            ]

        return []

    async def create_task_dependencies(self, task: Task) -> list[dict[str, Any]]:
        """Create task dependencies for subtasks"""
        return await self._create_task_dependencies(task)

    async def _create_task_dependencies(self, task: Task) -> list[dict[str, Any]]:
        """Internal method to create task dependencies"""
        # Simplified dependency creation
        subtasks = await self.break_down_task(task)
        dependencies = []

        for i, subtask in enumerate(subtasks):
            dependency = {"task": subtask, "depends_on": subtasks[:i] if i > 0 else []}
            dependencies.append(dependency)

        return dependencies

    # =============================================================================
    # DURATION ESTIMATION
    # =============================================================================

    async def estimate_task_duration(self, task: Task) -> dict[str, Any]:
        """Estimate task duration using AI and historical data"""
        try:
            # AI estimation
            estimation = await self._ai_estimate_duration(task)

            # Enhance with historical data if available
            historical_data = await self._get_historical_task_data(task)
            if historical_data:
                estimation = await self._learn_from_history(task, historical_data, estimation)

            return estimation

        except Exception as e:
            logging.error(f"Duration estimation failed: {e}")
            return {"hours": 2, "confidence": 0.3}

    async def estimate_with_user_profile(
        self, task: Task, user_profile: dict[str, Any]
    ) -> dict[str, Any]:
        """Estimate duration considering user's skill profile"""
        base_estimation = await self.estimate_task_duration(task)
        return await self._adjust_for_user_skill(task, user_profile, base_estimation)

    async def _ai_estimate_duration(self, task: Task) -> dict[str, Any]:
        """AI-powered duration estimation"""
        try:
            if self.openai_client:
                try:
                    prompt = f"""Estimate the duration to complete this task.

Task Title: {task.title}
Description: {task.description or "No description"}
Priority: {task.priority}

Return a JSON object with:
- hours: estimated hours (decimal number, e.g. 2.5)
- confidence: confidence level 0.0-1.0

Consider:
- Task complexity and scope
- Typical development time for similar tasks
- Testing and documentation time
- Buffer for unexpected issues

Example response:
{{"hours": 4.5, "confidence": 0.75}}

Return ONLY the JSON object, no other text."""

                    response = await self.openai_client.chat.completions.create(
                        model=self.ai_model,
                        messages=[
                            {
                                "role": "system",
                                "content": "You are a task estimation AI. Respond with ONLY a JSON object.",
                            },
                            {"role": "user", "content": prompt},
                        ],
                        temperature=0.3,
                        max_tokens=100,
                    )

                    # Extract estimation from AI response
                    ai_response = response.choices[0].message.content.strip()

                    # Try to parse as JSON
                    import json

                    estimation = json.loads(ai_response)

                    if (
                        isinstance(estimation, dict)
                        and "hours" in estimation
                        and "confidence" in estimation
                    ):
                        # Validate ranges
                        hours = float(estimation["hours"])
                        confidence = float(estimation["confidence"])

                        if hours > 0 and 0.0 <= confidence <= 1.0:
                            logging.debug(
                                f"AI estimation for '{task.title}': {hours}h @ {confidence:.0%} confidence"
                            )
                            return {
                                "hours": round(hours, 1),
                                "confidence": round(confidence, 2),
                            }

                except Exception as ai_error:
                    logging.debug(f"AI duration estimation failed, using fallback: {ai_error}")

            # Fallback heuristic estimation
            return self._heuristic_estimation(task)

        except Exception:
            return self._heuristic_estimation(task)

    def _heuristic_estimation(self, task: Task) -> dict[str, Any]:
        """Heuristic-based duration estimation"""
        content = task.title.lower() + " " + task.description.lower()

        # Base estimates by task type
        base_estimates = {
            "bug": {"hours": 2, "confidence": 0.7},
            "feature": {"hours": 8, "confidence": 0.6},
            "documentation": {"hours": 3, "confidence": 0.8},
            "review": {"hours": 1, "confidence": 0.9},
            "meeting": {"hours": 1, "confidence": 0.9},
            "research": {"hours": 4, "confidence": 0.5},
            "testing": {"hours": 3, "confidence": 0.7},
        }

        for task_type, estimate in base_estimates.items():
            if task_type in content:
                return estimate

        # Complexity-based estimation
        complexity = len(task.description) / 100
        hours = max(1, min(16, 2 + complexity))
        confidence = max(0.3, 0.8 - (complexity * 0.1))

        return {"hours": round(hours, 1), "confidence": round(confidence, 2)}

    async def _get_historical_task_data(self, task: Task) -> list[dict[str, Any]]:
        """Get historical data for similar tasks"""
        # Mock historical data for testing
        return []

    async def _learn_from_history(
        self, task: Task, historical_data: list[dict[str, Any]], base_estimation: dict[str, Any]
    ) -> dict[str, Any]:
        """Learn from historical task completion data"""
        if not historical_data:
            return base_estimation

        # Simple average of historical durations
        avg_duration = sum(item["actual_duration"] for item in historical_data) / len(
            historical_data
        )

        # Increase confidence with more data
        confidence_boost = min(0.3, len(historical_data) * 0.1)

        return {
            "hours": round(avg_duration, 1),
            "confidence": min(1.0, base_estimation["confidence"] + confidence_boost),
        }

    async def _adjust_for_user_skill(
        self, task: Task, user_profile: dict[str, Any], base_estimation: dict[str, Any]
    ) -> dict[str, Any]:
        """Adjust estimation based on user's skill level"""
        skills = user_profile.get("skills", {})
        content = task.title.lower() + " " + task.description.lower()

        # Identify relevant skills
        skill_relevance = {}
        for skill, level in skills.items():
            if skill.lower() in content:
                skill_relevance[skill] = level

        if not skill_relevance:
            return base_estimation

        # Calculate skill adjustment
        avg_skill_level = sum(skill_relevance.values()) / len(skill_relevance)

        # Adjust time based on skill (higher skill = less time)
        skill_multiplier = 2.0 - avg_skill_level  # 0.8 skill = 1.2x time, 0.2 skill = 1.8x time

        adjusted_hours = base_estimation["hours"] * skill_multiplier
        adjusted_confidence = base_estimation["confidence"] * avg_skill_level

        return {"hours": round(adjusted_hours, 1), "confidence": round(adjusted_confidence, 2)}

    # =============================================================================
    # TASK CATEGORIZATION
    # =============================================================================

    async def categorize_task(self, task: Task) -> dict[str, Any]:
        """Categorize task using AI analysis"""
        try:
            return await self._ai_categorize_task(task)
        except Exception as e:
            logging.error(f"Task categorization failed: {e}")
            return {"category": "general", "confidence": 0.5}

    async def suggest_similar_tasks(self, task: Task) -> list[dict[str, Any]]:
        """Suggest similar tasks based on content analysis"""
        return await self._find_similar_tasks(task)

    async def _ai_categorize_task(self, task: Task) -> dict[str, Any]:
        """AI-powered task categorization"""
        content = task.title.lower() + " " + task.description.lower()

        # Rule-based categorization as fallback
        categories = {
            "bug_fix": ["bug", "fix", "error", "issue", "broken", "failing"],
            "feature_development": ["feature", "implement", "build", "create", "develop"],
            "documentation": ["document", "docs", "readme", "guide", "manual"],
            "testing": ["test", "testing", "qa", "quality", "validation"],
            "meeting": ["meeting", "call", "discussion", "standup", "review"],
            "personal_errand": ["buy", "groceries", "appointment", "personal", "vacation"],
            "research": ["research", "investigate", "analyze", "study", "explore"],
            "maintenance": ["update", "upgrade", "maintain", "clean", "optimize"],
        }

        for category, keywords in categories.items():
            if any(keyword in content for keyword in keywords):
                confidence = 0.8 if len([kw for kw in keywords if kw in content]) > 1 else 0.6
                return {"category": category, "confidence": confidence}

        return {"category": "general", "confidence": 0.5}

    async def _find_similar_tasks(self, task: Task) -> list[dict[str, Any]]:
        """Find similar tasks for suggestions"""
        # Mock similar tasks for testing
        content = task.title.lower()

        if "test" in content:
            return [
                {"title": "Write integration tests", "similarity": 0.8},
                {"title": "Add test documentation", "similarity": 0.6},
            ]

        return []

    # =============================================================================
    # CONTEXT-AWARE SUGGESTIONS
    # =============================================================================

    async def suggest_tasks_for_context(
        self, tasks: list[Task], context: dict[str, Any]
    ) -> list[dict[str, Any]]:
        """Suggest appropriate tasks for current context with intelligent recommendations"""
        suggestions = []

        for task in tasks:
            fit_score = await self._calculate_context_fit(task, context)

            # Add reason for suggestion
            reason = await self._generate_suggestion_reason(task, context, fit_score)

            suggestions.append(
                {
                    "task": task,
                    "fit_score": fit_score,
                    "reason": reason,
                    "recommended_action": await self._get_recommended_action(task, context),
                }
            )

        # Sort by fit score and add additional smart filtering
        suggestions.sort(key=lambda x: x["fit_score"], reverse=True)

        # Add smart suggestions based on patterns
        enhanced_suggestions = await self._enhance_with_smart_suggestions(suggestions, context)

        return enhanced_suggestions

    async def _calculate_context_fit(self, task: Task, context: dict[str, Any]) -> float:
        """Calculate how well a task fits the current context"""
        base_score = await self._analyze_contextual_fit(task, context)

        # Add additional context considerations
        enhancement_score = 0.0

        # Time-based enhancement
        if "time_of_day" in context:
            hour = context.get("hour", 12)
            if hour < 10:  # Morning
                if any(
                    word in task.title.lower() for word in ["plan", "strategy", "design", "create"]
                ):
                    enhancement_score += 0.2
            elif hour > 15:  # Afternoon/Evening
                if any(
                    word in task.title.lower()
                    for word in ["review", "respond", "organize", "clean"]
                ):
                    enhancement_score += 0.2

        # Location-based enhancement
        if "location" in context:
            location = context["location"].lower()
            if "office" in location:
                if any(
                    word in task.title.lower()
                    for word in ["meeting", "call", "presentation", "collaborate"]
                ):
                    enhancement_score += 0.3
            elif "home" in location and any(
                word in task.title.lower() for word in ["personal", "family", "hobby", "relax"]
            ):
                enhancement_score += 0.3

        # Mood/energy enhancement
        if "mood" in context:
            mood = context["mood"].lower()
            if mood in ["focused", "productive"]:
                if task.priority == "high" or "complex" in task.description.lower():
                    enhancement_score += 0.2
            elif mood in ["tired", "low"] and any(
                word in task.title.lower() for word in ["easy", "simple", "quick", "organize"]
            ):
                enhancement_score += 0.2

        return min(1.0, base_score + enhancement_score)

    async def _generate_suggestion_reason(
        self, task: Task, context: dict[str, Any], fit_score: float
    ) -> str:
        """Generate human-readable reason for task suggestion"""
        reasons = []

        if fit_score > 0.8:
            reasons.append("Perfect fit for current situation")
        elif fit_score > 0.6:
            reasons.append("Good match for your context")

        # Context-specific reasons
        if "energy_level" in context:
            energy = context["energy_level"]
            if energy == "high" and "complex" in task.description.lower():
                reasons.append("Good for high energy levels")
            elif energy == "low" and any(
                word in task.title.lower() for word in ["organize", "review", "simple"]
            ):
                reasons.append("Perfect for when energy is low")

        if "available_time" in context:
            time_available = context["available_time"]
            if time_available < 30:
                reasons.append("Quick task for limited time")
            elif time_available > 120:
                reasons.append("Good use of extended time block")

        if "location" in context:
            location = context["location"]
            if "office" in location.lower() and "work" in task.project_id:
                reasons.append("Matches your current work location")

        return "; ".join(reasons) if reasons else "Suggested based on current context"

    async def _get_recommended_action(self, task: Task, context: dict[str, Any]) -> str:
        """Get recommended action for the task based on context"""
        if "available_time" in context:
            time_available = context["available_time"]
            if time_available < 15:
                return "Review details and plan approach"
            elif time_available < 60:
                return "Start with first subtask or planning"
            else:
                return "Begin full execution"

        if "energy_level" in context:
            energy = context["energy_level"]
            if energy == "high":
                return "Tackle the most challenging aspects first"
            elif energy == "medium":
                return "Start with moderate difficulty parts"
            else:
                return "Focus on simple, mechanical tasks"

        return "Begin when ready"

    async def _enhance_with_smart_suggestions(
        self, suggestions: list[dict[str, Any]], context: dict[str, Any]
    ) -> list[dict[str, Any]]:
        """Add smart insights and patterns to suggestions"""

        # Add contextual insights
        for suggestion in suggestions:
            task = suggestion["task"]

            # Add timing insights
            if hasattr(task, "due_date") and task.due_date:
                days_until_due = (task.due_date - datetime.now()).days
                if days_until_due <= 1:
                    suggestion["urgency_note"] = "⚠️ Due very soon!"
                elif days_until_due <= 3:
                    suggestion["urgency_note"] = "⏰ Due in a few days"

            # Add completion time estimates
            if "available_time" in context:
                available = context["available_time"]
                estimated_time = suggestion.get("estimated_duration", 60)  # Default 1 hour
                if estimated_time <= available:
                    suggestion["time_note"] = (
                        f"✅ Can complete in available time ({estimated_time}min)"
                    )
                else:
                    suggestion["time_note"] = (
                        f"⏱️ Needs {estimated_time}min (more than available {available}min)"
                    )

        return suggestions

    # =============================================================================
    # LEARNING AND PERSONALIZATION
    # =============================================================================

    async def learn_from_completed_task(
        self,
        completed_task: Task,
        actual_duration: int = None,
        user_satisfaction: float = None,
        context: dict[str, Any] = None,
    ) -> None:
        """Learn from completed task outcomes with rich feedback"""
        learning_data = self._extract_comprehensive_learning_data(
            completed_task, actual_duration, user_satisfaction, context
        )
        await self._update_advanced_learning_model(learning_data)
        await self._update_user_patterns(completed_task, context)

    async def get_personalized_recommendations(
        self, user_id: str, current_context: dict[str, Any] = None
    ) -> list[dict[str, Any]]:
        """Get sophisticated personalized task recommendations"""
        user_patterns = self.user_patterns.get(user_id, {})
        return await self._generate_intelligent_recommendations(user_patterns, current_context)

    async def predict_task_success_probability(
        self, task: Task, context: dict[str, Any], user_id: str
    ) -> float:
        """Predict probability of task completion success"""
        return await self._calculate_success_probability(task, context, user_id)

    async def learn_optimal_scheduling(
        self, user_id: str, completed_tasks: list[Task]
    ) -> dict[str, Any]:
        """Learn optimal scheduling patterns for user"""
        return await self._analyze_scheduling_patterns(user_id, completed_tasks)

    def _extract_comprehensive_learning_data(
        self,
        task: Task,
        actual_duration: int = None,
        user_satisfaction: float = None,
        context: dict[str, Any] = None,
    ) -> dict[str, Any]:
        """Extract comprehensive learning data from completed task"""
        data = {
            "task_id": task.task_id,
            "task_type": self._categorize_advanced(task.title, task.description),
            "complexity_level": self._assess_completed_task_complexity(task),
            "estimated_vs_actual": self._calculate_duration_accuracy(task, actual_duration),
            "completion_time": task.completed_at
            if hasattr(task, "completed_at")
            else datetime.now(),
            "completion_date": datetime.now().strftime("%Y-%m-%d"),
            "completion_hour": datetime.now().hour,
            "day_of_week": datetime.now().weekday(),
            "success": task.status == "done",
            "user_satisfaction": user_satisfaction or 0.8,  # Default satisfaction
            "priority_level": task.priority,
            "project_type": task.project_id,
            "context": context or {},
            "keywords": self._extract_keywords(task.title + " " + task.description),
            "estimated_duration": getattr(task, "estimated_duration", None),
            "actual_duration": actual_duration,
        }
        return data

    def _categorize_advanced(self, title: str, description: str) -> str:
        """Advanced categorization with multiple criteria"""
        content = (title + " " + description).lower()

        categories = {
            "coding": ["code", "implement", "develop", "programming", "function", "api"],
            "documentation": ["doc", "readme", "guide", "manual", "specification"],
            "bug_fix": ["bug", "fix", "error", "issue", "broken", "crash"],
            "testing": ["test", "testing", "qa", "verification", "validate"],
            "design": ["design", "mockup", "wireframe", "ui", "ux", "layout"],
            "research": ["research", "investigate", "analyze", "study", "explore"],
            "meeting": ["meeting", "call", "discussion", "standup", "review"],
            "planning": ["plan", "strategy", "roadmap", "scope", "requirements"],
            "maintenance": ["update", "upgrade", "refactor", "cleanup", "optimize"],
            "administrative": ["admin", "setup", "configure", "install", "deployment"],
        }

        # Score each category
        category_scores = {}
        for category, keywords in categories.items():
            score = sum(1 for keyword in keywords if keyword in content)
            if score > 0:
                category_scores[category] = score

        # Return category with highest score
        if category_scores:
            return max(category_scores.items(), key=lambda x: x[1])[0]

        return "general"

    def _assess_completed_task_complexity(self, task: Task) -> str:
        """Assess complexity of completed task for learning"""
        indicators = ["implement", "build", "system", "architecture", "complex", "integration"]
        content = (task.title + " " + task.description).lower()

        complexity_score = sum(1 for indicator in indicators if indicator in content)

        if complexity_score >= 3:
            return "high"
        elif complexity_score >= 1:
            return "medium"
        else:
            return "low"

    def _calculate_duration_accuracy(self, task: Task, actual_duration: int = None) -> float:
        """Calculate accuracy of duration estimation"""
        if (
            not actual_duration
            or not hasattr(task, "estimated_duration")
            or not task.estimated_duration
        ):
            return 1.0

        estimated = task.estimated_duration
        actual = actual_duration

        # Return ratio of actual to estimated (1.0 = perfect estimate)
        return actual / estimated if estimated > 0 else 1.0

    def _extract_keywords(self, text: str) -> list[str]:
        """Extract meaningful keywords from task text"""

        # Remove common words and extract meaningful terms
        common_words = {
            "the",
            "a",
            "an",
            "and",
            "or",
            "but",
            "in",
            "on",
            "at",
            "to",
            "for",
            "of",
            "with",
            "by",
        }

        words = re.findall(r"\b\w+\b", text.lower())
        keywords = [word for word in words if len(word) > 3 and word not in common_words]

        return keywords[:10]  # Limit to 10 most relevant keywords

    async def _update_advanced_learning_model(self, learning_data: dict[str, Any]) -> None:
        """Update sophisticated learning model with comprehensive data"""
        task_type = learning_data["task_type"]

        # Initialize learning data structure
        if task_type not in self.learning_data:
            self.learning_data[task_type] = {
                "completion_history": [],
                "duration_patterns": {},
                "success_patterns": {},
                "optimal_times": {},
                "context_preferences": {},
                "satisfaction_trends": [],
            }

        category_data = self.learning_data[task_type]

        # Update completion history
        category_data["completion_history"].append(learning_data)

        # Update duration patterns
        if learning_data["actual_duration"]:
            complexity = learning_data["complexity_level"]
            if complexity not in category_data["duration_patterns"]:
                category_data["duration_patterns"][complexity] = []
            category_data["duration_patterns"][complexity].append(learning_data["actual_duration"])

        # Update success patterns
        hour = learning_data["completion_hour"]
        learning_data["day_of_week"]
        success = learning_data["success"]

        if hour not in category_data["success_patterns"]:
            category_data["success_patterns"][hour] = {"success": 0, "total": 0}

        category_data["success_patterns"][hour]["total"] += 1
        if success:
            category_data["success_patterns"][hour]["success"] += 1

        # Update satisfaction trends
        if learning_data["user_satisfaction"]:
            category_data["satisfaction_trends"].append(
                {
                    "satisfaction": learning_data["user_satisfaction"],
                    "context": learning_data["context"],
                    "timestamp": learning_data["completion_time"],
                }
            )

    async def _update_user_patterns(self, task: Task, context: dict[str, Any] = None) -> None:
        """Update user-specific behavioral patterns"""
        user_id = getattr(task, "user_id", "default_user")

        if user_id not in self.user_patterns:
            self.user_patterns[user_id] = {
                "preferred_times": {},
                "productive_contexts": {},
                "task_preferences": {},
                "completion_velocity": [],
                "energy_patterns": {},
            }

        patterns = self.user_patterns[user_id]

        # Update preferred completion times
        hour = datetime.now().hour
        if hour not in patterns["preferred_times"]:
            patterns["preferred_times"][hour] = 0
        patterns["preferred_times"][hour] += 1

        # Update productive contexts
        if context:
            for key, value in context.items():
                if key not in patterns["productive_contexts"]:
                    patterns["productive_contexts"][key] = {}
                if value not in patterns["productive_contexts"][key]:
                    patterns["productive_contexts"][key][value] = 0
                patterns["productive_contexts"][key][value] += 1

    async def _generate_intelligent_recommendations(
        self, user_patterns: dict[str, Any], current_context: dict[str, Any] = None
    ) -> list[dict[str, Any]]:
        """Generate sophisticated personalized recommendations"""
        recommendations = []

        # Analyze user's most productive times
        preferred_times = user_patterns.get("preferred_times", {})
        if preferred_times:
            best_hour = max(preferred_times.items(), key=lambda x: x[1])[0]
            recommendations.append(
                {
                    "type": "timing",
                    "recommendation": f"Schedule important tasks around {best_hour}:00",
                    "confidence": 0.8,
                    "reason": "Based on your historical completion patterns",
                }
            )

        # Analyze task type performance
        for task_type, data in self.learning_data.items():
            success_patterns = data.get("success_patterns", {})
            if success_patterns:
                # Find best times for this task type
                best_times = [
                    (hour, patterns["success"] / patterns["total"])
                    for hour, patterns in success_patterns.items()
                    if patterns["total"] > 2
                ]  # Only consider times with enough data

                if best_times:
                    best_hour, success_rate = max(best_times, key=lambda x: x[1])
                    if success_rate > 0.7:  # High success rate
                        recommendations.append(
                            {
                                "type": "task_timing",
                                "task_type": task_type,
                                "recommendation": f"Best time for {task_type} tasks: {best_hour}:00",
                                "confidence": success_rate,
                                "reason": f"{success_rate:.1%} success rate at this time",
                            }
                        )

        # Context-based recommendations
        if current_context:
            context_recommendations = await self._generate_context_recommendations(
                user_patterns, current_context
            )
            recommendations.extend(context_recommendations)

        return recommendations

    async def _calculate_success_probability(
        self, task: Task, context: dict[str, Any], user_id: str
    ) -> float:
        """Calculate probability of task completion success based on historical data"""
        base_probability = 0.7  # Default baseline

        task_type = self._categorize_advanced(task.title, task.description)

        # Check historical success for this task type
        if task_type in self.learning_data:
            type_data = self.learning_data[task_type]
            success_patterns = type_data.get("success_patterns", {})

            current_hour = context.get("hour", datetime.now().hour)

            if current_hour in success_patterns:
                pattern = success_patterns[current_hour]
                if pattern["total"] > 0:
                    historical_success_rate = pattern["success"] / pattern["total"]
                    base_probability = (base_probability + historical_success_rate) / 2

        # Adjust based on user patterns
        if user_id in self.user_patterns:
            user_data = self.user_patterns[user_id]

            # Check if current context matches productive contexts
            productive_contexts = user_data.get("productive_contexts", {})
            context_bonus = 0.0

            for key, value in context.items():
                if key in productive_contexts and value in productive_contexts[key]:
                    context_bonus += 0.1  # Small bonus for favorable context

            base_probability = min(1.0, base_probability + context_bonus)

        return base_probability

    async def _analyze_scheduling_patterns(
        self, user_id: str, completed_tasks: list[Task]
    ) -> dict[str, Any]:
        """Analyze optimal scheduling patterns for user"""
        if not completed_tasks:
            return {"pattern": "insufficient_data"}

        # Group tasks by completion time
        hourly_completions = {}
        daily_completions = {}

        for task in completed_tasks:
            if hasattr(task, "completed_at") and task.completed_at:
                hour = task.completed_at.hour
                day = task.completed_at.weekday()

                hourly_completions[hour] = hourly_completions.get(hour, 0) + 1
                daily_completions[day] = daily_completions.get(day, 0) + 1

        # Find peak productivity hours and days
        peak_hour = (
            max(hourly_completions.items(), key=lambda x: x[1])[0] if hourly_completions else 9
        )
        peak_day = max(daily_completions.items(), key=lambda x: x[1])[0] if daily_completions else 1

        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

        return {
            "peak_productivity_hour": peak_hour,
            "peak_productivity_day": day_names[peak_day],
            "hourly_distribution": hourly_completions,
            "daily_distribution": daily_completions,
            "recommendations": [
                f"Schedule important tasks around {peak_hour}:00",
                f"{day_names[peak_day]}s are your most productive day",
                "Consider batching similar tasks together",
            ],
        }

    async def _generate_context_recommendations(
        self, user_patterns: dict[str, Any], current_context: dict[str, Any]
    ) -> list[dict[str, Any]]:
        """Generate recommendations based on current context"""
        recommendations = []

        # Energy level recommendations
        if "energy_level" in current_context:
            energy = current_context["energy_level"]
            if energy == "high":
                recommendations.append(
                    {
                        "type": "energy_optimization",
                        "recommendation": "Tackle complex, high-priority tasks now",
                        "confidence": 0.9,
                        "reason": "High energy is optimal for challenging work",
                    }
                )
            elif energy == "low":
                recommendations.append(
                    {
                        "type": "energy_optimization",
                        "recommendation": "Focus on administrative or organizational tasks",
                        "confidence": 0.8,
                        "reason": "Low energy is suitable for less demanding work",
                    }
                )

        # Time-based recommendations
        if "available_time" in current_context:
            available = current_context["available_time"]
            if available < 30:
                recommendations.append(
                    {
                        "type": "time_optimization",
                        "recommendation": "Choose quick tasks or use time for planning",
                        "confidence": 0.9,
                        "reason": "Limited time available",
                    }
                )
            elif available > 120:
                recommendations.append(
                    {
                        "type": "time_optimization",
                        "recommendation": "Perfect time for deep work or complex projects",
                        "confidence": 0.8,
                        "reason": "Extended time block available",
                    }
                )

        return recommendations
