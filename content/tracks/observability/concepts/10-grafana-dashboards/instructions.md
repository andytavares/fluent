## What you build

You write a Grafana dashboard with three RED panels: request rate, error ratio and latency percentiles. You set the panel type, layout, unit and thresholds for each. This lesson builds on **PromQL Aggregations** and **RED and USE Methods**.

## Key concepts

### A dashboard is a JSON document

A Grafana dashboard is JSON: panels, targets and layout. You can write it by hand, generate it, or export and import it.

```json
{
  "title": "Web App Overview",
  "panels": []
}
```

Each element of `panels` is one panel object:

```json
{
  "id": 1,
  "title": "Request Rate",
  "type": "timeseries",
  "gridPos": {
    "h": 8, "w": 12, "x": 0, "y": 0
  },
  "targets": [{
    "expr":
      "sum(rate(http_requests_total[5m]))",
    "legendFormat": "requests/s"
  }],
  "fieldConfig": {
    "defaults": { "unit": "reqps" }
  }
}
```

- `panels`: the visual elements. Each panel shows one query result in one way.
- `targets`: the queries of a panel. Each target has a PromQL `expr`. A panel with several targets draws several lines.
- `gridPos`: position and size on a 24-column grid. `x` and `y` are the top-left corner, `w` and `h` the size.
- `fieldConfig.defaults.unit`: the field with the most effect on how people read the panel.

Panels use explicit coordinates, not flow. Two panels with overlapping `gridPos` overlap on screen. `w: 24` spans the full width.

### Pick the panel type for the question

| Type | Use for | Avoid for |
|---|---|---|
| `timeseries` | Rate, latency, utilization over time | One current value |
| `stat` | One current number, large | Trends: no history shows |
| `gauge` | A value inside a known min and max | Values with no natural range |
| `table` | Breakdowns, such as error rate per route | Trends: no time axis |
| `heatmap` | Histogram distribution over time | One scalar trend |

A `timeseries` panel with p50, p95 and p99 lines is good. A heatmap of the raw buckets next to it is better. It shows the full shape, such as a bimodal split of fast cache hits and slow cache misses. Three percentile lines can hide that split.

### The unit changes how people read the number

`fieldConfig.defaults.unit` sets the number format. A wrong unit makes an on-call engineer misread the panel.

- `reqps`: requests per second. Shows `142 reqps`, not a bare `142`.
- `percentunit`: takes a 0–1 fraction, such as an error ratio, and shows `5.7%`. On a 0–100 value, every number looks 100 times too small.
- `s` or `ms`: Grafana scales the display, for example `250ms` or `1.2s`. Pick the base unit of the metric, which is seconds in this track.
- `bytes`: Grafana scales to KB, MB or GB. Do not divide by 1024 in the query. Keep the data in its base unit.

### `legendFormat` names each series

`legendFormat` on a target sets the legend text for each series. `{{ method }} {{ route }}` gives one entry per method and route in the result. Without `legendFormat`, Grafana shows the full label set. That is unreadable with more than a few labels.

### Thresholds color a panel

`fieldConfig.defaults.thresholds` sets color bands for `stat` and `gauge` panels. A `timeseries` panel can show them as lines. The color says "is this bad" before anyone reads the number.

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

`value: null` on the first step sets the base color. Each later step applies once the value crosses it.

Grafana JSON is an open format that you can commit, diff and generate, for example with Grafonnet. Datadog and New Relic dashboards use the same idea through a closed schema.

## Watch out

- A `stat` panel with no unit shows a bare number. "142" can be requests, milliseconds or a percentage.
- Always set `unit`.
- `percent` on a PromQL ratio makes every value look 100 times too small. Use `percentunit` for 0–1 values.
- Overlapping `gridPos` values draw panels on top of each other. Check the `x`, `y`, `w` and `h` values.
- The `w` values in one row must add up to 24 or less.

## The task

Write `stub.yaml`: the dashboard `red-dashboard.yaml`, in YAML with the same structure as the dashboard JSON model.

1. Set the top-level `title: "Web App RED Overview"`.
2. Add a `panels:` list with exactly three panels.
3. Panel 1: `id: 1`, `title: "Request Rate"`, `type: timeseries`, `gridPos: { h: 8, w: 12, x: 0, y: 0 }`.
4. Panel 1 target: `expr: 'sum(rate(http_requests_total[5m]))'`, `legendFormat: "requests/s"`. Unit: `reqps`.
5. Panel 2: `id: 2`, `title: "Error Ratio"`, `type: stat`, `gridPos: { h: 8, w: 12, x: 12, y: 0 }`.
6. Panel 2 target: the 5xx request rate divided by the total request rate, `legendFormat: "error ratio"`.
7. Panel 2 unit: `percentunit`. Add `thresholds` with `green` at `null`, `yellow` at `0.01`, `red` at `0.05`.
8. Panel 3: `id: 3`, `title: "Latency Percentiles"`, `type: timeseries`, `gridPos: { h: 8, w: 24, x: 0, y: 8 }`.
9. Panel 3 targets: `histogram_quantile(0.95, ...)` with `legendFormat: "p95"` and `histogram_quantile(0.99, ...)` with `legendFormat: "p99"`.
10. Panel 3 unit: `s`.

Write each `gridPos` on one line, in the order `h, w, x, y`. Panels 1 and 2 share the row at `y: 0`, and 12 + 12 = 24 columns. Panel 3 spans the full width on the row below. Do not leave `TODO` comments in the file.

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
      - expr: |
          sum(rate(
            http_requests_total{
              status=~"5.."
            }[5m]
          ))
          /
          sum(rate(
            http_requests_total[5m]
          ))
        legendFormat: "error ratio"
    fieldConfig:
      defaults:
        unit: percentunit
        thresholds:
          mode: absolute
          steps:
            - color: green
              value: null
            - color: yellow
              value: 0.01
            - color: red
              value: 0.05

  - id: 3
    title: "Latency Percentiles"
    type: timeseries
    gridPos: { h: 8, w: 24, x: 0, y: 8 }
    targets:
      - expr: |
          histogram_quantile(0.95,
            sum by (le) (rate(
          http_request_duration_seconds_bucket[5m]
            ))
          )
        legendFormat: "p95"
      - expr: |
          histogram_quantile(0.99,
            sum by (le) (rate(
          http_request_duration_seconds_bucket[5m]
            ))
          )
        legendFormat: "p99"
    fieldConfig:
      defaults:
        unit: s
```
