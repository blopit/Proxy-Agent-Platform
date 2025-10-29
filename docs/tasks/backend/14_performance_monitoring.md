# BE-14: Performance Monitoring

**Delegation Mode**: ⚙️ DELEGATE
**Estimated Time**: 4-5 hours
**Dependencies**: All backend services
**Agent Type**: backend-tdd

## 📋 Overview
Implement performance monitoring, metrics collection, and health checks for all backend services.

## 🗄️ Database Schema
```sql
CREATE TABLE api_metrics (
    metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    response_time_ms INT NOT NULL,
    status_code INT NOT NULL,
    user_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE service_health (
    health_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,  -- 'healthy', 'degraded', 'down'
    details JSONB,
    checked_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_api_metrics_endpoint ON api_metrics(endpoint, created_at DESC);
CREATE INDEX idx_service_health_checked ON service_health(checked_at DESC);
```

## 🏗️ Models
```python
class PerformanceMetric(BaseModel):
    endpoint: str
    method: str
    response_time_ms: int
    status_code: int
    user_id: Optional[str] = None
    timestamp: datetime

class HealthCheck(BaseModel):
    service: str
    status: Literal["healthy", "degraded", "down"]
    response_time_ms: int
    details: Dict[str, Any] = {}

class PerformanceReport(BaseModel):
    total_requests: int
    avg_response_time: float
    p95_response_time: float
    p99_response_time: float
    error_rate: float
    slowest_endpoints: List[Dict[str, Any]]
```

## 🛠️ Middleware
```python
from fastapi import Request, Response
from time import time

async def performance_middleware(request: Request, call_next):
    """Track request performance."""
    start_time = time()

    response = await call_next(request)

    duration_ms = int((time() - start_time) * 1000)

    # Log metric
    await log_metric(
        endpoint=request.url.path,
        method=request.method,
        response_time_ms=duration_ms,
        status_code=response.status_code,
        user_id=request.state.user_id if hasattr(request.state, 'user_id') else None
    )

    # Add header
    response.headers["X-Response-Time"] = f"{duration_ms}ms"

    return response
```

## 🌐 API Routes
```python
@router.get("/health")
async def health_check():
    """Overall system health check."""
    checks = {
        "database": await check_database_health(),
        "redis": await check_redis_health(),
        "ml_models": await check_ml_models_health()
    }

    all_healthy = all(c["status"] == "healthy" for c in checks.values())

    return {
        "status": "healthy" if all_healthy else "degraded",
        "timestamp": datetime.now(UTC),
        "checks": checks
    }

@router.get("/metrics/performance", response_model=PerformanceReport)
async def get_performance_metrics(
    hours: int = Query(24, ge=1, le=168)
):
    """Get performance metrics for last N hours."""
    pass

@router.get("/metrics/endpoints")
async def get_endpoint_metrics():
    """Get metrics grouped by endpoint."""
    pass
```

## 🧪 Tests
- Middleware logs all requests
- Health checks detect database issues
- Performance reports calculate correct percentiles
- Slow endpoint detection works

## ✅ Acceptance Criteria
- [ ] All API requests are tracked
- [ ] Health checks run automatically
- [ ] Performance reports show P95/P99
- [ ] Slow endpoints are identified
- [ ] 95%+ test coverage
