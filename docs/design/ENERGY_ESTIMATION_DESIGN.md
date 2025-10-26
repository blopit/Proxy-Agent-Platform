# Energy Level Estimation System Design

## Executive Summary

Energy level estimation is **critical** for ADHD-optimized task management. By learning when users have high/medium/low energy, we can:
- Suggest deep-work tasks during peak energy times
- Recommend low-effort tasks during energy dips
- Prevent burnout by detecting overexertion patterns
- Optimize task scheduling for maximum productivity

---

## Current State Analysis

### What We Have Now ✅

From [temporal_models.py](src/knowledge/temporal_models.py):
```python
class EventLog(BaseModel):
    energy_level: Optional[EnergyLevel] = None  # high, medium, low
    day_of_week: Optional[int] = None
    hour_of_day: Optional[int] = None
```

**Problem**: Energy level is **optional** and **manually set**. We need automatic detection!

### What We're Missing ❌

1. **No passive data collection** - User must explicitly report energy
2. **No inference algorithms** - Can't estimate from behavior
3. **No baseline learning** - Don't know user's normal patterns
4. **No contextual factors** - Miss sleep, weather, calendar events
5. **No predictive models** - Can't forecast future energy

---

## Data Collection Strategy

### 1. Explicit Data (User-Reported)

#### A. Micro Check-ins (Low Friction)
**Frequency**: 2-3x per day at strategic times

**UI**: Simple emoji picker
```
How's your energy right now?
🔋⚡ High    🔋 Medium    🪫 Low
```

**Strategic timing**:
- Morning (9 AM): Capture baseline
- Afternoon (2 PM): Catch post-lunch dip
- Evening (6 PM): Track end-of-day fatigue

**Implementation**:
```python
class EnergyCheckIn(BaseModel):
    checkin_id: str
    user_id: str
    timestamp: datetime
    energy_level: EnergyLevel  # high, medium, low

    # Optional context
    location: Optional[str]  # home, office, commute
    mood: Optional[str]  # happy, stressed, anxious, calm
    sleep_quality: Optional[int]  # 1-5 rating (if morning)
```

**Storage**: Add to `kg_event_log` table:
```sql
INSERT INTO kg_event_log (
    event_type, user_id, energy_level,
    hour_of_day, day_of_week, metadata
) VALUES (
    'energy_checkin', 'alice', 'high',
    9, 1, '{"mood": "happy", "location": "home"}'
);
```

#### B. Task Completion Feedback
**When**: After completing a task

**UI**: Quick rating
```
How did that feel?
😊 Energizing    😐 Neutral    😴 Draining
```

**Schema**:
```python
class TaskCompletionFeedback(BaseModel):
    task_id: str
    completed_at: datetime
    energy_impact: str  # energizing, neutral, draining
    difficulty_perceived: int  # 1-5 scale
```

**Insight**: Track which tasks give energy vs. drain it
- Deep work might be draining but satisfying
- Admin tasks always draining
- Creative tasks energizing in mornings

### 2. Implicit Data (Behavioral Inference)

#### A. Task Completion Patterns
**What to track**:
```python
class TaskBehaviorMetrics:
    # Completion speed
    estimated_minutes: int
    actual_minutes: int
    speed_ratio: float  # actual/estimated

    # Completion time
    started_at: datetime
    completed_at: datetime
    hour_of_day: int
    day_of_week: int

    # Task switching
    switches_before_completion: int  # How many times user switched away
    interruptions: int

    # Micro-breaks
    pause_duration_seconds: int  # Time spent paused
```

**Energy indicators**:
- **High energy**: Fast completion, few switches, sustained focus
- **Medium energy**: Normal pace, some breaks
- **Low energy**: Slow completion, frequent switches, many pauses

**Example**:
```python
# User completes task in 15 minutes (estimated 30 min) at 9 AM
# → Inference: High energy at 9 AM on Mondays

# User takes 60 minutes (estimated 20 min) at 3 PM, 5 switches
# → Inference: Low energy at 3 PM, possibly post-lunch dip
```

