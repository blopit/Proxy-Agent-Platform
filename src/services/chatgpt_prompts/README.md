# ChatGPT Video Task Prompt Generator

This service allows users to create detailed task breakdowns from video walkthroughs using ChatGPT's voice and camera mode.

## Overview

The workflow is designed to be simple for users:

1. **Generate a prompt** for ChatGPT
2. **Record a video** with ChatGPT while talking through what needs to be done
3. **Copy the breakdown** ChatGPT creates
4. **Import it back** into our task management system

This bridges the gap between video-based task capture and our structured task system, without requiring our own video analysis infrastructure.

## API Endpoints

### 1. Generate ChatGPT Prompt

**POST** `/api/v1/chatgpt-prompts/generate`

Generate a user-friendly prompt for ChatGPT voice+camera mode.

**Request Body:**
```json
{
  "task_context": "Clean room 8",
  "analysis_focus": "Pay attention to dusty surfaces and windows",
  "expected_task_count": 10,
  "priority": "high",
  "estimated_hours_per_task": 1.0
}
```

**Response:**
```json
{
  "prompt": "I need help breaking down a task...",
  "instructions": "**Instructions:**\n1. Copy the prompt...",
  "expected_json_format": {...},
  "task_context": "Clean room 8",
  "generated_at": "2025-10-30T00:00:00Z"
}
```

### 2. Import Task List (Structured)

**POST** `/api/v1/chatgpt-prompts/import`

Import a structured task list directly.

**Request Body:**
```json
{
  "parent_task_context": "Clean room 8",
  "subtasks": [
    {
      "title": "Dust all surfaces",
      "description": "Use microfiber cloth to dust shelves, desk, windowsills",
      "estimated_hours": 0.5,
      "priority": "medium",
      "tags": ["cleaning"]
    }
  ],
  "delegation_mode": "human",
  "capture_type": "video",
  "project_id": "proj-123"
}
```

**Response:**
```json
{
  "success": true,
  "parent_task_id": "uuid-here",
  "parent_task_title": "Clean room 8",
  "imported_task_count": 3,
  "task_ids": ["uuid1", "uuid2", "uuid3"],
  "created_at": "2025-10-30T00:00:00Z",
  "message": "Successfully imported 3 tasks"
}
```

### 3. Parse and Import (Raw Text)

**POST** `/api/v1/chatgpt-prompts/parse-and-import`

Parse raw ChatGPT response and import tasks.

**Request Body:**
```json
{
  "chatgpt_response": "**Task Breakdown for: Clean room 8**\n\n1. **Dust all surfaces**\n   - What to do: Use microfiber cloth...\n   - Time estimate: 30 minutes\n   - Priority: High\n\n2. **Vacuum carpet**..."
}
```

**Response:** Same as `/import` endpoint

## User Flow Example

### Step 1: Generate Prompt

```bash
curl -X POST http://localhost:8000/api/v1/chatgpt-prompts/generate \
  -H "Content-Type: application/json" \
  -d '{
    "task_context": "Clean room 8",
    "analysis_focus": "Dusty surfaces and windows",
    "expected_task_count": 5
  }'
```

**Copy the returned `prompt` field**

### Step 2: Use ChatGPT

1. Go to ChatGPT (app or web)
2. Enable voice mode (microphone icon)
3. Enable camera mode (camera icon)
4. Paste the prompt
5. Walk around with camera showing what needs to be done
6. ChatGPT will create a structured breakdown

### Step 3: Import Back

Copy the breakdown from ChatGPT and:

```bash
curl -X POST http://localhost:8000/api/v1/chatgpt-prompts/parse-and-import \
  -H "Content-Type: application/json" \
  -d '{
    "chatgpt_response": "<paste ChatGPT output here>"
  }'
```

## Expected ChatGPT Output Format

ChatGPT should return:

```
**Task Breakdown for: [Your Task]**

1. **[Step Title]**
   - What to do: [Detailed description]
   - Time estimate: [Hours or minutes]
   - Priority: [Critical/High/Medium/Low]

2. **[Step Title]**
   - What to do: [Detailed description]
   - Time estimate: [Hours or minutes]
   - Priority: [Critical/High/Medium/Low]

...
```

## Features

- **User-friendly**: No technical jargon (JSON, APIs, etc.) shown to users
- **Flexible parsing**: Accepts both structured text and JSON formats
- **Time parsing**: Handles "30 minutes", "1 hour", "2.5 hours", etc.
- **Priority levels**: Critical, High, Medium, Low
- **Tags support**: Optional tags for categorization
- **Project linking**: Optional project_id for organization

## Testing

Run the test suite:

```bash
# All tests
uv run pytest src/services/chatgpt_prompts/tests/ -v

# Specific test file
uv run pytest src/services/chatgpt_prompts/tests/test_prompt_service.py -v
uv run pytest src/services/chatgpt_prompts/tests/test_import_service.py -v
uv run pytest src/services/chatgpt_prompts/tests/test_integration.py -v
```

## Architecture

```
src/services/chatgpt_prompts/
├── __init__.py           # Package exports
├── models.py             # Pydantic models
├── prompt_service.py     # Prompt generation logic
├── import_service.py     # Task parsing and import logic
├── routes.py             # FastAPI endpoints
├── README.md             # This file
└── tests/
    ├── __init__.py
    ├── test_prompt_service.py
    ├── test_import_service.py
    └── test_integration.py
```

## Design Principles

1. **Shield users from complexity**: Users shouldn't need to understand JSON, APIs, or technical formats
2. **Natural language first**: Prompts and instructions use conversational language
3. **Flexible parsing**: Accept multiple formats (text, JSON) to handle different user skill levels
4. **Clear error messages**: When parsing fails, provide helpful guidance
5. **Test-driven**: Comprehensive test coverage (35 tests) for reliability

## Future Enhancements

- [ ] Support for voice-only mode (no camera)
- [ ] Template library for common task types
- [ ] Automatic project detection from context
- [ ] Integration with calendar for scheduling
- [ ] Mobile app shortcuts for one-tap workflow
- [ ] Progress tracking from video checkpoints
