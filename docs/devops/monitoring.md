# Monitoring & Observability Guide

> **Comprehensive guide for monitoring, logging, and observability in the Proxy Agent Platform**

## 🎯 Overview

This guide covers the complete observability stack for the Proxy Agent Platform, including logging, metrics, tracing, and alerting.

## 📊 Observability Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    Application Components                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Backend  │  │ Frontend │  │ Database │  │  Redis   │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │             │             │               │
│       ├─Logs────────┼─────────────┼─────────────┤               │
│       ├─Metrics─────┼─────────────┼─────────────┤               │
│       └─Traces──────┴─────────────┴─────────────┘               │
└───────┬───────────────┬─────────────────┬──────────────────────┘
        │               │                 │
┌───────▼──────┐ ┌─────▼──────┐  ┌───────▼────────┐
│   Loki       │ │ Prometheus │  │     Jaeger     │
│  (Logs)      │ │ (Metrics)  │  │   (Traces)     │
└───────┬──────┘ └─────┬──────┘  └───────┬────────┘
        │               │                 │
        └───────────────┴─────────────────┘
                        │
                ┌───────▼────────┐
                │    Grafana     │
                │ (Visualization)│
                └───────┬────────┘
                        │
                ┌───────▼────────┐
                │  AlertManager  │
                │   (Alerting)   │
                └────────────────┘
```

## 📝 Logging Strategy

### Structured Logging with Structlog

#### Backend Configuration

Create `src/config/logging.py`:

```python
import structlog
import logging
from typing import Any

def configure_logging(debug: bool = False) -> None:
    """Configure structured logging."""
    logging.basicConfig(
        format="%(message)s",
        level=logging.DEBUG if debug else logging.INFO,
    )

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer()
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

# Usage in application
logger = structlog.get_logger()

logger.info(
    "task_created",
    task_id=task.id,
    user_id=user.id,
    task_type=task.type,
    priority=task.priority
)
```

#### Request ID Tracking

```python
# src/middleware/request_id.py
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import structlog

class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))

        # Bind request_id to logger context
        structlog.contextvars.bind_contextvars(request_id=request_id)

        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id

        # Clear context after request
        structlog.contextvars.clear_contextvars()

        return response
```

### Log Aggregation with Loki

#### Docker Compose Configuration

Add to `docker-compose.prod.yml`:

```yaml
services:
  loki:
    image: grafana/loki:2.9.0
    container_name: proxy-loki
    restart: always
    ports:
      - "3100:3100"
    volumes:
      - ./config/loki-config.yml:/etc/loki/local-config.yaml
      - loki_data:/loki
    command: -config.file=/etc/loki/local-config.yaml
    networks:
      - proxy-network

  promtail:
    image: grafana/promtail:2.9.0
    container_name: proxy-promtail
    restart: always
    volumes:
      - ./config/promtail-config.yml:/etc/promtail/config.yml
      - /var/log:/var/log
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
    command: -config.file=/etc/promtail/config.yml
    networks:
      - proxy-network

volumes:
  loki_data:
    driver: local
```

#### Loki Configuration (`config/loki-config.yml`)

```yaml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    final_sleep: 0s
  chunk_idle_period: 5m
  chunk_retain_period: 30s

schema_config:
  configs:
    - from: 2024-01-01
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/index
    cache_location: /loki/index_cache
    shared_store: filesystem
  filesystem:
    directory: /loki/chunks

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h

chunk_store_config:
  max_look_back_period: 0s

table_manager:
  retention_deletes_enabled: true
  retention_period: 336h  # 14 days
```

#### Promtail Configuration (`config/promtail-config.yml`)

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  # Docker containers
  - job_name: docker
    static_configs:
      - targets:
          - localhost
        labels:
          job: docker
          __path__: /var/lib/docker/containers/*/*-json.log

    pipeline_stages:
      - json:
          expressions:
            output: log
            stream: stream
            attrs: attrs
      - json:
          expressions:
            tag: attrs.tag
          source: attrs
      - regex:
          expression: (?P<container_name>(?:[^|]*[^|]))
          source: tag
      - labels:
          tag:
          container_name:
          stream:
```

## 📈 Metrics Collection with Prometheus

### Backend Metrics Instrumentation

```python
# src/middleware/metrics.py
from prometheus_client import Counter, Histogram, Gauge
import time
from starlette.middleware.base import BaseHTTPMiddleware

# Define metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

REQUEST_DURATION = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)

ACTIVE_REQUESTS = Gauge(
    'http_requests_active',
    'Active HTTP requests'
)

TASK_COMPLETION = Counter(
    'tasks_completed_total',
    'Total completed tasks',
    ['task_type', 'status']
)

class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        ACTIVE_REQUESTS.inc()
        start_time = time.time()

        response = await call_next(request)

        duration = time.time() - start_time
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code
        ).inc()

        REQUEST_DURATION.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(duration)

        ACTIVE_REQUESTS.dec()

        return response
```

