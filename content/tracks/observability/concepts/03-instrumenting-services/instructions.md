# Instrumenting Services

## What you'll learn

You now know the four metric types. This lesson is about what to actually instrument on a typical HTTP service, the wire format Prometheus scrapes, the difference between a *target* label (who/where) and a *metric* label (what), and where exporters (node_exporter, blackbox_exporter) fit when you can't add instrumentation directly to the thing you're measuring.

## Key concepts

**The four numbers every HTTP service should expose**, regardless of language or framework:

1. **Request count** — a counter, labeled by method/route/status: `http_requests_total{method="GET", route="/users/:id", status="200"}`. This is where request rate and error rate both come from.
2. **Request duration** — a histogram, labeled by method/route (not status — see below): `http_request_duration_seconds_bucket{method="GET", route="/users/:id", le="0.5"}`.
3. **In-flight requests** — a gauge: `http_requests_in_flight`. Answers "are we currently overloaded," independent of any time window.
4. **Errors** — usually *not* a separate metric. Model errors as a `status` (or `code`) label on the request counter, so error rate is just a ratio over the same series, not a second metric you have to keep in sync. A separate `errors_total` invites double-counting and drift from the request counter.

This is the RED method (Rate, Errors, Duration) in miniature — you'll get the full treatment, plus USE for infrastructure, in a dedicated lesson later in this track. For now, internalize that these four signals cover the large majority of "is the service healthy" questions.

**Why duration shouldn't be labeled by status.** Latency for a 500 (fails fast, e.g., a validation error) and a 200 (does real work) have different distributions, and mixing them muddies your percentiles. But labeling duration itself with high-cardinality-adjacent fields multiplies histogram bucket series (a histogram already emits one series *per bucket*, so a `_bucket` metric with `status` as an extra label times 10 buckets times N status codes gets expensive fast). Keep duration labels to the low-cardinality dimensions you actually slice dashboards by — typically `method` and `route`.

**Exposition format** — what `/metrics` actually returns, plain text over HTTP:

```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/users/:id",status="200"} 84213
http_requests_total{method="GET",route="/users/:id",status="500"} 42

# HELP http_request_duration_seconds HTTP request duration in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="GET",route="/users/:id",le="0.1"} 80211
http_request_duration_seconds_bucket{method="GET",route="/users/:id",le="0.5"} 84100
http_request_duration_seconds_bucket{method="GET",route="/users/:id",le="+Inf"} 84213
http_request_duration_seconds_sum{method="GET",route="/users/:id"} 3021.4
http_request_duration_seconds_count{method="GET",route="/users/:id"} 84213
```

Every metric family gets a `# HELP` (human description) and `# TYPE` (counter/gauge/histogram/summary) comment line — Prometheus parses these, and `promtool check metrics` validates them. This is what a client library (`prometheus_client` in Python, `prom-client` in Node, `client_golang` in Go) generates for you; you should never hand-format this in production code, but you must be able to read it to debug a scrape.

**Target labels vs metric labels — a distinction that trips up almost everyone.** Metric labels (`method`, `route`, `status`) come from *inside* the application — they describe the observation. Target labels (`job`, `instance`, and anything added via `relabel_configs` or the scrape config's `labels:` block) come from *outside* — they describe *which process/host emitted this*, attached by Prometheus at scrape time, not by the application. `instance` is typically `host:port` and `job` is the `job_name` from the scrape config. This split matters because target labels are what you use to distinguish "which of 40 replicas" while metric labels are what you use to distinguish "which kind of request" — conflating them (e.g., hardcoding a pod name into a metric label from inside the app) duplicates information Prometheus already attaches for free and often introduces unbounded cardinality (pod names churn constantly in Kubernetes).

**Exporters** — for things you can't instrument directly (the OS, a third-party binary, a network endpoint), you run a small sidecar process that translates existing data into Prometheus exposition format:

- **node_exporter** — host-level metrics (CPU, memory, disk, network) for the machine it runs on. Exposes `node_cpu_seconds_total`, `node_memory_MemAvailable_bytes`, etc.
- **blackbox_exporter** — active probing: it hits an HTTP/TCP/ICMP/DNS target *you* configure and exposes whether it succeeded and how long it took (`probe_success`, `probe_duration_seconds`). This is how you get "is this website up from the outside" as a metric, for things you don't control the code of.

Both run as their own scrape targets — `job_name: 'node'` scraping `node-exporter:9100`, `job_name: 'blackbox'` scraping the blackbox exporter's `/probe` endpoint with a `params` block naming the real target and a `relabel_configs` step to move the probed URL into the `instance` label (a pattern you'll see below).