#### B. Response Time Metrics
**What to track**:
```python
class ResponseTimeMetrics:
    # Interaction latency
    notification_to_open_seconds: float  # How fast they open app
    task_view_to_start_seconds: float  # How long to start task
    message_to_reply_seconds: float  # Chat response time

    # Session engagement
    session_duration_seconds: float
    actions_per_minute: float  # Clicks, taps, interactions
    scroll_speed: float  # Fast scrolling = high energy?
```

**Energy indicators**:
- **High energy**: Fast responses, high actions/min, long sessions
- **Low energy**: Slow responses, low engagement, short sessions

#### C. Voice Input Analysis
**What to track**:
```python
class VoiceMetrics:
    audio_duration_seconds: float
    words_per_minute: float  # Speech rate
    pause_frequency: float  # Hesitations
    volume_level: float  # Loud = energetic?
    clarity_score: float  # From speech-to-text confidence
```

**Energy indicators**:
- **High energy**: Fast speech, few pauses, clear enunciation
- **Low energy**: Slow speech, many pauses, mumbling

**Note**: Privacy-sensitive - only collect aggregated metrics, not raw audio

#### D. Device Activity Patterns
**What to track**:
```python
class DeviceActivityMetrics:
    # App usage
    app_switches_per_hour: int  # More switches = distraction?
    focus_app_duration_minutes: float  # Time in productivity apps
    social_media_duration_minutes: float  # Procrastination indicator?

    # Physical activity (if available)
    step_count: int  # From fitness tracker
    heart_rate: Optional[int]  # If user grants access

    # Screen time
    active_screen_time_hours: float
    passive_screen_time_hours: float  # Videos, scrolling
```

**Energy indicators**:
- **High energy**: Focused app usage, productivity apps, movement
- **Low energy**: App switching, social media, passive consumption

### 3. External Context Data

#### A. Sleep Data
**Sources**:
- Manual input: "How'd you sleep? 1-5"
- Sleep tracker integration (Apple Health, Fitbit, Oura Ring)
- Bedtime/wake time inference (first app activity)

**Schema**:
```python
class SleepMetrics:
    user_id: str
    date: date

    # Duration
    bedtime: Optional[datetime]
    wake_time: Optional[datetime]
    total_sleep_hours: float

    # Quality
    sleep_quality_rating: Optional[int]  # 1-5 self-reported
    interruptions: Optional[int]
    deep_sleep_percentage: Optional[float]  # From tracker

    # Next-day impact
    next_day_energy_prediction: float  # 0-1 probability of high energy
```

**Energy correlation**:
```python
# Strong correlation patterns:
# <6 hours sleep → 80% chance LOW energy next day
# 7-8 hours sleep → 60% chance HIGH energy next day
# >9 hours sleep → 50% chance MEDIUM energy (grogginess?)
```

#### B. Calendar Integration
**What to track**:
```python
class CalendarContext:
    user_id: str
    timestamp: datetime

    # Upcoming events
    next_event_minutes: Optional[int]  # Time until next meeting
    next_event_type: Optional[str]  # meeting, deadline, social
    meetings_today_count: int

    # Recent events
    just_finished_meeting: bool  # Within last 15 min
    meeting_duration_minutes: int
    meeting_type: str  # video_call, in_person, presentation
```

**Energy indicators**:
- **Post-meeting drain**: Energy drops after long/intense meetings
- **Pre-deadline surge**: Energy spike before deadlines
- **Meeting fatigue**: Multiple meetings → progressive energy decline

#### C. Time-of-Day Patterns
**What to track**:
```python
class CircadianContext:
    hour_of_day: int  # 0-23
    day_of_week: int  # 0-6
    week_of_month: int  # 1-5

    # Biological patterns
    is_morning_person: bool  # Learned from historical data
    peak_energy_hour: int  # User's personal peak time
    crash_energy_hour: int  # User's personal low time

    # Day context
    is_weekend: bool
    is_holiday: bool
    is_monday: bool  # Monday blues?
```

