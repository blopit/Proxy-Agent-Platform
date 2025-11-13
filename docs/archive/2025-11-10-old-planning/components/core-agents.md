# 🤖 Core Proxy Agents

The Proxy Agent Platform's core functionality is delivered through four specialized AI agents, each designed to excel in a specific aspect of productivity and personal optimization.

## 🎯 Agent Architecture

All proxy agents inherit from a common base that provides:
- **PydanticAI Integration**: Type-safe AI interactions with automatic validation
- **Inter-Agent Communication**: Seamless collaboration between agents
- **Context Management**: Persistent state and user context awareness
- **Performance Monitoring**: Real-time metrics and optimization
- **Error Handling**: Graceful degradation and recovery

```python
class BaseProxyAgent(ABC, Generic[T]):
    """
    Base class for all proxy agents providing common infrastructure
    for AI-powered productivity assistance.
    """

    def __init__(self, name: str, model: str = "gpt-4"):
        self.name = name
        self.agent = Agent(model)
        self.context: dict[str, Any] = {}
        self.capabilities: List[str] = []

    @abstractmethod
    async def process_request(self, request: T) -> Any:
        """Process agent-specific requests."""
        pass
```

## 📋 Task Proxy Agent

The Task Proxy Agent specializes in ultra-fast task capture and intelligent task management.

### 🚀 Core Capabilities

#### 2-Second Task Capture
The signature feature that transforms productivity workflows:

```python
@app.post("/agents/task/capture")
async def capture_task(request: TaskCaptureRequest):
    """
    Capture tasks in under 2 seconds from natural language input.

    Performance targets:
    - 95th percentile: < 2 seconds
    - 99th percentile: < 3 seconds
    - Error rate: < 0.1%
    """
    start_time = time.time()

    # AI processing with parallel operations
    categorization_task = asyncio.create_task(
        categorize_input(request.input)
    )
    duration_task = asyncio.create_task(
        estimate_duration(request.input)
    )
    priority_task = asyncio.create_task(
        determine_priority(request.input, request.context)
    )

    # Wait for all AI operations
    category, duration, priority = await asyncio.gather(
        categorization_task,
        duration_task,
        priority_task
    )

    # Create and store task
    task = await create_task_record({
        "title": extract_title(request.input),
        "description": generate_description(request.input),
        "category": category,
        "estimated_duration": duration,
        "priority": priority,
        "user_id": request.context["user_id"]
    })

    processing_time = time.time() - start_time

    return TaskResponse(
        task_id=task.id,
        title=task.title,
        processing_time_ms=processing_time * 1000,
        agent_suggestions=await generate_suggestions(task)
    )
```

#### Natural Language Processing
Advanced NLP capabilities for understanding user intent:

**Input Examples:**
- *"Review quarterly reports by Friday and prepare summary for board meeting"*
- *"Call John about the budget - urgent, needs to happen this morning"*
- *"Research competitor analysis when I have 2 hours of deep focus time"*

**Extracted Information:**
- **Title**: Concise, actionable task title
- **Description**: Detailed context and requirements
- **Due Date**: Parsed from temporal expressions
- **Priority**: Inferred from urgency indicators
- **Duration**: Estimated based on task complexity
- **Prerequisites**: Dependencies and preparation needed

#### Smart Categorization
AI-powered categorization with continuous learning:

```python
class TaskCategories:
    WORK = "work"
    PERSONAL = "personal"
    LEARNING = "learning"
    HEALTH = "health"
    CREATIVE = "creative"
    ADMINISTRATIVE = "administrative"
    COMMUNICATION = "communication"
    PLANNING = "planning"

async def categorize_task(description: str, user_history: List[Task]) -> str:
    """
    Categorize task using AI with user-specific learning.

    Factors considered:
    - Task content and keywords
    - User's historical categorization patterns
    - Time of day and context
    - Current user goals and projects
    """
    prompt = f"""
    Categorize this task based on the user's patterns:

    Task: {description}

    User's recent categorizations:
    {format_user_patterns(user_history)}

    Available categories: {list(TaskCategories)}

    Return the most appropriate category.
    """

    result = await ai_client.run(prompt)
    return result.data
```

#### Intelligent Scheduling
Energy and calendar-aware task scheduling:

```python
async def generate_scheduling_suggestions(task: Task, user: User) -> SchedulingSuggestions:
    """
    Generate optimal scheduling suggestions based on:
    - User's energy patterns
    - Calendar availability
    - Task energy requirements
    - Focus type compatibility
    """

    # Get user's energy forecast
    energy_prediction = await energy_agent.predict_levels(
        user.id, hours_ahead=48
    )

    # Get calendar availability
    calendar_slots = await calendar_service.get_free_slots(
        user.id, days_ahead=7
    )

    # Match task requirements with optimal conditions
    optimal_slots = []
    for slot in calendar_slots:
        predicted_energy = get_energy_for_time(energy_prediction, slot.start_time)

        if predicted_energy >= task.energy_required:
            score = calculate_compatibility_score(
                task=task,
                time_slot=slot,
                predicted_energy=predicted_energy,
                user_preferences=user.preferences
            )
            optimal_slots.append((slot, score))

    # Return top 3 suggestions
    optimal_slots.sort(key=lambda x: x[1], reverse=True)

    return SchedulingSuggestions(
        recommendations=[
            {
                "time_slot": slot.start_time,
                "confidence": score,
                "reasoning": generate_reasoning(task, slot, score)
            }
            for slot, score in optimal_slots[:3]
        ]
    )
```

