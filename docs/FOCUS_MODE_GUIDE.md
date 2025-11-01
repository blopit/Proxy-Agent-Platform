# Focus Recovery Mode - Quick Start Guide

## What is Focus Recovery Mode?

A Tinder-style task engagement system designed specifically for ADHD and addiction recovery. It helps break unproductive cycles by providing structured, single-task focus sessions.

## How to Access

1. **Start the frontend server:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Navigate to the dogfooding page:**
   ```
   http://localhost:3000/dogfood
   ```

3. **Focus mode loads by default** - You'll see the 🎯 Focus Recovery Mode tab active

## The Focus Recovery Protocol

### Step-by-Step Usage:

1. **Crisis Intervention Card** (Top of page)
   - Explains the "Just 1 Hour" philosophy
   - Shows benefits: Single task focus, better dopamine, completion satisfaction

2. **Your Focus Task** (Main section)
   - Click "🚨 Create Focus Task Now" if none exists
   - Or select an existing focus/intervention task
   - Follow the 6-step protocol:
     1. Close ALL tabs except this one
     2. Put phone in another room
     3. Set physical timer: 1 hour
     4. Pick the SMALLEST task
     5. Use Quick Capture when distracted
     6. Mark complete and CELEBRATE after 1 hour

3. **Quick Wins** (Small tasks section)
   - Shows tasks ≤2 hours, sorted by size
   - Click "Start Now" to assign and switch to Hunt mode
   - Perfect for building momentum

4. **Emergency Capture** (Distraction management)
   - Type any distracting thought
   - Press `⌘ + Enter` to save
   - System creates a low-priority task automatically
   - Returns you to focus immediately

5. **7-Day Focus Challenge** (Bottom tracker)
   - Track daily progress
   - Success = 5 out of 7 days (71% target)
   - Builds sustainable habits vs perfectionism

## Key Features

### ADHD-Optimized Design:
- **External Working Memory**: Capture system offloads thoughts
- **Dopamine Replacement**: Completion > scrolling
- **Decision Fatigue Reduction**: System picks next task
- **Progress Visibility**: Constant visual feedback

### Scientific Backing:
- Based on external working memory research
- Dopamine system understanding
- Harm reduction vs elimination approach
- Built for neurodivergent workflows

## Navigation Between Modes

The biological tabs represent different cognitive states:

- **🔥 Focus** - Intervention/recovery mode (NEW)
- **➕ Add** - Quick thought capture
- **🔍 Scout** - Browse and explore tasks
- **🎯 Hunt** - Active task execution (flow state)
- **💚 Recharge** - Energy recovery
- **🗺️ Map** - Review and planning

## Integration with Other Modes

- **Focus → Hunt**: After selecting a quick win, automatically switches to Hunt mode
- **Focus → Capture**: Emergency thoughts become tasks in Scout mode
- **Focus → Map**: Review 7-day challenge progress

## Backend Requirements

The focus mode works with the existing task API:

```bash
# Make sure backend is running
cd backend
uv run uvicorn main:app --reload --port 8000
```

**API endpoints used:**
- `GET /api/v1/tasks` - Load all tasks
- `POST /api/v1/tasks` - Create focus/capture tasks
- `PUT /api/v1/tasks/{task_id}` - Assign tasks to user

## Tips for Success

1. **Start small**: Pick 30-minute tasks first
2. **Use timer**: Physical timer works better than digital
3. **Celebrate wins**: Mark completion, stand up, stretch
4. **Track honestly**: 5/7 days is success, not 7/7
5. **Capture everything**: Don't fight distractions, externalize them

## Troubleshooting

**No tasks showing?**
- Check backend is running on port 8000
- Open browser console for API errors
- Verify database has tasks with `estimated_hours` field

**Can't create focus task?**
- Click "🚨 Create Focus Task Now" button
- Manual task creation also works from Scout mode

**Emergency capture not working?**
- Make sure you press `⌘ + Enter` (Mac) or `Ctrl + Enter` (Windows)
- Check browser console for errors

## Future Enhancements

- [ ] Timer integration with notifications
- [ ] Daily focus session analytics
- [ ] Habit streak tracking
- [ ] Integration with calendar blocking
- [ ] Mobile app with offline capture

## Philosophy

This isn't about becoming a productivity machine. It's about:
- Breaking harmful patterns
- Building sustainable habits
- Accepting neurodivergent workflows
- Celebrating small wins
- Reducing shame and perfectionism

**Success = Progress, not perfection.**
