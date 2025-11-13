# BE-08: Social Features & Sharing Service

**Delegation Mode**: ⚙️ DELEGATE
**Estimated Time**: 4-5 hours
**Dependencies**: Core task models, BE-04 (Gamification)
**Agent Type**: backend-tdd

---

## 📋 Overview

Enable users to share achievements, celebrate with friends, and optionally collaborate on tasks.

**Core Functionality**:
- Share achievements externally (Twitter, clipboard)
- Task template sharing (export/import)
- Achievement showcase (public profile)
- Optional: Friend system and shared tasks (Phase 2)

---

## 🗄️ Database Schema

```sql
-- Shared achievements
CREATE TABLE shared_achievements (
    share_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    achievement_type VARCHAR(50) NOT NULL,  -- 'badge', 'streak', 'level', 'task_completion'
    achievement_data JSONB NOT NULL,
    share_platform VARCHAR(50),  -- 'twitter', 'clipboard', 'link'
    share_url VARCHAR(500),
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Shared task templates (community templates)
CREATE TABLE shared_templates (
    shared_template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_template_id UUID REFERENCES task_templates(template_id),
    shared_by_user_id VARCHAR(255) NOT NULL,
    template_data JSONB NOT NULL,  -- Full template export
    share_code VARCHAR(20) UNIQUE NOT NULL,  -- Short code for easy sharing
    use_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Template usage tracking
CREATE TABLE template_imports (
    import_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    shared_template_id UUID REFERENCES shared_templates(shared_template_id),
    imported_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_shared_achievements_user ON shared_achievements(user_id);
CREATE INDEX idx_shared_templates_code ON shared_templates(share_code);
```

---

## 🏗️ Pydantic Models

```python
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, Literal
from datetime import datetime
from uuid import UUID, uuid4

class ShareAchievementRequest(BaseModel):
    """Request to share an achievement."""
    user_id: str
    achievement_type: Literal["badge", "streak", "level", "task_completion"]
    achievement_data: Dict[str, Any]
    share_platform: Literal["twitter", "clipboard", "link"]
    is_public: bool = True


class ShareAchievementResponse(BaseModel):
    """Response with shareable content."""
    share_id: UUID
    share_url: Optional[str] = None
    share_text: str  # Pre-formatted text for social media
    image_url: Optional[str] = None  # Future: Generated achievement image


class ShareTemplateRequest(BaseModel):
    """Request to share a task template."""
    template_id: UUID
    user_id: str


class ShareTemplateResponse(BaseModel):
    """Response with shareable template."""
    shared_template_id: UUID
    share_code: str  # e.g., "HOMEWORK-A7B2"
    share_url: str


class ImportTemplateRequest(BaseModel):
    """Request to import a shared template."""
    user_id: str
    share_code: str = Field(..., min_length=5, max_length=20)
```

---

## 🏛️ Repository Layer

```python
class SharingRepository(BaseRepository):
    """Repository for social sharing."""

    def create_achievement_share(
        self,
        request: ShareAchievementRequest
    ) -> ShareAchievementResponse:
        """Create shareable achievement."""
        share_id = uuid4()
        share_url = f"https://app.adhdfocus.com/achievements/{share_id}"

        query = """
            INSERT INTO shared_achievements (
                share_id, user_id, achievement_type, achievement_data,
                share_platform, share_url, is_public
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        """
        self.execute(
            query, share_id, request.user_id, request.achievement_type,
            request.achievement_data, request.share_platform,
            share_url, request.is_public
        )

        # Generate share text
        share_text = self._generate_share_text(request.achievement_type, request.achievement_data)

        return ShareAchievementResponse(
            share_id=share_id,
            share_url=share_url if request.is_public else None,
            share_text=share_text
        )

    def _generate_share_text(self, achievement_type: str, data: dict) -> str:
        """Generate social media share text."""
        templates = {
            "streak": "🔥 I'm on a {days}-day productivity streak!",
            "badge": "🏆 Achievement unlocked: {badge_name}!",
            "level": "🎮 Level {level} reached!",
            "task_completion": "✅ Completed {count} tasks this week!"
        }
        template = templates.get(achievement_type, "🎉 New achievement!")
        return template.format(**data)

    def share_template(
        self,
        template_id: UUID,
        user_id: str
    ) -> ShareTemplateResponse:
        """Share a task template."""
        # Get template data
        template = self.fetch_one(
            "SELECT * FROM task_templates WHERE template_id = $1",
            template_id
        )

        # Generate short share code
        share_code = self._generate_share_code(template.name)

        query = """
            INSERT INTO shared_templates (
                original_template_id, shared_by_user_id,
                template_data, share_code
            ) VALUES ($1, $2, $3, $4)
            RETURNING shared_template_id, share_code
        """
        result = self.fetch_one(
            query, template_id, user_id,
            template.dict(), share_code
        )

        return ShareTemplateResponse(
            shared_template_id=result.shared_template_id,
            share_code=result.share_code,
            share_url=f"https://app.adhdfocus.com/templates/{result.share_code}"
        )

    def _generate_share_code(self, template_name: str) -> str:
        """Generate unique share code from template name."""
        import hashlib
        import random

        # Take first word of template name, uppercase
        prefix = template_name.split()[0][:8].upper().replace(" ", "")

        # Add random suffix
        suffix = ''.join(random.choices('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', k=4))

        return f"{prefix}-{suffix}"

    def import_template(
        self,
        user_id: str,
        share_code: str
    ) -> UUID:
        """Import a shared template."""
        # Get shared template
        shared = self.fetch_one(
            "SELECT * FROM shared_templates WHERE share_code = $1",
            share_code
        )

        if not shared:
            raise ValueError(f"Template not found: {share_code}")

        # Create new template for user
        template_data = shared.template_data
        template_data['user_id'] = user_id

        insert_query = """
            INSERT INTO task_templates (user_id, name, category, icon, steps)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING template_id
        """
        result = self.fetch_one(
            insert_query,
            user_id,
            template_data['name'],
            template_data['category'],
            template_data.get('icon'),
            template_data['steps']
        )

        # Track import
        self.execute(
            "INSERT INTO template_imports (user_id, shared_template_id) VALUES ($1, $2)",
            user_id, shared.shared_template_id
        )

        # Increment use count
        self.execute(
            "UPDATE shared_templates SET use_count = use_count + 1 WHERE shared_template_id = $1",
            shared.shared_template_id
        )

        return result.template_id
```