**Known patterns**:
- **Circadian rhythm**: Most people peak 9-11 AM, crash 2-4 PM
- **Ultradian rhythm**: 90-minute cycles (high → low → high)
- **Weekly pattern**: Monday low, Wednesday peak, Friday low
- **Monthly pattern**: Hormonal cycles affect energy (for some users)

#### D. Weather & Environment
**Sources**: Weather API, location services

**Schema**:
```python
class EnvironmentalContext:
    user_id: str
    timestamp: datetime

    # Weather
    temperature_f: float
    condition: str  # sunny, cloudy, rainy, snowy
    air_quality_index: int  # AQI
    humidity_percentage: float

    # Location
    location_type: str  # home, office, outdoors, transit
    noise_level: Optional[str]  # quiet, moderate, loud
    lighting: Optional[str]  # natural, artificial, dim
```

**Energy correlation**:
- **Sunny days**: +10% energy boost
- **Rainy/gray days**: -15% energy (SAD effect)
- **Poor air quality**: -20% energy (hypoxia)
- **Temperature extremes**: -10% energy (discomfort)

---

## Knowledge Graph Schema Extensions

### 1. Energy Profile Entity

Create user-specific energy baseline:

```sql
CREATE TABLE kg_energy_profiles (
    profile_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,

    -- Baseline characteristics
    chronotype TEXT CHECK(chronotype IN ('morning_lark', 'night_owl', 'neither')),
    peak_energy_hour INT CHECK(peak_energy_hour >= 0 AND peak_energy_hour <= 23),
    crash_energy_hour INT CHECK(crash_energy_hour >= 0 AND crash_energy_hour <= 23),

    -- Average patterns (learned from history)
    avg_morning_energy REAL CHECK(avg_morning_energy >= 0 AND avg_morning_energy <= 1),
    avg_afternoon_energy REAL CHECK(avg_afternoon_energy >= 0 AND avg_afternoon_energy <= 1),
    avg_evening_energy REAL CHECK(avg_evening_energy >= 0 AND avg_evening_energy <= 1),

    -- Weekly patterns
    monday_energy_factor REAL DEFAULT 0.8,    -- Monday blues
    tuesday_energy_factor REAL DEFAULT 0.9,
    wednesday_energy_factor REAL DEFAULT 1.0,  -- Peak
    thursday_energy_factor REAL DEFAULT 0.95,
    friday_energy_factor REAL DEFAULT 0.85,   -- Friday fatigue
    saturday_energy_factor REAL DEFAULT 0.9,
    sunday_energy_factor REAL DEFAULT 0.85,   -- Sunday scaries

    -- Personal thresholds
    high_energy_threshold REAL DEFAULT 0.7,
    medium_energy_threshold REAL DEFAULT 0.4,

    -- Confidence metrics
    sample_count INT DEFAULT 0,  -- How many data points used
    confidence_score REAL DEFAULT 0.5,  -- How confident we are

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_energy_profile_user ON kg_energy_profiles(user_id);
```

### 2. Energy Snapshots (Time Series)

Track energy over time:

```sql
CREATE TABLE kg_energy_snapshots (
    snapshot_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,

    -- Observed/inferred energy
    energy_level TEXT CHECK(energy_level IN ('high', 'medium', 'low')),
    energy_score REAL CHECK(energy_score >= 0 AND energy_score <= 1),

    -- Data source
    source TEXT CHECK(source IN ('explicit', 'inferred', 'predicted')),
    confidence REAL CHECK(confidence >= 0 AND confidence <= 1),

    -- Context snapshot
    hour_of_day INT,
    day_of_week INT,
    location TEXT,

    -- Contributing factors (JSON)
    factors TEXT,  -- {"sleep_hours": 7, "meetings_today": 3, "weather": "rainy"}

    -- Temporal context
    since_last_break_minutes INT,
    since_woke_up_hours REAL,
    tasks_completed_today INT,

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_energy_snapshot_user_time ON kg_energy_snapshots(user_id, timestamp);
CREATE INDEX idx_energy_snapshot_level ON kg_energy_snapshots(user_id, energy_level, timestamp);
```

