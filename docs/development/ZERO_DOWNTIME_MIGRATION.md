# Zero-Downtime Migration Strategy
**Safe migration path from current architecture to refactored backend**

**Version**: 1.0
**Date**: 2025-10-25
**Risk Level**: HIGH → MEDIUM → LOW (progressive de-risking)

---

## Executive Summary

This document outlines the **zero-downtime migration strategy** for refactoring the Proxy Agent Platform backend. The strategy ensures:

- ✅ **Zero user-facing downtime** during migration
- ✅ **Instant rollback capability** at every phase
- ✅ **Data integrity** throughout transition
- ✅ **Progressive risk reduction** via feature flags

### Migration Approach: Strangler Fig Pattern

We'll use the [Strangler Fig](https://martinfowler.com/bliki/StranglerFigApplication.html) pattern:

```
Old System ━━━━━━━┓
                  ┃  (Gradually shrinks)
New System ┓      ┃
           ┃      ┃
           ┣━━━━━━┛  (Grows until complete replacement)
           ┃
    Production
```

---

## Phase 1: Parallel Infrastructure (Weeks 1-3)

### Strategy: Side-by-Side Deployment

Deploy v2 code alongside v1 without activating it.

#### 1.1 File Naming Convention

```python
# Old code (untouched)
src/services/task_service.py          # Original
src/repositories/task_repository.py   # Original

# New code (v2)
src/services/task_service_v2.py       # Refactored with DI
src/repositories/task_repository_v2.py # SQLAlchemy-based
```

**Benefits**:
- Old code continues running
- New code deployed but inactive
- Can switch between versions instantly

#### 1.2 Feature Flags

```python
# File: src/core/config.py

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Feature flags for gradual rollout
    use_v2_repositories: bool = False
    use_v2_services: bool = False
    use_v2_api: bool = False

    # Database selection
    use_postgresql: bool = False
    database_url_v2: str = "postgresql://..."

    # Rollout percentage (0-100)
    v2_traffic_percentage: int = 0

settings = Settings()
```

#### 1.3 Router-Level Traffic Splitting

```python
# File: src/api/main.py

from src.core.config import settings
from src.api.routes import tasks_v1, tasks_v2
import random

app = FastAPI()

# Traffic splitting middleware
@app.middleware("http")
async def route_to_version(request: Request, call_next):
    # Route to v2 based on percentage
    if random.randint(1, 100) <= settings.v2_traffic_percentage:
        request.state.api_version = "v2"
    else:
        request.state.api_version = "v1"

    response = await call_next(request)
    response.headers["X-API-Version"] = request.state.api_version
    return response

# Conditional router inclusion
if settings.use_v2_api:
    app.include_router(tasks_v2.router, prefix="/api/v1/tasks")
else:
    app.include_router(tasks_v1.router, prefix="/api/v1/tasks")
```

#### 1.4 Dual Database Write

During transition, write to both databases:

```python
# File: src/services/task_service_hybrid.py

class TaskServiceHybrid:
    """Hybrid service that writes to both v1 and v2"""

    def __init__(self):
        self.v1_service = TaskService()  # Old
        self.v2_service = TaskServiceV2()  # New

    def create_task(self, task_data):
        # Write to v1 (primary)
        task_v1 = self.v1_service.create_task(task_data)

        try:
            # Shadow write to v2 (don't fail on error)
            task_v2 = self.v2_service.create_task(task_data)
            logger.info("Shadow write successful", task_id=task_v1.task_id)
        except Exception as e:
            logger.warning("Shadow write failed", error=str(e))
            # Continue - v1 succeeded

        return task_v1  # Return v1 result
```

**Migration Timeline**:

```
Week 1: Deploy v2 code (0% traffic)
├─ v2 files deployed but unused
├─ Feature flags all OFF
└─ Database: SQLite only

Week 2: Enable shadow writes (0% traffic)
├─ v1 primary, v2 shadow
├─ PostgreSQL writes logged
└─ Compare data consistency

Week 3: Test v2 in staging (0% production traffic)
├─ Staging: 100% v2
├─ Production: Still 100% v1
└─ Validate parity
```

**Rollback Plan**:
- **Week 1**: Delete v2 files
- **Week 2**: Disable shadow writes via feature flag
- **Week 3**: Destroy staging environment

---

## Phase 2: Gradual Traffic Migration (Weeks 4-6)

### Strategy: Canary Deployment with Incremental Rollout

Gradually shift traffic from v1 to v2 with constant monitoring.

#### 2.1 Canary Release Schedule

