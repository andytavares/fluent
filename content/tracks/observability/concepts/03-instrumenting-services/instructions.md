## What you build

You write a sample of the Prometheus exposition format for an HTTP service. You add a scrape config for node_exporter and a blackbox probe with relabeling. This lesson builds on **Metric Types**.

## Key concepts

### Every HTTP service exposes four numbers

These four signals answer most "is the service healthy?" questions, in any language or framework:

1. **Request count**: a counter with `method`, `route` and `status` labels. Request rate and error rate both come from it.
2. **Request duration**: a histogram with `method` and `route` labels, but no `status` label.
3. **In-flight requests**: a gauge, `http_requests_in_flight`. It shows overload now, with no time window.
4. **Errors**: a `status` or `code` label on the request counter, not a separate metric.

```
http_requests_total{method="GET",
  route="/users/:id", status="200"}
http_request_duration_seconds_bucket{
  method="GET", route="/users/:id",
  le="0.5"}
```

With errors as a label, the error rate is a ratio over the same series. A separate `errors_total` counter invites double counting and drifts from the request counter. This is the RED method (Rate, Errors, Duration) in short form. A later concept covers RED, and USE for infrastructure.

### Duration does not get a status label

A fast 500 from a validation error and a slow 200 have different latency distributions. But a histogram already emits one series per bucket. A `status` label multiplies that: 10 buckets times N status codes. Keep duration labels to the low-cardinality dimensions you slice dashboards by, usually `method` and `route`.

### The exposition format is plain text

`/metrics` returns plain text over HTTP.

```
# HELP http_requests_total Total ...
# TYPE http_requests_total counter
http_requests_total{method="GET",
  route="/users/:id",
  status="200"} 84213
```

Each metric family has a `# HELP` line, a human description. It also has a `# TYPE` line: counter, gauge, histogram or summary. Prometheus parses both lines, and `promtool check metrics` validates them. A client library writes this format for you: `prometheus_client` in Python, `prom-client` in Node, `client_golang` in Go. Do not write it by hand in production code. You must still read it to debug a scrape.

### Target labels describe who emitted the data

Metric labels such as `method`, `route` and `status` come from inside the application. They describe the observation. Target labels come from outside. Prometheus attaches them at scrape time to show which process or host emitted the data.

Target labels are `job`, `instance` and the labels from `relabel_configs` or the scrape config's `labels:` block. `instance` is usually `host:port`. `job` is the `job_name` from the scrape config.

Use target labels to tell 40 replicas apart. Use metric labels to tell kinds of request apart. Do not hard-code a pod name in a metric label inside the app. Prometheus already attaches that information. In Kubernetes, pod names change all the time, so the label adds unbounded cardinality.

### Exporters measure what you cannot instrument

An exporter is a small separate process. It translates existing data into the exposition format, for the OS, a third-party binary or a network endpoint.

- **node_exporter** exposes host metrics for its machine: CPU, memory, disk and network. Examples are `node_cpu_seconds_total` and `node_memory_MemAvailable_bytes`.
- **blackbox_exporter** probes a target that you configure, over HTTP, TCP, ICMP or DNS. It exposes `probe_success` and `probe_duration_seconds`. It answers "is this website up from the outside?" for code you do not control.

Each exporter is its own scrape target. Job `'node'` scrapes `node-exporter:9100`. Job `'blackbox'` scrapes the `/probe` endpoint of the exporter. A `params` block names the real target. A `relabel_configs` chain moves the probed URL into the `instance` label.

### The relabel chain points Prometheus at the exporter

The blackbox chain has three steps:

1. Copy `__address__`, the probed URL, into `__param_target`. Blackbox probes that URL.
2. Copy `__param_target` into `instance`. Dashboards then group by URL, not by exporter process.
3. Set `__address__` to the exporter, so Prometheus scrapes the exporter and not the probed site.

### Agents instrument without code changes

Datadog and New Relic agents add request metrics with no code changes, but lock you to a proprietary agent and per-host licensing. With Prometheus, you or a library add a few lines of middleware, and any tool can scrape the result. OpenTelemetry auto-instrumentation is the vendor-neutral middle path. Later concepts in this track cover it.

## Watch out

- Do not add an `errors_total` counter next to `requests_total`. The two disagree after someone edits only one code path.
- `/users/482913` in a `route` label is a cardinality bomb, like `user_id`. Take the route from the router pattern, `/users/:id`.
- `job` names the kind of service, shared by all replicas. `instance` names one process.
- A dashboard grouped by the wrong label merges distinct services, or splits one service into many rows.

## The task

Write `stub.yaml`, also named `service-metrics.yaml`. It holds an exposition-format sample and a scrape config with relabeling for a blackbox probe.

1. Add `exposition_sample:` as a literal block scalar, `|`, with raw exposition-format text.
2. For `http_requests_total`, add a `# HELP` line and `# TYPE http_requests_total counter`.
3. Add two or more `http_requests_total` sample lines with `method`, `route` and `status` labels.
4. Use `route="/users/:id"`. One sample has `status="200"`, another has `status="500"`.
5. For `http_request_duration_seconds`, add `# TYPE http_request_duration_seconds histogram`.
6. Add one or more `_bucket` lines with an `le` label, one `_sum` line and one `_count` line.
7. Under `scrape_configs:`, add job `'node'` with `static_configs` target `'node-exporter:9100'`.
8. Add job `'blackbox'` with `metrics_path: /probe` and `params:` `module: [http_2xx]`.
9. Its `static_configs` target is `'https://example.com'`.
10. Its `relabel_configs` list has a step with `target_label: __param_target`.
11. It has another step with `target_label: instance`.
12. Remove every `TODO` comment.

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
