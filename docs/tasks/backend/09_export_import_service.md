# BE-09: Export/Import Service

**Delegation Mode**: ⚙️ DELEGATE
**Estimated Time**: 3-4 hours
**Dependencies**: Core models
**Agent Type**: backend-tdd

## 📋 Overview
Enable users to export their data (tasks, achievements, settings) and import to new device/account.

## 🗄️ Database Schema
```sql
CREATE TABLE export_requests (
    export_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    export_type VARCHAR(50) NOT NULL,  -- 'full', 'tasks_only', 'achievements'
    status VARCHAR(20) DEFAULT 'processing',
    file_url VARCHAR(500),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🏗️ Models
```python
class ExportRequest(BaseModel):
    user_id: str
    export_type: Literal["full", "tasks_only", "achievements"]
    include_completed: bool = True

class ExportResponse(BaseModel):
    export_id: UUID
    download_url: str
    expires_at: datetime

class ImportRequest(BaseModel):
    user_id: str
    import_data: Dict[str, Any]
    merge_strategy: Literal["replace", "merge"] = "merge"
```

## 🌐 API Routes
```python
@router.post("/export")
async def create_export(request: ExportRequest):
    """Create data export (JSON format)."""
    pass

@router.post("/import")
async def import_data(request: ImportRequest):
    """Import previously exported data."""
    pass
```

## 🧪 Tests
- Export creates valid JSON
- Import restores all data
- Merge strategy works correctly
- Expired exports are cleaned up

## ✅ Acceptance Criteria
- [ ] Full export includes all user data
- [ ] Import handles duplicates gracefully
- [ ] Exports expire after 7 days
- [ ] 95%+ test coverage
