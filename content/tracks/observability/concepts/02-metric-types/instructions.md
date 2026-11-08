## What you build

You define four metrics for an HTTP service, each with the correct type, plus a scrape job. You also record one label that must never go on a metric. This lesson builds on **Observability Foundations**.

## Key concepts

### Prometheus has four metric types

The types are counter, gauge, histogram and summary. The OpenTelemetry metrics SDK mirrors them. With the wrong type, you cannot answer the incident question. A gauge cannot give a p99 latency, and a counter cannot give the requests in flight now.

### A counter only goes up

A counter goes up, or resets to zero when the process restarts. Use it for "how many X happened".

```
http_requests_total{method="GET",
  status="200"} 84213
```

Do not show the raw value of a counter on a dashboard. Graph its rate of increase, `rate(http_requests_total[5m])`, from the PromQL concept. A counter that goes down for any reason other than a restart is an instrumentation bug.

### A gauge shows current state

A gauge goes up and down. Use it for "how much X right now".

```
http_requests_in_flight 12
process_resident_memory_bytes 104857600
queue_depth 340
```

Read a gauge directly, with no `rate()`. The current number is the answer. You can average a gauge or take its minimum and maximum. The rate of change of a gauge is rarely useful, and it can be negative.

### A histogram counts observations in buckets

A histogram puts observations, usually durations or sizes, into cumulative `le` buckets. `le` means "less than or equal". It also exposes `_sum` and `_count`. Use it when you need quantiles across many processes.

```
# Bucket series, label le:
..._bucket{le="0.1"}  24054
..._bucket{le="0.5"}  33444
..._bucket{le="1"}    34200
..._bucket{le="+Inf"} 34209
# Full names start with
# http_request_duration_seconds
http_request_duration_seconds_sum 18300.4
http_request_duration_seconds_count 34209
```

You can aggregate histograms on the server. `sum()` the bucket counts of every pod behind a load balancer, then compute one fleet-wide quantile. That property makes the histogram the default for latency in a distributed system. The next concept covers bucket boundaries and `histogram_quantile()`.

### A summary computes quantiles in the client

A summary computes quantiles at scrape time and exposes them directly as `{quantile="0.99"}`. It also exposes `_sum` and `_count`.

```
# Metric name:
# http_request_duration_seconds
{quantile="0.5"}  0.031
{quantile="0.99"} 0.290
```

You cannot aggregate summaries. The average of two p99 values is not the fleet-wide p99. So use a histogram for anything you scrape from more than one process. Client libraries still use summaries where per-process quantiles are the goal, for example GC pause time.

### Metric names follow fixed suffixes

- Every counter ends in `_total`: `http_requests_total`, not `http_requests`.
- The name holds the base unit, singular: `_seconds` not `_ms`, `_bytes` not `_kb`. Queries and dashboards can then assume one unit.
- A histogram produces `_bucket`, `_sum` and `_count` series. Do not end another metric name with these.
- Use snake_case, with the subsystem first: `http_requests_total`, `db_connections_open`, `queue_messages_pending`.

### Labels are dimensions with bounded values

A label has a small, known set of values that you decide at instrumentation time. Examples are `method` (GET, POST), `status` (200, 404, 500) and `route` (`/users/:id`, never the raw path). Never use these as labels:

- User IDs, session IDs, request IDs, trace IDs, emails: one value per user or request.
- Raw URLs or query strings: one value per unique request.
- Timestamps: time is already the x-axis.

One high-cardinality label multiplies all the others. `http_requests_total{method, status, path}` with 5 × 6 × 30 values gives 900 series. Add `user_id` with 100,000 users, and you get 90,000,000 series.

### Other tools use similar types

StatsD timers compute quantiles in the client like summaries, and OpenTelemetry has Counter, UpDownCounter, Gauge and Histogram instruments that export to either backend.

## Watch out

- A value that can go down is a gauge, not a counter. "Active connections" is a gauge. "Connections accepted" is a counter.
- A counter without `_total` confuses readers and convention-aware tools. `promtool check metrics` reports it.
- Before you add a label, count its distinct values over all time and all instances. Unbounded values do not go on a metric.

## The task

Document four metrics and a scrape job in `stub.yaml`. Prometheus does not load this file; it is documentation as config.

1. Add a top-level `metric_definitions:` list. Each entry has `name`, `type` and `help`.
2. `http_requests_total`: type `counter`, help `"Total number of HTTP requests"`, `labels: [method, status, route]`.
3. `http_requests_in_flight`: type `gauge`, help `"Number of HTTP requests currently being served"`.
4. `http_request_duration_seconds`: type `histogram`, help `"HTTP request duration in seconds"`, `labels: [method, route]`.
5. `process_resident_memory_bytes`: type `gauge`, help `"Resident memory size in bytes"`.
6. Add `scrape_configs:` with job `'web-app'` and `static_configs` target `'web-app:8080'`.
7. Add a comment block that starts with `# cardinality_review:`.
8. In it, name `user_id` as a label that must never go on `http_requests_total`. Give a one-line reason.
9. Remove every `TODO` comment.

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
# Never add a user_id label to
# http_requests_total. It multiplies the
# series count by the number of users,
# and that number has no upper bound.
```
