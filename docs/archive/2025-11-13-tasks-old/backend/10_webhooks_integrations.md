# BE-10: Webhooks & Integrations

**Delegation Mode**: ⚙️ DELEGATE
**Estimated Time**: 4-5 hours
**Dependencies**: Core task models
**Agent Type**: backend-tdd

## 📋 Overview
Allow third-party integrations via webhooks for task creation, completion events.

## 🗄️ Database Schema
```sql
CREATE TABLE webhooks (
    webhook_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    events TEXT[] NOT NULL,  -- ['task.created', 'task.completed']
    secret VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE webhook_deliveries (
    delivery_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID REFERENCES webhooks(webhook_id),
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    attempts INT DEFAULT 0,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🏗️ Models
```python
class WebhookCreate(BaseModel):
    user_id: str
    url: HttpUrl
    events: List[Literal["task.created", "task.completed", "achievement.unlocked"]]
    secret: Optional[str] = None

class WebhookEvent(BaseModel):
    event_type: str
    timestamp: datetime
    data: Dict[str, Any]
    signature: str  # HMAC signature for verification
```

## 🌐 API Routes
```python
@router.post("/webhooks")
async def create_webhook(webhook: WebhookCreate):
    """Register a new webhook endpoint."""
    pass

@router.delete("/webhooks/{webhook_id}")
async def delete_webhook(webhook_id: UUID):
    """Remove webhook."""
    pass

@router.post("/webhooks/{webhook_id}/test")
async def test_webhook(webhook_id: UUID):
    """Send test event to webhook."""
    pass
```

## 🧪 Tests
- Webhook creation works
- Events are delivered with retry logic
- HMAC signatures are correct
- Failed deliveries are retried (3 attempts)

## ✅ Acceptance Criteria
- [ ] Webhooks can be registered
- [ ] Events trigger HTTP POST to webhook URL
- [ ] HMAC signatures included for verification
- [ ] Failed deliveries retry with exponential backoff
- [ ] 95%+ test coverage