### 🔄 Task Lifecycle Management

#### Task States
```python
class TaskStatus(Enum):
    PENDING = "pending"
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    DELEGATED = "delegated"
```

#### State Transitions
```python
async def update_task_status(
    task_id: UUID,
    new_status: TaskStatus,
    context: Optional[dict] = None
) -> TaskUpdate:
    """
    Handle task status transitions with validation and side effects.
    """
    task = await get_task(task_id)

    # Validate transition
    if not is_valid_transition(task.status, new_status):
        raise InvalidTransitionError(
            f"Cannot transition from {task.status} to {new_status}"
        )

    # Handle transition side effects
    if new_status == TaskStatus.IN_PROGRESS:
        await start_focus_session_if_needed(task)
        await update_energy_tracking(task.user_id, "task_started")

    elif new_status == TaskStatus.COMPLETED:
        await award_xp(task.user_id, calculate_xp_reward(task))
        await update_completion_patterns(task)
        await suggest_follow_up_tasks(task)

    # Update task
    task.status = new_status
    task.updated_at = datetime.now()

    if context:
        task.context.update(context)

    await save_task(task)

    # Broadcast update
    await broadcast_task_update(task)

    return TaskUpdate(
        task_id=task_id,
        old_status=task.status,
        new_status=new_status,
        timestamp=datetime.now()
    )
```

## 🎯 Focus Proxy Agent

The Focus Proxy Agent manages deep work sessions and environmental optimization for sustained concentration.

### 🧠 Focus Session Types

#### Pomodoro Sessions
Traditional time-boxed focus sessions:

```python
class PomodoroSession:
    duration_minutes: int = 25
    break_duration: int = 5
    long_break_interval: int = 4
    long_break_duration: int = 15

    async def start_session(self, task_id: Optional[UUID] = None):
        """Start a Pomodoro session with automatic break management."""
        session = await create_focus_session(
            type="pomodoro",
            duration=self.duration_minutes,
            task_id=task_id
        )

        # Configure environment
        await enable_distraction_blocking()
        await set_status_indicator("deep_work")
        await start_ambient_sound("focus")

        # Schedule break notification
        await schedule_notification(
            delay_minutes=self.duration_minutes,
            message="Time for a break! You've earned it.",
            action="start_break"
        )

        return session
```

#### Deep Work Sessions
Extended focus periods for complex work:

```python
class DeepWorkSession:
    default_duration: int = 90  # minutes
    maximum_duration: int = 180

    async def start_session(self, estimated_duration: int, task: Task):
        """Start a deep work session with adaptive duration."""

        # Predict optimal duration based on task and user patterns
        optimal_duration = await predict_optimal_duration(
            task_complexity=task.complexity,
            user_energy=await get_current_energy(),
            historical_performance=await get_focus_history()
        )

        session_duration = min(
            estimated_duration,
            optimal_duration,
            self.maximum_duration
        )

        session = await create_focus_session(
            type="deep_work",
            duration=session_duration,
            task_id=task.id
        )

        # Optimize environment for deep work
        await configure_deep_work_environment(session)

        return session

async def configure_deep_work_environment(session: FocusSession):
    """Configure optimal environment for deep work."""

    # Block all non-critical notifications
    await notification_manager.set_mode("deep_work")

    # Configure website blocking
    await web_blocker.enable_strict_mode()

    # Set ambient lighting if supported
    await smart_home.set_focus_lighting()

    # Start background soundscape
    await audio_manager.start_soundscape("deep_focus")

    # Set calendar status
    await calendar_service.set_busy_status(
        duration=session.duration,
        message="In deep work session"
    )
```

#### Flow State Sessions
Adaptive sessions that extend naturally:

```python
class FlowStateSession:
    """
    Sessions that adapt to user's natural flow state,
    extending automatically when deep focus is detected.
    """

    async def start_session(self, task: Task):
        session = await create_focus_session(
            type="flow_state",
            duration=None,  # Open-ended
            task_id=task.id
        )

        # Start with minimal interruptions
        await enable_flow_mode()

        # Monitor for flow state indicators
        await start_flow_monitoring(session)

        return session

async def monitor_flow_state(session: FocusSession):
    """
    Monitor indicators of flow state and adapt session accordingly.

    Flow indicators:
    - Consistent typing/interaction patterns
    - Lack of task switching
    - Extended periods without breaks
    - Low distraction interaction
    """

    flow_score = 0
    monitoring = True

    while monitoring:
        await asyncio.sleep(60)  # Check every minute

        # Analyze recent activity
        activity = await analyze_user_activity(last_minutes=5)

        # Calculate flow score
        current_flow = calculate_flow_score(activity)
        flow_score = update_flow_score(flow_score, current_flow)

        # If deep flow detected, suggest extension
        if flow_score > 0.8 and session.duration_minutes > 45:
            await suggest_session_extension(session)

        # If flow broken, suggest natural break
        elif flow_score < 0.3:
            await suggest_mindful_break(session)
            monitoring = False
```

### 🚫 Distraction Management

#### Intelligent Website Blocking
Context-aware website filtering:

```python
class DistractionBlocker:
    """
    Intelligent website blocking based on context and user patterns.
    """

    def __init__(self):
        self.block_lists = {
            "social_media": ["facebook.com", "twitter.com", "instagram.com"],
            "news": ["reddit.com", "news.ycombinator.com", "cnn.com"],
            "entertainment": ["youtube.com", "netflix.com", "twitch.tv"],
            "shopping": ["amazon.com", "ebay.com"]
        }

    async def enable_blocking(self, focus_type: str, user_preferences: dict):
        """Enable blocking based on focus type and user preferences."""

        blocked_categories = self.get_blocked_categories(focus_type)

        # Customize based on user preferences
        if user_preferences.get("allow_work_youtube"):
            self.block_lists["entertainment"].remove("youtube.com")

        # Apply blocks
        for category in blocked_categories:
            await self.block_category(category)

        # Set up bypass mechanism for emergencies
        await self.setup_emergency_bypass()

    async def smart_unblock_suggestion(self, url: str, context: dict):
        """
        Suggest whether to allow access to a blocked site
        based on current context and task requirements.
        """

        # Check if URL is relevant to current task
        current_task = await get_current_task(context["user_id"])
        if current_task:
            relevance = await calculate_url_relevance(url, current_task)
            if relevance > 0.7:
                return UnblockSuggestion(
                    action="allow_temporarily",
                    reason=f"URL appears relevant to task: {current_task.title}",
                    duration_minutes=10
                )

        # Check user's historical patterns
        historical_value = await analyze_url_value(url, context["user_id"])
        if historical_value > 0.5:
            return UnblockSuggestion(
                action="ask_user",
                reason="You've found this site valuable during focus sessions before",
                quick_allow_option=True
            )

        return UnblockSuggestion(
            action="maintain_block",
            reason="Site not relevant to current goals",
            alternative_suggestion=await suggest_relevant_resources(current_task)
        )
```

#### Notification Management
Smart notification filtering during focus:

```python
class FocusNotificationManager:
    """
    Manage notifications during focus sessions with intelligent filtering.
    """

    async def configure_focus_notifications(
        self,
        session: FocusSession,
        user_preferences: NotificationPreferences
    ):
        """Configure notifications for focus session."""

        # Allow critical notifications
        await self.configure_critical_allowlist(user_preferences.critical_contacts)

        # Defer non-critical notifications
        await self.defer_notifications([
            "social_media",
            "promotional",
            "news",
            "entertainment"
        ])

        # Set auto-responses
        await self.set_auto_responses(
            email_response=f"I'm in a focus session until {session.end_time}. "
                          f"I'll respond to your message then.",
            slack_status="🎯 Deep work - will respond after focus session",
            phone_greeting="Currently in a focus session. Leave a message for urgent matters."
        )

    async def evaluate_notification_urgency(
        self,
        notification: Notification,
        context: FocusContext
    ) -> NotificationDecision:
        """
        Evaluate whether a notification should interrupt focus session.
        """

        urgency_score = 0

        # Check sender importance
        if notification.sender in context.vip_contacts:
            urgency_score += 0.4

        # Analyze content for urgency keywords
        urgency_keywords = ["urgent", "emergency", "asap", "deadline", "crisis"]
        if any(keyword in notification.content.lower() for keyword in urgency_keywords):
            urgency_score += 0.3

        # Check time sensitivity
        if self.is_time_sensitive(notification):
            urgency_score += 0.2

        # Consider user's current task priority
        if context.current_task.priority == "urgent":
            urgency_score -= 0.2  # Less likely to interrupt urgent work

        if urgency_score > 0.7:
            return NotificationDecision.INTERRUPT
        elif urgency_score > 0.4:
            return NotificationDecision.GENTLE_NOTIFY
        else:
            return NotificationDecision.DEFER
```

### 📊 Focus Analytics

#### Quality Scoring
Comprehensive focus quality assessment:

```python
async def calculate_focus_quality_score(session: FocusSession) -> FocusQualityReport:
    """
    Calculate comprehensive focus quality score based on multiple factors.
    """

    # Base metrics
    duration_score = min(session.actual_duration / session.planned_duration, 1.0)
    interruption_penalty = max(0, 1.0 - (session.interruption_count * 0.1))

    # Activity analysis
    activity_data = await get_session_activity(session.id)
    focus_consistency = analyze_activity_consistency(activity_data)
    task_switching_penalty = calculate_task_switching_penalty(activity_data)

    # Environmental factors
    environment_score = await analyze_environment_factors(session)

    # User self-assessment
    user_rating = session.user_quality_rating or 0.5

    # Calculate weighted score
    quality_score = (
        duration_score * 0.25 +
        interruption_penalty * 0.20 +
        focus_consistency * 0.20 +
        task_switching_penalty * 0.15 +
        environment_score * 0.10 +
        user_rating * 0.10
    )

    return FocusQualityReport(
        overall_score=quality_score,
        duration_effectiveness=duration_score,
        interruption_resistance=interruption_penalty,
        focus_consistency=focus_consistency,
        environment_optimization=environment_score,
        user_satisfaction=user_rating,
        insights=await generate_improvement_insights(session, quality_score),
        recommendations=await generate_recommendations(session)
    )

async def generate_improvement_insights(
    session: FocusSession,
    quality_score: float
) -> List[FocusInsight]:
    """Generate personalized insights for focus improvement."""

    insights = []

    if session.interruption_count > 3:
        insights.append(FocusInsight(
            type="interruption_management",
            message="Consider enabling stricter notification blocking",
            impact="Could improve focus quality by 15-20%",
            action="Update notification preferences"
        ))

    if quality_score < 0.6:
        # Analyze patterns to identify issues
        recent_sessions = await get_recent_focus_sessions(
            session.user_id, days=7
        )

        if all(s.quality_score < 0.6 for s in recent_sessions):
            insights.append(FocusInsight(
                type="environmental_optimization",
                message="Consistent focus challenges detected",
                impact="Environmental changes could help",
                action="Review workspace setup and ambient conditions"
            ))

    return insights
```

