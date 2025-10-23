# Quick Capture API

**Service**: Mobile Quick Capture
**Base Path**: `/api/v1/mobile`
**File**: `src/api/capture.py`
**Authentication**: Not required

## Overview

The Quick Capture API enables rapid task creation from natural language input. Optimized for mobile devices with minimal friction, automatic task processing, and optional AI clarification.

## Endpoints

### 1. Quick Capture

**Primary mobile endpoint** for instant task capture.

```http
POST /api/v1/mobile/quick-capture
```

#### Request

**Headers:**
- `Content-Type: application/json`

**Body:**
```json
{
  "text": "Buy groceries tomorrow at 3pm",
  "user_id": "mobile-user",
  "voice_input": false,
  "auto_mode": true,
  "ask_for_clarity": false
}
```

**Request Fields:**
- `text` (string, required): Natural language task description
- `user_id` (string, required): User identifier
- `voice_input` (boolean, optional): Whether input came from voice (default: `false`)
- `auto_mode` (boolean, optional): Auto-process without confirmation (default: `true`)
- `ask_for_clarity` (boolean, optional): Ask AI for clarification if ambiguous (default: `false`)

#### Response

**Success Response:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "task_id": "task_abc123",
  "tasks": [
    {
      "task_id": "task_abc123",
      "title": "Buy groceries",
      "description": "Purchase groceries at 3pm tomorrow",
      "status": "pending",
      "priority": "medium",
      "due_date": "2025-10-24T15:00:00",
      "tags": ["shopping", "errands"],
      "created_at": "2025-10-23T11:30:00"
    }
  ],
  "xp_earned": 10,
  "processing_time_ms": 145
}
```

**Response Fields:**
- `success` (boolean): Whether capture succeeded
- `message` (string): Human-readable message
- `task_id` (string): ID of created task
- `tasks` (array): Array of task objects (may be multiple if NLP detected several)
- `xp_earned` (number): XP awarded for capture
- `processing_time_ms` (number): Processing time in milliseconds

**Error Response:**
```json
{
  "success": false,
  "message": "Failed to process input",
  "error": "Invalid user_id",
  "processing_time_ms": 50
}
```

#### Frontend Integration

**TypeScript Interface:**
```typescript
export interface QuickCaptureRequest {
  text: string;
  user_id: string;
  voice_input?: boolean;
  auto_mode?: boolean;
  ask_for_clarity?: boolean;
}

export interface QuickCaptureResponse {
  success: boolean;
  message: string;
  task_id?: string;
  tasks?: Task[];
  xp_earned?: number;
  processing_time_ms?: number;
  error?: string;
}

export interface Task {
  task_id?: string;
  id?: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  tags?: string[];
  created_at?: string;
}
```

**Usage Example:**
```typescript
import { apiClient } from '@/lib/api';

// Basic capture
const response = await apiClient.quickCapture({
  text: 'Call client about proposal',
  user_id: 'mobile-user',
  auto_mode: true
});