## vs other tools

Datadog/New Relic agents auto-instrument via bytecode injection or eBPF and give you request/duration/error metrics with zero code changes, at the cost of a proprietary agent and per-host licensing. The Prometheus model requires you (or a library maintainer) to add a few lines of middleware, but the result is a plain-text format any tool can scrape — no agent lock-in. OpenTelemetry auto-instrumentation (covered later in this track) is the vendor-neutral middle ground: automatic HTTP instrumentation via language-specific agents, exported to whatever backend you choose.

## Watch out

- **Don't create a separate `errors_total` counter alongside `requests_total`.** It's redundant with a `status` label and the two will eventually disagree after someone edits one code path and not the other.
- **Never put the full URL path (with IDs interpolated) in a route label** — `/users/482913` instead of `/users/:id` is a cardinality bomb identical to the `user_id` label mistake from the last lesson. Route labels must come from your router's *pattern*, not the raw request path.
- **`instance` is not `job`.** `job` identifies "what kind of service" (shared across all replicas); `instance` identifies "which specific process" (unique per replica). Dashboards that group by the wrong one either merge distinct services together or fragment one service into dozens of indistinguishable rows.

## The task

Write `service-metrics.yaml`: an annotated exposition-format snippet for an HTTP service, plus a scrape config with relabeling for a blackbox probe.

Requirements:

Under `exposition_sample:` (a literal block scalar `|` containing the raw exposition-format text), include, for metric family `http_requests_total`:
- A `# HELP` line and `# TYPE http_requests_total counter` line.
- At least two sample lines with labels `method`, `route`, `status` (different status values, e.g. one `200` and one `500`).

And for `http_request_duration_seconds`:
- `# TYPE http_request_duration_seconds histogram`.
- At least one `_bucket` line with an `le` label, plus a `_sum` and `_count` line.

Under `scrape_configs:`, define two jobs:
1. `job_name: 'node'` scraping `static_configs` targets `['node-exporter:9100']`.
2. `job_name: 'blackbox'` scraping `metrics_path: /probe`, with `params: module: [http_2xx]`, `static_configs` targets `['https://example.com']`, and a `relabel_configs` list containing at least one relabel step with `target_label: __param_target` and one with `target_label: instance`.

Expected shape:

```yaml
exposition_sample: |
  # HELP http_requests_total Total number of HTTP requests
  # TYPE http_requests_total counter
  http_requests_total{method="GET",route="/users/:id",status="200"} 84213
  http_requests_total{method="GET",route="/users/:id",status="500"} 42

  # HELP http_request_duration_seconds HTTP request duration in seconds
  # TYPE http_request_duration_seconds histogram
  http_request_duration_seconds_bucket{method="GET",route="/users/:id",le="0.5"} 84100
  http_request_duration_seconds_sum{method="GET",route="/users/:id"} 3021.4
  http_request_duration_seconds_count{method="GET",route="/users/:id"} 84213

scrape_configs:
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'blackbox'
    metrics_path: /probe
    params:
      module: [http_2xx]
    static_configs:
      - targets: ['https://example.com']
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox-exporter:9115
```

The blackbox relabel chain is the load-bearing pattern: it moves the probed URL into `__param_target` (what blackbox actually probes), then into `instance` (so dashboards group by "which URL," not "which blackbox-exporter process"), then rewrites `__address__` to point Prometheus at the exporter itself rather than the target being probed.