## ⚡ Energy Proxy Agent

The Energy Proxy Agent tracks, predicts, and optimizes user energy levels throughout the day.

### 📊 Energy Tracking System

#### Multi-Modal Data Collection
Comprehensive energy level monitoring:

```python
class EnergyTracker:
    """
    Comprehensive energy tracking with multiple data sources.
    """

    async def log_energy_level(
        self,
        user_id: UUID,
        level: int,
        context: EnergyContext
    ) -> EnergyLog:
        """Log energy level with contextual information."""

        energy_log = EnergyLog(
            user_id=user_id,
            level=level,
            timestamp=datetime.now(),
            context=context
        )

        # Enrich with environmental data
        energy_log.weather = await get_weather_data(context.location)
        energy_log.calendar_context = await get_calendar_context(user_id)

        # Store and analyze
        await store_energy_log(energy_log)

        # Trigger real-time analysis
        await analyze_energy_patterns(user_id)

        return energy_log

class EnergyContext(BaseModel):
    """Contextual factors affecting energy levels."""

    location: Optional[str] = None
    activity: Optional[str] = None
    sleep_hours: Optional[float] = None
    caffeine_intake: Optional[bool] = None
    exercise_today: Optional[bool] = None
    meal_timing: Optional[datetime] = None
    stress_level: Optional[int] = None
    social_interaction: Optional[str] = None
    work_intensity: Optional[str] = None
    mood: Optional[str] = None
```

#### Smart Prompting System
Intelligent prompts for energy logging:

```python
async def generate_energy_prompt(user: User, context: dict) -> EnergyPrompt:
    """
    Generate contextually appropriate energy logging prompts.
    """

    # Analyze optimal prompting times
    last_log = await get_last_energy_log(user.id)
    time_since_last = datetime.now() - last_log.timestamp

    # Don't prompt too frequently
    if time_since_last < timedelta(hours=1):
        return None

    # Generate contextual prompt
    current_context = await analyze_current_context(user.id)

    if current_context.just_finished_meeting:
        prompt_text = "How's your energy after that meeting?"
        suggested_factors = ["meeting_quality", "social_energy", "mental_fatigue"]

    elif current_context.time_of_day == "afternoon":
        prompt_text = "How are you feeling this afternoon?"
        suggested_factors = ["post_lunch_dip", "caffeine_effect", "natural_rhythm"]

    elif current_context.just_completed_task:
        prompt_text = "How's your energy after completing that task?"
        suggested_factors = ["task_satisfaction", "mental_effort", "achievement_boost"]

    return EnergyPrompt(
        text=prompt_text,
        suggested_factors=suggested_factors,
        quick_options=generate_quick_energy_options(user),
        optimal_timing=True
    )
```

### 🔮 Predictive Energy Modeling

#### Machine Learning Pipeline
Advanced ML models for energy prediction:

```python
class EnergyPredictor:
    """
    Machine learning model for predicting user energy levels.
    """

    def __init__(self):
        self.model = None
        self.feature_columns = [
            'hour_of_day', 'day_of_week', 'month',
            'sleep_hours', 'caffeine_intake', 'exercise',
            'weather_temperature', 'weather_humidity', 'weather_pressure',
            'meetings_count', 'task_complexity_avg', 'social_interactions',
            'stress_level', 'energy_previous_hour', 'energy_trend_3h'
        ]

    async def train_model(self, user_id: UUID):
        """Train personalized energy prediction model."""

        # Fetch training data
        energy_data = await get_energy_history(user_id, days=90)

        if len(energy_data) < 50:  # Not enough data
            return await use_generic_model(user_id)

        # Feature engineering
        features = await engineer_features(energy_data)
        X = features[self.feature_columns]
        y = features['energy_level']

        # Train model with cross-validation
        from sklearn.ensemble import RandomForestRegressor
        from sklearn.model_selection import TimeSeriesSplit

        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )

        # Time series cross-validation
        tscv = TimeSeriesSplit(n_splits=5)
        scores = []

        for train_idx, val_idx in tscv.split(X):
            X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
            y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]

            self.model.fit(X_train, y_train)
            score = self.model.score(X_val, y_val)
            scores.append(score)

        # Final training on all data
        self.model.fit(X, y)

        # Store model performance
        await store_model_metrics(user_id, {
            'cv_score_mean': np.mean(scores),
            'cv_score_std': np.std(scores),
            'feature_importance': dict(zip(
                self.feature_columns,
                self.model.feature_importances_
            ))
        })

    async def predict_energy_levels(
        self,
        user_id: UUID,
        hours_ahead: int = 8
    ) -> List[EnergyPrediction]:
        """Predict energy levels for the next few hours."""

        if not self.model:
            await self.train_model(user_id)

        predictions = []
        current_time = datetime.now()

        for hour in range(1, hours_ahead + 1):
            future_time = current_time + timedelta(hours=hour)

            # Generate features for prediction
            features = await generate_prediction_features(user_id, future_time)

            # Make prediction
            predicted_energy = self.model.predict([features])[0]

            # Calculate confidence
            confidence = await calculate_prediction_confidence(features)

            predictions.append(EnergyPrediction(
                timestamp=future_time,
                predicted_level=max(1, min(10, round(predicted_energy, 1))),
                confidence=confidence,
                factors=await identify_key_factors(features)
            ))

        return predictions

async def generate_prediction_features(user_id: UUID, target_time: datetime) -> List[float]:
    """Generate feature vector for energy prediction."""

    # Time-based features
    features = [
        target_time.hour,
        target_time.weekday(),
        target_time.month
    ]

    # Sleep data
    sleep_data = await get_sleep_data(user_id, target_time.date())
    features.extend([
        sleep_data.total_hours if sleep_data else 7.5,
        sleep_data.quality_score if sleep_data else 0.7
    ])

    # Activity predictions
    calendar_events = await get_calendar_events(user_id, target_time)
    features.extend([
        len(calendar_events),
        calculate_event_intensity(calendar_events)
    ])

    # Weather forecast
    weather = await get_weather_forecast(target_time)
    features.extend([
        weather.temperature,
        weather.humidity,
        weather.pressure
    ])

    # Historical energy trends
    recent_energy = await get_recent_energy_trend(user_id, target_time)
    features.extend([
        recent_energy.previous_hour,
        recent_energy.three_hour_trend
    ])

    return features
```

### 🔄 Energy Optimization Strategies

#### Personalized Recommendations
AI-generated energy optimization suggestions:

```python
class EnergyOptimizer:
    """
    Generate personalized energy optimization recommendations.
    """

    async def generate_recommendations(
        self,
        user_id: UUID,
        current_energy: int,
        predictions: List[EnergyPrediction]
    ) -> List[EnergyRecommendation]:
        """Generate energy optimization recommendations."""

        recommendations = []
        user_patterns = await get_user_energy_patterns(user_id)

        # Proactive recommendations for predicted dips
        for prediction in predictions:
            if prediction.predicted_level < 5 and prediction.confidence > 0.7:
                rec = await generate_energy_dip_recommendation(
                    user_patterns, prediction
                )
                recommendations.append(rec)

        # Current state recommendations
        if current_energy < 4:
            recommendations.extend(
                await generate_low_energy_recommendations(user_patterns)
            )
        elif current_energy > 8:
            recommendations.extend(
                await generate_high_energy_recommendations(user_patterns)
            )

        # Pattern-based recommendations
        recommendations.extend(
            await generate_pattern_recommendations(user_patterns)
        )

        return sorted(recommendations, key=lambda x: x.priority, reverse=True)

async def generate_energy_dip_recommendation(
    user_patterns: UserEnergyPatterns,
    prediction: EnergyPrediction
) -> EnergyRecommendation:
    """Generate recommendation for predicted energy dip."""

    time_until_dip = prediction.timestamp - datetime.now()

    if time_until_dip < timedelta(minutes=30):
        # Immediate action needed
        if "caffeine_responsive" in user_patterns.traits:
            return EnergyRecommendation(
                type="immediate_boost",
                action="Consider a coffee or tea break",
                reasoning="Your energy is predicted to drop soon, and caffeine typically helps you",
                timing="now",
                priority=8,
                duration_minutes=5
            )
        else:
            return EnergyRecommendation(
                type="micro_break",
                action="Take a 5-minute walk or do some light stretching",
                reasoning="Movement can help prevent the predicted energy dip",
                timing="now",
                priority=7,
                duration_minutes=5
            )

    elif time_until_dip < timedelta(hours=1):
        # Plan ahead
        return EnergyRecommendation(
            type="proactive_planning",
            action=f"Schedule lighter tasks for {prediction.timestamp.strftime('%I:%M %p')}",
            reasoning="Your energy is predicted to be lower then",
            timing="when_planning",
            priority=6,
            duration_minutes=None
        )

    else:
        # Lifestyle adjustment
        return EnergyRecommendation(
            type="lifestyle_optimization",
            action="Consider adjusting your morning routine for better sustained energy",
            reasoning="Pattern analysis suggests improvements are possible",
            timing="daily_planning",
            priority=4,
            duration_minutes=None
        )

class EnergyRecoveryProtocol:
    """
    Structured protocols for energy recovery.
    """

    @staticmethod
    async def micro_recovery(user_preferences: dict) -> RecoveryProtocol:
        """2-5 minute energy recovery protocol."""
        return RecoveryProtocol(
            name="Micro Recovery",
            duration_minutes=3,
            steps=[
                "Stand up and stretch arms overhead",
                "Take 5 deep breaths",
                "Drink a glass of water",
                "Look out a window or at something distant"
            ],
            expected_energy_boost=1.5
        )

    @staticmethod
    async def power_nap_protocol(user_patterns: dict) -> RecoveryProtocol:
        """10-20 minute power nap protocol."""
        optimal_duration = calculate_optimal_nap_duration(user_patterns)

        return RecoveryProtocol(
            name="Power Nap",
            duration_minutes=optimal_duration,
            steps=[
                "Find a quiet, dark space",
                "Set alarm for exactly {optimal_duration} minutes",
                "Lie down and close eyes",
                "Focus on breathing or use guided relaxation",
                "Wake up and move immediately to avoid grogginess"
            ],
            expected_energy_boost=3.0,
            prerequisites=["quiet_space", "time_available"]
        )

    @staticmethod
    async def movement_boost(energy_level: int) -> RecoveryProtocol:
        """Movement-based energy boost protocol."""

        if energy_level < 3:
            return RecoveryProtocol(
                name="Gentle Movement",
                duration_minutes=5,
                steps=[
                    "Gentle neck and shoulder rolls",
                    "Light walking in place",
                    "Simple desk stretches"
                ],
                intensity="very_low"
            )
        else:
            return RecoveryProtocol(
                name="Energizing Movement",
                duration_minutes=10,
                steps=[
                    "Brisk 5-minute walk",
                    "Light calisthenics",
                    "Deep breathing exercises"
                ],
                intensity="moderate"
            )
```