```
Week 4 (Sprint 2.1):
├─ Day 1: 1% traffic to v2
├─ Day 2: 5% traffic (if metrics green)
├─ Day 3: 10% traffic
├─ Day 4: 25% traffic
└─ Day 5: 50% traffic OR rollback

Week 5 (Sprint 2.2):
├─ Day 1: 75% traffic to v2
├─ Day 2: 90% traffic
├─ Day 3: 95% traffic
└─ Day 4-5: 100% traffic (v1 on standby)

Week 6 (Sprint 2.3):
└─ v1 deprecated, v2 fully active
```

#### 2.2 Health Check Automation

```python
# File: src/monitoring/health_checker.py

from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class HealthMetrics:
    error_rate: float       # 4xx/5xx %
    latency_p95: float      # milliseconds
    throughput: int         # requests/sec
    timestamp: datetime

class CanaryHealthChecker:
    """Automatic rollback based on health metrics"""

    THRESHOLDS = {
        "error_rate_max": 5.0,        # 5% error rate
        "latency_p95_max": 500.0,     # 500ms p95
        "error_rate_increase": 2.0,   # 2x increase over baseline
        "latency_increase": 1.5,      # 1.5x increase over baseline
    }

    def __init__(self):
        self.baseline_metrics = self._get_v1_baseline()

    def check_health(self, v2_metrics: HealthMetrics) -> bool:
        """
        Check if v2 is healthy

        Returns:
            True if healthy, False if should rollback
        """
        # Absolute threshold checks
        if v2_metrics.error_rate > self.THRESHOLDS["error_rate_max"]:
            logger.critical("Error rate too high", rate=v2_metrics.error_rate)
            self.trigger_rollback("Error rate exceeded threshold")
            return False

        if v2_metrics.latency_p95 > self.THRESHOLDS["latency_p95_max"]:
            logger.critical("Latency too high", p95=v2_metrics.latency_p95)
            self.trigger_rollback("Latency exceeded threshold")
            return False

        # Relative threshold checks (compare to v1 baseline)
        error_ratio = v2_metrics.error_rate / self.baseline_metrics.error_rate
        if error_ratio > self.THRESHOLDS["error_rate_increase"]:
            logger.critical("Error rate increased", ratio=error_ratio)
            self.trigger_rollback("Error rate increased significantly")
            return False

        return True

    def trigger_rollback(self, reason: str):
        """Automatic rollback to v1"""
        logger.critical("TRIGGERING ROLLBACK", reason=reason)

        # Set feature flags to revert to v1
        import redis
        r = redis.Redis()
        r.set("feature:v2_traffic_percentage", "0")

        # Send alerts
        self.send_pagerduty_alert(reason)
        self.send_slack_alert(reason)
```

#### 2.3 Comparison Testing (Shadow Mode)

Run v2 in shadow mode to compare results:

```python
# File: src/api/comparison_middleware.py

from fastapi import Request
import asyncio
import logging

logger = logging.getLogger(__name__)

async def compare_v1_v2(request: Request):
    """Call both v1 and v2, compare results"""

    # Call v1 (production)
    v1_response = await call_v1_endpoint(request)

    # Call v2 in background (shadow)
    asyncio.create_task(shadow_v2_call(request, v1_response))

    # Return v1 response to user
    return v1_response

async def shadow_v2_call(request: Request, v1_response):
    """Shadow call to v2 for comparison"""
    try:
        v2_response = await call_v2_endpoint(request)

        # Compare responses
        if v1_response.json() != v2_response.json():
            logger.warning(
                "Response mismatch",
                endpoint=request.url.path,
                v1=v1_response.json(),
                v2=v2_response.json()
            )
        else:
            logger.info("Response match", endpoint=request.url.path)

    except Exception as e:
        logger.error("Shadow call failed", error=str(e))
```

#### 2.4 Data Migration

Migrate existing data from SQLite to PostgreSQL:

```python
# File: scripts/migrate_data.py

import sqlite3
import asyncpg
from tqdm import tqdm

async def migrate_table(table_name: str, batch_size: int = 1000):
    """Migrate table from SQLite to PostgreSQL"""

    # Connect to both databases
    sqlite_conn = sqlite3.connect("proxy_agents_enhanced.db")
    pg_conn = await asyncpg.connect("postgresql://...")

    # Get row count
    cursor = sqlite_conn.execute(f"SELECT COUNT(*) FROM {table_name}")
    total_rows = cursor.fetchone()[0]

    logger.info(f"Migrating {total_rows} rows from {table_name}")

    # Batch migrate
    offset = 0
    with tqdm(total=total_rows) as pbar:
        while offset < total_rows:
            # Read batch from SQLite
            rows = sqlite_conn.execute(
                f"SELECT * FROM {table_name} LIMIT {batch_size} OFFSET {offset}"
            ).fetchall()

            # Insert into PostgreSQL
            await pg_conn.executemany(
                f"INSERT INTO {table_name} VALUES ({','.join(['$' + str(i+1) for i in range(len(rows[0]))])})",
                rows
            )

            offset += batch_size
            pbar.update(len(rows))

    # Verify count
    pg_count = await pg_conn.fetchval(f"SELECT COUNT(*) FROM {table_name}")
    assert pg_count == total_rows, f"Migration incomplete: {pg_count} != {total_rows}"

    logger.info(f"Migration complete: {table_name}")

async def migrate_all():
    """Migrate all tables"""
    tables = [
        "users",
        "projects",
        "tasks",
        "micro_steps",
        "focus_sessions",
        # ... all tables
    ]

    for table in tables:
        await migrate_table(table)

# Run migration
# python scripts/migrate_data.py --dry-run  # Test first
# python scripts/migrate_data.py            # Actual migration
```

**Rollback Plan**:
- **Week 4**: Revert `v2_traffic_percentage` to 0%
- **Week 5**: Switch database back to SQLite
- **Week 6**: Disable v2 services, revert to v1

---

## Phase 3: Complete Cutover (Weeks 7-8)

### Strategy: Final Migration with Fallback

Complete transition to v2 and decommission v1.

#### 3.1 Final Cutover Checklist

```bash
# Pre-cutover validation (Friday before cutover)
□ All tests passing (unit, integration, E2E)
□ Staging environment 100% v2 for 1 week
□ Performance benchmarks meet targets
□ Security audit passed
□ Data migration complete and validated
□ Rollback plan tested
□ Team on-call for 48 hours

# Cutover steps (Saturday 2am - low traffic window)
□ 01:00 - Final database backup
□ 02:00 - Set v2_traffic_percentage to 100%
□ 02:05 - Monitor error rates for 15 minutes
□ 02:20 - Run smoke tests
□ 02:30 - Validate data consistency
□ 03:00 - Declare cutover complete OR rollback

# Post-cutover monitoring (48 hours)
□ Monitor error rates every 15 minutes
□ Compare metrics to baseline
□ Watch for anomalies
□ Team on-call

# Decommission v1 (1 week after cutover)
□ Archive v1 code
□ Delete v1 database (after backup)
□ Remove feature flags
□ Update documentation
```

#### 3.2 Emergency Rollback Procedure

**Scenario**: Critical issue discovered after cutover

```bash
# EMERGENCY ROLLBACK (Execute in <5 minutes)

# Step 1: Revert traffic (30 seconds)
kubectl set env deployment/api FEATURE_V2_TRAFFIC_PERCENTAGE=0

# Step 2: Scale down v2 pods (30 seconds)
kubectl scale deployment/api-v2 --replicas=0

# Step 3: Verify v1 operational (1 minute)
curl https://api.proxyagent.dev/health
# Should return: {"version": "v1", "status": "healthy"}

# Step 4: Monitor recovery (2 minutes)
watch -n 5 'curl -s https://api.proxyagent.dev/health | jq .'

# Step 5: Notify team
slack-notify "#backend-refactor" "ROLLBACK COMPLETE: v1 restored"

# Step 6: Post-mortem (within 24 hours)
# Document what went wrong
# Create fix plan
# Schedule re-attempt
```

#### 3.3 Database Cutover Strategy

**Option A: Blue-Green Database** (Recommended)

```
┌─────────────┐        ┌─────────────┐
│  SQLite     │        │ PostgreSQL  │
│  (Blue)     │        │  (Green)    │
│  Primary    │ ════>  │  Shadow     │
└─────────────┘        └─────────────┘
                              │
                              │ (Validate data parity)
                              ↓
┌─────────────┐        ┌─────────────┐
│  SQLite     │        │ PostgreSQL  │
│  (Blue)     │  <════ │  (Green)    │
│  Standby    │        │  Primary    │  ← CUTOVER
└─────────────┘        └─────────────┘
```

**Cutover Steps**:
1. **Week 6**: Shadow write to PostgreSQL (primary still SQLite)
2. **Week 7**: Compare data integrity (must be 100% match)
3. **Week 8 Saturday 2am**:
   - Stop writes to SQLite
   - Switch `DATABASE_URL` to PostgreSQL
   - Resume writes
   - Keep SQLite as hot standby for 48 hours

**Option B: Logical Replication** (Lower risk but slower)

