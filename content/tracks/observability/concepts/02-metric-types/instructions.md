# Metric Types

## What you'll learn

Prometheus (and the OpenTelemetry metrics SDK, which mirrors it) has exactly four metric types: counter, gauge, histogram, summary. Picking the wrong one means you literally cannot answer the question you'll be asked in an incident — "what was our p99 latency" is unanswerable from a gauge, "how many requests are in flight right now" is unanswerable from a counter. This lesson covers what each type can and cannot do, naming conventions that make metrics self-documenting, and the cardinality discipline from the last lesson applied concretely to labels.

## Key concepts

**Counter** — a value that only ever goes up (or resets to zero on restart). Use it for anything you'd phrase as "how many X happened."

```
http_requests_total{method="GET", status="200"} 84213
```

You never read a counter's raw value in a dashboard — you graph its *rate of increase* (`rate(http_requests_total[5m])`), covered in the PromQL lesson. A counter that goes down (other than a process restart resetting to 0) is a bug in your instrumentation.

**Gauge** — a value that goes up and down, representing current state. Use it for anything you'd phrase as "how much X right now."

```
http_requests_in_flight 12
process_resident_memory_bytes 104857600
queue_depth 340
```

Gauges can be read directly (no `rate()` needed) — the current number *is* the answer. You can average or take min/max over a gauge, but rate-of-change on a gauge is rarely meaningful (it can go negative).

**Histogram** — buckets observations (usually durations or sizes) into cumulative `le` (less-than-or-equal) buckets, plus a `_sum` and `_count`. Use it for anything you need percentiles/quantiles on, aggregated across many processes.

```
http_request_duration_seconds_bucket{le="0.1"} 24054
http_request_duration_seconds_bucket{le="0.5"} 33444
http_request_duration_seconds_bucket{le="1"}   34200
http_request_duration_seconds_bucket{le="+Inf"} 34209
http_request_duration_seconds_sum   18300.4
http_request_duration_seconds_count 34209
```

Histograms are aggregatable server-side (you can `sum()` bucket counts across every pod behind a load balancer and still compute a fleet-wide quantile) — this is the property that makes them the default choice for latency in a distributed system. The mechanics of bucket boundaries and `histogram_quantile()` get a full lesson next.

**Summary** — like a histogram, but computes quantiles *client-side* at scrape time and exposes them directly (`{quantile="0.99"}`), plus `_sum`/`_count`.

```
http_request_duration_seconds{quantile="0.5"}  0.031
http_request_duration_seconds{quantile="0.99"} 0.290
http_request_duration_seconds_sum   18300.4
http_request_duration_seconds_count 34209
```

Summaries are *not* aggregatable — you cannot average two instances' p99 and get a meaningful fleet-wide p99. That's why histograms are strongly preferred for anything scraped from more than one process. Summaries still show up for client libraries measuring things like GC pause time where per-process quantiles are what you want.

**Naming conventions** — Prometheus metric names follow strict, load-bearing suffixes:

- `_total` suffix on every counter (`http_requests_total`, not `http_requests`).
- Base unit in the name, always singular, always a base unit: `_seconds` not `_ms`, `_bytes` not `_kb`. This lets PromQL functions and dashboards assume a consistent unit without per-metric lookup.
- `_bucket`, `_sum`, `_count` are the three series a histogram automatically produces — never name a metric ending in these yourself for something else.
- Snake_case, namespaced by subsystem: `http_requests_total`, `db_connections_open`, `queue_messages_pending`.

**Labels are dimensions, not free-form data.** A label should have a small, known, bounded set of values decided at instrumentation time — `method` (GET/POST/...), `status` (200/404/500...), `route` (`/users/:id`, never the raw interpolated path). Never label with:

- User IDs, session IDs, request IDs, trace IDs, emails — unbounded, one value per user/request.
- Raw URLs or query strings — unbounded, one value per unique request.
- Timestamps — meaningless as a label; time is already the x-axis.

A single high-cardinality label multiplies every other label's cardinality. `http_requests_total{method, status, path}` with 5 × 6 × 30 possible values is 900 series — fine. Add `{user_id}` with 100,000 distinct users and it becomes 90,000,000 series — that one label change can take down a Prometheus server.

## vs other tools

StatsD's model (counter/gauge/timer/set) maps roughly to Prometheus's but timers are typically pre-aggregated client-side into percentiles the same way summaries are — same aggregation problem across instances. Datadog's metric types add "rate" and "distribution" as separate concepts to work around exactly this counter/histogram-aggregation tension. OpenTelemetry's metrics API deliberately mirrors Prometheus's four types (Counter, UpDownCounter ≈ gauge, Histogram, and a deprecated Summary) so instrumentation written once can export to either backend.

## Watch out

- **A counter that can decrease is a modeling bug**, not a real "counter." If a value can go down, it's a gauge — even if it's counting something that sounds count-like (e.g., "active connections" is a gauge, "connections accepted" is a counter).
- **Forgetting the `_total` suffix** breaks convention-aware tooling and confuses anyone reading your dashboards — Prometheus's own linter (`promtool check metrics`) flags this.
- **Cardinality bombs are the #1 production incident this lesson exists to prevent.** Before adding a label, ask: "how many distinct values can this take, across all time, across all instances?" If the answer is "unbounded" or "grows with user count," it doesn't go on the metric.

## The task

Write a Prometheus exposition-format snippet plus scrape config, `metrics.yaml`, documenting four metric definitions an HTTP service should expose (as commented exposition-format examples — this file is documentation-as-config, not a live scrape target) and a scrape config block.

Requirements — under a top-level `metric_definitions:` key, define four metrics, each with `name`, `type`, and `help`:

1. `http_requests_total` — type `counter`, help `"Total number of HTTP requests"`, with `labels: [method, status, route]`.
2. `http_requests_in_flight` — type `gauge`, help `"Number of HTTP requests currently being served"`.
3. `http_request_duration_seconds` — type `histogram`, help `"HTTP request duration in seconds"`, with `labels: [method, route]`.
4. `process_resident_memory_bytes` — type `gauge`, help `"Resident memory size in bytes"`.

Then, under `scrape_configs:`, define one job `job_name: 'web-app'` with `static_configs` targets `['web-app:8080']`.

Also add a top-level comment block, `# cardinality_review:`, listing one label that must **never** be added to `http_requests_total` and a one-line reason — for example a comment noting `user_id` would multiply cardinality by the number of distinct users.

Expected shape:

```yaml
metric_definitions:
  - name: http_requests_total
    type: counter
    help: "Total number of HTTP requests"
    labels: [method, status, route]

  - name: http_requests_in_flight
    type: gauge
    help: "Number of HTTP requests currently being served"

  - name: http_request_duration_seconds
    type: histogram
    help: "HTTP request duration in seconds"
    labels: [method, route]

  - name: process_resident_memory_bytes
    type: gauge
    help: "Resident memory size in bytes"

scrape_configs:
  - job_name: 'web-app'
    static_configs:
      - targets: ['web-app:8080']

# cardinality_review:
# Never add a `user_id` label to http_requests_total — it multiplies the
# series count by the number of distinct users and is unbounded over time.
```

Getting the type assignment right for each metric — counter for cumulative counts, gauge for point-in-time state, histogram for anything needing percentiles — is the core skill this lesson tests.
