# Energy Tracking API

**Service**: Energy Management
**Base Path**: `/api/v1/energy`
**File**: `src/api/energy.py`
**Authentication**: Not required for `/current-level`

## Overview

The Energy Tracking API provides circadian rhythm analysis, energy level monitoring, and optimization recommendations. It helps users match tasks to their energy levels throughout the day.

## Endpoints

### 1. Get Current Energy Level

**Mobile-optimized endpoint** for quick energy readings.

```http
GET /api/v1/energy/current-level?user_id={user_id}
```

#### Request

**Query Parameters:**
- `user_id` (string, optional): User identifier (default: "mobile-user")

**Example:**
```bash
curl "http://localhost:8000/api/v1/energy/current-level?user_id=mobile-user"
```

#### Response

```json
{
  "energy_level": 8.0,
  "user_id": "mobile-user",
  "timestamp": "2025-10-23T11:30:00",
  "message": "Energy level: 8.0/10 (circadian estimate)"
}
```

**Response Fields:**
- `energy_level` (float): Current energy level (0-10 scale)
- `user_id` (string): User identifier
- `timestamp` (string): ISO 8601 timestamp
- `message` (string): Human-readable energy description

#### Circadian Algorithm

Energy levels are estimated based on time of day:

| Time Range | Base Energy | Phase |
|------------|-------------|-------|
| 06:00-09:00 | 6.5/10 | Morning rise |
| 09:00-12:00 | 8.0/10 | ⚡ Peak morning |
| 12:00-14:00 | 5.5/10 | Post-lunch dip |
| 14:00-17:00 | 7.0/10 | Afternoon recovery |
| 17:00-20:00 | 6.0/10 | Evening |
| 20:00-23:00 | 4.5/10 | Night wind-down |
| 23:00-06:00 | 3.0/10 | Late night/early morning |

#### Frontend Integration

**TypeScript Interface:**
```typescript
export interface EnergyData {
  energy_level: number; // 0-10 scale
  user_id?: string;
  timestamp?: string;
  message?: string;
  // Legacy fields (optional)
  current_level?: number;
  predicted_level?: number;
  trend?: 'rising' | 'falling' | 'stable';
}
```

**Usage Example:**
```typescript
import { apiClient } from '@/lib/api';

// Fetch current energy
const energy = await apiClient.getEnergyLevel('mobile-user');

// Convert to percentage for UI (0-100%)
const energyPercentage = Math.round(energy.energy_level * 10);
console.log(`Energy: ${energyPercentage}%`);

// Display in UI
setEnergy(energyPercentage); // e.g., 80%
```

**React Hook Example:**
```typescript
const useEnergyLevel = (userId: string) => {
  const [energy, setEnergy] = useState(72); // Default
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnergy = async () => {
      try {
        const data = await apiClient.getEnergyLevel(userId);
        const percentage = Math.round(data.energy_level * 10);
        setEnergy(percentage);
      } catch (error) {
        console.warn('Energy endpoint unavailable, using default');
      } finally {
        setLoading(false);
      }
    };

    fetchEnergy();
    const interval = setInterval(fetchEnergy, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [userId]);

  return { energy, loading };
};
```

---

### 2. Track Energy Reading

Record detailed energy data with contextual factors.

```http
POST /api/v1/energy/track
```

#### Request

**Headers:**
- `Authorization: Bearer {token}` (required)
- `Content-Type: application/json`

**Body:**
```json
{
  "user_id": "user123",
  "context_description": "Just finished lunch, feeling sluggish",
  "sleep_quality": 7,
  "stress_level": 5,
  "last_meal_time": "12:30",
  "hydration_level": 6,
  "physical_activity": "sedentary"
}
```

**Request Fields:**
- `user_id` (string, required): User identifier
- `context_description` (string, optional): Current state description
- `sleep_quality` (int, optional): Sleep quality (1-10)
- `stress_level` (int, optional): Stress level (1-10)
- `last_meal_time` (string, optional): Time of last meal (HH:MM)
- `hydration_level` (int, optional): Hydration (1-10)
- `physical_activity` (string, optional): Activity level (sedentary, light, moderate, vigorous)

#### Response

```json
{
  "energy_level": 6.2,
  "trend": "declining",
  "primary_factors": [
    "Post-meal fatigue",
    "Low hydration",
    "Sedentary activity"
  ],
  "predicted_next_hour": 5.8,
  "confidence": 0.85,
  "immediate_recommendations": [
    "Drink 16oz water",
    "Take a 5-minute walk",
    "Consider light stretching"
  ],
  "message": "Energy declining due to post-meal fatigue"
}
```

---

### 3. Get Energy Optimization

Get personalized strategies to improve energy levels.

```http
POST /api/v1/energy/optimize
```

#### Request

**Body:**
```json
{
  "user_id": "user123",
  "current_energy": 4.5,
  "target_energy": 7.0,
  "time_available": 15
}
```

#### Response