### 3. Energy Factors (Correlation Tracking)

Track what affects energy:

```sql
CREATE TABLE kg_energy_factors (
    factor_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,

    -- Factor definition
    factor_type TEXT NOT NULL,  -- sleep, meeting, weather, task_type
    factor_name TEXT NOT NULL,  -- hours_slept, post_meeting, rainy_day, deep_work

    -- Statistical correlation
    correlation_coefficient REAL,  -- -1 to 1 (Pearson correlation)
    sample_count INT,
    confidence REAL,

    -- Effect quantification
    avg_energy_impact REAL,  -- Average change in energy score

    -- Significance
    is_significant BOOL DEFAULT FALSE,
    p_value REAL,  -- Statistical significance

    -- Temporal validity
    learned_from_date DATE,
    learned_to_date DATE,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, factor_type, factor_name)
);

CREATE INDEX idx_energy_factors_user ON kg_energy_factors(user_id);
CREATE INDEX idx_energy_factors_correlation ON kg_energy_factors(user_id, correlation_coefficient DESC);
```

Example data:
```sql
INSERT INTO kg_energy_factors VALUES (
    'ef-1', 'alice',
    'sleep', 'hours_slept',
    0.72,  -- Strong positive correlation
    150,   -- 150 data points
    0.95,  -- High confidence
    0.15,  -- +15% energy per hour of sleep
    TRUE,
    0.001,  -- Highly significant (p < 0.001)
    '2025-01-01', '2025-10-23',
    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
);
```

### 4. Energy Predictions (ML Model Outputs)

Store predictions for proactive scheduling:

```sql
CREATE TABLE kg_energy_predictions (
    prediction_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,

    -- Prediction target
    predicted_timestamp TIMESTAMP NOT NULL,
    predicted_energy_level TEXT CHECK(predicted_energy_level IN ('high', 'medium', 'low')),
    predicted_energy_score REAL CHECK(predicted_energy_score >= 0 AND predicted_energy_score <= 1),

    -- Model metadata
    model_version TEXT,  -- v1.0, v2.0
    prediction_made_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confidence REAL,

    -- Input features (JSON)
    features TEXT,  -- {"sleep_hours": 7, "meetings_scheduled": 2, "weather_forecast": "sunny"}

    -- Validation (after the fact)
    actual_energy_level TEXT,
    actual_energy_score REAL,
    prediction_error REAL,

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_energy_predictions_user_time ON kg_energy_predictions(user_id, predicted_timestamp);
CREATE INDEX idx_energy_predictions_validation ON kg_energy_predictions(user_id, actual_energy_level);
```

---

## Temporal Graph Relationships

### Energy Flow Graph

Model how energy changes over time and with events:

```
[Energy State A] --[trigger_event]--> [Energy State B]
```

Example:
```
[High Energy 9AM] --[1hr meeting]--> [Medium Energy 10AM]
[Medium Energy 10AM] --[completed task]--> [High Energy 10:30AM]
[High Energy 2PM] --[no lunch]--> [Low Energy 3PM]
```

**Schema**:
```sql
CREATE TABLE kg_energy_transitions (
    transition_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,

    -- States
    from_energy_level TEXT,
    to_energy_level TEXT,
    from_timestamp TIMESTAMP,
    to_timestamp TIMESTAMP,
    duration_minutes INT,

    -- Trigger event
    trigger_event_type TEXT,  -- meeting, task_completed, break, meal
    trigger_event_id TEXT,

    -- Magnitude
    energy_change REAL,  -- Delta in energy score

    -- Pattern detection
    is_recurring BOOL DEFAULT FALSE,
    recurrence_pattern TEXT,  -- daily_2pm_crash, post_meeting_boost

    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE INDEX idx_energy_transitions_user ON kg_energy_transitions(user_id);
CREATE INDEX idx_energy_transitions_pattern ON kg_energy_transitions(user_id, is_recurring);
```

