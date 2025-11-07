# ChatGPT Video Task Workflow - User Guide

This guide shows you how to use ChatGPT's voice and camera mode to create detailed task lists from video walkthroughs.

## Why This Workflow?

You mentioned: "Most people have ChatGPT, so let's use it!" This workflow:

- ✅ Uses ChatGPT's existing video analysis capabilities (no custom video infrastructure needed)
- ✅ Shields users from technical details (no JSON, APIs, or code)
- ✅ Takes advantage of ChatGPT's voice + camera mode
- ✅ Creates structured task lists we can import into our system

## The Complete Workflow

### 1. Generate Your Prompt (30 seconds)

First, generate a custom prompt for your task:

**API Call:**
```bash
curl -X POST http://localhost:8000/api/v1/chatgpt-prompts/generate \
  -H "Content-Type: application/json" \
  -d '{
    "task_context": "Clean room 8",
    "analysis_focus": "Pay attention to dusty surfaces and windows",
    "expected_task_count": 10,
    "priority": "high"
  }'
```

**What you'll get:**
- A copyable prompt customized for your task
- Step-by-step instructions
- Tips for best results

**Copy the prompt that's returned!**

### 2. Use ChatGPT with Video (2-5 minutes)

1. Open ChatGPT (app or web at chat.openai.com)
2. Click the **microphone icon** to enable voice mode
3. Click the **camera icon** to enable camera mode
4. **Paste your prompt** from step 1
5. **Walk around and talk** - show your camera everything that needs to be done
   - Example: "Here's room 8. As you can see, these shelves are dusty..."
   - Show all the areas: windows, floor, furniture, etc.
6. **ChatGPT will create a breakdown** when you're done

### 3. Copy the Breakdown (10 seconds)

ChatGPT will give you something like:

```
**Task Breakdown for: Clean room 8**

1. **Dust all surfaces**
   - What to do: Use microfiber cloth to dust shelves, desk, and windowsills thoroughly
   - Time estimate: 30 minutes
   - Priority: High

2. **Vacuum carpet**
   - What to do: Vacuum all carpet areas including under furniture
   - Time estimate: 45 minutes
   - Priority: High

3. **Clean windows**
   - What to do: Spray and wipe all windows with glass cleaner
   - Time estimate: 1 hour
   - Priority: Medium
```

**Copy this entire breakdown!**

### 4. Import into Your System (30 seconds)

Paste the breakdown back into our system:

**API Call:**
```bash
curl -X POST http://localhost:8000/api/v1/chatgpt-prompts/parse-and-import \
  -H "Content-Type: application/json" \
  -d '{
    "chatgpt_response": "<paste the breakdown here>"
  }'
```

**Result:**
```json
{
  "success": true,
  "parent_task_id": "uuid-here",
  "parent_task_title": "Clean room 8",
  "imported_task_count": 3,
  "task_ids": ["...", "...", "..."],
  "message": "Successfully imported 3 tasks"
}
```

Done! All your tasks are now in the system.

## Real-World Example: "Clean Room 8"

Let's walk through a complete example:

### The Scenario
You need to clean room 8 and want to break it down into specific tasks using video.

### Step-by-Step

**1. Generate the prompt:**
```bash
curl -X POST http://localhost:8000/api/v1/chatgpt-prompts/generate \
  -H "Content-Type: application/json" \
  -d '{"task_context": "Clean room 8", "expected_task_count": 8}'
```

**2. The prompt you get:**
```
I need help breaking down a task into smaller steps: "Clean room 8"

I'm going to use my camera to show you the space/situation and talk through what needs to be done.

I'm expecting roughly 8 distinct steps.

Please analyze what you see and hear, then create a detailed breakdown with:
- A clear title for each step
- What exactly needs to be done
- How long each step might take

After analyzing the video, please format your response EXACTLY like this:

**Task Breakdown for: Clean room 8**

1. **[Step Title]**
   - What to do: [Detailed description]
   - Time estimate: [Hours or minutes]
   - Priority: [Critical/High/Medium/Low]

...
```

**3. Use in ChatGPT:**
- Open ChatGPT
- Enable voice + camera
- Paste the prompt
- Walk around room 8 with your camera:
  - "Here's the desk, it's pretty dusty"
  - "These windows need cleaning, inside and out"
  - "The carpet needs vacuuming, especially under this chair"
  - "The bathroom sink has soap scum"
  - etc.