### Prometheus Configuration

#### Docker Compose Addition

```yaml
services:
  prometheus:
    image: prom/prometheus:v2.47.0
    container_name: proxy-prometheus
    restart: always
    ports:
      - "9090:9090"
    volumes:
      - ./config/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    networks:
      - proxy-network

volumes:
  prometheus_data:
    driver: local
```

#### Prometheus Configuration (`config/prometheus.yml`)

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'proxy-agent-platform'
    environment: 'production'

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['alertmanager:9093']

# Load rules
rule_files:
  - "/etc/prometheus/alerts/*.yml"

scrape_configs:
  # Backend application metrics
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'

  # PostgreSQL metrics
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  # Redis metrics
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  # Node exporter (system metrics)
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  # Docker metrics
  - job_name: 'docker'
    static_configs:
      - targets: ['cadvisor:8080']
```

### Alert Rules (`config/prometheus/alerts/app.yml`)

```yaml
groups:
  - name: application_alerts
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }}% over the last 5 minutes"

      # High response time
      - alert: HighResponseTime
        expr: |
          histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time (p95 > 1s)"
          description: "95th percentile response time is {{ $value }}s"

      # Service down
      - alert: ServiceDown
        expr: up == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"
          description: "{{ $labels.job }} has been down for more than 2 minutes"

      # Database connection pool exhaustion
      - alert: DatabaseConnectionPoolExhausted
        expr: |
          pg_stat_database_numbackends / pg_settings_max_connections > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Database connection pool nearly exhausted"
          description: "{{ $value }}% of connections are in use"

      # High memory usage
      - alert: HighMemoryUsage
        expr: |
          (container_memory_usage_bytes / container_spec_memory_limit_bytes) > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Container {{ $labels.name }} high memory usage"
          description: "Memory usage is {{ $value }}%"

      # Celery queue backlog
      - alert: CeleryQueueBacklog
        expr: |
          celery_queue_length > 1000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Celery queue has large backlog"
          description: "Queue {{ $labels.queue }} has {{ $value }} pending tasks"
```

## 📊 Visualization with Grafana

### Grafana Setup

#### Docker Compose Addition

```yaml
services:
  grafana:
    image: grafana/grafana:10.1.0
    container_name: proxy-grafana
    restart: always
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
      - GF_INSTALL_PLUGINS=grafana-piechart-panel
    volumes:
      - grafana_data:/var/lib/grafana
      - ./config/grafana/provisioning:/etc/grafana/provisioning
      - ./config/grafana/dashboards:/var/lib/grafana/dashboards
    networks:
      - proxy-network

volumes:
  grafana_data:
    driver: local
```

### Datasource Provisioning (`config/grafana/provisioning/datasources/datasources.yml`)

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    editable: false
```

### Dashboard Provisioning (`config/grafana/provisioning/dashboards/dashboards.yml`)

```yaml
apiVersion: 1

providers:
  - name: 'Proxy Agent Platform'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
```

### Example Dashboard JSON

Create `config/grafana/dashboards/application-overview.json`:

```json
{
  "dashboard": {
    "title": "Proxy Agent Platform - Application Overview",
    "tags": ["proxy-agent", "overview"],
    "timezone": "browser",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{ method }} {{ endpoint }}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "{{ endpoint }}"
          }
        ]
      },
      {
        "title": "Response Time (p95)",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "{{ endpoint }}"
          }
        ]
      },
      {
        "title": "Active Requests",
        "type": "stat",
        "targets": [
          {
            "expr": "http_requests_active"
          }
        ]
      }
    ]
  }
}
```

## 🔔 Alerting with AlertManager

### AlertManager Configuration

#### Docker Compose Addition

```yaml
services:
  alertmanager:
    image: prom/alertmanager:v0.26.0
    container_name: proxy-alertmanager
    restart: always
    ports:
      - "9093:9093"
    volumes:
      - ./config/alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    networks:
      - proxy-network

volumes:
  alertmanager_data:
    driver: local
```

#### AlertManager Configuration (`config/alertmanager.yml`)

```yaml
global:
  resolve_timeout: 5m
  slack_api_url: '${SLACK_WEBHOOK_URL}'

route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: 'critical'
      continue: true
    - match:
        severity: warning
      receiver: 'warning'

receivers:
  - name: 'default'
    slack_configs:
      - channel: '#alerts'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'critical'
    slack_configs:
      - channel: '#critical-alerts'
        title: '🚨 CRITICAL: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
    pagerduty_configs:
      - service_key: '${PAGERDUTY_SERVICE_KEY}'

  - name: 'warning'
    slack_configs:
      - channel: '#warnings'
        title: '⚠️ WARNING: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'cluster', 'service']
```

