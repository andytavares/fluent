# Dashboard Best Practices

## What you'll learn

Knowing panel types and PromQL doesn't automatically produce a dashboard people actually open during an incident instead of grep-ing logs out of frustration. This lesson is about the structure that makes a dashboard *usable under pressure*: overview-to-drill-down hierarchy, template variables that make one dashboard cover every service instead of one dashboard per service, the per-service standard layout, and the anti-patterns that make a dashboard decorative rather than operational.

## Key concepts

**Overview → drill-down hierarchy.** A single dashboard trying to show everything is unreadable; a hundred single-metric dashboards means no one knows where to start. The fix is a hierarchy:

1. **Fleet/overview dashboard** — one row per service, aggregate RED numbers only (request rate, error ratio, p99 — three or four numbers), designed to answer "which service is unhealthy right now" in five seconds.
2. **Per-service dashboard** — the RED+USE panels for one service, parameterized by template variable (see below) so the same dashboard JSON serves every service/environment.
3. **Drill-down/debug dashboard** — per-route, per-instance breakdowns, linked *from* the per-service dashboard (Grafana panel links / data links), for once you've identified which service and need to find which endpoint or replica.

The failure mode this prevents: an on-call engineer opening a wall of 40 graphs at 3am with no indication of where to look first.

**Template variables — one dashboard, every service.** Grafana template variables (`$job`, `$instance`, `$le` when needed for bucket-aware panels) let a single dashboard JSON be reused across every service/environment instead of hand-copying a dashboard per service:

```json
"templating": {
  "list": [
    {
      "name": "job",
      "type": "query",
      "query": "label_values(http_requests_total, job)",
      "multi": false,
      "includeAll": false
    },
    {
      "name": "instance",
      "type": "query",
      "query": "label_values(http_requests_total{job=\"$job\"}, instance)",
      "multi": true,
      "includeAll": true
    }
  ]
}
```

`label_values(metric, label)` populates the dropdown from actual label values Prometheus currently has. The second variable's query *depends on* the first (`job="$job"`) — Grafana re-runs it whenever `$job` changes, cascading the instance list down to only instances of the selected job. Panel queries then reference `$job`/`$instance` directly: `sum(rate(http_requests_total{job="$job"}[5m]))`. `multi: true` + `includeAll: true` lets a variable select multiple values or "All" — useful for `instance` (compare replicas) but usually wrong for `job` on a per-service dashboard (you want exactly one service in view at a time).

**The per-service dashboard standard** — the layout this track has been building toward the whole time. Every service's dashboard should have, in this order:

1. **Throughput** — request rate, aggregate.
2. **Error rate** — ratio, aggregate, with a threshold-colored `stat` panel.
3. **Latency percentiles** — p50/p95/p99, never an average, as both a `timeseries` (trend) and ideally a `heatmap` (distribution shape).
4. **Saturation** — the USE-side signals for the resources this service depends on most (CPU/memory for the service's own pods; connection pool usage; queue depth).
5. **Dependencies** — the same RED signals, but for the service's own outbound calls (rate/errors/duration *of calls this service makes to its dependencies*) — this is what tells you "we're slow because our database is slow" instead of just "we're slow."

This exact order matters: it mirrors how an engineer actually debugs — is anyone using it, is it failing, is it slow, is it resource-starved, is it a downstream dependency — top to bottom.

**Anti-patterns:**

- **Wall-of-graphs** — 30+ small panels with no hierarchy, no visual priority, everything the same size. Nothing draws the eye to what's wrong; the viewer has to read every panel to find the anomaly.
- **Averages-only latency** — a single `avg(duration)` line, no percentiles. Covered in the RED lesson: this hides tail latency that affects a meaningful fraction of real users while looking perfectly fine in aggregate.
- **No units / inconsistent units across panels** — one panel in `percent` (0-100), another using `percentunit` (0-1) for conceptually the same kind of ratio, forces the viewer to remember which panel uses which scale.
- **Dashboards with no time range context** — panels that don't make clear whether "now" is 15 seconds ago or 15 minutes ago (a stale panel during an active incident looks identical to a healthy one unless the "last updated"/refresh interval is visible).

## vs other tools

Datadog's "Service Catalog" auto-generates the overview → per-service hierarchy for you from APM data, which is convenient but ties you to their auto-instrumentation. Grafana's approach (hand-built or generated dashboard JSON plus template variables) requires you to build the hierarchy explicitly, but the result is a portable, versionable artifact you can generate once (via Grafonnet or a script) and apply to every service that emits RED-shaped metrics with consistent label names — which is exactly the payoff of having standardized on the naming/label conventions from the earlier lessons in this track.

## Watch out

- **A dashboard with `includeAll: true` and `multi: true` on the primary "which service" variable makes the aggregate panels ambiguous** — "sum across all selected jobs" silently blends multiple services' numbers into one line the moment someone selects "All," which looks like one service's data.
- **Cascading template variables must actually cascade** — a second variable's query that doesn't reference the first (`$job`) will show every instance for every job regardless of the selected job, defeating the purpose and confusing whoever is trying to drill down.
- **A per-service dashboard without a "dependencies" section stops one level too early** — "we're slow" without "and here's the downstream call that's slow" sends the on-call engineer to check logs manually for something the dashboard could have shown directly.

## The task

Write `service-overview-dashboard.yaml`: a templated per-service dashboard following the standard five-section layout.

Requirements:

Top-level `title: "Service Overview"`.

A `templating:` block with a `list:` of two variables:
1. `name: job`, `type: query`, `query: 'label_values(http_requests_total, job)'`, `multi: false`, `includeAll: false`.
2. `name: instance`, `type: query`, `query: 'label_values(http_requests_total{job="$job"}, instance)'`, `multi: true`, `includeAll: true`.

A `panels:` list with exactly five panels, one per section, each with `title`, `type`, and a `targets` list with at least one `expr` referencing `$job` (every query must be parameterized by the job variable, not hardcoded):

1. `title: "Throughput"`, `type: timeseries`, expr `'sum(rate(http_requests_total{job="$job"}[5m]))'`
2. `title: "Error Rate"`, `type: stat`, expr `'sum(rate(http_requests_total{job="$job", status=~"5.."}[5m])) / sum(rate(http_requests_total{job="$job"}[5m]))'`
3. `title: "Latency Percentiles"`, `type: timeseries`, expr `'histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket{job="$job"}[5m])))'`
4. `title: "Saturation"`, `type: timeseries`, expr `'avg by (instance) (rate(node_cpu_seconds_total{job="$job", mode="idle"}[5m]))'`
5. `title: "Dependencies"`, `type: timeseries`, expr `'sum by (dependency) (rate(outbound_request_duration_seconds_count{job="$job"}[5m]))'`

Expected shape:

```yaml
title: "Service Overview"
templating:
  list:
    - name: job
      type: query
      query: 'label_values(http_requests_total, job)'
      multi: false
      includeAll: false

    - name: instance
      type: query
      query: 'label_values(http_requests_total{job="$job"}, instance)'
      multi: true
      includeAll: true

panels:
  - title: "Throughput"
    type: timeseries
    targets:
      - expr: 'sum(rate(http_requests_total{job="$job"}[5m]))'

  - title: "Error Rate"
    type: stat
    targets:
      - expr: 'sum(rate(http_requests_total{job="$job", status=~"5.."}[5m])) / sum(rate(http_requests_total{job="$job"}[5m]))'

  - title: "Latency Percentiles"
    type: timeseries
    targets:
      - expr: 'histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket{job="$job"}[5m])))'

  - title: "Saturation"
    type: timeseries
    targets:
      - expr: 'avg by (instance) (rate(node_cpu_seconds_total{job="$job", mode="idle"}[5m]))'

  - title: "Dependencies"
    type: timeseries
    targets:
      - expr: 'sum by (dependency) (rate(outbound_request_duration_seconds_count{job="$job"}[5m]))'
```

Every panel query must reference `$job` — a per-service dashboard whose panels hardcode one job name instead of using the template variable can't be reused across services, which defeats the entire point of this lesson.
