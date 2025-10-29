# BE-12: AI Creature Generation

**Delegation Mode**: ⚙️ DELEGATE
**Estimated Time**: 6-7 hours
**Dependencies**: BE-02 (User Pets), BE-11 (Leveling)
**Agent Type**: backend-tdd

## 📋 Overview
Use AI to generate unique creature personalities, names, and behaviors based on user activity patterns.

## 🗄️ Database Schema
```sql
ALTER TABLE user_pets ADD COLUMN personality_traits JSONB;
ALTER TABLE user_pets ADD COLUMN ai_generated_name VARCHAR(100);
ALTER TABLE user_pets ADD COLUMN behavior_pattern VARCHAR(50);

CREATE TABLE creature_personalities (
    personality_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personality_name VARCHAR(50) UNIQUE NOT NULL,
    traits JSONB NOT NULL,  -- {"energy": "high", "friendliness": "medium"}
    dialogue_examples TEXT[],
    behavior_modifiers JSONB
);
```

## 🏗️ Models
```python
class GenerateCreatureRequest(BaseModel):
    user_id: str
    species: str
    user_productivity_pattern: Dict[str, Any]  -- From analytics

class CreaturePersonality(BaseModel):
    personality_id: UUID
    personality_name: str
    traits: Dict[str, str]
    suggested_name: str
    dialogue_style: str

class CreatureBehavior(BaseModel):
    pet_id: UUID
    current_mood: Literal["happy", "hungry", "playful", "sleepy"]
    next_dialogue: str
    recommended_interaction: str
```

## 🤖 AI Integration (PydanticAI)
```python
from pydantic_ai import Agent

creature_generator = Agent(
    model=OpenAIModel("gpt-4"),
    system_prompt="""
    Generate unique creature personalities for ADHD productivity pets.
    Match personality to user's productivity patterns.

    High-energy users → Energetic, excitable creatures
    Low-energy users → Calm, supportive creatures
    Inconsistent patterns → Adaptive, patient creatures

    Return name, personality traits, and sample dialogue.
    """,
    result_type=CreaturePersonality
)

async def generate_creature_personality(
    species: str,
    user_patterns: Dict
) -> CreaturePersonality:
    """Use AI to create unique creature."""
    prompt = f"Create a {species} companion for a user with these patterns: {user_patterns}"
    result = await creature_generator.run(prompt)
    return result.data
```

## 🌐 API Routes
```python
@router.post("/creatures/generate")
async def generate_creature(request: GenerateCreatureRequest):
    """Generate AI-powered creature personality."""
    pass

@router.get("/creatures/{pet_id}/dialogue")
async def get_creature_dialogue(pet_id: UUID):
    """Get context-aware dialogue from creature."""
    pass

@router.get("/creatures/{pet_id}/behavior")
async def get_creature_behavior(pet_id: UUID) -> CreatureBehavior:
    """Get current creature behavior and mood."""
    pass
```

## 🧪 Tests
- AI generates valid personality
- Personality matches user pattern
- Dialogue is contextual
- Behavior changes based on interactions

## ✅ Acceptance Criteria
- [ ] AI generates unique personalities
- [ ] Personalities match user productivity patterns
- [ ] Creatures have contextual dialogue
- [ ] Behavior adapts to user interactions
- [ ] 95%+ test coverage