---

## Energy Estimation Algorithms

### 1. Baseline Algorithm (v1.0 - Simple)

**Input**: Time of day, day of week
**Output**: Energy estimate (0-1 score)

```python
def estimate_energy_baseline(user_id: str, timestamp: datetime) -> float:
    """
    Simple baseline using time-of-day patterns.

    Returns energy score 0-1 based on typical circadian rhythm.
    """
    profile = get_energy_profile(user_id)
    hour = timestamp.hour
    day = timestamp.weekday()

    # Time-of-day factor (circadian rhythm)
    if 6 <= hour < 9:
        time_factor = 0.7  # Rising energy
    elif 9 <= hour < 12:
        time_factor = 0.9  # Peak morning
    elif 12 <= hour < 14:
        time_factor = 0.7  # Post-lunch dip
    elif 14 <= hour < 17:
        time_factor = 0.6  # Afternoon slump
    elif 17 <= hour < 20:
        time_factor = 0.5  # Evening fatigue
    else:
        time_factor = 0.3  # Night time

    # Day-of-week factor
    day_factors = [0.8, 0.9, 1.0, 0.95, 0.85, 0.9, 0.85]  # Mon-Sun
    day_factor = day_factors[day]

    # Personal adjustment
    if profile.chronotype == 'night_owl':
        if hour >= 20:
            time_factor += 0.2  # Night owls energized at night
        if hour < 9:
            time_factor -= 0.2  # Sluggish in morning

    # Combine factors
    energy_score = time_factor * day_factor
    return max(0.0, min(1.0, energy_score))
```

### 2. Context-Aware Algorithm (v2.0 - Intermediate)

**Input**: Time + Recent activity + Sleep + Calendar
**Output**: Energy estimate with confidence

```python
def estimate_energy_contextual(
    user_id: str,
    timestamp: datetime,
    context: dict
) -> tuple[float, float]:
    """
    Context-aware energy estimation.

    Returns: (energy_score, confidence)
    """
    # Start with baseline
    base_score = estimate_energy_baseline(user_id, timestamp)
    confidence = 0.6  # Base confidence

    # Apply context modifiers
    score = base_score

    # Sleep factor
    if 'sleep_hours' in context:
        sleep = context['sleep_hours']
        if sleep < 6:
            score *= 0.7  # Significant penalty
            confidence += 0.2  # More confident
        elif sleep >= 7 and sleep <= 8:
            score *= 1.1  # Slight boost
            confidence += 0.15

    # Recent meetings
    if context.get('just_finished_meeting'):
        duration = context.get('meeting_duration_minutes', 60)
        if duration > 60:
            score *= 0.8  # Draining long meetings
        if context.get('meeting_type') == 'presentation':
            score *= 0.7  # Presentations are exhausting

    # Tasks completed today
    tasks_done = context.get('tasks_completed_today', 0)
    if tasks_done > 5:
        score *= 0.9  # Fatigue from high productivity

    # Time since last break
    if context.get('since_last_break_minutes', 0) > 120:
        score *= 0.85  # Need a break!

    # Calendar pressure
    if context.get('next_deadline_hours', 100) < 2:
        score *= 1.15  # Deadline adrenaline boost
        confidence += 0.1

    # Clamp and return
    score = max(0.0, min(1.0, score))
    confidence = min(0.95, confidence)

    return score, confidence
```

### 3. ML-Based Algorithm (v3.0 - Advanced)

**Input**: Full feature vector
**Model**: Gradient Boosted Trees or Neural Network
**Output**: Energy prediction with uncertainty

