# Gamification API

**Service**: User Engagement & Gamification
**Base Path**: `/api/v1/gamification`
**File**: `src/api/gamification.py`
**Authentication**: Not required for `/user-stats`

## Overview

The Gamification API provides user engagement tracking, achievement systems, leaderboards, and behavioral analytics. It powers the mobile interface stats display (XP, level, streaks).

## Endpoints

### 1. Get User Stats (Mobile)

**Mobile-optimized endpoint** for user engagement analytics.

```http
GET /api/v1/gamification/user-stats?user_id={user_id}
```

#### Request

**Query Parameters:**
- `user_id` (string, required): User identifier

**Example:**
```bash
curl "http://localhost:8000/api/v1/gamification/user-stats?user_id=mobile-user"
```

#### Response

```json
{
  "engagement_score": 7.5,
  "active_days_streak": 12,
  "participation_rate": 0.85,
  "achievement_completion_rate": 0.65,
  "engagement_trends": {
    "trend": "improving",
    "peak_times": ["09:00-11:00", "14:00-16:00"]
  },
  "insights": [
    "Great momentum! You're on a 12-day streak",
    "Morning sessions show highest productivity",
    "Consider scheduling complex tasks at peak times"
  ],
  "message": "📈 Engagement Score: 7.5/10"
}
```

**Response Fields:**
- `engagement_score` (float): Overall engagement (0-10 scale)
- `active_days_streak` (int): Consecutive days with activity
- `participation_rate` (float): Engagement rate (0-1 scale)
- `achievement_completion_rate` (float): Achievements completed (0-1 scale)
- `engagement_trends` (object): Trend analysis and peak times
- `insights` (array): Personalized recommendations
- `message` (string): Summary message

#### Frontend Integration

**TypeScript Interface:**
```typescript
export interface GamificationStats {
  engagement_score: number; // 0-10 scale
  active_days_streak: number;
  participation_rate: number; // 0-1 scale
  achievement_completion_rate: number; // 0-1 scale
  engagement_trends: {
    trend: 'improving' | 'stable' | 'declining';
    peak_times: string[];
  };
  insights: string[];
  message: string;
}
```

**Usage Example:**
```typescript
import { apiClient } from '@/lib/api';

// Fetch user stats
const stats = await apiClient.getProgressStats('mobile-user');

// Map to UI state
setLevel(Math.floor(stats.engagement_score) || 1); // 7.5 → Level 7
setStreakDays(stats.active_days_streak); // 12 days
setXp(Math.floor(stats.engagement_score * 1000)); // 7500 XP estimate
```

**React Component Example:**
```typescript
const UserStatsDisplay = ({ userId }: { userId: string }) => {
  const [stats, setStats] = useState<GamificationStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.getProgressStats(userId);
        setStats(data);
      } catch (error) {
        console.warn('Stats unavailable, using defaults');
      }
    };

    fetchStats();
  }, [userId]);

  if (!stats) return <Loading />;

  return (
    <div>
      <h2>Level {Math.floor(stats.engagement_score)}</h2>
      <p>🔥 {stats.active_days_streak} day streak</p>
      <p>Engagement: {Math.round(stats.participation_rate * 100)}%</p>
      {stats.insights.map(insight => (
        <p key={insight}>💡 {insight}</p>
      ))}
    </div>
  );
};
```

---

### 2. Track Achievement Progress

Update user progress on achievements.

```http
POST /api/v1/gamification/achievement-progress
```

#### Request

**Headers:**
- `Authorization: Bearer {token}` (required)
- `Content-Type: application/json`

**Body:**
```json
{
  "user_id": "user123",
  "achievement_id": "task_master_100",
  "progress": 75,
  "metadata": {
    "tasks_completed": 75,
    "tasks_required": 100
  }
}
```

#### Response

```json
{
  "achievement_id": "task_master_100",
  "progress": 75,
  "completed": false,
  "xp_earned": 0,
  "rewards_unlocked": [],
  "next_milestone": 100,
  "message": "75/100 tasks completed - keep going!"
}
```