---

## 🌐 API Routes

```python
router = APIRouter(prefix="/api/v1/sharing", tags=["sharing"])

@router.post("/achievements", response_model=ShareAchievementResponse)
async def share_achievement(
    request: ShareAchievementRequest,
    repo: SharingRepository = Depends()
):
    """Share an achievement to social media or get shareable link."""
    return repo.create_achievement_share(request)


@router.post("/templates", response_model=ShareTemplateResponse)
async def share_template(
    request: ShareTemplateRequest,
    repo: SharingRepository = Depends()
):
    """Share a task template with a short code."""
    return repo.share_template(request.template_id, request.user_id)


@router.post("/templates/import", status_code=201)
async def import_template(
    request: ImportTemplateRequest,
    repo: SharingRepository = Depends()
):
    """Import a shared template using share code."""
    template_id = repo.import_template(request.user_id, request.share_code)
    return {"template_id": template_id, "message": "Template imported successfully"}


@router.get("/templates/popular", response_model=List[dict])
async def get_popular_templates(
    limit: int = Query(10, ge=1, le=50),
    repo: SharingRepository = Depends()
):
    """Get most-used community templates."""
    query = """
        SELECT shared_template_id, share_code, template_data, use_count
        FROM shared_templates
        WHERE is_active = true
        ORDER BY use_count DESC
        LIMIT $1
    """
    return repo.fetch_all(query, limit)
```

---

## 🧪 TDD Tests

```python
class TestSharingService:
    def test_share_achievement_generates_text(self, repo):
        """RED: Should generate shareable text."""
        request = ShareAchievementRequest(
            user_id="user-123",
            achievement_type="streak",
            achievement_data={"days": 7},
            share_platform="twitter"
        )

        result = repo.create_achievement_share(request)

        assert "7-day" in result.share_text
        assert result.share_url

    def test_share_template_creates_code(self, repo):
        """RED: Should create short share code."""
        # Create template first
        template_id = uuid4()
        repo.execute(
            "INSERT INTO task_templates (template_id, user_id, name, category) VALUES ($1, $2, $3, $4)",
            template_id, "user-123", "Homework Assignment", "Academic"
        )

        result = repo.share_template(template_id, "user-123")

        assert result.share_code
        assert len(result.share_code) <= 20
        assert "-" in result.share_code  # Format: PREFIX-SUFFIX

    def test_import_template_creates_copy(self, repo):
        """RED: Importing should create new template for user."""
        # Setup: Share a template
        original_template_id = uuid4()
        repo.execute(
            "INSERT INTO task_templates (template_id, user_id, name, category) VALUES ($1, $2, $3, $4)",
            original_template_id, "user-123", "Test Template", "Work"
        )

        shared = repo.share_template(original_template_id, "user-123")

        # Import as different user
        imported_id = repo.import_template("user-456", shared.share_code)

        assert imported_id != original_template_id

        # Verify it belongs to new user
        imported = repo.fetch_one(
            "SELECT * FROM task_templates WHERE template_id = $1",
            imported_id
        )
        assert imported.user_id == "user-456"

    def test_import_increments_use_count(self, repo):
        """RED: Each import should increment use count."""
        # Setup
        template_id = uuid4()
        repo.execute(
            "INSERT INTO task_templates (template_id, user_id, name, category) VALUES ($1, $2, $3, $4)",
            template_id, "user-123", "Popular Template", "Personal"
        )

        shared = repo.share_template(template_id, "user-123")

        # Import twice
        repo.import_template("user-456", shared.share_code)
        repo.import_template("user-789", shared.share_code)

        # Check use count
        result = repo.fetch_one(
            "SELECT use_count FROM shared_templates WHERE share_code = $1",
            shared.share_code
        )

        assert result.use_count == 2
```

---

## ✅ Acceptance Criteria

- [ ] Users can share achievements with generated text
- [ ] Templates can be exported with short codes
- [ ] Templates can be imported via share codes
- [ ] Use count tracks template popularity
- [ ] Public achievement links work
- [ ] 95%+ test coverage

---

## 🎯 Success Metrics

- **Share Rate**: 10%+ of achievements shared
- **Template Adoption**: 20+ templates shared in first month
- **Viral Coefficient**: Average 1.5 imports per shared template

---

## 📚 Additional Context

**Future Enhancements**:
- OpenGraph meta tags for rich previews
- Generated achievement images
- Friend system for direct sharing
- Collaborative tasks