## 📈 Progress Proxy Agent

The Progress Proxy Agent tracks achievements, manages gamification, and provides motivational insights.

### 🎮 Gamification Engine

#### Experience Points System
Sophisticated XP calculation and reward system:

```python
class XPEngine:
    """
    Advanced experience points system with dynamic rewards.
    """

    def __init__(self):
        self.base_rewards = {
            "task_completion": 10,
            "focus_session": 25,
            "energy_logging": 5,
            "daily_reflection": 20,
            "habit_maintenance": 15,
            "goal_achievement": 100
        }

        self.multipliers = {
            "streak": lambda days: min(3.0, 1.0 + (days * 0.1)),
            "difficulty": {"easy": 0.8, "medium": 1.0, "hard": 1.5, "expert": 2.0},
            "quality": lambda score: 0.5 + (score * 0.5),  # 0.5-1.0 based on quality
            "consistency": lambda rate: 1.0 + (rate * 0.5)  # up to 1.5x for high consistency
        }

    async def calculate_xp_reward(
        self,
        action: str,
        context: dict,
        user_patterns: UserPatterns
    ) -> XPReward:
        """Calculate XP reward with all applicable multipliers."""

        base_xp = self.base_rewards.get(action, 0)

        if base_xp == 0:
            return XPReward(amount=0, breakdown={"error": "Unknown action"})

        multipliers_applied = {}
        total_multiplier = 1.0

        # Streak multiplier
        if context.get("streak_days", 0) > 0:
            streak_mult = self.multipliers["streak"](context["streak_days"])
            multipliers_applied["streak"] = streak_mult
            total_multiplier *= streak_mult

        # Difficulty multiplier
        if "difficulty" in context:
            diff_mult = self.multipliers["difficulty"].get(context["difficulty"], 1.0)
            multipliers_applied["difficulty"] = diff_mult
            total_multiplier *= diff_mult

        # Quality multiplier
        if "quality_score" in context:
            quality_mult = self.multipliers["quality"](context["quality_score"])
            multipliers_applied["quality"] = quality_mult
            total_multiplier *= quality_mult

        # Consistency bonus
        consistency_rate = await calculate_consistency_rate(user_patterns, action)
        if consistency_rate > 0.7:
            consistency_mult = self.multipliers["consistency"](consistency_rate)
            multipliers_applied["consistency"] = consistency_mult
            total_multiplier *= consistency_mult

        final_xp = int(base_xp * total_multiplier)

        return XPReward(
            amount=final_xp,
            base_amount=base_xp,
            total_multiplier=total_multiplier,
            breakdown=multipliers_applied,
            action=action
        )

async def award_xp(user_id: UUID, xp_reward: XPReward) -> XPTransaction:
    """Award XP to user and handle level progression."""

    # Get current XP status
    current_status = await get_user_xp_status(user_id)

    # Create transaction
    transaction = XPTransaction(
        user_id=user_id,
        amount=xp_reward.amount,
        source=xp_reward.action,
        multipliers=xp_reward.breakdown,
        timestamp=datetime.now()
    )

    # Update user XP
    new_total = current_status.total_xp + xp_reward.amount
    new_level = calculate_level_from_xp(new_total)

    # Check for level up
    level_up_reward = None
    if new_level > current_status.level:
        level_up_reward = await handle_level_up(
            user_id, current_status.level, new_level
        )

    # Store transaction
    await store_xp_transaction(transaction)
    await update_user_xp_status(user_id, new_total, new_level)

    # Broadcast XP gain
    await broadcast_xp_gain(user_id, transaction, level_up_reward)

    return transaction
```

#### Achievement System
Dynamic achievement tracking and unlocking:

```python
class AchievementEngine:
    """
    Dynamic achievement system with personalized challenges.
    """

    def __init__(self):
        self.achievement_definitions = self._load_achievement_definitions()

    async def check_achievements(
        self,
        user_id: UUID,
        action: str,
        context: dict
    ) -> List[Achievement]:
        """Check if any achievements were unlocked by this action."""

        unlocked_achievements = []
        user_data = await get_user_achievement_data(user_id)

        for achievement_id, definition in self.achievement_definitions.items():
            if achievement_id in user_data.unlocked_achievements:
                continue  # Already unlocked

            if await self._check_achievement_criteria(
                definition, user_data, action, context
            ):
                achievement = await self._unlock_achievement(
                    user_id, achievement_id, definition
                )
                unlocked_achievements.append(achievement)

        return unlocked_achievements

    async def _check_achievement_criteria(
        self,
        definition: AchievementDefinition,
        user_data: UserAchievementData,
        action: str,
        context: dict
    ) -> bool:
        """Check if achievement criteria are met."""

        if definition.trigger_action and definition.trigger_action != action:
            return False

        for criterion in definition.criteria:
            if not await self._evaluate_criterion(criterion, user_data, context):
                return False

        return True

    async def _evaluate_criterion(
        self,
        criterion: AchievementCriterion,
        user_data: UserAchievementData,
        context: dict
    ) -> bool:
        """Evaluate a single achievement criterion."""

        if criterion.type == "count":
            actual_count = getattr(user_data, criterion.field)
            return actual_count >= criterion.target_value

        elif criterion.type == "streak":
            current_streak = await get_current_streak(
                user_data.user_id, criterion.activity
            )
            return current_streak >= criterion.target_value

        elif criterion.type == "consistency":
            consistency_rate = await calculate_consistency_rate(
                user_data.user_id, criterion.activity, criterion.period_days
            )
            return consistency_rate >= criterion.target_value

        elif criterion.type == "quality":
            avg_quality = await get_average_quality_score(
                user_data.user_id, criterion.activity, criterion.period_days
            )
            return avg_quality >= criterion.target_value

        return False

# Example achievement definitions
ACHIEVEMENT_DEFINITIONS = {
    "task_master_bronze": AchievementDefinition(
        id="task_master_bronze",
        name="Task Master - Bronze",
        description="Complete 100 tasks",
        category="productivity",
        tier="bronze",
        criteria=[
            AchievementCriterion(
                type="count",
                field="tasks_completed",
                target_value=100
            )
        ],
        rewards=XPReward(amount=200),
        icon="🥉"
    ),

    "focus_ninja": AchievementDefinition(
        id="focus_ninja",
        name="Focus Ninja",
        description="Complete 10 focus sessions without interruptions",
        category="focus",
        tier="silver",
        criteria=[
            AchievementCriterion(
                type="count",
                field="uninterrupted_focus_sessions",
                target_value=10
            )
        ],
        rewards=XPReward(amount=300),
        icon="🥷",
        unlocks_feature="advanced_focus_modes"
    ),

    "energy_optimizer": AchievementDefinition(
        id="energy_optimizer",
        name="Energy Optimizer",
        description="Log energy levels daily for 30 days",
        category="energy",
        tier="gold",
        criteria=[
            AchievementCriterion(
                type="streak",
                activity="energy_logging",
                target_value=30
            )
        ],
        rewards=XPReward(amount=500),
        icon="⚡",
        unlocks_feature="energy_prediction_pro"
    )
}
```

### 📊 Progress Analytics

#### Comprehensive Progress Tracking
Multi-dimensional progress analysis:

```python
class ProgressAnalyzer:
    """
    Comprehensive progress analysis and insight generation.
    """

    async def generate_progress_report(
        self,
        user_id: UUID,
        period: str = "week"
    ) -> ProgressReport:
        """Generate comprehensive progress report."""

        time_range = self._get_time_range(period)

        # Gather data from all systems
        task_data = await get_task_metrics(user_id, time_range)
        focus_data = await get_focus_metrics(user_id, time_range)
        energy_data = await get_energy_metrics(user_id, time_range)
        xp_data = await get_xp_metrics(user_id, time_range)

        # Calculate key metrics
        productivity_score = await calculate_productivity_score({
            "task_completion_rate": task_data.completion_rate,
            "focus_quality_avg": focus_data.average_quality,
            "energy_consistency": energy_data.consistency_score,
            "goal_achievement_rate": task_data.goal_achievement_rate
        })

        # Generate insights
        insights = await self._generate_insights(
            user_id, task_data, focus_data, energy_data, xp_data
        )

        # Create recommendations
        recommendations = await self._generate_recommendations(
            user_id, insights, time_range
        )

        return ProgressReport(
            period=period,
            productivity_score=productivity_score,
            task_metrics=task_data,
            focus_metrics=focus_data,
            energy_metrics=energy_data,
            xp_metrics=xp_data,
            insights=insights,
            recommendations=recommendations,
            achievements_unlocked=await get_recent_achievements(user_id, time_range),
            trends=await calculate_trends(user_id, time_range)
        )

    async def _generate_insights(
        self,
        user_id: UUID,
        task_data: TaskMetrics,
        focus_data: FocusMetrics,
        energy_data: EnergyMetrics,
        xp_data: XPMetrics
    ) -> List[ProgressInsight]:
        """Generate actionable insights from progress data."""

        insights = []

        # Task completion insights
        if task_data.completion_rate > 0.9:
            insights.append(ProgressInsight(
                type="achievement",
                title="Excellent Task Completion",
                message=f"You completed {task_data.completion_rate:.0%} of your tasks!",
                impact="positive",
                confidence=0.95
            ))
        elif task_data.completion_rate < 0.6:
            insights.append(ProgressInsight(
                type="improvement_opportunity",
                title="Task Completion Could Improve",
                message="Consider breaking large tasks into smaller, more manageable pieces",
                impact="actionable",
                confidence=0.8,
                suggested_action="task_breakdown_workshop"
            ))

        # Focus quality insights
        if focus_data.average_quality > 8.0:
            insights.append(ProgressInsight(
                type="strength",
                title="High Focus Quality",
                message=f"Your focus sessions average {focus_data.average_quality:.1f}/10 quality",
                impact="positive",
                confidence=0.9
            ))

        # Energy pattern insights
        energy_patterns = await analyze_energy_patterns(user_id)
        if energy_patterns.has_clear_peak_time:
            insights.append(ProgressInsight(
                type="optimization",
                title="Clear Energy Peak Identified",
                message=f"Your energy peaks around {energy_patterns.peak_time}",
                impact="actionable",
                confidence=energy_patterns.confidence,
                suggested_action="schedule_important_tasks_during_peak"
            ))

        return insights

async def calculate_productivity_score(metrics: dict) -> float:
    """
    Calculate overall productivity score from multiple metrics.

    Weighted scoring system:
    - Task completion: 30%
    - Focus quality: 25%
    - Energy consistency: 20%
    - Goal achievement: 25%
    """

    weights = {
        "task_completion_rate": 0.30,
        "focus_quality_avg": 0.25,
        "energy_consistency": 0.20,
        "goal_achievement_rate": 0.25
    }

    weighted_score = 0
    for metric, value in metrics.items():
        if metric in weights:
            # Normalize to 0-1 scale
            normalized_value = min(1.0, max(0.0, value / 10.0))
            weighted_score += normalized_value * weights[metric]

    return round(weighted_score * 10, 1)  # Return as 0-10 score
```