Use PostgreSQL's logical replication to sync from SQLite:
- Continuous replication
- Zero downtime
- Instant rollback

**Rollback**: Change `DATABASE_URL` back to SQLite

#### 3.4 API Endpoint Migration

**Week 7-8**: Deprecate old endpoints

```python
# File: src/api/routes/tasks_v1.py

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/api/v1/tasks", tags=["Tasks (Deprecated)"])

@router.post(
    "/simple",
    deprecated=True,
    responses={
        410: {"description": "Endpoint gone - use POST /api/v1/tasks"}
    }
)
async def create_simple_task_deprecated():
    """
    DEPRECATED: This endpoint has been removed.

    Please use POST /api/v1/tasks with scope=simple instead.

    Migration guide: https://docs.proxyagent.dev/migration/v2
    """
    return JSONResponse(
        status_code=status.HTTP_410_GONE,
        content={
            "error": "Endpoint deprecated",
            "message": "Use POST /api/v1/tasks instead",
            "migration_guide": "https://docs.proxyagent.dev/migration/v2",
            "sunset_date": "2025-12-25"
        }
    )
```

**Endpoint Deprecation Timeline**:
- **Week 7**: Add deprecation warnings (200 response + header)
- **Week 8**: Return 410 Gone for old endpoints
- **Week 12**: Remove old endpoints completely

---

## Monitoring & Validation

### Key Metrics to Track

| Metric | Baseline (v1) | Target (v2) | Alert Threshold |
|--------|---------------|-------------|-----------------|
| **Error Rate** | 0.5% | <1% | >2% |
| **Latency (p50)** | 100ms | <100ms | >150ms |
| **Latency (p95)** | 300ms | <200ms | >400ms |
| **Latency (p99)** | 800ms | <500ms | >1000ms |
| **Throughput** | 100 RPS | >100 RPS | <80 RPS |
| **Database Queries** | 5 per request | <3 per request | >7 per request |
| **Memory Usage** | 500MB | <600MB | >1GB |
| **CPU Usage** | 30% | <40% | >60% |

### Grafana Dashboard

```yaml
# grafana-dashboard.json
{
  "title": "Backend Migration Monitoring",
  "panels": [
    {
      "title": "Traffic Split (v1 vs v2)",
      "targets": [
        "sum(rate(http_requests_total{version='v1'}[5m]))",
        "sum(rate(http_requests_total{version='v2'}[5m]))"
      ]
    },
    {
      "title": "Error Rate Comparison",
      "targets": [
        "sum(rate(http_errors_total{version='v1'}[5m])) / sum(rate(http_requests_total{version='v1'}[5m]))",
        "sum(rate(http_errors_total{version='v2'}[5m])) / sum(rate(http_requests_total{version='v2'}[5m]))"
      ],
      "alert": {
        "condition": "v2_error_rate > v1_error_rate * 2",
        "action": "trigger_rollback"
      }
    },
    {
      "title": "Latency Comparison (p95)",
      "targets": [
        "histogram_quantile(0.95, http_request_duration_seconds{version='v1'})",
        "histogram_quantile(0.95, http_request_duration_seconds{version='v2'})"
      ]
    }
  ]
}
```

### Data Validation Queries

```sql
-- Check record count parity
SELECT
    'SQLite' as db,
    (SELECT COUNT(*) FROM tasks) as task_count,
    (SELECT COUNT(*) FROM projects) as project_count
UNION ALL
SELECT
    'PostgreSQL' as db,
    (SELECT COUNT(*) FROM tasks) as task_count,
    (SELECT COUNT(*) FROM projects) as project_count;

-- Expected: Exact match

-- Check for data inconsistencies
SELECT
    task_id,
    'missing_in_postgres' as issue
FROM sqlite_tasks
WHERE task_id NOT IN (SELECT task_id FROM postgres_tasks)
UNION ALL
SELECT
    task_id,
    'missing_in_sqlite' as issue
FROM postgres_tasks
WHERE task_id NOT IN (SELECT task_id FROM sqlite_tasks);

-- Expected: Zero rows
```

---

## Risk Assessment

### Risk Matrix

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Data loss during migration** | Low | Critical | Backups + validation scripts |
| **Performance regression** | Medium | High | Canary deployment + auto-rollback |
| **API breaking changes** | Low | High | Deprecated endpoints + migration guide |
| **Database corruption** | Very Low | Critical | Blue-green deployment |
| **Rollback failure** | Low | Critical | Weekly rollback drills |
| **Team burnout** | Medium | Medium | Realistic timeline + on-call rotation |

### Mitigation Strategies

