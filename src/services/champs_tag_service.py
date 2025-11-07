"""
CHAMPS Tag Service - LLM-powered generation of success criteria and expectations

Uses CHAMPS framework to generate meaningful tags for micro-steps:
- Conversation: What level of talking/interaction is needed?
- Help: How do I get help if stuck?
- Activity: What am I actually doing?
- Movement: Can I move around or stay in place?
- Participation: What does success look like?
- Success: What are the completion criteria?
"""

import json
import logging
import os

from pydantic import BaseModel, Field

# Try to import LLM clients
try:
    import openai

    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    import anthropic

    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

logger = logging.getLogger(__name__)


class CHAMPSTags(BaseModel):
    """CHAMPS-based tags for a micro-step"""

    conversation: list[str] = Field(
        default_factory=list, description="Communication/interaction tags"
    )
    help: list[str] = Field(default_factory=list, description="Help and support tags")
    activity: list[str] = Field(default_factory=list, description="Activity/action tags")
    movement: list[str] = Field(default_factory=list, description="Movement/physical tags")
    participation: list[str] = Field(default_factory=list, description="Success participation tags")
    success: list[str] = Field(default_factory=list, description="Completion criteria tags")

    def get_all_tags(self) -> list[str]:
        """Get all tags as a flat list"""
        all_tags = []
        all_tags.extend(self.conversation)
        all_tags.extend(self.help)
        all_tags.extend(self.activity)
        all_tags.extend(self.movement)
        all_tags.extend(self.participation)
        all_tags.extend(self.success)
        return all_tags


class CHAMPSTagResult(BaseModel):
    """Result of CHAMPS tag generation"""

    tags: CHAMPSTags
    reasoning: str
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)