---

### 3. Get User Achievements

Retrieve all user achievements.

```http
GET /api/v1/gamification/achievements?user_id={user_id}
```

#### Request

**Query Parameters:**
- `user_id` (string, required): User identifier
- `status` (string, optional): Filter by status (`completed`, `in_progress`, `locked`)

#### Response

```json
{
  "achievements": [
    {
      "achievement_id": "first_task",
      "name": "First Steps",
      "description": "Complete your first task",
      "icon": "🎯",
      "xp_reward": 100,
      "status": "completed",
      "completed_at": "2025-10-20T10:30:00",
      "progress": 100
    },
    {
      "achievement_id": "task_master_100",
      "name": "Task Master",
      "description": "Complete 100 tasks",
      "icon": "🏆",
      "xp_reward": 1000,
      "status": "in_progress",
      "progress": 75,
      "next_milestone": 100
    },
    {
      "achievement_id": "streak_30",
      "name": "Unstoppable",
      "description": "Maintain 30-day streak",
      "icon": "🔥",
      "xp_reward": 2000,
      "status": "locked",
      "requirements": "Reach 30-day streak"
    }
  ],
  "total_achievements": 45,
  "completed": 12,
  "in_progress": 8,
  "locked": 25,
  "total_xp_earned": 5400
}
```

---

### 4. Get Leaderboard

Retrieve user rankings.

```http
GET /api/v1/gamification/leaderboard
```

#### Request

**Query Parameters:**
- `timeframe` (string, optional): `daily`, `weekly`, `monthly`, `all_time` (default: `weekly`)
- `metric` (string, optional): `xp`, `tasks_completed`, `streak` (default: `xp`)
- `limit` (int, optional): Number of users to return (default: 50)

#### Response

```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user_id": "user123",
      "username": "TaskNinja",
      "metric_value": 15000,
      "level": 15,
      "streak": 45,
      "avatar": "🥷"
    },
    {
      "rank": 2,
      "user_id": "user456",
      "username": "ProductivityPro",
      "metric_value": 12500,
      "level": 12,
      "streak": 30,
      "avatar": "⚡"
    }
  ],
  "current_user": {
    "rank": 23,
    "metric_value": 7500,
    "level": 7,
    "streak": 12
  },
  "timeframe": "weekly",
  "metric": "xp",
  "total_users": 150,
  "message": "You're ranked #23 this week!"
}
```

---

### 5. Get Engagement Analytics

Detailed engagement analytics over time.

```http
GET /api/v1/gamification/analytics?user_id={user_id}
```

#### Request

**Query Parameters:**
- `user_id` (string, required): User identifier
- `start_date` (string, optional): ISO date (default: 30 days ago)
- `end_date` (string, optional): ISO date (default: today)

#### Response

```json
{
  "daily_engagement": [
    {
      "date": "2025-10-23",
      "tasks_completed": 8,
      "xp_earned": 450,
      "focus_hours": 4.5,
      "engagement_score": 8.2
    },
    {
      "date": "2025-10-22",
      "tasks_completed": 6,
      "xp_earned": 320,
      "focus_hours": 3.0,
      "engagement_score": 7.5
    }
  ],
  "weekly_summary": {
    "total_tasks": 45,
    "total_xp": 2800,
    "total_focus_hours": 28.5,
    "avg_engagement_score": 7.8,
    "streak_maintained": true
  },
  "trends": {
    "engagement": "improving",
    "productivity": "stable",
    "consistency": "high"
  },
  "recommendations": [
    "Maintain current streak momentum",
    "Schedule complex tasks in morning",
    "Take breaks every 90 minutes"
  ],
  "message": "Your engagement is improving! 📈"
}
```

---

## Data Mapping

### Engagement Score → Level & XP

The frontend maps gamification data to level/XP display:

```typescript
// Map engagement score (0-10) to level (1-10)
const level = Math.floor(stats.engagement_score) || 1; // 7.5 → 7

// Estimate XP from engagement score
const xp = Math.floor(stats.engagement_score * 1000); // 7.5 → 7500

// Streak days come directly from API
const streakDays = stats.active_days_streak; // 12
```

### Mobile Interface Integration

```typescript
// Fetch stats on app load
useEffect(() => {
  const fetchGameData = async () => {
    try {
      const stats = await apiClient.getProgressStats('mobile-user');

      // Update UI state
      setLevel(Math.floor(stats.engagement_score) || 1);
      setXp(Math.floor(stats.engagement_score * 1000) || 0);
      setStreakDays(stats.active_days_streak || 0);

      // Optional: Show insights as toast notifications
      stats.insights?.forEach(insight => {
        toast.info(insight, { icon: '💡' });
      });
    } catch (error) {
      console.warn('Gamification stats unavailable');
      // Fallback to defaults
      setLevel(1);
      setXp(0);
      setStreakDays(0);
    }
  };

  fetchGameData();
}, []);
```

---

## Achievement System

### Available Achievements

| ID | Name | Description | XP | Requirement |
|----|------|-------------|----|----|
| `first_task` | First Steps | Complete first task | 100 | 1 task |
| `task_10` | Getting Started | Complete 10 tasks | 250 | 10 tasks |
| `task_50` | Momentum Builder | Complete 50 tasks | 500 | 50 tasks |
| `task_100` | Task Master | Complete 100 tasks | 1000 | 100 tasks |
| `streak_7` | Committed | 7-day streak | 500 | 7 days |
| `streak_30` | Unstoppable | 30-day streak | 2000 | 30 days |
| `streak_100` | Legendary | 100-day streak | 10000 | 100 days |
| `focus_10h` | Deep Worker | 10 focus hours | 400 | 10 hours |
| `focus_100h` | Flow Master | 100 focus hours | 2000 | 100 hours |

### Unlocking Achievements

Achievements unlock automatically based on user activity. Frontend can listen for achievement notifications via WebSocket:

```typescript
// WebSocket listener for achievements
ws.on('achievement_unlocked', (data) => {
  toast.success(`🏆 Achievement Unlocked: ${data.name}!`, {
    description: `+${data.xp_reward} XP`,
    duration: 5000
  });

  // Update UI
  setXp(prev => prev + data.xp_reward);
});
```

---

## Error Codes

| Status Code | Error | Description |
|-------------|-------|-------------|
| 200 | Success | Request successful |
| 400 | Bad Request | Missing user_id or invalid parameters |
| 401 | Unauthorized | Auth required (non-mobile endpoints) |
| 404 | Not Found | User or achievement not found |
| 500 | Internal Error | Server error |

## Rate Limiting

- `/user-stats`: No limit (mobile endpoint)
- Other endpoints: 100 requests/minute per user

## Caching

- `/user-stats`: Safe to cache for 60 seconds
- `/achievements`: Safe to cache for 5 minutes
- `/leaderboard`: Safe to cache for 5 minutes (updates every 5 min)

## Best Practices

1. **Fetch stats periodically**
   ```typescript
   useInterval(() => fetchStats(), 60000); // Every minute
   ```

2. **Handle mock data gracefully**
   - Current implementation returns mock data
   - Production will integrate with real analytics

3. **Use insights for user guidance**
   ```typescript
   stats.insights?.forEach(insight => {
     showNotification(insight, 'info');
   });
   ```

4. **Show achievement progress**
   ```typescript
   <ProgressBar
     value={achievement.progress}
     max={achievement.next_milestone}
     label={`${achievement.progress}/${achievement.next_milestone}`}
   />
   ```

## Related Endpoints

- **[Progress Tracking](./06-progress.md)** - XP calculation and level progression
- **[Rewards System](./07-rewards.md)** - Reward redemption and inventory
- **[Energy Tracking](./04-energy.md)** - Energy-based engagement

---

**Last Updated**: 2025-10-23
**Version**: 1.0.0
**Status**: ✅ Production Ready (Mock Data)