1. **Weekly Rollback Drills** (Starting Week 2)
   - Practice rolling back from v2 to v1
   - Ensure process takes <5 minutes
   - Document any issues

2. **Automated Testing Gates**
   - No deployment without 100% test pass
   - Performance regression tests
   - Data integrity checks

3. **Communication Plan**
   - Daily updates to stakeholders
   - Immediate notification on rollback
   - Post-mortem after any incident

---

## Success Criteria

### Phase 1 Success (Week 3)
- ✅ v2 code deployed (0% traffic)
- ✅ Shadow writes 100% successful
- ✅ Staging runs 100% v2

### Phase 2 Success (Week 6)
- ✅ 100% traffic on v2
- ✅ All metrics green for 7 days
- ✅ Zero rollbacks

### Phase 3 Success (Week 8)
- ✅ v1 decommissioned
- ✅ Feature flags removed
- ✅ Production stable for 14 days

---

## Appendix A: Runbooks

### Runbook 1: Increase v2 Traffic

```bash
#!/bin/bash
# increase_v2_traffic.sh

CURRENT_PERCENTAGE=$(kubectl get configmap feature-flags -o jsonpath='{.data.v2_traffic_percentage}')
NEW_PERCENTAGE=$1

echo "Current: ${CURRENT_PERCENTAGE}%"
echo "Target: ${NEW_PERCENTAGE}%"
read -p "Proceed? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Update config
    kubectl patch configmap feature-flags -p "{\"data\":{\"v2_traffic_percentage\":\"$NEW_PERCENTAGE\"}}"

    # Wait 30 seconds
    echo "Waiting 30 seconds for config propagation..."
    sleep 30

    # Check health
    echo "Checking health metrics..."
    python scripts/check_health.py --duration=300  # 5 minutes

    if [ $? -eq 0 ]; then
        echo "✅ Health check passed!"
    else
        echo "❌ Health check failed - rolling back"
        kubectl patch configmap feature-flags -p "{\"data\":{\"v2_traffic_percentage\":\"$CURRENT_PERCENTAGE\"}}"
    fi
fi
```

### Runbook 2: Emergency Rollback

```bash
#!/bin/bash
# emergency_rollback.sh

echo "🚨 EMERGENCY ROLLBACK INITIATED"

# Step 1: Set traffic to 0%
echo "Step 1/5: Reverting traffic to v1..."
kubectl patch configmap feature-flags -p '{"data":{"v2_traffic_percentage":"0"}}'

# Step 2: Scale down v2
echo "Step 2/5: Scaling down v2 pods..."
kubectl scale deployment/api-v2 --replicas=0

# Step 3: Verify v1 health
echo "Step 3/5: Checking v1 health..."
for i in {1..5}; do
    curl -sf https://api.proxyagent.dev/health | jq '.version' | grep -q "v1"
    if [ $? -eq 0 ]; then
        echo "✅ v1 operational"
        break
    fi
    sleep 5
done

# Step 4: Send alerts
echo "Step 4/5: Sending alerts..."
curl -X POST https://hooks.slack.com/... -d '{"text":"🚨 ROLLBACK COMPLETE: v1 restored"}'

# Step 5: Create incident ticket
echo "Step 5/5: Creating incident ticket..."
# Auto-create Jira ticket or similar

echo "✅ ROLLBACK COMPLETE"
```

---

## Appendix B: Testing Checklist

### Pre-Migration Testing

- [ ] All unit tests pass (≥80% coverage)
- [ ] All integration tests pass
- [ ] Performance tests show no regression
- [ ] Security scan shows zero critical CVEs
- [ ] Load test passes (1000 RPS sustained)
- [ ] Chaos engineering test (random pod kills)
- [ ] Rollback drill completed successfully
- [ ] Database migration tested on staging
- [ ] API backward compatibility verified

### During Migration

- [ ] Monitor error rates every 15 minutes
- [ ] Compare v1/v2 response times
- [ ] Validate data consistency every hour
- [ ] Check database replication lag
- [ ] Review logs for warnings
- [ ] Test rollback procedure

### Post-Migration

- [ ] All endpoints returning expected responses
- [ ] Database queries optimized
- [ ] No orphaned data in either DB
- [ ] Feature flags cleaned up
- [ ] Documentation updated
- [ ] Post-mortem completed

---

**This migration strategy ensures safety through:**
- 🔒 **Progressive rollout** (0% → 100% over 8 weeks)
- 🔙 **Instant rollback** capability at every stage
- 📊 **Continuous monitoring** with automated health checks
- 🧪 **Comprehensive testing** before each phase
- 📋 **Detailed runbooks** for all scenarios

**Ready for safe migration!** 🚀
