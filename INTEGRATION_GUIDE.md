# Temporal Knowledge Graph Integration Guide

## Quick Start

### 1. Run Database Migration

```bash
# Navigate to project root
cd /Users/shrenilpatel/Github/Proxy-Agent-Platform

# Apply temporal KG schema
sqlite3 proxy_agents_enhanced.db < src/database/migrations/004_add_temporal_kg.sql

# Verify tables
sqlite3 proxy_agents_enhanced.db ".tables"
```

**Expected output:**
```
kg_entities                  kg_temporal_entities
kg_relationships             kg_temporal_relationships
kg_shopping_items            kg_preference_history
kg_event_log                 kg_recurring_patterns
```

### 2. Test Shopping List Service

```python
# Test in Python REPL
from src.services.shopping_list_service import ShoppingListService

service = ShoppingListService()

# Add items via natural language
items, dups = service.parse_natural_language(
    user_id="alice",
    text="buy milk, eggs and coffee"
)

print(f"Added {len(items)} items:")
for item in items:
    print(f"  - {item.item_name} ({item.category})")

# Check for duplicates
item2, is_new = service.add_item("alice", "Milk")
if not is_new:
    print(f"Duplicate! Milk was added {item2.added_at}")

# Get active shopping list
active = service.get_active_items("alice", sort_by="urgency")
for item in active:
    print(f"{item.urgency}: {item.item_name} ({item.get_freshness()})")
```

### 3. Verify Sample Data

```bash
# Check sample shopping items
sqlite3 proxy_agents_enhanced.db "
  SELECT item_name, category, urgency, status
  FROM kg_shopping_items
  WHERE user_id = 'alice';
"
```

**Expected output:**
```
Milk|groceries|normal|active
Coffee Beans|groceries|urgent|active
Light Bulbs|hardware|someday|active
```

## Integration Checklist

### Phase 1: Backend Integration (THIS IS DONE ✅)

- [x] Database schema migration
- [x] Temporal models (Pydantic)
- [x] Shopping list service
- [x] Event logging
- [x] Pattern detection logic

### Phase 2: API Endpoints (NEXT STEP)

Create `/src/api/shopping.py`:

```python
"""Shopping List API Endpoints"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from src.services.shopping_list_service import ShoppingListService
from src.knowledge.temporal_models import ItemCategory, ItemUrgency

router = APIRouter(prefix="/api/v1/shopping", tags=["shopping"])


# Request/Response models
class AddItemsRequest(BaseModel):
    text: str
    user_id: str
    urgency: ItemUrgency = ItemUrgency.NORMAL


class ShoppingItemResponse(BaseModel):
    item_id: str
    item_name: str
    category: Optional[str]
    urgency: str
    freshness: str
    added_at: str
    is_recurring: bool


# Endpoints
@router.post("/items")
async def add_shopping_items(request: AddItemsRequest):
    """
    Add shopping items via natural language.

    Example:
        POST /api/v1/shopping/items
        {
            "text": "buy milk, eggs and coffee",
            "user_id": "alice",
            "urgency": "normal"
        }
    """
    service = ShoppingListService()

    items, duplicates = service.parse_natural_language(
        user_id=request.user_id,
        text=request.text
    )

    return {
        "added": [
            ShoppingItemResponse(
                item_id=item.item_id,
                item_name=item.item_name,
                category=item.category.value if item.category else None,
                urgency=item.urgency.value,
                freshness=item.get_freshness(),
                added_at=item.added_at.isoformat(),
                is_recurring=item.is_recurring
            )
            for item in items
        ],
        "duplicates": duplicates,
        "message": f"Added {len(items)} items" + (
            f", {len(duplicates)} duplicates found" if duplicates else ""
        )
    }


@router.get("/items")
async def get_shopping_list(
    user_id: str,
    category: Optional[ItemCategory] = None,
    sort_by: str = "urgency"
):
    """
    Get active shopping list.

    Example:
        GET /api/v1/shopping/items?user_id=alice&sort_by=urgency
    """
    service = ShoppingListService()

    items = service.get_active_items(
        user_id=user_id,
        category=category,
        sort_by=sort_by
    )

    return {
        "items": [
            ShoppingItemResponse(
                item_id=item.item_id,
                item_name=item.item_name,
                category=item.category.value if item.category else None,
                urgency=item.urgency.value,
                freshness=item.get_freshness(),
                added_at=item.added_at.isoformat(),
                is_recurring=item.is_recurring
            )
            for item in items
        ],
        "total": len(items)
    }


@router.post("/items/{item_id}/complete")
async def complete_item(item_id: str):
    """
    Mark item as completed (purchased).

    Example:
        POST /api/v1/shopping/items/abc123/complete
    """
    service = ShoppingListService()

    item = service.complete_item(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    return {
        "success": True,
        "item_id": item.item_id,
        "message": f"Completed: {item.item_name}",
        "is_recurring": item.is_recurring,
        "pattern": item.recurrence_pattern.value if item.recurrence_pattern else None
    }


@router.delete("/items/{item_id}")
async def cancel_item(item_id: str):
    """
    Cancel a shopping item.

    Example:
        DELETE /api/v1/shopping/items/abc123
    """
    service = ShoppingListService()

    success = service.cancel_item(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")

    return {
        "success": True,
        "message": "Item cancelled"
    }


@router.get("/patterns")
async def get_recurring_patterns(user_id: str):
    """
    Get recurring purchase patterns.

    Example:
        GET /api/v1/shopping/patterns?user_id=alice
    """
    service = ShoppingListService()

    items = service.get_recurring_items(user_id)

    return {
        "patterns": [
            {
                "item_name": item.item_name,
                "recurrence": item.recurrence_pattern.value if item.recurrence_pattern else None,
                "purchase_count": item.purchase_count,
                "last_purchased": item.last_purchased.isoformat() if item.last_purchased else None
            }
            for item in items
        ],
        "total": len(items)
    }
```

