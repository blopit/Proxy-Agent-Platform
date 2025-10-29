# BE-13: ML Training Pipeline

**Delegation Mode**: ⚙️ DELEGATE
**Estimated Time**: 7-8 hours
**Dependencies**: BE-05 (Task Splitting), BE-06 (Analytics)
**Agent Type**: backend-tdd

## 📋 Overview
Build ML pipeline to learn user patterns and improve task suggestions, energy predictions, and optimal scheduling.

## 🗄️ Database Schema
```sql
CREATE TABLE ml_models (
    model_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_type VARCHAR(50) NOT NULL,  -- 'energy_prediction', 'task_suggester'
    version VARCHAR(20) NOT NULL,
    model_data BYTEA,  -- Serialized model
    accuracy_score DECIMAL(5,4),
    training_samples INT,
    trained_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT false
);

CREATE TABLE training_data (
    data_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    feature_vector JSONB NOT NULL,
    label VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE model_predictions (
    prediction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES ml_models(model_id),
    user_id VARCHAR(255) NOT NULL,
    prediction_type VARCHAR(50) NOT NULL,
    prediction_value JSONB NOT NULL,
    confidence_score DECIMAL(5,4),
    was_correct BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🏗️ Models
```python
class TrainingDataCreate(BaseModel):
    user_id: str
    features: Dict[str, Any]  # Time, day, recent completions, etc.
    label: str  # Actual outcome

class EnergyPredictionRequest(BaseModel):
    user_id: str
    target_time: datetime
    recent_activity: Dict[str, Any]

class EnergyPredictionResponse(BaseModel):
    predicted_energy: Literal["low", "medium", "high"]
    confidence: Decimal
    recommended_tasks: List[str]  # Task types suitable for energy level

class TaskSuggestion(BaseModel):
    task_id: UUID
    task_title: str
    match_score: Decimal  # How well it fits current energy/time
    reasoning: str
```

## 🔬 ML Implementation (Scikit-learn)
```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib

class EnergyPredictor:
    """Predict user energy level based on time and patterns."""

    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100)
        self.scaler = StandardScaler()

    def prepare_features(self, user_data: Dict) -> np.array:
        """Extract features from user data."""
        features = [
            user_data['hour_of_day'],
            user_data['day_of_week'],
            user_data['tasks_completed_today'],
            user_data['avg_energy_last_7_days'],
            user_data['sleep_quality'],  # If available
        ]
        return np.array(features).reshape(1, -1)

    def train(self, training_data: List[TrainingDataCreate]):
        """Train model on historical data."""
        X = [self.prepare_features(d.features) for d in training_data]
        y = [d.label for d in training_data]

        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)

    def predict(self, user_data: Dict) -> Tuple[str, float]:
        """Predict energy level."""
        features = self.prepare_features(user_data)
        features_scaled = self.scaler.transform(features)

        prediction = self.model.predict(features_scaled)[0]
        confidence = self.model.predict_proba(features_scaled).max()

        return prediction, confidence

    def save(self, path: str):
        """Serialize model to disk."""
        joblib.dump({'model': self.model, 'scaler': self.scaler}, path)

    @classmethod
    def load(cls, path: str):
        """Load model from disk."""
        data = joblib.load(path)
        instance = cls()
        instance.model = data['model']
        instance.scaler = data['scaler']
        return instance
```

## 🌐 API Routes
```python
@router.post("/ml/train/energy-predictor")
async def train_energy_model(user_id: str):
    """Trigger training for user-specific energy prediction model."""
    pass

@router.post("/ml/predict/energy", response_model=EnergyPredictionResponse)
async def predict_energy(request: EnergyPredictionRequest):
    """Predict user energy level at target time."""
    pass

@router.post("/ml/suggest/tasks", response_model=List[TaskSuggestion])
async def suggest_tasks(user_id: str, current_energy: str):
    """Suggest best tasks for current energy level."""
    pass

@router.post("/ml/feedback")
async def record_prediction_feedback(
    prediction_id: UUID,
    was_correct: bool
):
    """Record whether prediction was accurate (for retraining)."""
    pass
```

## 🧪 Tests
- Model trains without errors
- Predictions return valid energy levels
- Confidence scores are between 0-1
- Feedback loop updates model accuracy
- Model serialization/deserialization works

## ✅ Acceptance Criteria
- [ ] Energy prediction model trains on user data
- [ ] Predictions have >60% accuracy after 50 data points
- [ ] Task suggestions adapt to energy level
- [ ] Models improve with feedback
- [ ] Models can be saved and loaded
- [ ] 90%+ test coverage (ML code complex)
