# PromQL Aggregations

## What you'll learn

Individual series (one per pod, one per route) are rarely what you want on a dashboard — you want "total across all pods" or "worst route." This lesson covers aggregation operators (`sum`, `avg`, `count`, `by`/`without`), `topk`/`bottomk`, `quantile`, binary operators with vector matching, and `absent()` — the tools for turning per-series data into the operational answers people in this track actually ask for.

## Key concepts

**Aggregation operators collapse multiple series into fewer series**, grouped by the labels you keep:

```promql
sum(rate(http_requests_total[5m]))                          # one number: total request rate, all labels dropped
sum by (route) (rate(http_requests_total[5m]))               # one number per route, everything else collapsed
sum without (instance) (rate(http_requests_total[5m]))        # keeps every label except instance (collapses replicas)
```

`by (labels...)` keeps *only* the named labels, dropping everything else. `without (labels...)` keeps every label *except* the named ones. Use `by` when you know exactly which dimension you're grouping on (route, status, method); use `without` when you want to collapse one specific dimension (instance/pod) while keeping everything else you didn't anticipate — `without (instance)` survives a schema change that adds a new label better than an equivalent `by (...)` listing every label except instance.

**The other aggregation functions**, same `by`/`without` syntax:

```promql
avg by (route) (http_request_duration_seconds_sum / http_request_duration_seconds_count)  # average latency per route
max by (job) (process_resident_memory_bytes)                 # peak memory per job
min by (job) (up)                                             # is every instance in a job up? (1 if all up, else 0 present but min catches any 0)
count by (status) (http_requests_total)                       # how many distinct series (not requests!) per status
```

`count` counts the number of *series*, not a metric value — `count(up)` tells you how many targets exist, not anything about request volume.

**`topk` / `bottomk` — the N largest/smallest series by value**, essential for "which route is slowest" style panels:

```promql
topk(5, sum by (route) (rate(http_requests_total{status=~"5.."}[5m])))   # top 5 routes by error rate
bottomk(3, avg_over_time(up[1h]))                                        # 3 targets with the worst uptime ratio
```

Unlike `sum`/`avg`, `topk`/`bottomk` don't need `by`/`without` — they operate over whatever series the inner expression already produced and return that many full series (with all original labels intact), not a single collapsed number.

**`quantile()` — the *aggregation* function, not `histogram_quantile()`.** These are easy to confuse: `quantile(0.95, some_instant_vector)` computes a quantile *across a set of series* at one instant (e.g., "p95 memory usage across all pods, right now") using nearest-rank interpolation over the actual sample values. `histogram_quantile()` computes a quantile *within one (possibly summed) histogram's buckets* over time. They solve different problems and are not interchangeable.

**Binary operators and vector matching** — arithmetic between two instant vectors matches series by identical label sets, which is rarely what you want across two *different* metrics:

```promql
rate(http_requests_total{status=~"5.."}[5m])
  /
sum without (status) (rate(http_requests_total[5m]))
```

This divides error rate by total rate — but the numerator still has a `status` label the denominator doesn't. Prometheus's default matching requires identical label sets on both sides, so this needs `ignoring`:

```promql
sum without (status) (rate(http_requests_total{status=~"5.."}[5m]))
  /
sum without (status) (rate(http_requests_total[5m]))
```

Or, matching a many-to-one relationship (e.g., dividing a per-instance metric by a per-job total), you need `group_left`/`group_right` to tell Prometheus which side has the "extra" labels:

```promql
node_memory_MemAvailable_bytes
  / on (instance) group_left
node_memory_MemTotal_bytes
```

`on (labels)` restricts matching to only the named labels (the inverse of `ignoring`); `group_left`/`group_right` says "the left/right side may match multiple series on the right/left" — required whenever the two sides don't have a strict 1:1 label correspondence.

**`absent()` — detects the total absence of a series**, which is different from a series being present with value 0. Essential for "is anything even scraping this job" alerts:

```promql
absent(up{job="critical-service"})
```