**Register in main.py:**

```python
# In src/api/main.py
from src.api import shopping

app.include_router(shopping.router)
```

### Phase 3: Input Classification (RECOMMENDED)

Create `/src/services/input_classifier_service.py`:

```python
"""Input Classification Service - Classify user input type"""

from enum import Enum
import re


class InputType(str, Enum):
    """Types of user inputs"""
    SHOPPING_ITEM = "shopping_item"
    TASK = "task"
    QUERY = "query"
    PREFERENCE = "preference"
    REMINDER = "reminder"


class InputClassifier:
    """Classify user input to route to appropriate handler"""

    def __init__(self):
        # Shopping keywords
        self.shopping_keywords = [
            "buy", "get", "purchase", "grab", "pick up", "need",
            "shopping", "grocery", "groceries", "store"
        ]

        # Query keywords
        self.query_keywords = [
            "what", "when", "where", "who", "how many", "show me",
            "list", "find", "search"
        ]

        # Preference keywords
        self.preference_keywords = [
            "i prefer", "i like", "i usually", "my favorite",
            "i work best", "i need"
        ]

    def classify(self, text: str) -> InputType:
        """
        Classify input text.

        Examples:
            "buy milk" → SHOPPING_ITEM
            "write report" → TASK
            "what tasks do I have?" → QUERY
            "I prefer mornings" → PREFERENCE
        """
        text_lower = text.lower().strip()

        # Shopping detection (highest priority for shopping keywords)
        if any(keyword in text_lower for keyword in self.shopping_keywords):
            # Check if it's a query about shopping
            if any(q in text_lower for q in ["what", "show", "list"]):
                return InputType.QUERY
            return InputType.SHOPPING_ITEM

        # Query detection
        if any(keyword in text_lower for keyword in self.query_keywords):
            return InputType.QUERY

        # Preference detection
        if any(keyword in text_lower for keyword in self.preference_keywords):
            return InputType.PREFERENCE

        # Default: treat as task
        return InputType.TASK
```

**Update QuickCaptureService:**

```python
# In src/services/quick_capture_service.py

from src.services.input_classifier_service import InputClassifier, InputType
from src.services.shopping_list_service import ShoppingListService

class QuickCaptureService:
    def __init__(self):
        # ... existing initialization ...
        self.classifier = InputClassifier()
        self.shopping_service = ShoppingListService()

    async def analyze_capture(
        self,
        text: str,
        user_id: str,
        voice_input: bool = False,
        kg_context: Optional[KGContext] = None,
    ) -> dict[str, Any]:
        """Enhanced with input classification"""

        # 1. Classify input type
        input_type = self.classifier.classify(text)

        # 2. Route based on type
        if input_type == InputType.SHOPPING_ITEM:
            # Handle shopping list
            items, duplicates = self.shopping_service.parse_natural_language(
                user_id=user_id,
                text=text
            )

            return {
                "type": "shopping_list",
                "items": items,
                "duplicates": duplicates,
                "message": f"Added {len(items)} items to shopping list"
            }

        elif input_type == InputType.QUERY:
            # Handle query (route to search/retrieval)
            return {
                "type": "query",
                "query": text,
                "message": "Processing query..."
            }

        elif input_type == InputType.PREFERENCE:
            # Handle preference storage
            return {
                "type": "preference",
                "message": "Preference saved"
            }

        # Default: existing task flow
        return await self._analyze_task(text, user_id, voice_input, kg_context)
```

### Phase 4: Frontend UI (FUTURE)

Create shopping list UI components:

```typescript
// frontend/src/components/mobile/ShoppingList.tsx

import { useState, useEffect } from 'react';

interface ShoppingItem {
  item_id: string;
  item_name: string;
  category: string;
  urgency: 'urgent' | 'normal' | 'someday';
  freshness: 'fresh' | 'aging' | 'stale';
  is_recurring: boolean;
}

export function ShoppingList({ userId }: { userId: string }) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [input, setInput] = useState('');

  // Fetch shopping list
  useEffect(() => {
    fetch(`/api/v1/shopping/items?user_id=${userId}`)
      .then(res => res.json())
      .then(data => setItems(data.items));
  }, [userId]);

  // Add items
  const handleAdd = async () => {
    const response = await fetch('/api/v1/shopping/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: input,
        user_id: userId,
        urgency: 'normal'
      })
    });

    const data = await response.json();

    // Show duplicates
    if (data.duplicates.length > 0) {
      alert(`Already added: ${data.duplicates.join(', ')}`);
    }

    // Refresh list
    setInput('');
    // ... refresh items
  };

  return (
    <div className="shopping-list">
      {/* Input */}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Add items (e.g., milk, eggs, coffee)"
      />
      <button onClick={handleAdd}>Add</button>

      {/* List */}
      <div className="items">
        {items.map(item => (
          <div key={item.item_id} className={`item ${item.freshness}`}>
            <span className={`urgency-${item.urgency}`}>
              {item.urgency === 'urgent' && '!'}
              {item.item_name}
            </span>
            {item.is_recurring && <span className="badge">Recurring</span>}
            <span className="freshness">{item.freshness}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Testing

### Unit Tests

```python
# src/services/tests/test_shopping_list_service.py

import pytest
from datetime import datetime, timedelta
from src.services.shopping_list_service import ShoppingListService
from src.knowledge.temporal_models import ItemUrgency


@pytest.fixture
def service():
    return ShoppingListService()


def test_add_item(service):
    """Test adding a shopping item"""
    item, is_new = service.add_item("alice", "Milk", urgency="urgent")

    assert is_new is True
    assert item.item_name == "Milk"
    assert item.urgency == ItemUrgency.URGENT


def test_duplicate_detection(service):
    """Test duplicate detection within 24 hours"""
    # Add item
    item1, is_new1 = service.add_item("alice", "Milk")
    assert is_new1 is True

    # Try duplicate
    item2, is_new2 = service.add_item("alice", "Milk")
    assert is_new2 is False
    assert item1.item_id == item2.item_id


def test_natural_language_parsing(service):
    """Test NL parsing"""
    items, dups = service.parse_natural_language(
        "alice",
        "buy milk, eggs and coffee"
    )

    assert len(items) == 3
    assert "Milk" in [i.item_name for i in items]
    assert "Eggs" in [i.item_name for i in items]
    assert "Coffee" in [i.item_name for i in items]


def test_category_classification(service):
    """Test auto-categorization"""
    item, _ = service.add_item("alice", "Milk")
    assert item.category.value == "groceries"

    item2, _ = service.add_item("alice", "Screwdriver")
    assert item2.category.value == "hardware"


def test_recurrence_detection(service):
    """Test pattern detection after 3+ purchases"""
    # Simulate 3 purchases at weekly intervals
    # (Would need to mock database for full test)
    pass


def test_expire_stale_items(service):
    """Test auto-expiry of old items"""
    # Add old item (would need to mock added_at)
    # Run expire_stale_items
    # Verify status changed to EXPIRED
    pass
```

### Integration Tests

```bash
# Test API endpoints
pytest src/api/tests/test_shopping_endpoints.py -v

# Test with real database
pytest src/services/tests/test_shopping_list_service.py --db=proxy_agents_enhanced.db
```

## Deployment

### Environment Variables

No new environment variables needed! Uses existing database connection.

### Background Jobs (Optional)

Add to cron for maintenance:

```bash
# Expire stale items daily at 3 AM
0 3 * * * python -c "
from src.services.shopping_list_service import ShoppingListService
service = ShoppingListService()
service.expire_stale_items('alice', days=30)
"
```

### Monitoring

Track key metrics:
- Shopping items added per day
- Duplicate detection rate
- Recurring patterns detected
- Average list size

## Troubleshooting

### Common Issues

**1. Migration fails**
```bash
# Check if tables already exist
sqlite3 proxy_agents_enhanced.db ".schema kg_shopping_items"

# Drop and recreate
sqlite3 proxy_agents_enhanced.db "DROP TABLE IF EXISTS kg_shopping_items;"
# Re-run migration
```

**2. Import errors**
```python
# Ensure models are importable
python -c "from src.knowledge.temporal_models import ShoppingItem; print('OK')"
```

**3. Database connection issues**
```python
# Test database connection
from src.database.enhanced_adapter import get_enhanced_database
db = get_enhanced_database()
print(db.get_connection())
```

## Next Steps

1. ✅ **Run migration** (5 minutes)
2. ✅ **Test shopping service** (10 minutes)
3. ⏭️ **Create API endpoints** (30 minutes)
4. ⏭️ **Add input classification** (20 minutes)
5. ⏭️ **Build frontend UI** (1-2 hours)
6. ⏭️ **Write tests** (1 hour)
7. ⏭️ **Deploy** (30 minutes)

**Total estimated time**: ~4-5 hours for full integration

## Support

- 📖 Documentation: See [TEMPORAL_KG_DESIGN.md](./TEMPORAL_KG_DESIGN.md)
- 🏗️ Architecture: See [TEMPORAL_ARCHITECTURE.md](./TEMPORAL_ARCHITECTURE.md)
- 📊 Summary: See [TEMPORAL_KG_SUMMARY.md](./TEMPORAL_KG_SUMMARY.md)

---

**Status**: Backend complete, API ready for implementation
**Last Updated**: 2025-10-23
