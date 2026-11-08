## What you build

You write a minimal Prometheus scrape configuration. It scrapes Prometheus itself and one application.

## Key concepts

### Observability means new questions without new code

A system is observable when you can answer new questions about its internal state from the outside. You use only the telemetry it already emits. "We have a dashboard" is not observability.

### Each signal type answers a different question

| Signal | Answers | Cost |
|---|---|---|
| Metrics | How much, how often, how fast, over time? | Low, fixed |
| Logs | What happened on this one request? | High at volume |
| Traces | Where did the time go, across services? | High, sampled |

Metrics hold aggregates, not events. Their cost stays the same when traffic grows. Logs store every event with full detail. Traces follow one request through its causal chain, so systems usually sample them.

`http_requests_total` tells you that volume went from 100/s to 100,000/s. It cannot tell you which request IDs were slow, or show the stack trace of one 500. A log line has that detail. But a p99 latency over 30 days from a billion log lines needs a log-analytics engine. Metrics do that aggregation at write time. A trace shows that one slow request spent 400 ms in a call to a downstream `payments` service. No metric or log line alone shows that.

Use metrics for "is something wrong, and how bad?" Use logs for "what happened?" Use traces for "where in the call graph did it happen?" Alert on metrics. Debug with logs and traces.

### Prometheus pulls metrics

Prometheus uses pull. The server scrapes an HTTP endpoint, `/metrics`, on your service at a fixed interval. The application does not know who scrapes it. It shows its current state on each request.

```
Prometheus --GET /metrics every 15s-->
  your service
```

A failed scrape is data: the scraper detects "target is down" as its own signal. Pull gives one source of truth for "is this target monitored". The application needs no client-side batching or retry logic.

### Push systems send data to a collector

StatsD, most APM agents and OTLP metric export use push. The application sends data to a collector.

```
your service --UDP/HTTP push-->
  collector
```

Push works for jobs that end before a scrape, such as cron jobs and Lambda functions. It also works when the monitoring system cannot reach the target, because the target can always reach the collector. OpenTelemetry defaults to push (OTLP), because it must work the same way for server and non-server workloads. Later concepts in this track return to this choice.

### Cardinality is the constraint that breaks systems

Cardinality is the number of unique time series a metric name can produce. A series is the metric name plus one unique combination of label values.

```
# Three different series:
http_requests_total{method="GET",
  path="/users", status="200"}
http_requests_total{method="POST",
  path="/users", status="201"}
http_requests_total{method="GET",
  path="/users", status="500"}
```

Three labels with 5, 20 and 6 values give 5 × 20 × 6 = 600 series for one metric name. Add a label with unbounded values, and that one metric can produce millions of series. Examples are `user_id`, `request_id`, `session_id`, email addresses and full URLs with query strings.

Prometheus keeps every active and recently active series in memory. A cardinality explosion is the most common cause of a Prometheus server crash or a sudden jump in a hosted metrics bill. Label design, recording rules and alerting in later concepts all follow from this constraint.

### The open stack lets you change the backend

APM tools such as Datadog APM and New Relic mix the signals in one UI, at a higher cost and with vendor lock-in. With OpenTelemetry or the Prometheus client libraries, you can change the backend without new instrumentation. For example, move from Prometheus to Mimir or Thanos, or from Jaeger to Tempo.

## Watch out

- "We added logging" is not observability. Can you answer an unexpected question without a deploy? If not, you have only a log line.
- A `user_id` label looks fine in a demo with 10 users. With 500,000 users, it causes an incident. Review label cardinality at design time.
- Pull fails when the scraper cannot reach the target. Firewalls, NAT and short batch jobs need a Pushgateway or OTLP push export.

## The task

Write a minimal Prometheus scrape configuration in `stub.yaml`. Prometheus loads it on startup as `prometheus.yml`.

1. Add a `global` block with `scrape_interval: 15s` and `evaluation_interval: 15s`.
2. `scrape_interval` sets how often Prometheus scrapes targets.
3. `evaluation_interval` sets how often Prometheus evaluates recording and alerting rules.
4. Add a `scrape_configs` list with two jobs.
5. Job `'prometheus'` scrapes Prometheus itself at `localhost:9090`, in `static_configs`.
6. Job `'web-app'` scrapes `web-app:8080`, in `static_configs`.
7. Job `'web-app'` sets `scrape_interval: 10s`. This overrides the global value for this job only.
8. The `web-app:8080` targets get a `labels:` block with `env: production`.
9. Remove every `TODO` comment.

The values must match exactly. The key order does not matter.

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'web-app'
    scrape_interval: 10s
    static_configs:
      - targets: ['web-app:8080']
        labels:
          env: production
```