Returns `1` if no series matches `up{job="critical-service"}` at all (the job doesn't exist / was never scraped / all instances vanished), and returns nothing if at least one matching series exists — regardless of that series' value. This catches a class of failure `up == 0` alerts miss entirely: total absence, e.g., service discovery lost every target so there's nothing to report `0` from.

## vs other tools

SQL's `GROUP BY` is the closest analogy to `by (...)`, but PromQL's default binary-operator matching (exact label-set equality) has no SQL equivalent — SQL joins are always explicit about their join keys, while PromQL implicitly joins on "every label both sides have," which is exactly why `ignoring`/`on` exist: to make that implicit join explicit when it isn't what you want.

## Watch out

- **Forgetting `ignoring`/`on` on cross-metric division is the single most common PromQL error** — the query silently returns *no data* (not an error) because no series pair has an identical label set, and a panel with no data looks the same as a panel querying the wrong metric name. Always check: are both sides of a binary operator the same metric family? If not, expect to need `ignoring` or `on`.
- **`count()` counts series, `sum()` counts values.** `count(http_requests_total)` is "how many distinct method/route/status combinations exist," not "how many requests happened" — a frequent misread on first exposure to PromQL.
- **`topk`/`bottomk` on a live dashboard reorders which series are shown from one refresh to the next**, which can look like flickering/inconsistent data to someone unfamiliar with the query — this is expected: the top 5 by value at 10:00:00 may differ from the top 5 at 10:00:15.

## The task

Write `promql-aggregations.yaml`: an annotated set of aggregation queries answering real operational questions.

Requirements — a `queries:` list, each entry with `name`, `promql`, `explains`:

1. `name: total_request_rate` — `promql: 'sum(rate(http_requests_total[5m]))'` — total request rate across all series.
2. `name: request_rate_by_route` — `promql: 'sum by (route) (rate(http_requests_total[5m]))'` — request rate grouped by route.
3. `name: request_rate_collapse_instance` — `promql: 'sum without (instance) (rate(http_requests_total[5m]))'` — request rate collapsing only the instance label.
4. `name: top5_error_routes` — `promql: 'topk(5, sum by (route) (rate(http_requests_total{status=~"5.."}[5m])))'` — the 5 routes with the highest error rate.
5. `name: error_ratio` — `promql: 'sum without (status) (rate(http_requests_total{status=~"5.."}[5m])) / sum without (status) (rate(http_requests_total[5m]))'` — fraction of requests that errored.
6. `name: memory_utilization_ratio` — `promql: 'node_memory_MemAvailable_bytes / on (instance) group_left node_memory_MemTotal_bytes'` — available memory as a fraction of total, matched by instance with group_left.
7. `name: critical_service_missing` — `promql: 'absent(up{job="critical-service"})'` — fires 1 if the critical-service job has no series (not being scraped at all) present.

Expected shape:

```yaml
queries:
  - name: total_request_rate
    promql: 'sum(rate(http_requests_total[5m]))'
    explains: "Total request rate across every series, all labels collapsed."

  - name: request_rate_by_route
    promql: 'sum by (route) (rate(http_requests_total[5m]))'
    explains: "Request rate grouped by route, everything else collapsed."

  - name: request_rate_collapse_instance
    promql: 'sum without (instance) (rate(http_requests_total[5m]))'
    explains: "Request rate with only the instance label collapsed, keeping every other label."

  - name: top5_error_routes
    promql: 'topk(5, sum by (route) (rate(http_requests_total{status=~"5.."}[5m])))'
    explains: "The 5 routes with the highest 5xx error rate right now."

  - name: error_ratio
    promql: 'sum without (status) (rate(http_requests_total{status=~"5.."}[5m])) / sum without (status) (rate(http_requests_total[5m]))'
    explains: "Fraction of total requests that returned a 5xx, with status stripped from both sides so the division matches."

  - name: memory_utilization_ratio
    promql: 'node_memory_MemAvailable_bytes / on (instance) group_left node_memory_MemTotal_bytes'
    explains: "Available memory as a fraction of total memory, matched per instance with group_left for the many-to-one relationship."

  - name: critical_service_missing
    promql: 'absent(up{job="critical-service"})'
    explains: "Returns 1 only if no series for the critical-service job exists at all — catches total scrape/discovery loss, not just a 0 value."
```

The `ignoring`-equivalent `without (status)` on both sides of `error_ratio`, and the `on (instance) group_left` on the memory ratio, are the load-bearing details — get either wrong and the query returns no data instead of an error.
