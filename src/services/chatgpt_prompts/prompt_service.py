"""
ChatGPT Prompt Generator Service.

Generates user-friendly prompts for ChatGPT voice+camera mode that
create structured task lists we can import back into our system.
"""

from datetime import datetime

from src.services.chatgpt_prompts.models import (
    PromptGenerationRequest,
    PromptGenerationResponse,
)


class PromptGeneratorService:
    """Service for generating ChatGPT prompts for video-based task breakdown."""

    def generate_prompt(self, request: PromptGenerationRequest) -> PromptGenerationResponse:
        """
        Generate a user-friendly ChatGPT prompt for video task analysis.

        The prompt is designed to:
        1. Be natural and conversational (no technical jargon)
        2. Guide the user through video recording
        3. Instruct ChatGPT to output structured data we can parse
        4. Not mention "JSON" or technical formats to users

        Args:
            request: Prompt generation request with task context

        Returns:
            PromptGenerationResponse: Generated prompt and instructions
        """
        # Build the prompt sections
        task_context = request.task_context
        focus_section = self._build_focus_section(request.analysis_focus)
        count_guidance = self._build_count_guidance(request.expected_task_count)
        priority_note = self._build_priority_note(request.priority)
        hours_note = self._build_hours_note(request.estimated_hours_per_task)

        # Generate the user-friendly prompt
        prompt = f"""I need help breaking down a task into smaller steps: "{task_context}"

I'm going to use my camera to show you the space/situation and talk through what needs to be done.
{focus_section}
{count_guidance}
Please analyze what you see and hear, then create a detailed breakdown with:
- A clear title for each step
- What exactly needs to be done
- How long each step might take{priority_note}{hours_note}

After analyzing the video, please format your response EXACTLY like this:

**Task Breakdown for: {task_context}**

1. **[Step Title]**
   - What to do: [Detailed description]
   - Time estimate: [Hours or minutes]
   - Priority: [Critical/High/Medium/Low]

2. **[Step Title]**
   - What to do: [Detailed description]
   - Time estimate: [Hours or minutes]
   - Priority: [Critical/High/Medium/Low]

Continue for all steps...

---
Copy the breakdown above and paste it back into your task management system when done.
"""

        # Generate user instructions
        instructions = self._build_user_instructions(task_context)

        # Generate expected format (internal use, not shown to user initially)
        expected_format = self._build_expected_json_format(task_context)

        return PromptGenerationResponse(
            prompt=prompt.strip(),
            instructions=instructions,
            expected_json_format=expected_format,
            task_context=task_context,
            generated_at=datetime.utcnow(),
        )

    def _build_focus_section(self, analysis_focus: str | None) -> str:
        """Build the focus section if user provided specific focus areas."""
        if not analysis_focus:
            return ""
        return f"\nPlease pay special attention to: {analysis_focus}"

    def _build_count_guidance(self, expected_count: int | None) -> str:
        """Build guidance about expected number of tasks."""
        if not expected_count:
            return ""
        return f"\nI'm expecting roughly {expected_count} distinct steps."

    def _build_priority_note(self, priority: str | None) -> str:
        """Build note about priority if specified."""
        if not priority or priority == "medium":
            return ""
        return f"\n- Overall priority level: {priority}"

    def _build_hours_note(self, hours: float | None) -> str:
        """Build note about estimated hours if specified."""
        if not hours:
            return ""
        return f"\n- Each step should take around {hours} hours"

    def _build_user_instructions(self, task_context: str) -> str:
        """Build step-by-step instructions for the user."""
        return f"""**Instructions:**

1. Copy the generated prompt above
2. Go to ChatGPT (app or web)
3. Enable voice mode (microphone icon)
4. Enable camera mode (camera icon)
5. Paste the prompt to start the conversation
6. Show your camera around and talk through what needs to be done for: "{task_context}"
7. ChatGPT will analyze and create a breakdown
8. Copy the breakdown ChatGPT provides
9. Return here and paste it into the import field

**Tips:**
- Speak clearly and show everything relevant on camera
- Point out specific areas or items that need attention
- Mention any special concerns or constraints
- Take your time - walk through the space thoroughly
"""

    def _build_expected_json_format(self, task_context: str) -> dict:
        """
        Build expected JSON format for internal parsing.

        This is used by our import system to validate ChatGPT output.
        Not shown to users.
        """
        return {
            "parent_task_context": task_context,
            "subtasks": [
                {
                    "title": "Example: Dust all surfaces",
                    "description": "Use microfiber cloth to dust shelves, desk, windowsills",
                    "estimated_hours": 0.5,
                    "priority": "medium",
                    "tags": [],
                },
                {
                    "title": "Example: Vacuum carpet",
                    "description": "Thoroughly vacuum all carpet areas including under furniture",
                    "estimated_hours": 0.75,
                    "priority": "high",
                    "tags": [],
                },
            ],
        }