```python
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor

class EnergyMLPredictor:
    """ML-based energy level predictor"""

    def __init__(self):
        self.model = GradientBoostingRegressor(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1
        )
        self.feature_names = [
            # Temporal
            'hour_of_day', 'day_of_week', 'week_of_month',
            'is_weekend', 'is_monday',

            # Sleep
            'sleep_hours', 'sleep_quality',
            'hours_since_woke',

            # Activity
            'tasks_completed_today', 'meetings_today',
            'since_last_break_minutes',
            'current_task_duration_minutes',

            # Behavioral
            'avg_response_time_seconds',
            'app_switches_last_hour',
            'actions_per_minute',

            # Calendar
            'next_meeting_minutes',
            'meetings_remaining_today',
            'next_deadline_hours',

            # Environmental
            'is_sunny', 'temperature_f',
            'air_quality_index',

            # Historical
            'avg_energy_this_hour_last_7days',
            'energy_30min_ago',
            'energy_trend',  # Rising or falling?
        ]

    def extract_features(
        self,
        user_id: str,
        timestamp: datetime,
        context: dict
    ) -> np.ndarray:
        """Extract feature vector from context"""
        features = []

        # Temporal features
        features.append(timestamp.hour)
        features.append(timestamp.weekday())
        features.append((timestamp.day - 1) // 7 + 1)
        features.append(1 if timestamp.weekday() >= 5 else 0)
        features.append(1 if timestamp.weekday() == 0 else 0)

        # Sleep features
        features.append(context.get('sleep_hours', 7))
        features.append(context.get('sleep_quality', 3) / 5)
        features.append(context.get('hours_since_woke', 2))

        # Activity features
        features.append(context.get('tasks_completed_today', 0))
        features.append(context.get('meetings_today', 0))
        features.append(context.get('since_last_break_minutes', 30))
        features.append(context.get('current_task_duration_minutes', 0))

        # Behavioral features
        features.append(context.get('avg_response_time_seconds', 5))
        features.append(context.get('app_switches_last_hour', 10))
        features.append(context.get('actions_per_minute', 2))

        # Calendar features
        features.append(context.get('next_meeting_minutes', 999))
        features.append(context.get('meetings_remaining_today', 0))
        features.append(context.get('next_deadline_hours', 999))

        # Environmental features
        features.append(1 if context.get('weather') == 'sunny' else 0)
        features.append(context.get('temperature_f', 70))
        features.append(context.get('air_quality_index', 50))

        # Historical features (from database)
        features.append(get_avg_energy_this_hour(user_id, timestamp))
        features.append(get_energy_30min_ago(user_id, timestamp))
        features.append(get_energy_trend(user_id, timestamp))

        return np.array(features).reshape(1, -1)

    def predict(
        self,
        user_id: str,
        timestamp: datetime,
        context: dict
    ) -> tuple[float, float]:
        """
        Predict energy level with uncertainty.

        Returns: (energy_score, confidence)
        """
        features = self.extract_features(user_id, timestamp, context)

        # Predict
        energy_score = self.model.predict(features)[0]

        # Estimate confidence using model's estimators
        predictions = np.array([
            estimator.predict(features)[0]
            for estimator in self.model.estimators_[:, 0]
        ])
        variance = np.var(predictions)
        confidence = 1.0 / (1.0 + variance)  # High variance = low confidence

        return float(energy_score), float(confidence)

    def train(self, training_data: list[tuple]):
        """
        Train model on historical data.

        Args:
            training_data: List of (features, label) tuples
        """
        X = np.array([features for features, _ in training_data])
        y = np.array([label for _, label in training_data])

        self.model.fit(X, y)
```

**Training Data Collection**:
```python
def collect_training_data(user_id: str, days_back: int = 90) -> list:
    """
    Collect training data from historical energy snapshots.

    Returns list of (features, label) tuples for ML training.
    """
    snapshots = get_energy_snapshots(user_id, days_back=days_back)

    training_data = []
    for snapshot in snapshots:
        # Get context at that time
        context = json.loads(snapshot.factors)

        # Extract features
        features = extract_features(user_id, snapshot.timestamp, context)

        # Label is the actual energy score
        label = snapshot.energy_score

        training_data.append((features, label))

    return training_data
```

---

## Implementation Phases

### Phase 1: Data Collection (Weeks 1-2)

**Goal**: Start gathering baseline data