### 🎯 Motivation and Engagement

#### Adaptive Motivation System
Personalized motivation strategies:

```python
class MotivationEngine:
    """
    Adaptive motivation system that personalizes encouragement
    based on user psychology and current state.
    """

    async def generate_motivational_message(
        self,
        user_id: UUID,
        context: MotivationContext
    ) -> MotivationalMessage:
        """Generate personalized motivational message."""

        user_profile = await get_user_motivation_profile(user_id)
        current_state = await analyze_current_motivation_state(user_id)

        # Select motivation strategy based on profile and state
        strategy = self._select_motivation_strategy(user_profile, current_state)

        message = await self._craft_message(strategy, context, user_profile)

        return MotivationalMessage(
            content=message.content,
            tone=message.tone,
            call_to_action=message.call_to_action,
            timing=message.optimal_timing,
            personalization_factors=message.factors_used
        )

    def _select_motivation_strategy(
        self,
        profile: UserMotivationProfile,
        state: MotivationState
    ) -> MotivationStrategy:
        """Select optimal motivation strategy."""

        if state.energy_level < 4:
            # Low energy - use gentle encouragement
            return MotivationStrategy.GENTLE_ENCOURAGEMENT

        elif state.recent_failures > 2:
            # Recent struggles - use resilience building
            return MotivationStrategy.RESILIENCE_BUILDING

        elif state.streak_days > 7:
            # Good streak - use momentum building
            return MotivationStrategy.MOMENTUM_BUILDING

        elif profile.motivation_type == "achievement_oriented":
            return MotivationStrategy.GOAL_FOCUSED

        elif profile.motivation_type == "progress_oriented":
            return MotivationStrategy.PROGRESS_CELEBRATION

        else:
            return MotivationStrategy.BALANCED_ENCOURAGEMENT

    async def _craft_message(
        self,
        strategy: MotivationStrategy,
        context: MotivationContext,
        profile: UserMotivationProfile
    ) -> MotivationalMessage:
        """Craft personalized motivational message."""

        if strategy == MotivationStrategy.GENTLE_ENCOURAGEMENT:
            return MotivationalMessage(
                content=f"Take it one step at a time, {profile.preferred_name}. "
                       f"Even small progress is still progress. 🌱",
                tone="gentle",
                call_to_action="What's one small thing you could accomplish right now?",
                optimal_timing="immediate"
            )

        elif strategy == MotivationStrategy.MOMENTUM_BUILDING:
            return MotivationalMessage(
                content=f"You're on fire, {profile.preferred_name}! "
                       f"{context.streak_days} days strong. Keep this energy going! 🔥",
                tone="energetic",
                call_to_action="What ambitious goal could you tackle next?",
                optimal_timing="during_peak_energy"
            )

        elif strategy == MotivationStrategy.GOAL_FOCUSED:
            progress_pct = (context.completed_goals / context.total_goals) * 100
            return MotivationalMessage(
                content=f"You're {progress_pct:.0f}% of the way to your goal! "
                       f"Each task completed brings you closer. 🎯",
                tone="focused",
                call_to_action="Which goal-aligned task will you tackle next?",
                optimal_timing="during_planning"
            )

        # ... other strategies
```

---

The Core Proxy Agents represent the heart of the Proxy Agent Platform, each bringing specialized AI capabilities to different aspects of productivity. Their collaborative design allows them to work together seamlessly, creating a comprehensive productivity enhancement system that adapts to each user's unique patterns and preferences.

Through continuous learning and adaptation, these agents become increasingly effective at helping users optimize their productivity, maintain focus, manage energy, and achieve their goals.
