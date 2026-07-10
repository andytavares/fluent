# RED and USE Methods

## What you'll learn

This is the lesson that answers "what do people actually put on a dashboard." Two complementary frameworks — RED for request-driven services, USE for resources — plus the four golden signals from Google's SRE book they both derive from, translated into exact PromQL. Every dashboard in this track from here on is built out of these queries.

## Key concepts

**RED — for anything that serves requests** (an HTTP API, a gRPC service, a queue consumer): **Rate, Errors, Duration.**

- **Rate** — requests per second.
  ```promql
  sum(rate(http_requests_total[5m]))
  ```
- **Errors** — the *fraction* of requests that failed, not a raw error count (a raw count means nothing without knowing total volume).
  ```promql
  sum(rate(http_requests_total{status=~"5.."}[5m]))
    /
  sum(rate(http_requests_total[5m]))
  ```
- **Duration** — latency distribution, always as percentiles, never as an average (see Watch out below).
  ```promql
  histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))
  histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))
  ```

RED answers "is this service serving traffic correctly and fast enough" — the question an on-call engineer asks first during almost every incident.

**USE — for resources** (CPU, memory, disk, a connection pool, a queue, a thread pool): **Utilization, Saturation, Errors.**

- **Utilization** — the percentage of time/capacity the resource was busy.
  ```promql
  1 - avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m]))    # CPU utilization
  ```
- **Saturation** — how much extra demand is queued waiting for the resource — the metric that tells you *before* utilization hits 100% that trouble is coming.
  ```promql
  node_load1 / count without (cpu, mode) (node_cpu_seconds_total{mode="idle"})   # load average per core
  ```
- **Errors** — resource-level error events (disk I/O errors, OOM kills, dropped packets) — distinct from RED's request-level errors.
  ```promql
  rate(node_vmstat_oom_kill[5m])
  ```

USE answers "is the infrastructure underneath the service the bottleneck" — the question you ask *after* RED tells you duration is bad but the service's own logic looks fine.

**The four golden signals** (Google SRE book) are RED's Rate/Errors/Duration plus USE's Saturation, unified as the minimum signal set for *any* component: **Latency, Traffic, Errors, Saturation.** RED and USE are the same underlying idea split by whether the thing you're watching serves requests (RED) or is a finite resource consumed by something else (USE) — a database connection pool gets USE treatment (how saturated is the pool), while the database's query-serving behavior gets RED treatment (how fast, how many errors).

**Per-endpoint vs aggregate — pick both, for different purposes.** An aggregate error ratio (`sum(rate(errors[5m])) / sum(rate(total[5m]))`) can hide a single endpoint that's completely broken if it's low-traffic relative to the rest of the service — 100% error rate on a rarely-called endpoint barely moves an aggregate ratio. Always keep both:

```promql
# Aggregate — top-level service health
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))

# Per-route — catches a single broken endpoint the aggregate would mask
sum by (route) (rate(http_requests_total{status=~"5.."}[5m])) / sum by (route) (rate(http_requests_total[5m]))
```

Aggregate belongs on a top-level overview dashboard (alert threshold lives here too, usually); per-route belongs on the drill-down dashboard you go to once the aggregate trips.

## vs other tools

Google's SRE book coined "the four golden signals"; RED was popularized by Tom Wilkie (Weaveworks/Grafana Labs) as an application of the golden signals specifically tuned for microservices; USE was coined by Brendan Gregg for systems/kernel performance work. All three are compatible vocabularies for the same underlying discipline — you'll see all three terms used interchangeably in the industry, and this track uses RED for services, USE for resources, deliberately, because conflating them (asking "what's the utilization of an API" or "what's the error rate of a CPU") doesn't map cleanly.

## Watch out

- **Never put a bare average latency on a dashboard.** `avg(http_request_duration_seconds_sum / http_request_duration_seconds_count)` is dominated by the bulk of fast requests and completely hides a tail of slow ones — a service with 99% of requests at 10ms and 1% at 10 seconds has an average of about 110ms, which looks fine while 1 in 100 users has a terrible experience. Always use `histogram_quantile()` at p95/p99, never a raw average, for latency panels.
- **Error rate as a raw count without a rate/ratio is meaningless without also knowing traffic volume** — "50 errors" is nothing at 1M requests/day and a crisis at 100 requests/day. Always express errors as a rate (`rate(errors_total[5m])`) or, better, a ratio over total requests.
- **Saturation is the leading indicator, utilization is the lagging one.** By the time CPU utilization hits 100%, you're already in trouble; queue depth/load-average climbing while utilization is still at 70% is the earlier warning — dashboards that only show utilization miss the window where action would have prevented the incident.

## The task

Write `red-use-pack.yaml`: a complete RED+USE query pack for a web service and its host.

Requirements — two top-level keys, `red_queries:` and `use_queries:`, each a list of entries with `name`, `promql`, `explains`.

`red_queries` — exactly these three:
1. `name: rate` — `promql: 'sum(rate(http_requests_total[5m]))'`
2. `name: errors` — `promql: 'sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))'`
3. `name: duration_p99` — `promql: 'histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))'`

`use_queries` — exactly these three:
1. `name: cpu_utilization` — `promql: '1 - avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m]))'`
2. `name: load_saturation` — `promql: 'node_load1 / count without (cpu, mode) (node_cpu_seconds_total{mode="idle"})'`
3. `name: oom_kill_errors` — `promql: 'rate(node_vmstat_oom_kill[5m])'`

Also add a top-level `per_endpoint_error_ratio:` key holding the drill-down query: `'sum by (route) (rate(http_requests_total{status=~"5.."}[5m])) / sum by (route) (rate(http_requests_total[5m]))'`.

Expected shape:

```yaml
red_queries:
  - name: rate
    promql: 'sum(rate(http_requests_total[5m]))'
    explains: "Requests per second across the whole service."

  - name: errors
    promql: 'sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))'
    explains: "Fraction of requests returning a 5xx, aggregated across the service."

  - name: duration_p99
    promql: 'histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))'
    explains: "p99 request latency — never a raw average."

use_queries:
  - name: cpu_utilization
    promql: '1 - avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m]))'
    explains: "Fraction of CPU time not spent idle, per host."

  - name: load_saturation
    promql: 'node_load1 / count without (cpu, mode) (node_cpu_seconds_total{mode="idle"})'
    explains: "1-minute load average normalized by core count — saturation, the leading indicator."

  - name: oom_kill_errors
    promql: 'rate(node_vmstat_oom_kill[5m])'
    explains: "Rate of out-of-memory kills — a resource-level error, distinct from request-level errors."

per_endpoint_error_ratio:
  promql: 'sum by (route) (rate(http_requests_total{status=~"5.."}[5m])) / sum by (route) (rate(http_requests_total[5m]))'
  explains: "Per-route error ratio — catches a single broken endpoint the aggregate error ratio would mask."
```

Getting the RED/USE split right — request-level rate/errors/duration for the service, resource-level utilization/saturation/errors for the host — and keeping both an aggregate and a per-route error ratio, is the operational judgment this task exercises.