**Tasks**:
1. Add energy check-in UI (emoji picker)
2. Implement `kg_energy_snapshots` table
3. Auto-log energy from task completions
4. Capture implicit signals (response time, completion speed)

**Deliverables**:
- 3 daily check-ins per user
- Task completion metrics logged
- Behavioral data captured

### Phase 2: Baseline Learning (Weeks 3-4)

**Goal**: Build user energy profiles

**Tasks**:
1. Implement `kg_energy_profiles` table
2. Calculate time-of-day averages
3. Detect chronotype (morning person vs. night owl)
4. Implement v1.0 baseline algorithm

**Deliverables**:
- Personal energy profile for each user
- Basic energy prediction (time-based)
- Dashboard showing energy patterns

### Phase 3: Context Integration (Weeks 5-8)

**Goal**: Add context-aware prediction

**Tasks**:
1. Integrate sleep tracking (manual or API)
2. Connect calendar for meeting context
3. Add weather API integration
4. Implement v2.0 contextual algorithm

**Deliverables**:
- Sleep-aware energy prediction
- Meeting fatigue detection
- Weather impact modeling

### Phase 4: ML Training (Weeks 9-12)

**Goal**: Build ML-powered prediction

**Tasks**:
1. Collect 90+ days of training data
2. Train gradient boosting model
3. Implement v3.0 ML predictor
4. Add confidence intervals

**Deliverables**:
- ML model predicting energy 4 hours ahead
- Feature importance analysis
- A/B test vs. baseline

### Phase 5: Proactive Features (Weeks 13-16)

**Goal**: Use predictions for smart scheduling

**Tasks**:
1. Predict tomorrow's energy curve
2. Suggest optimal task times
3. Warn about overload risk
4. Auto-schedule based on energy

**Deliverables**:
- "Best time to do this" suggestions
- "You'll be low energy at 3 PM - schedule a break"
- Auto-reschedule low-energy tasks

---

## Privacy & Ethics

### Data Minimization
- Only collect what's needed
- Aggregate metrics, not raw data (e.g., WPM, not audio)
- Local processing where possible

### User Control
- Opt-in for each data source
- Clear explanations of what's collected
- Easy opt-out at any time
- Export/delete all data

### Transparency
- Show which factors affect predictions
- Explain model decisions
- Let users correct predictions
- Display confidence levels

### Security
- Encrypt sensitive health data
- No sharing with third parties
- Comply with HIPAA/GDPR
- Regular security audits

---

## Success Metrics

### Data Quality
- **Coverage**: 80%+ of work hours have energy data
- **Accuracy**: User-reported matches predicted 75%+ of time
- **Latency**: Predictions updated within 5 minutes

### Model Performance
- **MAE**: Mean Absolute Error < 0.15 (on 0-1 scale)
- **Calibration**: Predicted confidence matches actual accuracy
- **Personalization**: Per-user models outperform global model by 25%+

### User Impact
- **Task completion**: 20% increase in task completion during high-energy periods
- **Burnout reduction**: 30% fewer "overwhelmed" days
- **User satisfaction**: 4.5+ star rating on energy features

---

## Conclusion

Energy level estimation requires:

1. **Multi-modal data collection**:
   - Explicit check-ins (low friction)
   - Behavioral inference (passive)
   - External context (sleep, weather, calendar)

2. **Temporal knowledge graph extensions**:
   - Energy profiles (baseline patterns)
   - Energy snapshots (time series)
   - Energy factors (correlation tracking)
   - Energy predictions (forecasting)

3. **Progressive algorithms**:
   - v1.0: Time-based baseline
   - v2.0: Context-aware
   - v3.0: ML-powered

4. **Privacy-first approach**:
   - User control
   - Data minimization
   - Transparency
   - Security

**Timeline**: 16 weeks from data collection to ML-powered predictions

**ROI**: Better energy estimation → 20-30% productivity boost for ADHD users

---

**Status**: Design complete, ready for implementation
**Next step**: Phase 1 - Data collection infrastructure