**4. ChatGPT analyzes and returns:**
```
**Task Breakdown for: Clean room 8**

1. **Dust desk and shelves**
   - What to do: Use microfiber cloth to remove dust from desk surface, shelves, and picture frames
   - Time estimate: 15 minutes
   - Priority: Medium

2. **Clean windows inside and outside**
   - What to do: Spray glass cleaner and wipe down both sides of all windows
   - Time estimate: 30 minutes
   - Priority: High

3. **Vacuum carpet thoroughly**
   - What to do: Vacuum all carpet areas including under furniture and in corners
   - Time estimate: 20 minutes
   - Priority: High

4. **Clean bathroom sink**
   - What to do: Scrub sink to remove soap scum, clean faucet
   - Time estimate: 10 minutes
   - Priority: Medium

... (and 4 more tasks)
```

**5. Copy and import:**
```bash
curl -X POST http://localhost:8000/api/v1/chatgpt-prompts/parse-and-import \
  -H "Content-Type: application/json" \
  -d '{
    "chatgpt_response": "**Task Breakdown for: Clean room 8**\n\n1. **Dust desk and shelves**..."
  }'
```

**6. Success!**
```json
{
  "success": true,
  "parent_task_id": "abc-123",
  "parent_task_title": "Clean room 8",
  "imported_task_count": 8,
  "message": "Successfully imported 8 tasks"
}
```

## Tips for Best Results

### For Video Recording:
- **Go slow** - Give ChatGPT time to analyze what it sees
- **Be descriptive** - Talk about what needs to be done as you show it
- **Good lighting** - Make sure the camera can see details
- **Show everything** - Don't skip areas that need work

### For Task Context:
- **Be specific**: "Clean room 8" is better than "clean"
- **Add focus**: Mention special concerns like "dusty surfaces" or "windows"
- **Set expectations**: Tell it roughly how many tasks you expect

### For Importing:
- **Copy everything** - Don't edit or trim the breakdown
- **Include formatting** - The `**bold**` and `- bullets` help parsing
- **Check before importing** - Make sure it looks complete

## Troubleshooting

### "Could not parse ChatGPT response"
- Make sure you copied the complete breakdown
- Check that it starts with "**Task Breakdown for:**"
- Verify each task has title, description, time, and priority

### "No tasks found in response"
- ChatGPT might have returned text without the structured format
- Try asking it to "reformat using the structure from my prompt"
- Make sure you're copying the breakdown, not ChatGPT's commentary

### API endpoint not responding
- Check that the server is running: `curl http://localhost:8000/health`
- Verify the URL: should be `http://localhost:8000/api/v1/chatgpt-prompts/...`

## Technical Details (Optional)

### Supported Formats

The import system accepts:

1. **Structured Text** (recommended for users):
   ```
   **Task Breakdown for: [Context]**

   1. **[Title]**
      - What to do: [Description]
      - Time estimate: [Time]
      - Priority: [Level]
   ```

2. **JSON** (for technical users):
   ```json
   {
     "parent_task_context": "Task name",
     "subtasks": [
       {
         "title": "Task title",
         "description": "What to do",
         "estimated_hours": 0.5,
         "priority": "medium"
       }
     ]
   }
   ```

### Time Formats Supported
- "30 minutes" → 0.5 hours
- "1 hour" → 1.0 hours
- "2.5 hours" → 2.5 hours
- "45 min" → 0.75 hours
- "90 minutes" → 1.5 hours

### Priority Levels
- Critical
- High
- Medium (default)
- Low

## API Reference

Full API documentation: [src/services/chatgpt_prompts/README.md](../src/services/chatgpt_prompts/README.md)

**Endpoints:**
- `POST /api/v1/chatgpt-prompts/generate` - Generate prompt
- `POST /api/v1/chatgpt-prompts/import` - Import structured tasks
- `POST /api/v1/chatgpt-prompts/parse-and-import` - Parse and import text
- `GET /api/v1/chatgpt-prompts/health` - Health check

## Next Steps

This is the foundation! Potential enhancements:

1. **Mobile app integration** - One-tap workflow from app
2. **Voice-only mode** - For tasks that don't need video
3. **Template library** - Pre-made prompts for common tasks
4. **Progress tracking** - Mark tasks complete as you go
5. **Calendar integration** - Schedule when tasks will be done

---

**Questions?** Check the [README](../src/services/chatgpt_prompts/README.md) or run the tests:
```bash
uv run pytest src/services/chatgpt_prompts/tests/ -v
```
