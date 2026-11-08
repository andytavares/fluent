## What you build

You write a Prometheus recording rules file that stores the RED queries as named, precomputed series. Dashboards and alerts then read one shared definition. This lesson builds on **RED and USE Methods**.

## Key concepts

### Recording rules make dashboards fast

A p99 query scans every raw bucket sample on every instance each time a panel renders. At high cardinality, that takes seconds, for every viewer of every dashboard. A recording rule computes the result once on a schedule, and the dashboard reads the stored series.

```promql
histogram_quantile(
  0.99,
  sum by (le) (rate(
  http_request_duration_seconds_bucket[5m]
  ))
)
```

### Recording rules give one definition

Without a rule, each dashboard and alert writes its own "error rate". The definitions drift. One uses `status=~"5.."`, another uses `status="500"` and misses 502, 503 and 504. A recording rule is the one named source that every consumer reads.

### Rules live in groups with an interval

Each group has a name and an `interval`: how often Prometheus evaluates its rules. Prometheus evaluates the rules in one group in order. A rule can read the output of an earlier rule in the same group. Groups run independently, so do not assume an order between groups.

```yaml
groups:
- name: web-app-red
  interval: 30s
  rules:
  - record: job:http_requests:rate5m
    expr: sum by (job) (rate(http_requests_total[5m]))
```

Keep each `expr` on one line. The task's checks read one line at a time.

### Names follow `level:metric:operations`

The Prometheus naming convention has three colon-separated parts:

- `level`: the aggregation level, for example `instance`, `job`, `route` or `job_route`.
- `metric`: the base metric name, with its unit and without `_total` or `_bucket`.
- `operations`: the operations in the order applied, for example `rate5m` or `rate5m:avg`.

```
# rate(), then sum by (job)
job:http_requests:rate5m
# rate(), then sum by (job, route)
job_route:http_requests:rate5m
# error ratio, aggregated by job
job:http_request_errors:ratio_rate5m
# per-instance CPU rate
instance:node_cpu:rate5m
```

A reader can tell the level and the source of a recorded series from its name, without the rule file. This matters once you have dozens of rules.

### Later rules reuse earlier rules

An error-ratio rule can divide two recorded series by name. The expensive sub-expressions run once. Do not wrap the recorded series in `rate()` again: they are already rates.

```yaml
- record: >-
    job:http_request_errors:ratio_rate5m
  expr: >-
    job:http_request_errors:rate5m
    / job:http_requests:rate5m
```

### The interval sets the cost

Each rule adds load in proportion to its expression cost divided by its interval. A rule at 15s costs about four times the same rule at 60s, whether or not anyone looks at a dashboard. A shorter interval gives fresher data: the value is at most one interval old. Match the interval to how fast the value must update. 30s is a common default for RED series. Burn-rate inputs for alerts sometimes use a shorter interval.

Recording rules are like materialized views in a data warehouse: precomputed on a schedule and queried directly. Grafana query caching speeds up a dashboard, but two dashboards can still cache two different "error rate" queries.

## Watch out

- A rule expression is still PromQL. A bad `ignoring` or `on` clause records an empty series forever.
- That empty series looks like a normal metric, so it is harder to find than a bad dashboard query.
- Do not wrap a recorded rate in another `rate()`. A rate of a rate is meaningless.
- A group without `interval` uses the global `evaluation_interval` from `prometheus.yml`. That value can be wrong for the group.

## The task

Write `stub.yaml`: the recording rules file `red-recording-rules.yaml` for the RED queries. Prometheus loads it through a `rule_files:` entry.

1. Add a `groups:` list with one group.
2. Name the group `web-app-red`.
3. Set `interval: 30s`.
4. Add a `rules:` list with exactly four recording rules, in this order.
5. Rule 1: `record: job:http_requests:rate5m`, `expr: sum by (job) (rate(http_requests_total[5m]))`.
6. Rule 2: `record: job:http_request_errors:rate5m`, the same sum filtered to `status=~"5.."`.
7. Rule 3: `record: job:http_request_errors:ratio_rate5m`, `expr: job:http_request_errors:rate5m / job:http_requests:rate5m`.
8. Rule 4: `record: job:http_request_duration_seconds:p99_rate5m`, the p99 from `histogram_quantile(0.99, ...)` summed by `(job, le)`.

The order matters: rule 3 reads the output of rules 1 and 2 by name. Rule 3 has no `rate()` around the recorded series. Do not leave `TODO` comments in the file.

```yaml
groups:
- name: web-app-red
  interval: 30s
  rules:
  - record: job:http_requests:rate5m
    expr: sum by (job) (rate(http_requests_total[5m]))

  - record: job:http_request_errors:rate5m
    expr: |
      sum by (job) (rate(
        http_requests_total{
          status=~"5.."
        }[5m]
      ))

  - record: job:http_request_errors:ratio_rate5m
    expr: job:http_request_errors:rate5m / job:http_requests:rate5m

  - record: job:http_request_duration_seconds:p99_rate5m
    expr: |
      histogram_quantile(0.99,
        sum by (job, le) (rate(
      http_request_duration_seconds_bucket[5m]
        ))
      )
```