class CHAMPSTagService:
    """Service for LLM-powered CHAMPS tag generation"""

    def __init__(self):
        self.openai_client = None
        self.anthropic_client = None

        if OPENAI_AVAILABLE:
            api_key = os.getenv("OPENAI_API_KEY")
            if api_key:
                self.openai_client = openai.AsyncOpenAI(api_key=api_key)

        if ANTHROPIC_AVAILABLE:
            api_key = os.getenv("ANTHROPIC_API_KEY")
            if api_key:
                self.anthropic_client = anthropic.AsyncAnthropic(api_key=api_key)

    async def generate_tags(
        self, step_description: str, estimated_minutes: int, leaf_type: str = "HUMAN"
    ) -> CHAMPSTagResult:
        """
        Generate CHAMPS-based tags for a micro-step using LLM

        Args:
            step_description: Description of the micro-step
            estimated_minutes: Estimated duration in minutes
            leaf_type: "DIGITAL" or "HUMAN"

        Returns:
            CHAMPSTagResult with generated tags and reasoning
        """
        try:
            if self.openai_client:
                return await self._generate_with_openai(
                    step_description, estimated_minutes, leaf_type
                )
            elif self.anthropic_client:
                return await self._generate_with_anthropic(
                    step_description, estimated_minutes, leaf_type
                )
            else:
                # Fallback to keyword-based generation
                return self._generate_fallback_tags(step_description, estimated_minutes, leaf_type)
        except Exception as e:
            logger.error(f"Error generating CHAMPS tags: {e}")
            return self._generate_fallback_tags(step_description, estimated_minutes, leaf_type)

    def _build_champs_prompt(
        self, step_description: str, estimated_minutes: int, leaf_type: str
    ) -> str:
        """Build prompt for CHAMPS tag generation"""

        return f"""
You are an expert at generating CHAMPS-based success criteria and expectations for micro-steps.

**CHAMPS Framework:**
- **Conversation**: What level of talking/interaction is needed? (💬 Communication, 🤔 Decision, ❓ Clarification)
- **Help**: How do I get help if stuck? (💾 Save Progress, ✅ Verify, 📋 Organize)
- **Activity**: What am I actually doing? (⬆️ Transfer, ⬇️ Download, 🧹 Clean, 👨‍🍳 Prepare, 🛒 Purchase)
- **Movement**: Can I move around or stay in place? (🚗 Travel, 🚶 Move, 🪑 Stationary)
- **Participation**: What does success look like? (⚡ Quick Win, 🎯 Focused, ⏱️ Sustained, 🏃 Endurance, 🏔️ Marathon)
- **Success**: What are the completion criteria? (🎯 Complete, ✅ Selected, 💾 Saved, 📋 Organized, ✅ Verified)

**Step Details:**
- Description: "{step_description}"
- Duration: {estimated_minutes} minutes
- Type: {leaf_type}

**Instructions:**
1. Generate 2-4 relevant tags for each CHAMPS category
2. Use emojis and clear, actionable language
3. Focus on success criteria and expectations
4. Consider ADHD-friendly task management
5. Make tags specific to this step's content

**Output Format:**
Return JSON matching this schema:
```json
{{
  "conversation": ["💬 Communication", "🤔 Decision"],
  "help": ["💾 Save Progress", "✅ Verify"],
  "activity": ["⬆️ Transfer", "🧹 Clean"],
  "movement": ["🚗 Travel", "🪑 Stationary"],
  "participation": ["⚡ Quick Win", "🎯 Focused"],
  "success": ["🎯 Complete", "✅ Selected"],
  "reasoning": "Explanation of tag choices",
  "confidence": 0.9
}}
```
"""

    async def _generate_with_openai(
        self, step_description: str, estimated_minutes: int, leaf_type: str
    ) -> CHAMPSTagResult:
        """Generate tags using OpenAI"""
        prompt = self._build_champs_prompt(step_description, estimated_minutes, leaf_type)

        response = await self.openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert at generating CHAMPS-based success criteria for micro-steps.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=1000,
        )

        content = response.choices[0].message.content
        return self._parse_llm_response(content)

    async def _generate_with_anthropic(
        self, step_description: str, estimated_minutes: int, leaf_type: str
    ) -> CHAMPSTagResult:
        """Generate tags using Anthropic"""
        prompt = self._build_champs_prompt(step_description, estimated_minutes, leaf_type)

        response = await self.anthropic_client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1000,
            temperature=0.3,
            messages=[{"role": "user", "content": prompt}],
        )

        content = response.content[0].text
        return self._parse_llm_response(content)

    def _parse_llm_response(self, content: str) -> CHAMPSTagResult:
        """Parse LLM response into CHAMPSTagResult"""
        try:
            # Extract JSON from response
            json_start = content.find("{")
            json_end = content.rfind("}") + 1
            json_str = content[json_start:json_end]

            data = json.loads(json_str)

            return CHAMPSTagResult(
                tags=CHAMPSTags(
                    conversation=data.get("conversation", []),
                    help=data.get("help", []),
                    activity=data.get("activity", []),
                    movement=data.get("movement", []),
                    participation=data.get("participation", []),
                    success=data.get("success", []),
                ),
                reasoning=data.get("reasoning", "Generated using CHAMPS framework"),
                confidence=data.get("confidence", 0.8),
            )
        except Exception as e:
            logger.error(f"Error parsing LLM response: {e}")
            return self._generate_fallback_tags("", 0, "HUMAN")

    def _generate_fallback_tags(
        self, step_description: str, estimated_minutes: int, leaf_type: str
    ) -> CHAMPSTagResult:
        """Fallback keyword-based tag generation"""
        description = step_description.lower()

        # Basic keyword matching
        conversation = []
        if any(word in description for word in ["email", "send", "message", "call"]):
            conversation.append("💬 Communication")
        if any(word in description for word in ["select", "choose", "pick", "decide"]):
            conversation.append("🤔 Decision")

        help = []
        if any(word in description for word in ["backup", "save", "store"]):
            help.append("💾 Save Progress")
        if any(word in description for word in ["check", "verify", "review"]):
            help.append("✅ Verify")

        activity = []
        if any(word in description for word in ["upload", "transfer", "sync"]):
            activity.append("⬆️ Transfer")
        if any(word in description for word in ["clean", "tidy", "wash"]):
            activity.append("🧹 Clean")

        movement = []
        if any(word in description for word in ["drive", "travel", "go"]):
            movement.append("🚗 Travel")
        if any(word in description for word in ["sit", "desk", "computer"]):
            movement.append("🪑 Stationary")

        # Participation based on duration
        participation = []
        if estimated_minutes <= 2:
            participation.append("⚡ Quick Win")
        elif estimated_minutes <= 5:
            participation.append("🎯 Focused")
        elif estimated_minutes <= 15:
            participation.append("⏱️ Sustained")
        else:
            participation.append("🏃 Endurance")

        success = []
        if any(word in description for word in ["complete", "finish", "all"]):
            success.append("🎯 Complete")
        if any(word in description for word in ["select", "choose"]):
            success.append("✅ Selected")

        return CHAMPSTagResult(
            tags=CHAMPSTags(
                conversation=conversation,
                help=help,
                activity=activity,
                movement=movement,
                participation=participation,
                success=success,
            ),
            reasoning="Fallback keyword-based generation",
            confidence=0.6,
        )
