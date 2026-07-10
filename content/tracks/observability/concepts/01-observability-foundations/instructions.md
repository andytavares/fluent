# Observability Foundations

## What you'll learn

"Observability" gets used as a buzzword for "we have a dashboard." The actual claim is narrower and more useful: a system is observable if you can answer new questions about its internal state *from the outside*, using only the telemetry it already emits — without shipping new code first. This lesson covers the three signal types (metrics, logs, traces), the pull-vs-push delivery models, and the single constraint that determines whether any of this scales: cardinality. Every later concept in this track assumes you understand these tradeoffs.

## Key concepts

**The three signal types answer different questions.**

| Signal | Answers | Cost | Granularity |
|---|---|---|---|
| Metrics | "How much / how often / how fast, over time?" | Cheap — fixed cost regardless of traffic volume | Aggregated (numbers, not events) |
| Logs | "What exactly happened on this one request/error?" | Expensive at volume — every event is stored | Per-event, full detail |
| Traces | "Where did the time go, across services, for this one request?" | Expensive, usually sampled | Per-request, causal chain |

A metric like `http_requests_total` tells you request volume went from 100/s to 100,000/s. It cannot tell you *which* request IDs were slow, or what the stack trace was for a specific 500. A log line has that detail but you can't cheaply ask "what's the p99 latency over the last 30 days" from a billion log lines without a log-analytics engine doing the aggregation work metrics do for free at write time. A trace shows you that a single slow request spent 400ms in a downstream `payments` service call — something no metric or log line, taken alone, tells you directly.

The practical rule: **metrics for "is something wrong and how bad,"logs for "what exactly happened," traces for "where, in a distributed call graph, did it happen."** Alert on metrics. Debug with logs and traces.

**Pull vs push.**

Prometheus (and this track's default model) uses **pull**: the monitoring system scrapes an HTTP endpoint (`/metrics`) on your service at a fixed interval. Your application doesn't know or care who's scraping it — it just exposes current state whenever asked.

```
Prometheus server --(GET /metrics every 15s)--> your service
```

Push systems (StatsD, most APM agents, OTLP metric export) have the application send data to a collector.

```
your service --(UDP/HTTP push)--> collector
```

Pull's advantages: the scraper can detect "target is down" as its own signal (a failed scrape *is* data), there's a natural single source of truth for "is this being monitored," and you don't need client-side batching/retry logic for delivery. Push's advantages: works for ephemeral jobs that don't live long enough to be scraped (cron jobs, Lambda), and works across network topologies where the monitoring system can't reach the target (the target can always reach the collector). Modern OpenTelemetry defaults to push (OTLP) precisely because it needs to work for both server and non-server workloads uniformly — you'll see this tension again in the OTel concepts later in this track.

**Cardinality is the constraint that breaks systems, not disk space.**

Cardinality = the number of unique time series a metric name can produce, where a "series" is the metric name plus every unique combination of label values.

```
http_requests_total{method="GET", path="/users", status="200"}   <- one series
http_requests_total{method="POST", path="/users", status="201"}  <- another series
http_requests_total{method="GET", path="/users", status="500"}   <- another series
```

Three labels with 5, 20, and 6 possible values respectively gives 5 × 20 × 6 = 600 series for *one* metric name. Add a label with unbounded values — `user_id`, `request_id`, `session_id`, raw email addresses, full URLs with query strings — and that single metric can generate millions of series. Prometheus keeps every active series (and recently-active ones) in memory; a cardinality explosion is the single most common cause of a Prometheus server falling over or a hosted metrics bill exploding overnight. This is not a minor tuning detail — it is the design constraint that every later concept (label design, recording rules, alerting) is built around.

## vs other tools

Traditional APM tools (Datadog APM, New Relic) blur these lines deliberately — they auto-instrument and let you pivot between "signal types" in one UI, at the cost of vendor lock-in and much higher cost per unit of data. The pull/PromQL/Grafana stack this track teaches is the vendor-neutral, self-hostable foundation that OpenTelemetry is designed to feed — you can swap the backend (Prometheus → Mimir/Thanos, Jaeger → Tempo) without re-instrumenting application code, provided you instrumented with OTel or the Prometheus client libraries rather than a proprietary agent.

## Watch out

- **"We added logging" is not "we added observability."** If you cannot answer a question you didn't anticipate when you wrote the log line, without deploying new code, you don't have observability for that question — you have a log line.
- **Cardinality mistakes are invisible until they aren't.** A metric with a `user_id` label looks completely fine in a demo with 10 users and becomes an incident with 500,000 users. Review label cardinality at design time, not after the pager goes off.
- **Pull requires the scraper to reach the target.** Firewalls, NAT, and short-lived batch jobs are the classic cases where pull breaks down and you need a push gateway or push-based OTLP export instead.

## The task

Write a minimal Prometheus scrape configuration, `prometheus.yml`, that a Prometheus server would load to scrape itself and one application.

Requirements:

- A `global` block setting `scrape_interval: 15s` and `evaluation_interval: 15s` (how often Prometheus scrapes targets, and how often it evaluates recording/alerting rules — covered in depth later in this track).
- A `scrape_configs` list with two jobs:
  1. `job_name: 'prometheus'` — Prometheus scraping its own `/metrics` endpoint, `static_configs` with `targets: ['localhost:9090']`.
  2. `job_name: 'web-app'` — scraping an application, overriding the interval to `scrape_interval: 10s` for this job only, `static_configs` with `targets: ['web-app:8080']` and a label attached to those targets: `labels:` block containing `env: production`.

Expected shape (values must match exactly; key order does not matter):

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

This file is what `prometheus --config.file=prometheus.yml` loads on startup. Getting this shape right — global defaults, per-job overrides, static target lists, target-level labels — is the entry point for every scrape configuration you'll write in the rest of this track.
