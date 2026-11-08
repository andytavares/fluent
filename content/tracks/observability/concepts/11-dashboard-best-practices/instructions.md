## What you build

You write one templated per-service dashboard with the standard five-section layout. Template variables let the same dashboard serve every service. This lesson builds on **Grafana Dashboards**.

## Key concepts

### Dashboards form a hierarchy from overview to drill-down

One dashboard that shows everything is unreadable. A hundred single-metric dashboards leave nobody knowing where to start. Use three levels:

1. **Overview**: one row per service with three or four RED numbers. It answers "which service is unhealthy now" in five seconds.
2. **Per-service**: the RED and USE panels for one service. A template variable lets the same JSON serve every service and environment.
3. **Drill-down**: per-route and per-instance breakdowns. Panel links and data links on the per-service dashboard open it.

This prevents the on-call engineer at 3am facing a wall of 40 graphs with no starting point.

### Template variables make one dashboard serve every service

Grafana template variables, such as `$job` and `$instance`, replace one hand-copied dashboard per service. `label_values(metric, label)` fills the dropdown from the label values Prometheus has now.

The variables live in `templating.list` in the dashboard JSON. These are the queries of two variables:

```
# job variable
label_values(http_requests_total, job)

# instance variable, filtered by $job
label_values(
  http_requests_total{job="$job"},
  instance
)
```

### A variable can cascade from another

The `instance` query uses `job="$job"`. Grafana runs it again each time `$job` changes, so the list shows only instances of the selected job. Panel queries use the variables directly.

```promql
sum(rate(
  http_requests_total{job="$job"}[5m]
))
```

`multi: true` with `includeAll: true` lets a variable select several values or "All". That suits `instance`, to compare replicas. It is usually wrong for `job` on a per-service dashboard, which must show one service.

### A per-service dashboard has five sections, in order

1. **Throughput**: the total request rate.
2. **Error rate**: the error ratio, in a `stat` panel colored by thresholds.
3. **Latency percentiles**: p50, p95 and p99, never an average. Use a `timeseries` panel, and a `heatmap` for the distribution shape if you can.
4. **Saturation**: the USE signals for the resources the service depends on most. Examples: CPU and memory of its pods, connection pool use, queue depth.
5. **Dependencies**: rate, errors and duration of the calls this service makes to its dependencies. This shows "we are slow because the database is slow", not only "we are slow".

The order follows how an engineer debugs: is anyone using it, is it failing, is it slow, is it starved, is a dependency at fault.

### Four anti-patterns make a dashboard decorative

- **Wall of graphs**: 30 or more small panels with no hierarchy, all one size. Nothing draws the eye, so the viewer reads every panel to find the anomaly.
- **Averages-only latency**: one `avg(duration)` line and no percentiles. It hides tail latency that a real share of users feel, as the RED lesson showed.
- **Mixed units**: one ratio panel in `percent` (0–100) and another in `percentunit` (0–1). The viewer must remember which scale each panel uses.
- **No time context**: a stale panel during an incident looks the same as a healthy one. Show the refresh interval or the last update time.

Datadog's Service Catalog builds this hierarchy for you from APM data, but ties you to its auto-instrumentation. In Grafana, you build it yourself, and you can generate one portable dashboard for every service with consistent label names.

## Watch out

- `multi: true` and `includeAll: true` on the service variable blend services into one line.
- After someone selects "All", that blended line looks like the data of one service.
- A cascading variable must use `$job` in its query. Otherwise it lists every instance of every job.
- A dashboard without a Dependencies section stops one level short. The on-call engineer must search logs for the slow call.

## The task

Write `stub.yaml`: the templated dashboard `service-overview-dashboard.yaml` with the five-section layout.

1. Set the top-level `title: "Service Overview"`.
2. Add a `templating:` block with a `list:` of two variables.
3. Variable 1: `name: job`, `type: query`, `query: 'label_values(http_requests_total, job)'`, `multi: false`, `includeAll: false`.
4. Variable 2: `name: instance`, `type: query`, `query: 'label_values(http_requests_total{job="$job"}, instance)'`, `multi: true`, `includeAll: true`.
5. Add a `panels:` list with exactly five panels, one per section.
6. Give each panel a `title`, a `type` and a `targets` list with at least one `expr`.
7. Every `expr` must filter on `job="$job"`. Do not hard-code a job name.
8. `"Throughput"`, `timeseries`: the request rate of `http_requests_total`.
9. `"Error Rate"`, `stat`: the 5xx request rate divided by the total request rate.
10. `"Latency Percentiles"`, `timeseries`: `histogram_quantile(0.99, ...)` over `http_request_duration_seconds_bucket`, summed by `le`.
11. `"Saturation"`, `timeseries`: the idle CPU rate of `node_cpu_seconds_total`, averaged by `instance`.
12. `"Dependencies"`, `timeseries`: the call rate of `outbound_request_duration_seconds_count`, summed by `dependency`.

Do not leave `TODO` comments in the file.

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
      - expr: |
          sum(rate(http_requests_total{
            job="$job"
          }[5m]))

  - title: "Error Rate"
    type: stat
    targets:
      - expr: |
          sum(rate(http_requests_total{
            job="$job", status=~"5.."
          }[5m]))
          /
          sum(rate(http_requests_total{
            job="$job"
          }[5m]))

  - title: "Latency Percentiles"
    type: timeseries
    targets:
      - expr: |
          histogram_quantile(0.99,
            sum by (le) (rate(
          http_request_duration_seconds_bucket{
                job="$job"
              }[5m]
            ))
          )

  - title: "Saturation"
    type: timeseries
    targets:
      - expr: |
          avg by (instance) (rate(
            node_cpu_seconds_total{
              job="$job", mode="idle"
            }[5m]
          ))

  - title: "Dependencies"
    type: timeseries
    targets:
      - expr: |
          sum by (dependency) (rate(
          outbound_request_duration_seconds_count{
              job="$job"
            }[5m]
          ))
```