if (response.success) {
  console.log(`Task created: ${response.task_id}`);
  console.log(`XP earned: ${response.xp_earned}`);
}
```

**React Hook Example:**
```typescript
const useCaptureFlow = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const captureTask = async (text: string) => {
    if (!text.trim()) return;

    setIsProcessing(true);
    try {
      const response = await apiClient.quickCapture({
        text,
        user_id: 'mobile-user',
        voice_input: false,
        auto_mode: true,
        ask_for_clarity: false
      });

      if (response.success) {
        toast.success(`Task captured: ${response.message}`, {
          description: `+${response.xp_earned} XP`,
          duration: 3000
        });

        // Trigger task list refresh
        onTaskCaptured?.();

        return response;
      } else {
        toast.error(`Capture failed: ${response.message}`);
      }
    } catch (error) {
      toast.error('Network error - please try again');
    } finally {
      setIsProcessing(false);
    }
  };

  return { captureTask, isProcessing };
};
```

**Mobile Component Example:**
```typescript
const CaptureInput = () => {
  const [input, setInput] = useState('');
  const { captureTask, isProcessing } = useCaptureFlow();

  const handleSubmit = async () => {
    await captureTask(input);
    setInput(''); // Clear input after successful capture
  };

  return (
    <div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="What needs to be done?"
        disabled={isProcessing}
      />
      <button
        onClick={handleSubmit}
        disabled={!input.trim() || isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Capture'}
      </button>
    </div>
  );
};
```

---

### 2. Get Capture Stats

Get user capture statistics and analytics.

```http
GET /api/v1/capture/stats/{user_id}
```

#### Request

**Path Parameters:**
- `user_id` (string, required): User identifier

**Query Parameters:**
- `timeframe` (string, optional): `day`, `week`, `month`, `all` (default: `week`)

#### Response

```json
{
  "user_id": "mobile-user",
  "total_captures": 245,
  "successful_captures": 238,
  "failed_captures": 7,
  "avg_processing_time_ms": 152,
  "captures_by_day": {
    "Monday": 42,
    "Tuesday": 38,
    "Wednesday": 45
  },
  "capture_methods": {
    "text": 180,
    "voice": 65
  },
  "peak_capture_times": ["09:00-10:00", "14:00-15:00"],
  "total_xp_earned": 2450,
  "message": "245 captures this week"
}
```

---

## Natural Language Processing

The Quick Capture API uses NLP to extract structured task data from natural language input.

### Supported Patterns

| Input | Extracted Data |
|-------|----------------|
| "Buy milk tomorrow" | Title: "Buy milk", Due: Tomorrow |
| "Call John at 3pm" | Title: "Call John", Due: Today 3pm |
| "High priority: Fix bug" | Title: "Fix bug", Priority: high |
| "Meeting with Sarah next Monday 10am" | Title: "Meeting with Sarah", Due: Next Monday 10am |
| "Buy groceries, do laundry, call mom" | Creates 3 separate tasks |

### Priority Detection

| Keywords | Priority |
|----------|----------|
| "urgent", "asap", "critical" | high |
| "important", "high priority" | high |
| "low priority", "when possible" | low |
| Default | medium |

### Date/Time Parsing

- "tomorrow" → Next day
- "next week" → 7 days from now
- "Monday" → Next Monday
- "3pm" → Today at 15:00
- "tomorrow at 2:30pm" → Next day at 14:30

### Tag Extraction

Common words are auto-tagged:
- "meeting", "call" → `@communication`
- "buy", "shop" → `@shopping`
- "fix", "bug" → `@development`
- "email", "reply" → `@email`

---

## Auto Mode vs Clarification Mode

### Auto Mode (Recommended for Mobile)

```json
{
  "text": "Buy groceries tomorrow",
  "auto_mode": true,
  "ask_for_clarity": false
}
```

**Behavior:**
- ✅ Instant task creation
- ✅ No confirmation needed
- ✅ Best guesses for ambiguity
- ✅ Fastest capture experience

### Clarification Mode

```json
{
  "text": "Meeting with team",
  "auto_mode": false,
  "ask_for_clarity": true
}
```

**Response:**
```json
{
  "success": false,
  "message": "Need clarification",
  "clarification_needed": [
    "When is the meeting? (date/time)",
    "Who else is attending?",
    "What's the meeting topic?"
  ],
  "suggested_questions": [
    "Is this today or tomorrow?",
    "Morning or afternoon?"
  ]
}
```

**Follow-up Request:**
```json
{
  "text": "Meeting with team tomorrow at 10am about Q4 planning",
  "auto_mode": true
}
```

---

## Voice Input Support

### Voice Capture Flow

```typescript
const captureVoiceInput = async (transcript: string) => {
  const response = await apiClient.quickCapture({
    text: transcript,
    user_id: 'mobile-user',
    voice_input: true, // Indicates voice source
    auto_mode: true
  });

  // Voice input gets extra XP bonus
  if (response.success && response.xp_earned) {
    console.log(`Voice bonus XP: ${response.xp_earned}`); // +15 XP instead of +10
  }
};
```

### Voice-Specific Handling

- Automatic punctuation added
- Filler words removed ("um", "uh", "like")
- Natural speech patterns normalized
- Extra XP bonus for voice capture

---

## Performance Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Response Time | <200ms | ~150ms |
| Success Rate | >95% | 97% |
| NLP Accuracy | >90% | 92% |
| Mobile Optimized | Yes | ✅ |

## Error Codes

| Status Code | Error | Description |
|-------------|-------|-------------|
| 200 | Success | Task created successfully |
| 400 | Bad Request | Missing `text` or `user_id` |
| 422 | Unprocessable | NLP failed to parse input |
| 500 | Internal Error | Server error |

## Rate Limiting

- No rate limit for mobile users
- Designed for high-frequency capture

## Best Practices

1. **Keep input natural**
   ```typescript
   // ✅ Good
   "Buy milk tomorrow at 9am"

   // ❌ Avoid structured syntax
   "task: Buy milk, priority: high, due: 2025-10-24"
   ```

2. **Use auto mode for speed**
   ```typescript
   { auto_mode: true, ask_for_clarity: false }
   ```

3. **Clear input after capture**
   ```typescript
   if (response.success) {
     setInput(''); // Reset for next capture
   }
   ```

4. **Show XP feedback**
   ```typescript
   toast.success(`+${response.xp_earned} XP`, { icon: '⭐' });
   ```

5. **Handle multiple tasks**
   ```typescript
   if (response.tasks && response.tasks.length > 1) {
     toast.info(`Created ${response.tasks.length} tasks`);
   }
   ```

## Related Endpoints

- **[Task Management](./01-tasks.md)** - Full CRUD operations on tasks
- **[Gamification](./05-gamification.md)** - XP and streak tracking
- **[Energy Tracking](./04-energy.md)** - Optimal capture times

---

**Last Updated**: 2025-10-23
**Version**: 1.0.0
**Status**: ✅ Production Ready