## 🔍 Distributed Tracing with Jaeger

### Jaeger Setup

#### Docker Compose Addition

```yaml
services:
  jaeger:
    image: jaegertracing/all-in-one:1.50
    container_name: proxy-jaeger
    restart: always
    ports:
      - "5775:5775/udp"
      - "6831:6831/udp"
      - "6832:6832/udp"
      - "5778:5778"
      - "16686:16686"  # Jaeger UI
      - "14268:14268"
      - "14250:14250"
      - "9411:9411"
    environment:
      - COLLECTOR_ZIPKIN_HOST_PORT=:9411
    networks:
      - proxy-network
```

### Backend Tracing Instrumentation

```python
# src/config/tracing.py
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor

def configure_tracing(app, service_name: str = "proxy-agent-backend"):
    """Configure distributed tracing."""
    resource = Resource.create({"service.name": service_name})

    provider = TracerProvider(resource=resource)
    jaeger_exporter = JaegerExporter(
        agent_host_name="jaeger",
        agent_port=6831,
    )

    provider.add_span_processor(BatchSpanProcessor(jaeger_exporter))
    trace.set_tracer_provider(provider)

    # Instrument frameworks
    FastAPIInstrumentor.instrument_app(app)
    SQLAlchemyInstrumentor().instrument()
    RedisInstrumentor().instrument()

# Usage in main.py
from src.config.tracing import configure_tracing

app = FastAPI()
configure_tracing(app)
```

## 📊 System Metrics with Node Exporter

### Docker Compose Addition

```yaml
services:
  node-exporter:
    image: prom/node-exporter:v1.6.1
    container_name: proxy-node-exporter
    restart: always
    ports:
      - "9100:9100"
    command:
      - '--path.rootfs=/host'
    volumes:
      - '/:/host:ro,rslave'
    networks:
      - proxy-network

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.47.0
    container_name: proxy-cadvisor
    restart: always
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    networks:
      - proxy-network
```

## 📝 Log Queries (LogQL Examples)

```logql
# All logs from backend
{container_name="proxy-backend"}

# Error logs only
{container_name="proxy-backend"} |= "ERROR"

# Specific user's actions
{container_name="proxy-backend"} | json | user_id="123"

# Request duration > 1s
{container_name="proxy-backend"} | json | duration > 1

# Rate of 5xx errors
rate({container_name="proxy-backend"} | json | status >= 500 [5m])
```

## 📊 Useful Prometheus Queries

```promql
# Request rate by endpoint
rate(http_requests_total[5m])

# Error rate percentage
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100

# p95 response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Memory usage by container
container_memory_usage_bytes{name=~"proxy-.*"} / container_spec_memory_limit_bytes * 100

# CPU usage by container
rate(container_cpu_usage_seconds_total{name=~"proxy-.*"}[5m]) * 100

# Database connections
pg_stat_database_numbackends

# Redis memory usage
redis_memory_used_bytes

# Celery queue length
celery_queue_length
```

## 🔧 Complete Monitoring Stack Deployment

```bash
# Start complete monitoring stack
docker-compose -f docker-compose.prod.yml \
               -f docker-compose.monitoring.yml \
               up -d

# Access Grafana
open http://localhost:3001
# Login: admin / ${GRAFANA_ADMIN_PASSWORD}

# Access Prometheus
open http://localhost:9090

# Access Jaeger UI
open http://localhost:16686

# Access AlertManager
open http://localhost:9093
```

## 📚 Best Practices

### 1. Logging
- Use structured logging (JSON format)
- Include request IDs for correlation
- Log at appropriate levels (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- Don't log sensitive information (passwords, tokens, PII)
- Include context (user_id, task_id, etc.)

### 2. Metrics
- Use meaningful metric names
- Add labels for dimensionality
- Avoid high cardinality labels
- Set up appropriate retention periods
- Monitor metric collection overhead

### 3. Tracing
- Trace business-critical operations
- Add custom spans for important operations
- Include relevant attributes
- Be mindful of sampling rates
- Monitor trace collection overhead

### 4. Alerting
- Alert on symptoms, not causes
- Set appropriate thresholds
- Avoid alert fatigue
- Include runbook links in alerts
- Test alerts regularly

## 📝 Next Steps

1. Deploy monitoring stack from templates above
2. Create custom Grafana dashboards
3. Configure alert rules for your SLOs
4. Set up log retention policies
5. Test alerting channels
6. Document runbooks for common alerts

## 📚 Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [OpenTelemetry Python](https://opentelemetry.io/docs/instrumentation/python/)

---

**Last Updated**: 2025-10-25
**Maintained By**: DevOps Team
**Review Schedule**: Monthly
