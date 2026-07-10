# Recording Rules

## What you'll learn

The RED+USE queries from the last lesson are expensive to recompute on every dashboard load, and worse, if five different dashboards each write their own slightly-different version of "error ratio," you get five different numbers during an incident. Recording rules solve both: precompute expensive expressions on a schedule and store the result as a new, named time series — the single definition everyone's dashboards and alerts read from.

## Key concepts

**Why recording rules exist — two independent reasons.**

1. **Dashboard latency.** `histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))` re-scans every raw bucket sample across every instance, every time any dashboard panel using it renders. At high cardinality (many routes × many instances × many buckets), this can take seconds — noticeable, and multiplied across every viewer of every dashboard. A recording rule computes it once, on Prometheus's own evaluation schedule, and a dashboard just reads the pre-aggregated series — a cheap, instant lookup.
2. **Consistent definitions.** Without a recording rule, "error rate" gets redefined ad hoc in every dashboard/alert that needs it, and definitions drift (one dashboard uses `status=~"5.."`, another uses `status="500"` only, missing 502/503/504). A recording rule is the single named source of truth every consumer reads.

**Rule groups and evaluation intervals** — rules are organized into named groups, each with its own `interval` (how often its rules are (re-)evaluated):

```yaml
groups:
  - name: web-app-red
    interval: 30s
    rules:
      - record: job:http_requests:rate5m
        expr: sum by (job) (rate(http_requests_total[5m]))
```

Rules within a group are evaluated sequentially and can reference each other's *just-computed* output within the same evaluation cycle if ordered correctly — but rules across *different* groups run independently and shouldn't assume ordering.

**Naming convention: `level:metric:operations`.** Prometheus's own style guide (and every serious production setup) names recording rules with this exact colon-delimited convention:

- `level` — the aggregation level: `instance`, `job`, or a custom level like `route` or `job_route`.
- `metric` — the base metric name, unit included, no `_total`/`_bucket` suffix.
- `operations` — the operations applied, in application order, colon-separated: `rate5m`, `rate5m:avg`, `sum`.

```
job:http_requests:rate5m              # rate() then sum by (job)
job_route:http_requests:rate5m        # rate() then sum by (job, route)
job:http_request_errors:ratio_rate5m  # error ratio, aggregated by job
instance:node_cpu:rate5m              # per-instance CPU rate
```

This convention lets anyone reading a recorded metric name infer its aggregation level and derivation without opening the rule file — critical once you have dozens of recording rules across a large PromQL codebase.

**Building SLI records.** Take the RED pack from the last lesson and turn each query into a recording rule:

```yaml
groups:
  - name: web-app-red
    interval: 30s
    rules:
      - record: job:http_requests:rate5m
        expr: sum by (job) (rate(http_requests_total[5m]))

      - record: job:http_request_errors:rate5m
        expr: sum by (job) (rate(http_requests_total{status=~"5.."}[5m]))

      - record: job:http_request_errors:ratio_rate5m
        expr: job:http_request_errors:rate5m / job:http_requests:rate5m

      - record: job:http_request_duration_seconds:p99_rate5m
        expr: histogram_quantile(0.99, sum by (job, le) (rate(http_request_duration_seconds_bucket[5m])))
```

Note the third rule *references the first two rules' output by name* — a key benefit of recording rules: expensive sub-expressions get computed once and reused, rather than recomputed inline in a longer expression (and note it's written without `rate(...)` around it — it's already a rate, referencing a recorded rate-series directly).

**Evaluation cost thinking.** Every recording rule adds continuous evaluation load, proportional to `1/interval` times the cost of its expression — a rule with a 15s interval scanning a large cardinality range costs roughly 4x what the same rule at 60s costs, running continuously, whether or not anyone's looking at a dashboard right now. The tradeoff: shorter intervals reduce dashboard/alert staleness (data is at most `interval` old) but raise steady-state Prometheus CPU/memory cost. Match the interval to how fast the underlying value actually needs to be — 30s is a common default for RED-style SLIs; alerting-critical burn-rate inputs (next lesson) sometimes go tighter.

## vs other tools

Materialized views in a data warehouse are the closest SQL analogy — precomputed, refreshed on a schedule, queried directly instead of recomputing the underlying joins/aggregations every time. Grafana's own query caching solves the dashboard-latency problem partially but not the consistent-definition problem — two different dashboards can still cache two different ad hoc "error rate" expressions. Recording rules solve both at the source.

## Watch out

- **A recording rule expression is still just PromQL — it inherits every mistake from earlier lessons.** A recording rule with a bad `ignoring`/`on` clause silently records an empty series forever, and because it looks like a normal metric to consumers, this is *harder* to notice than the same mistake in an ad hoc dashboard query.
- **Don't rate() an already-recorded rate series.** If `job:http_requests:rate5m` is itself the output of a `rate()`, referencing it directly (not wrapping it in another `rate()`) in a dependent rule is correct — wrapping it again produces nonsense (rate of a rate).
- **Group interval, not global `evaluation_interval`, controls a rule's actual cadence** if you set a per-group `interval:` — omitting it falls back to the global default from your `prometheus.yml`, which may be looser or tighter than you intend for a specific rule group.

## The task

Write `red-recording-rules.yaml`: a Prometheus recording rules file implementing the RED pack from the last lesson as named, reusable series.

Requirements — a `groups:` list with one group:

- `name: web-app-red`
- `interval: 30s`
- `rules:` a list of exactly four recording rules, in this order (so later rules can reference earlier ones by name):
  1. `record: job:http_requests:rate5m`, `expr: sum by (job) (rate(http_requests_total[5m]))`
  2. `record: job:http_request_errors:rate5m`, `expr: sum by (job) (rate(http_requests_total{status=~"5.."}[5m]))`
  3. `record: job:http_request_errors:ratio_rate5m`, `expr: job:http_request_errors:rate5m / job:http_requests:rate5m`
  4. `record: job:http_request_duration_seconds:p99_rate5m`, `expr: histogram_quantile(0.99, sum by (job, le) (rate(http_request_duration_seconds_bucket[5m])))`

Expected shape:

```yaml
groups:
  - name: web-app-red
    interval: 30s
    rules:
      - record: job:http_requests:rate5m
        expr: sum by (job) (rate(http_requests_total[5m]))

      - record: job:http_request_errors:rate5m
        expr: sum by (job) (rate(http_requests_total{status=~"5.."}[5m]))

      - record: job:http_request_errors:ratio_rate5m
        expr: job:http_request_errors:rate5m / job:http_requests:rate5m

      - record: job:http_request_duration_seconds:p99_rate5m
        expr: histogram_quantile(0.99, sum by (job, le) (rate(http_request_duration_seconds_bucket[5m])))
```

This is exactly the file `prometheus --config.file=prometheus.yml` would load via a `rule_files:` entry, and exactly what the alerting lesson's burn-rate rules will read from instead of recomputing the error ratio inline.
