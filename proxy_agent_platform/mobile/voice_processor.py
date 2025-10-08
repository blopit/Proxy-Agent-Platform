"""
Enhanced voice command processing system for mobile and wearable devices.

Provides intelligent voice command parsing, advanced speech recognition,
workflow routing, and context-aware voice responses across all platforms.
"""

import logging
import re
from datetime import datetime
from typing import Any
from uuid import uuid4

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)


class VoiceProcessor:
    """Advanced voice command processor with ML-enhanced recognition and workflow integration."""

    def __init__(self, workflow_engine=None):
        """Initialize voice processor with advanced recognition and workflow routing."""
        self.command_patterns = self._initialize_command_patterns()
        self.intent_handlers = self._initialize_intent_handlers()
        self.user_contexts = {}  # Store user context for better responses

        # Advanced speech recognition components
        self.intent_classifier = VoiceIntentClassifier()
        self.entity_extractor = VoiceEntityExtractor()
        self.context_manager = VoiceContextManager()

        # Workflow integration
        self.workflow_engine = workflow_engine
        self.workflow_router = WorkflowVoiceRouter(workflow_engine)

        # Performance tracking
        self.metrics = {
            "commands_processed": 0,
            "successful_recognitions": 0,
            "workflow_triggers": 0,
            "context_enrichments": 0,
        }

        # Multi-language support
        self.supported_languages = ["en", "es", "fr", "de"]
        self.current_language = "en"

    def _initialize_command_patterns(self) -> dict[str, list[dict[str, Any]]]:
        """Initialize regex patterns for command recognition."""
        return {
            "create_task": [
                {"pattern": r"add task (.+)", "groups": ["task_content"], "priority": "medium"},
                {"pattern": r"remind me to (.+)", "groups": ["task_content"], "priority": "low"},
                {
                    "pattern": r"create (?:(urgent|high|low|medium)\s+)?task (.+)",
                    "groups": ["priority", "task_content"],
                    "priority": "medium",
                },
                {
                    "pattern": r"schedule (.+) for (today|tomorrow|next week)",
                    "groups": ["task_content", "due_time"],
                    "priority": "medium",
                },
            ],
            "query": [
                {"pattern": r"what'?s my (?:current )?streak\??", "response_type": "streak_count"},
                {
                    "pattern": r"how much xp (?:do i have|have i earned) today\??",
                    "response_type": "daily_xp",
                },
                {"pattern": r"what'?s my next task\??", "response_type": "next_task"},
                {
                    "pattern": r"what'?s my (?:current )?energy level\??",
                    "response_type": "energy_level",
                },
                {
                    "pattern": r"show (?:me )?(?:my )?workflow status",
                    "response_type": "workflow_status",
                },
                {
                    "pattern": r"what (?:workflows|processes) are (?:running|active)\??",
                    "response_type": "active_workflows",
                },
            ],
            "focus_control": [
                {
                    "pattern": r"start (?:a )?(\d+) minute focus session",
                    "groups": ["duration"],
                    "action": "start_focus",
                },
                {
                    "pattern": r"begin (?:a )?(?:(deep work|focus) )?session",
                    "groups": ["session_type"],
                    "action": "start_focus",
                    "default_duration": 25,
                },
                {
                    "pattern": r"start (?:a )?deep work session",
                    "action": "start_focus",
                    "session_type": "deep_work",
                    "default_duration": 90,
                },
                {
                    "pattern": r"take (?:a )?(\d+) minute break",
                    "groups": ["duration"],
                    "action": "start_break",
                },
                {"pattern": r"(?:stop|end) (?:focus )?session", "action": "stop_session"},
            ],
            "workflow_control": [
                {
                    "pattern": r"start (\\w+) workflow",
                    "groups": ["workflow_name"],
                    "action": "start_workflow",
                },
                {
                    "pattern": r"(?:stop|pause) (\\w+) workflow",
                    "groups": ["workflow_name"],
                    "action": "stop_workflow",
                },
                {
                    "pattern": r"trigger (\\w+) (?:workflow|process)",
                    "groups": ["workflow_name"],
                    "action": "trigger_workflow",
                },
                {
                    "pattern": r"execute (?:the )?(.+) workflow",
                    "groups": ["workflow_name"],
                    "action": "execute_workflow",
                },
            ],
        }

    def _initialize_intent_handlers(self) -> dict[str, callable]:
        """Initialize handlers for each intent type."""
        return {
            "create_task": self._handle_task_creation,
            "query": self._handle_query,
            "focus_control": self._handle_focus_control,
            "workflow_control": self._handle_workflow_control,
        }

    async def process_command(self, command: str, user_id: int, context: dict[str, Any] | None = None) -> dict[str, Any]:
        """
        Process voice command with advanced recognition and workflow routing.

        Args:
            command: Voice command text to process
            user_id: User identifier for personalized responses
            context: Additional context information (location, device, etc.)

        Returns:
            Dictionary containing:
                - status: Success/failure status
                - intent: Recognized intent type
                - workflow_triggered: Whether a workflow was triggered
                - Additional response data based on intent

        Raises:
            ValueError: If command is empty or user_id is invalid
        """
        if not command or not command.strip():
            raise ValueError("Command cannot be empty")

        if not user_id or user_id <= 0:
            raise ValueError("Valid user_id is required")

        command = command.strip()
        logger.info(f"Processing voice command for user {user_id}: '{command}'")

        self.metrics["commands_processed"] += 1

        # Update user context
        if context:
            await self.context_manager.update_user_context(user_id, context)

        # Advanced intent recognition with ML
        intent_result = await self.intent_classifier.classify_intent(command, user_id)

        if not intent_result["intent"]:
            # Fallback to pattern-based recognition
            intent, parameters = await self._recognize_intent(command.lower())
            intent_result = {
                "intent": intent,
                "confidence": 0.5 if intent else 0.0,
                "entities": parameters,
                "method": "pattern_based"
            }

        if not intent_result["intent"] or intent_result["confidence"] < 0.3:
            return {
                "status": "error",
                "error": "Could not understand command",
                "suggested_commands": await self._get_context_aware_suggestions(user_id),
                "confidence": intent_result.get("confidence", 0.0),
            }

        # Extract entities with context enrichment
        entities = await self.entity_extractor.extract_entities(
            command, intent_result["intent"], user_id
        )

        # Merge entities with intent parameters
        parameters = {**intent_result.get("entities", {}), **entities}

        # Check for workflow triggers
        workflow_result = None
        if self.workflow_engine:
            workflow_result = await self.workflow_router.check_workflow_triggers(
                intent_result["intent"], parameters, user_id
            )

        # Execute intent handler with enriched context
        try:
            enriched_context = await self.context_manager.get_enriched_context(user_id)
            response = await self.intent_handlers[intent_result["intent"]](
                user_id, parameters, enriched_context
            )

            response.update({
                "status": "success",
                "intent": intent_result["intent"],
                "confidence": intent_result["confidence"],
                "method": intent_result.get("method", "ml_based"),
                "workflow_triggered": workflow_result is not None,
                "workflow_result": workflow_result,
            })

            self.metrics["successful_recognitions"] += 1
            if workflow_result:
                self.metrics["workflow_triggers"] += 1

            return response

        except Exception as e:
            logger.error(f"Error processing intent {intent_result['intent']}: {e}")
            return {
                "status": "error",
                "intent": intent_result["intent"],
                "error": str(e),
                "confidence": intent_result["confidence"]
            }

    async def _recognize_intent(self, command: str) -> tuple[str | None, dict[str, Any]]:
        """
        Recognize intent and extract parameters from command using pattern matching.

        Args:
            command: Normalized command text

        Returns:
            Tuple of (intent_name, parameters_dict)
        """
        for intent, patterns in self.command_patterns.items():
            for pattern_config in patterns:
                pattern = pattern_config["pattern"]
                match = re.search(pattern, command, re.IGNORECASE)

                if match:
                    parameters = {}

                    # Extract named groups
                    if "groups" in pattern_config:
                        groups = pattern_config["groups"]
                        for i, group_name in enumerate(groups):
                            if i + 1 <= len(match.groups()):
                                value = match.group(i + 1)
                                if value:  # Only add non-None values
                                    parameters[group_name] = value.strip()

                    # Add pattern configuration to parameters
                    parameters.update(
                        {k: v for k, v in pattern_config.items() if k not in ["pattern", "groups"]}
                    )

                    logger.info(f"Recognized intent: {intent}, parameters: {parameters}")
                    return intent, parameters

        return None, {}

    async def _handle_task_creation(
        self, user_id: int, parameters: dict[str, Any], context: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """Handle task creation commands with context awareness."""
        task_content = parameters.get("task_content", "").strip()
        if not task_content:
            raise ValueError("Task content is required")

        priority = parameters.get("priority", "medium")
        if priority not in ["low", "medium", "high", "urgent"]:
            priority = "medium"

        # Extract due date and time from natural language
        due_date = await self._extract_due_date(task_content)
        due_time = parameters.get("due_time")

        # Context-aware task enhancement
        if context:
            location = context.get("location")
            if location and location != "unknown":
                task_content = f"{task_content} (at {location})"

            # Auto-prioritize based on context
            if context.get("energy_level") == "low" and priority == "medium":
                priority = "low"  # Suggest easier task when energy is low

        # Create task
        task_id = f"voice_task_{uuid4().hex[:8]}"
        task_data = {
            "id": task_id,
            "content": task_content,
            "priority": priority,
            "due_date": due_date,
            "due_time": due_time,
            "created_at": datetime.now().isoformat(),
            "source": "voice_command",
            "user_id": user_id,
            "context": context or {},
        }

        # Store task (in real implementation, this would save to database)
        logger.info(f"Created task via voice: {task_id} - {task_content}")

        # Generate context-aware response
        spoken_response = await self._generate_context_aware_response(
            "task_created", task_data, context
        )

        return {
            "task_data": task_data,
            "spoken_response": spoken_response,
            "confirmation": f"I've added '{task_content}' to your task list with {priority} priority.",
        }

    async def _handle_query(self, user_id: int, parameters: dict[str, Any], context: dict[str, Any] | None = None) -> dict[str, Any]:
        """Handle information query commands with enhanced context awareness."""
        response_type = parameters.get("response_type")

        # Enhanced query processing with context
        if response_type == "streak_count":
            streak = await self._get_user_streak(user_id)
            milestone_info = await self._get_streak_milestones(streak)
            spoken_response = f"Your current streak is {streak} days. {milestone_info}"

        elif response_type == "daily_xp":
            xp = await self._get_daily_xp(user_id)
            xp_goal = await self._get_daily_xp_goal(user_id)
            progress = min(100, (xp / xp_goal) * 100) if xp_goal > 0 else 0
            spoken_response = f"You've earned {xp} XP today ({progress:.1f}% of your goal). Great progress!"

        elif response_type == "next_task":
            next_task = await self._get_next_task(user_id)
            if next_task:
                # Add context-aware task recommendations
                current_energy = context.get("energy_level", "medium") if context else "medium"
                task_advice = await self._get_task_energy_match(next_task, current_energy)
                spoken_response = f"Your next task is: {next_task}. {task_advice}"
            else:
                spoken_response = "You don't have any pending tasks. Great job!"

        elif response_type == "energy_level":
            energy = await self._get_energy_level(user_id)
            energy_advice = self._get_energy_advice(energy)
            task_suggestions = await self._get_energy_appropriate_tasks(user_id, energy)
            spoken_response = f"Your energy level is {energy}. {energy_advice} {task_suggestions}"

        elif response_type == "workflow_status":
            # New: Workflow status queries
            workflows = await self._get_active_workflows(user_id)
            if workflows:
                workflow_summary = ", ".join([w["name"] for w in workflows[:3]])
                spoken_response = f"You have {len(workflows)} active workflows: {workflow_summary}"
            else:
                spoken_response = "You don't have any active workflows."

        elif response_type == "active_workflows":
            workflows = await self._get_active_workflows(user_id)
            if workflows:
                workflow_details = []
                for workflow in workflows[:3]:
                    status = workflow.get("status", "unknown")
                    workflow_details.append(f"{workflow['name']} ({status})")
                spoken_response = f"Active workflows: {', '.join(workflow_details)}"
            else:
                spoken_response = "No workflows are currently active."

        else:
            spoken_response = "I'm not sure what information you're looking for."

        return {
            "spoken_response": spoken_response,
            "data_type": response_type,
            "context_enhanced": context is not None
        }

    async def _handle_focus_control(
        self, user_id: int, parameters: dict[str, Any], context: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """Handle focus session control commands with intelligent recommendations."""
        action = parameters.get("action")

        if action == "start_focus":
            duration = parameters.get("duration")
            if duration:
                try:
                    duration = int(duration)
                except ValueError:
                    duration = parameters.get("default_duration", 25)
            else:
                # Context-aware duration recommendation
                duration = await self._recommend_focus_duration(user_id, context)

            session_type = parameters.get("session_type", "focus")

            # Enhanced session with workflow integration
            session_data = {
                "duration": duration,
                "session_type": session_type,
                "context": context or {},
                "recommended_tasks": await self._get_focus_appropriate_tasks(user_id, duration)
            }

            # Start focus session
            session_id = await self._start_focus_session(user_id, session_data)

            # Trigger focus workflow if available
            if self.workflow_engine:
                await self.workflow_router.trigger_focus_workflow(user_id, session_data)

            return {
                "session_id": session_id,
                "duration": duration,
                "session_type": session_type,
                "recommended_tasks": session_data["recommended_tasks"],
                "spoken_response": f"Starting {duration} minute {session_type} session. I've suggested some tasks that match your current energy level. Focus time!",
            }

        elif action == "start_break":
            duration = parameters.get("duration", "5")
            try:
                duration = int(duration)
            except ValueError:
                duration = 5

            # Context-aware break recommendations
            break_type = await self._recommend_break_type(user_id, context)

            # Start break session
            break_id = await self._start_break_session(user_id, duration, break_type)

            return {
                "break_id": break_id,
                "duration": duration,
                "break_type": break_type,
                "spoken_response": f"Starting {duration} minute {break_type} break. {self._get_break_suggestion(break_type)}",
            }

        elif action == "stop_session":
            # Enhanced session completion with summary
            session_summary = await self._get_session_summary(user_id)
            stopped = await self._stop_current_session(user_id)

            if stopped:
                return {
                    "session_stopped": True,
                    "session_summary": session_summary,
                    "spoken_response": f"Session completed! {session_summary.get('achievement', 'Good work!')}"
                }
            else:
                return {"session_stopped": False, "spoken_response": "No active session to stop."}

        else:
            raise ValueError(f"Unknown focus control action: {action}")

    async def _handle_workflow_control(
        self, user_id: int, parameters: dict[str, Any], context: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """Handle workflow control commands."""
        if not self.workflow_engine:
            return {
                "status": "error",
                "error": "Workflow engine not available",
                "spoken_response": "Sorry, workflow functionality is not available right now."
            }

        action = parameters.get("action")
        workflow_name = parameters.get("workflow_name", "").strip()

        if not workflow_name:
            return {
                "status": "error",
                "error": "Workflow name required",
                "spoken_response": "Please specify which workflow you'd like to control."
            }

        try:
            if action == "start_workflow":
                result = await self.workflow_router.start_workflow(user_id, workflow_name, context)
                return {
                    "status": "success",
                    "workflow_result": result,
                    "spoken_response": f"Started {workflow_name} workflow successfully."
                }

            elif action == "stop_workflow":
                result = await self.workflow_router.stop_workflow(user_id, workflow_name)
                return {
                    "status": "success",
                    "workflow_result": result,
                    "spoken_response": f"Stopped {workflow_name} workflow."
                }

            elif action in ["trigger_workflow", "execute_workflow"]:
                result = await self.workflow_router.trigger_workflow(user_id, workflow_name, parameters)
                return {
                    "status": "success",
                    "workflow_result": result,
                    "spoken_response": f"Triggered {workflow_name} workflow."
                }

            else:
                return {
                    "status": "error",
                    "error": f"Unknown workflow action: {action}",
                    "spoken_response": "I don't understand that workflow command."
                }

        except Exception as e:
            logger.error(f"Workflow control error: {e}")
            return {
                "status": "error",
                "error": str(e),
                "spoken_response": f"There was an issue controlling the {workflow_name} workflow."
            }

    # Helper methods for enhanced functionality
    async def _extract_due_date(self, task_content: str) -> str | None:
        """Extract due date from natural language task content."""
        # Simple pattern matching for common date expressions
        date_patterns = [
            r"tomorrow",
            r"today",
            r"next week",
            r"by (\\w+day)",
            r"in (\\d+) (day|week|hour)s?"
        ]

        for pattern in date_patterns:
            if re.search(pattern, task_content.lower()):
                # In real implementation, would parse to actual date
                return "auto_extracted"
        return None

    async def _generate_context_aware_response(
        self, response_type: str, data: dict[str, Any], context: dict[str, Any] | None
    ) -> str:
        """Generate context-aware spoken response."""
        base_responses = {
            "task_created": "Task created successfully",
            "focus_started": "Focus session started",
            "break_started": "Break time activated"
        }

        base = base_responses.get(response_type, "Action completed")

        if context and context.get("energy_level") == "low":
            return f"{base}. Take your time and pace yourself."
        elif context and context.get("energy_level") == "high":
            return f"{base}. You're energized - great time to make progress!"

        return base

    async def _get_context_aware_suggestions(self, user_id: int) -> list[str]:
        """Get context-aware command suggestions."""
        context = await self.context_manager.get_enriched_context(user_id)

        base_suggestions = [
            "Add task call client tomorrow",
            "What's my current streak?",
            "Start 25 minute focus session",
            "Show workflow status",
        ]

        if context and context.get("energy_level") == "low":
            base_suggestions.extend([
                "Take a 10 minute break",
                "Show me light tasks"
            ])
        elif context and context.get("energy_level") == "high":
            base_suggestions.extend([
                "Start deep work session",
                "Show me challenging tasks"
            ])

        return base_suggestions

    # Mock data methods (replace with real implementations)
    async def _get_user_streak(self, user_id: int) -> int:
        """Get current task completion streak."""
        return 7

    async def _get_daily_xp(self, user_id: int) -> int:
        """Get XP earned today."""
        return 150

    async def _get_daily_xp_goal(self, user_id: int) -> int:
        """Get user's daily XP goal."""
        return 200

    async def _get_next_task(self, user_id: int) -> str | None:
        """Get next scheduled task."""
        tasks = ["Review project proposal", "Call team meeting", "Update documentation"]
        import time
        if int(time.time()) % 2:
            return tasks[int(time.time()) % len(tasks)]
        return None

    async def _get_energy_level(self, user_id: int) -> str:
        """Get current energy level."""
        levels = ["low", "medium", "high", "peak"]
        import time
        return levels[int(time.time()) % len(levels)]

    async def _get_active_workflows(self, user_id: int) -> list[dict[str, Any]]:
        """Get user's active workflows."""
        return [
            {"name": "Daily Planning", "status": "active"},
            {"name": "Project Review", "status": "pending"}
        ]

    def _get_energy_advice(self, energy_level: str) -> str:
        """Get energy-specific advice."""
        advice_map = {
            "low": "Consider taking a break or doing some light tasks.",
            "medium": "Good time for moderate complexity tasks.",
            "high": "Perfect time for challenging work!",
            "peak": "Tackle your most important tasks now!",
        }
        return advice_map.get(energy_level, "Listen to your body and pace yourself.")

    async def _get_streak_milestones(self, streak: int) -> str:
        """Get milestone information for current streak."""
        if streak >= 30:
            return "Amazing! You're on a month-long streak!"
        elif streak >= 7:
            return "Excellent! You've maintained a week-long streak!"
        elif streak >= 3:
            return "Great consistency!"
        else:
            return "Keep building that momentum!"

    async def _get_task_energy_match(self, task: str, energy_level: str) -> str:
        """Get advice on task-energy level match."""
        if energy_level == "low":
            return "This might be challenging with your current energy. Consider starting with something lighter."
        elif energy_level == "high":
            return "Perfect timing! Your energy level is great for tackling this."
        return "This task seems well-suited for your current energy level."

    async def _get_energy_appropriate_tasks(self, user_id: int, energy_level: str) -> str:
        """Get task suggestions appropriate for current energy level."""
        if energy_level == "low":
            return "Consider light tasks like organizing or planning."
        elif energy_level == "high":
            return "Great time for challenging work or creative projects."
        return "Regular tasks are perfect for your current energy."

    async def _recommend_focus_duration(self, user_id: int, context: dict[str, Any] | None) -> int:
        """Recommend optimal focus session duration based on context."""
        if not context:
            return 25

        energy = context.get("energy_level", "medium")
        if energy == "low":
            return 15  # Shorter sessions for low energy
        elif energy in ["high", "peak"]:
            return 45  # Longer sessions for high energy
        return 25  # Default Pomodoro

    async def _get_focus_appropriate_tasks(self, user_id: int, duration: int) -> list[str]:
        """Get tasks appropriate for focus session duration."""
        if duration <= 15:
            return ["Quick email responses", "Calendar review", "Light planning"]
        elif duration >= 45:
            return ["Deep work project", "Complex analysis", "Creative writing"]
        return ["Regular task completion", "Document review", "Moderate planning"]

    async def _recommend_break_type(self, user_id: int, context: dict[str, Any] | None) -> str:
        """Recommend type of break based on context."""
        if not context:
            return "standard"

        if context.get("energy_level") == "low":
            return "restorative"  # Gentle, energy-restoring break
        elif context.get("stress_level") == "high":
            return "stress_relief"  # Stress-reducing activities
        return "standard"

    def _get_break_suggestion(self, break_type: str) -> str:
        """Get specific suggestion for break type."""
        suggestions = {
            "standard": "Time to step away and recharge!",
            "restorative": "Try some gentle stretching or deep breathing.",
            "stress_relief": "Consider a short walk or mindfulness exercise."
        }
        return suggestions.get(break_type, "Relax and recharge!")

    async def _get_session_summary(self, user_id: int) -> dict[str, Any]:
        """Get summary of completed session."""
        return {
            "duration_completed": "25 minutes",
            "achievement": "Great focus session! You've earned 50 XP.",
            "tasks_completed": 2
        }

    async def _start_focus_session(self, user_id: int, session_data: dict[str, Any]) -> str:
        """Start an enhanced focus session."""
        session_id = f"focus_{uuid4().hex[:8]}"
        duration = session_data["duration"]
        session_type = session_data["session_type"]
        logger.info(f"Starting {session_type} session for user {user_id}: {duration} minutes")
        return session_id

    async def _start_break_session(self, user_id: int, duration: int, break_type: str = "standard") -> str:
        """Start an enhanced break session."""
        break_id = f"break_{uuid4().hex[:8]}"
        logger.info(f"Starting {break_type} break for user {user_id}: {duration} minutes")
        return break_id

    async def _stop_current_session(self, user_id: int) -> bool:
        """Stop current active session."""
        logger.info(f"Stopping current session for user {user_id}")
        return True


class VoiceIntentClassifier:
    """ML-based intent classification for voice commands."""

    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words="english")
        self.intent_examples = self._load_intent_examples()
        self.is_trained = False

    def _load_intent_examples(self) -> dict[str, list[str]]:
        """Load training examples for each intent."""
        return {
            "create_task": [
                "add task call mom",
                "remind me to buy groceries",
                "create urgent task review contract",
                "new task schedule meeting",
                "schedule call with client tomorrow"
            ],
            "query": [
                "what's my streak",
                "how much xp today",
                "what's my next task",
                "show workflow status",
                "what workflows are running"
            ],
            "focus_control": [
                "start focus session",
                "begin 25 minute timer",
                "take a break",
                "stop session",
                "start deep work session"
            ],
            "workflow_control": [
                "start planning workflow",
                "trigger review process",
                "stop current workflow",
                "execute project workflow"
            ]
        }

    async def classify_intent(self, command: str, user_id: int) -> dict[str, Any]:
        """Classify intent using ML-based approach."""
        if not self.is_trained:
            await self._train_classifier()

        try:
            # Vectorize the command
            command_vector = self.vectorizer.transform([command.lower()])

            # Calculate similarities with intent examples
            best_intent = None
            best_confidence = 0.0

            for intent, examples in self.intent_examples.items():
                example_vectors = self.vectorizer.transform(examples)
                similarities = cosine_similarity(command_vector, example_vectors)
                max_similarity = np.max(similarities)

                if max_similarity > best_confidence:
                    best_confidence = max_similarity
                    best_intent = intent

            return {
                "intent": best_intent if best_confidence > 0.3 else None,
                "confidence": float(best_confidence),
                "method": "ml_similarity",
                "entities": {}
            }

        except Exception as e:
            logger.error(f"Intent classification failed: {e}")
            return {"intent": None, "confidence": 0.0, "method": "error", "entities": {}}

    async def _train_classifier(self):
        """Train the intent classifier."""
        all_examples = []
        for examples in self.intent_examples.values():
            all_examples.extend(examples)

        if all_examples:
            self.vectorizer.fit(all_examples)
            self.is_trained = True


class VoiceEntityExtractor:
    """Extract entities from voice commands with context awareness."""

    async def extract_entities(
        self, command: str, intent: str, user_id: int
    ) -> dict[str, Any]:
        """Extract entities from command based on intent."""
        entities = {}

        if intent == "create_task":
            entities.update(await self._extract_task_entities(command))
        elif intent == "focus_control":
            entities.update(await self._extract_focus_entities(command))
        elif intent == "workflow_control":
            entities.update(await self._extract_workflow_entities(command))

        return entities

    async def _extract_task_entities(self, command: str) -> dict[str, Any]:
        """Extract task-specific entities."""
        entities = {}

        # Extract priority
        priority_patterns = {
            "urgent": r"\\b(urgent|asap|immediately)\\b",
            "high": r"\\b(high|important|priority)\\b",
            "low": r"\\b(low|minor|later)\\b"
        }

        for priority, pattern in priority_patterns.items():
            if re.search(pattern, command.lower()):
                entities["priority"] = priority
                break

        # Extract time references
        time_patterns = {
            "today": r"\\btoday\\b",
            "tomorrow": r"\\btomorrow\\b",
            "next_week": r"\\bnext week\\b"
        }

        for time_ref, pattern in time_patterns.items():
            if re.search(pattern, command.lower()):
                entities["due_time"] = time_ref
                break

        return entities

    async def _extract_focus_entities(self, command: str) -> dict[str, Any]:
        """Extract focus session specific entities."""
        entities = {}

        # Extract duration
        duration_match = re.search(r"(\\d+)\\s*(?:minute|min)s?", command.lower())
        if duration_match:
            entities["duration"] = int(duration_match.group(1))

        # Extract session type
        if "deep work" in command.lower():
            entities["session_type"] = "deep_work"
        elif "pomodoro" in command.lower():
            entities["session_type"] = "pomodoro"

        return entities

    async def _extract_workflow_entities(self, command: str) -> dict[str, Any]:
        """Extract workflow-specific entities."""
        entities = {}

        # Extract workflow name (simple approach)
        workflow_match = re.search(r"(\\w+)\\s+workflow", command.lower())
        if workflow_match:
            entities["workflow_name"] = workflow_match.group(1)

        return entities


class VoiceContextManager:
    """Manage user context for voice interactions."""

    def __init__(self):
        self.user_contexts = {}

    async def update_user_context(self, user_id: int, context: dict[str, Any]):
        """Update user context information."""
        if user_id not in self.user_contexts:
            self.user_contexts[user_id] = {}

        self.user_contexts[user_id].update(context)
        self.user_contexts[user_id]["last_updated"] = datetime.now().isoformat()

    async def get_enriched_context(self, user_id: int) -> dict[str, Any]:
        """Get enriched context for user."""
        base_context = self.user_contexts.get(user_id, {})

        # Add time-based context
        now = datetime.now()
        base_context.update({
            "current_hour": now.hour,
            "day_of_week": now.weekday(),
            "is_weekend": now.weekday() >= 5
        })

        return base_context


class WorkflowVoiceRouter:
    """Route voice commands to appropriate workflows."""

    def __init__(self, workflow_engine):
        self.workflow_engine = workflow_engine
        self.workflow_triggers = self._initialize_workflow_triggers()

    def _initialize_workflow_triggers(self) -> dict[str, list[str]]:
        """Initialize workflow trigger mappings."""
        return {
            "daily_planning": ["create_task", "query"],
            "focus_session": ["focus_control"],
            "productivity_review": ["query"],
            "task_automation": ["create_task", "workflow_control"]
        }

    async def check_workflow_triggers(
        self, intent: str, parameters: dict[str, Any], user_id: int
    ) -> dict[str, Any] | None:
        """Check if voice command should trigger a workflow."""
        if not self.workflow_engine:
            return None

        for workflow_name, trigger_intents in self.workflow_triggers.items():
            if intent in trigger_intents:
                # Check specific conditions for workflow activation
                if await self._should_trigger_workflow(workflow_name, intent, parameters, user_id):
                    return await self._trigger_workflow(workflow_name, intent, parameters, user_id)

        return None

    async def _should_trigger_workflow(
        self, workflow_name: str, intent: str, parameters: dict[str, Any], user_id: int
    ) -> bool:
        """Determine if workflow should be triggered."""
        # Simple logic - can be enhanced with more sophisticated rules
        if workflow_name == "daily_planning" and intent == "create_task":
            return True
        elif workflow_name == "focus_session" and intent == "focus_control":
            return parameters.get("action") == "start_focus"

        return False

    async def _trigger_workflow(
        self, workflow_name: str, intent: str, parameters: dict[str, Any], user_id: int
    ) -> dict[str, Any]:
        """Trigger the specified workflow."""
        try:
            # Mock workflow triggering - replace with actual workflow engine integration
            logger.info(f"Triggering workflow {workflow_name} for user {user_id}")

            return {
                "workflow_name": workflow_name,
                "status": "triggered",
                "trigger_intent": intent,
                "parameters": parameters
            }

        except Exception as e:
            logger.error(f"Failed to trigger workflow {workflow_name}: {e}")
            return {
                "workflow_name": workflow_name,
                "status": "failed",
                "error": str(e)
            }

    async def start_workflow(self, user_id: int, workflow_name: str, context: dict[str, Any] | None) -> dict[str, Any]:
        """Start a specific workflow by name."""
        # Mock implementation
        return {"status": "started", "workflow_name": workflow_name}

    async def stop_workflow(self, user_id: int, workflow_name: str) -> dict[str, Any]:
        """Stop a specific workflow."""
        # Mock implementation
        return {"status": "stopped", "workflow_name": workflow_name}

    async def trigger_workflow(self, user_id: int, workflow_name: str, parameters: dict[str, Any]) -> dict[str, Any]:
        """Trigger a workflow with specific parameters."""
        # Mock implementation
        return {"status": "triggered", "workflow_name": workflow_name}

    async def trigger_focus_workflow(self, user_id: int, session_data: dict[str, Any]) -> dict[str, Any]:
        """Trigger focus-related workflow."""
        # Mock implementation
        return {"status": "focus_workflow_triggered", "session_data": session_data}