```json
{
  "immediate_actions": [
    "Drink cold water",
    "Step outside for natural light",
    "Do 10 jumping jacks"
  ],
  "nutritional_advice": [
    "Eat protein-rich snack",
    "Avoid sugar crash foods",
    "Stay hydrated"
  ],
  "environmental_changes": [
    "Increase room lighting",
    "Open window for fresh air",
    "Reduce ambient noise"
  ],
  "lifestyle_recommendations": [
    "Schedule tasks during peak hours",
    "Take regular movement breaks",
    "Maintain consistent sleep schedule"
  ],
  "expected_improvement": 2.0,
  "timeframe_minutes": 15,
  "message": "Follow these steps to boost energy by 2 points"
}
```

---

### 4. Circadian Analysis

Analyze circadian rhythm patterns over time.

```http
GET /api/v1/energy/circadian-analysis?user_id={user_id}
```

#### Request

**Query Parameters:**
- `user_id` (string, required): User identifier
- `days` (int, optional): Days to analyze (default: 7)

#### Response

```json
{
  "peak_energy_hours": ["09:00-11:00", "14:00-16:00"],
  "low_energy_hours": ["13:00-14:00", "20:00-21:00"],
  "chronotype": "moderate_morning",
  "energy_variability": 2.3,
  "recommendations": [
    "Schedule complex tasks at 09:00-11:00",
    "Avoid meetings during 13:00-14:00 dip",
    "Consider power nap at 14:00"
  ],
  "weekly_pattern": {
    "Monday": [7.5, 8.0, 6.0, 7.0, 5.5],
    "Tuesday": [7.0, 7.5, 5.5, 6.5, 5.0]
  },
  "message": "You're a moderate morning person"
}
```

---

### 5. Task-Energy Matching

Match tasks to optimal energy levels.

```http
POST /api/v1/energy/task-matching
```

#### Request

```json
{
  "user_id": "user123",
  "current_energy": 7.5,
  "tasks": [
    {
      "task_id": "task_1",
      "title": "Write documentation",
      "complexity": "medium",
      "estimated_hours": 2
    },
    {
      "task_id": "task_2",
      "title": "Review email",
      "complexity": "low",
      "estimated_hours": 0.5
    }
  ]
}
```

#### Response

```json
{
  "matched_tasks": [
    {
      "task_id": "task_1",
      "match_score": 0.92,
      "energy_requirement": 7.0,
      "optimal_time": "now",
      "reasoning": "High energy supports creative work"
    },
    {
      "task_id": "task_2",
      "match_score": 0.65,
      "energy_requirement": 4.0,
      "optimal_time": "afternoon_dip",
      "reasoning": "Low-energy task, save for later"
    }
  ],
  "recommended_order": ["task_1", "task_2"],
  "message": "Complete task_1 now while energy is high"
}
```

---

### 6. Energy Recovery Plan

Get personalized recovery strategies.

```http
POST /api/v1/energy/recovery-plan
```

#### Request

```json
{
  "user_id": "user123",
  "current_energy": 3.0,
  "recovery_goal": "moderate",
  "time_constraints": 30
}
```

#### Response

```json
{
  "recovery_steps": [
    {
      "duration_minutes": 10,
      "activity": "Power nap",
      "expected_boost": 2.0
    },
    {
      "duration_minutes": 5,
      "activity": "Light stretching",
      "expected_boost": 0.5
    },
    {
      "duration_minutes": 15,
      "activity": "Mindful breathing",
      "expected_boost": 1.0
    }
  ],
  "total_recovery_time": 30,
  "expected_final_energy": 6.5,
  "alternative_strategies": [
    "20-minute walk outside",
    "Cold shower",
    "Healthy snack + hydration"
  ],
  "message": "Complete recovery plan for 3.5 point boost"
}
```

---

## Error Codes

| Status Code | Error | Description |
|-------------|-------|-------------|
| 200 | Success | Request successful |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Missing/invalid auth token |
| 404 | Not Found | Endpoint not found |
| 500 | Internal Error | Server error (fallback values returned) |

## Rate Limiting

- No rate limiting on `/current-level` (mobile endpoint)
- Other endpoints: 100 requests/minute per user

## Caching

- `/current-level`: Updates every minute (safe to cache for 60s)
- `/circadian-analysis`: Updates daily (safe to cache for 24h)

## Best Practices

1. **Fetch on mount + periodic updates**
   ```typescript
   useEffect(() => {
     fetchEnergy();
     const interval = setInterval(fetchEnergy, 60000); // Every minute
     return () => clearInterval(interval);
   }, []);
   ```

2. **Convert 0-10 scale to percentage**
   ```typescript
   const percentage = Math.round(energy_level * 10); // 8.0 → 80%
   ```

3. **Handle errors gracefully**
   ```typescript
   try {
     const energy = await apiClient.getEnergyLevel(userId);
   } catch (error) {
     console.warn('Using default energy level');
     setEnergy(72); // Reasonable default
   }
   ```

4. **Use energy for UI decisions**
   ```typescript
   if (energy > 70) {
     // Show high-energy task suggestions
   } else if (energy < 40) {
     // Suggest break/recovery
   }
   ```

## Related Endpoints

- **[Progress Tracking](./06-progress.md)** - Track task completion based on energy
- **[Task Management](./01-tasks.md)** - Filter tasks by energy requirements
- **[Focus Management](./03-focus.md)** - Start focus sessions at peak energy

---

**Last Updated**: 2025-10-23
**Version**: 1.0.0
**Status**: ✅ Production Ready
