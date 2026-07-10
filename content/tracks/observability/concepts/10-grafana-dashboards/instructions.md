# Grafana Dashboards

## What you'll learn

You've built the queries; now the artifact that actually displays them. Grafana dashboards are JSON documents — panels, targets (queries), and layout — that you can hand-author, generate, or export/import. This lesson covers the dashboard JSON model precisely enough to hand-write panels, which panel type to reach for per question, and why units/legends/thresholds are not cosmetic — they're what makes a number mean something to whoever's staring at the dashboard during an incident.

## Key concepts

**The dashboard JSON model — the pieces that matter:**

```json
{
  "title": "Web App Overview",
  "panels": [
    {
      "id": 1,
      "title": "Request Rate",
      "type": "timeseries",
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 0 },
      "targets": [
        { "expr": "sum(rate(http_requests_total[5m]))", "legendFormat": "requests/s" }
      ],
      "fieldConfig": {
        "defaults": { "unit": "reqps" }
      }
    }
  ]
}
```

- **`panels`** — the list of visual elements on the dashboard. Each panel is one query result rendered one way.
- **`targets`** — the queries feeding a panel. A panel can have multiple targets (multiple lines on one timeseries panel); each target's `expr` is the PromQL, `legendFormat` controls how its series label reads in the legend (`{{route}}` interpolates a label value per series).
- **`gridPos`** — panel position/size on a 24-column grid: `x`/`y` are the top-left corner, `w`/`h` are width/height in grid units (`w: 24` spans the full dashboard width). Panels are laid out by explicit coordinates, not flow — two panels with overlapping `gridPos` will visually overlap.
- **`fieldConfig.defaults.unit`** — the single most impactful field for readability (see Units below).

**Panel types and when to reach for each:**

| Type | Use for | Avoid for |
|---|---|---|
| `timeseries` | Anything over time — rate, latency, utilization | A single current value (use `stat` instead) |
| `stat` | One current number, big and glanceable — "current error rate," "requests/sec right now" | Trends — a stat panel has no history visible |
| `gauge` | A value against a known min/max range with visual thresholds — "disk usage %," "connection pool saturation" | Anything without a natural bounded range |
| `table` | Multi-dimensional breakdowns — "error rate per route," sortable by column | Time-series trends — a table has no time axis |
| `heatmap` | Histogram distributions over time — "latency distribution, not just p99" — shows the *whole* bucket distribution shifting over time, not a single collapsed line | A single scalar trend (use timeseries) |

A latency panel using only `timeseries` with p50/p95/p99 lines is good; a heatmap of the raw histogram buckets alongside it is *better* because it shows you the full distribution shape (e.g., a bimodal distribution — fast cache hits vs slow cache misses — that three percentile lines alone can hide).

**Units matter — this is not cosmetic.** `fieldConfig.defaults.unit` tells Grafana how to *format* the number, and getting it right or wrong changes whether an on-call engineer correctly reads a graph in a hurry:

- `reqps` — requests/sec, renders `142 reqps` instead of a bare `142`.
- `percentunit` — expects a 0–1 fraction (like our error ratio queries) and renders it as `5.7%` — using this on a value that's already 0–100 makes every number look 100x too small.
- `s` (seconds) / `ms` — Grafana auto-scales the display unit (`250ms` vs `1.2s`) based on magnitude; pick the unit matching your metric's actual base unit (seconds, per this track's naming convention from the metric-types lesson) and let Grafana handle display scaling.
- `bytes` — auto-scales to KB/MB/GB for display; never hand-roll `/ 1024 / 1024` in the query just to display MB, let the unit formatter do it so the underlying data stays in the metric's true base unit.

**Legends** — `legendFormat` on a target controls what each returned series is labeled in the legend, interpolating Prometheus labels: `{{ method }} {{ route }}` produces one legend entry per unique method/route combination present in the query result. Omitting `legendFormat` falls back to Grafana's default rendering of the full label set, which is unreadable once you have more than a couple of labels.

**Thresholds** — `fieldConfig.defaults.thresholds` define color bands (green/yellow/red) applied to `stat`/`gauge` panels (and optionally overlay lines on `timeseries`), giving an at-a-glance "is this bad" without reading the number:

```json
"thresholds": {
  "mode": "absolute",
  "steps": [
    { "color": "green", "value": null },
    { "color": "yellow", "value": 0.01 },
    { "color": "red", "value": 0.05 }
  ]
}
```

`value: null` on the first step means "this is the base/default color," subsequent steps apply once the value crosses their threshold.

## vs other tools

Datadog and New Relic dashboards are built and stored the same conceptual way (JSON widget definitions with queries and layout) but through a proprietary schema — Grafana's dashboard JSON is at least an open, versionable, diffable format you can commit to git and generate programmatically (Grafonnet, Grafana's own dashboard-as-code tooling, or hand-written JSON as in this lesson). Kibana's (Elastic) visualization model is similarly panel/query-based but tied to Elasticsearch's query DSL rather than PromQL.

## Watch out

- **A `stat` panel with no unit set displays a bare number** that's ambiguous — "142" could be requests/sec, milliseconds, or a percentage times 100. Always set `unit`.
- **Using `percent` (0–100 scale) instead of `percentunit` (0–1 scale)** on a PromQL ratio query (which naturally returns 0–1) makes every value look 100x too small — this is one of the most common Grafana dashboard bugs and is invisible unless you know what the real value should look like.
- **Overlapping `gridPos` values silently render panels on top of each other** — always double check `x`/`y`/`w`/`h` math when hand-authoring more than a couple of panels; `w` values across one row should sum to at most 24.

## The task

Write `red-dashboard.yaml`: a Grafana dashboard (as YAML, structurally identical to the dashboard JSON model above) with three panels for the RED metrics.

Requirements — a top-level `title: "Web App RED Overview"` and a `panels:` list with exactly three panels:

1. **Request rate panel** — `id: 1`, `title: "Request Rate"`, `type: timeseries`, `gridPos: { h: 8, w: 12, x: 0, y: 0 }`, one target with `expr: 'sum(rate(http_requests_total[5m]))'` and `legendFormat: "requests/s"`, `fieldConfig.defaults.unit: reqps`.
2. **Error ratio panel** — `id: 2`, `title: "Error Ratio"`, `type: stat`, `gridPos: { h: 8, w: 12, x: 12, y: 0 }`, one target with `expr: 'sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))'` and `legendFormat: "error ratio"`, `fieldConfig.defaults.unit: percentunit`, plus a `thresholds` block with steps `green` at `null`, `yellow` at `0.01`, `red` at `0.05`.
3. **Latency percentiles panel** — `id: 3`, `title: "Latency Percentiles"`, `type: timeseries`, `gridPos: { h: 8, w: 24, x: 0, y: 8 }`, two targets: `expr: 'histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))'` with `legendFormat: "p95"`, and `expr: 'histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))'` with `legendFormat: "p99"`, `fieldConfig.defaults.unit: s`.

Expected shape:

```yaml
title: "Web App RED Overview"
panels:
  - id: 1
    title: "Request Rate"
    type: timeseries
    gridPos: { h: 8, w: 12, x: 0, y: 0 }
    targets:
      - expr: 'sum(rate(http_requests_total[5m]))'
        legendFormat: "requests/s"
    fieldConfig:
      defaults:
        unit: reqps

  - id: 2
    title: "Error Ratio"
    type: stat
    gridPos: { h: 8, w: 12, x: 12, y: 0 }
    targets:
      - expr: 'sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))'
        legendFormat: "error ratio"
    fieldConfig:
      defaults:
        unit: percentunit
        thresholds:
          mode: absolute
          steps:
            - { color: green, value: null }
            - { color: yellow, value: 0.01 }
            - { color: red, value: 0.05 }

  - id: 3
    title: "Latency Percentiles"
    type: timeseries
    gridPos: { h: 8, w: 24, x: 0, y: 8 }
    targets:
      - expr: 'histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))'
        legendFormat: "p95"
      - expr: 'histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))'
        legendFormat: "p99"
    fieldConfig:
      defaults:
        unit: s
```

Note the two `timeseries` panels sit side-by-side at `y: 0` (12 + 12 = 24 columns, the full row), and the latency panel spans the full width (`w: 24`) on the row below (`y: 8`) — the `gridPos` math is exactly what determines whether this renders as a clean layout or overlapping panels.
