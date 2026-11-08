## What you build

You write a RED and USE query pack for a web service and its host. It answers "what goes on a dashboard?" This lesson builds on **PromQL Aggregations** and **Histograms and Quantiles**.

## Key concepts

### RED covers anything that serves requests

Use RED for an HTTP API, a gRPC service or a queue consumer. RED stands for Rate, Errors and Duration. It answers "does this service serve traffic correctly and fast enough?" An on-call engineer asks that first in almost every incident.

**Rate** is requests per second.

```promql
sum(rate(http_requests_total[5m]))
```

**Errors** is the fraction of requests that failed. A raw error count means nothing without the total volume.

```promql
sum(rate(http_requests_total{
  status=~"5.."}[5m]))
/
sum(rate(http_requests_total[5m]))
```

**Duration** is the latency distribution, as percentiles. Never use an average.

```promql
histogram_quantile(0.99,
  sum by (le) (rate(
  http_request_duration_seconds_bucket[5m]
)))
```

### USE covers resources

Use USE for CPU, memory, disk, a connection pool, a queue or a thread pool. USE stands for Utilization, Saturation and Errors. It answers "is the infrastructure under the service the bottleneck?" Ask it when RED shows bad duration but the service logic looks fine.

**Utilization** is the percentage of time or capacity that the resource was busy.

```promql
# CPU utilization
1 - avg by (instance) (rate(
  node_cpu_seconds_total{
    mode="idle"}[5m]))
```

**Saturation** is the extra demand that waits in a queue for the resource. It warns you before utilization reaches 100%.

```promql
# Load average per core
node_load1
/
count without (cpu, mode) (
  node_cpu_seconds_total{mode="idle"})
```

**Errors** are resource-level error events: disk I/O errors, OOM kills, dropped packets. They are not the request-level errors of RED.

```promql
rate(node_vmstat_oom_kill[5m])
```

### The four golden signals unify RED and USE

The Google SRE book names four golden signals for any component: Latency, Traffic, Errors and Saturation. They are the Rate, Errors and Duration of RED, plus the Saturation of USE.

RED and USE split one idea by the kind of thing you watch. A service that serves requests gets RED. A finite resource that something else uses gets USE. A database connection pool gets USE: how saturated is the pool? The query behavior of the database gets RED: how fast, how many errors?

Tom Wilkie (Weaveworks, later Grafana Labs) made RED popular for microservices. Brendan Gregg coined USE for systems performance work. This track uses RED for services and USE for resources. "The utilization of an API" or "the error rate of a CPU" does not map well.

### Keep both an aggregate and a per-route error ratio

An aggregate error ratio can hide one broken endpoint with low traffic. A 100% error rate on a rarely called endpoint barely moves the aggregate.

```promql
# Aggregate: top-level service health
sum(rate(http_requests_total{
  status=~"5.."}[5m]))
/
sum(rate(http_requests_total[5m]))

# Per route: finds one broken endpoint
sum by (route) (rate(
  http_requests_total{
    status=~"5.."}[5m]))
/
sum by (route) (rate(
  http_requests_total[5m]))
```

Put the aggregate on the top-level overview dashboard. The alert threshold usually goes there too. Put the per-route ratio on the drill-down dashboard that you open when the aggregate trips.

## Watch out

- Do not show a plain average latency. The many fast requests hide the slow tail.
- 99% of requests at 10 ms and 1% at 10 seconds average about 110 ms. It looks fine, but 1 in 100 users suffers.
- Use `histogram_quantile()` at p95 or p99 for latency panels.
- "50 errors" is nothing at 1M requests a day, and a crisis at 100. Show errors as a rate, or better, a ratio.
- Utilization is a late signal: at 100% CPU, you are already in trouble.
- Saturation is an early signal. Queue depth or load can climb while utilization is at 70%. Show saturation on the dashboard.

## The task

Write `stub.yaml`, also named `red-use-pack.yaml`. It holds a RED and USE query pack for a web service and its host.

1. Add two top-level lists, `red_queries:` and `use_queries:`. Each entry has `name`, `promql` and `explains`.
2. `red_queries` has exactly three entries: `rate`, `errors` and `duration_p99`.
3. `rate` is the total request rate.
4. `errors` is the 5xx rate divided by the total rate. Write it on one line.
5. `duration_p99` is the 0.99 quantile of the duration histogram.
6. `use_queries` has exactly three entries: `cpu_utilization`, `load_saturation` and `oom_kill_errors`.
7. `cpu_utilization` is 1 minus the average idle CPU rate per instance.
8. `load_saturation` is `node_load1` divided by the count of idle CPU series.
9. `oom_kill_errors` is the rate of `node_vmstat_oom_kill`.
10. Add a top-level `per_endpoint_error_ratio:` key with `promql` and `explains`.
11. Its query is the error ratio with `sum by (route)` on both sides.
12. Remove every `TODO` comment.

```yaml
red_queries:
  - name: rate
    promql: 'sum(rate(http_requests_total[5m]))'
    explains: >-
      Requests per second across the
      whole service.

  - name: errors
    promql: 'sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))'
    explains: >-
      Fraction of requests that return
      a 5xx, for the whole service.

  - name: duration_p99
    promql: 'histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))'
    explains: >-
      p99 request latency. Never a raw
      average.

use_queries:
  - name: cpu_utilization
    promql: '1 - avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m]))'
    explains: >-
      Fraction of CPU time not idle,
      per host.

  - name: load_saturation
    promql: 'node_load1 / count without (cpu, mode) (node_cpu_seconds_total{mode="idle"})'
    explains: >-
      1-minute load per core: saturation,
      the early signal.

  - name: oom_kill_errors
    promql: 'rate(node_vmstat_oom_kill[5m])'
    explains: >-
      Rate of out-of-memory kills: a
      resource-level error.

per_endpoint_error_ratio:
  promql: 'sum by (route) (rate(http_requests_total{status=~"5.."}[5m])) / sum by (route) (rate(http_requests_total[5m]))'
  explains: >-
    Error ratio per route. It finds one
    broken endpoint that the aggregate
    hides.
```
