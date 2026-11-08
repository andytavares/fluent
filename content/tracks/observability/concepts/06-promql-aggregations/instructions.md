## What you build

You write seven annotated PromQL queries that turn per-series data into operational answers. They use `sum`, `by`, `without`, `topk`, vector matching and `absent()`. This lesson builds on **PromQL Basics**.

## Key concepts

### Aggregation operators collapse series

A dashboard rarely needs one series per pod or per route. It needs "total across all pods" or "worst route". Aggregation operators group series by the labels you keep.

```promql
# One number: all labels dropped
sum(rate(http_requests_total[5m]))

# One number per route
sum by (route) (
  rate(http_requests_total[5m]))

# Every label except instance
sum without (instance) (
  rate(http_requests_total[5m]))
```

`by (labels)` keeps only the named labels. `without (labels)` keeps every label except the named ones. Use `by` when you know the grouping dimension, such as route, status or method.

Use `without` to collapse one dimension, such as instance or pod, and keep all the others. `without (instance)` keeps working when someone adds a new label. A `by` list of every other label does not.

### Other aggregations use the same syntax

```promql
# Average latency per route
avg by (route) (
  http_request_duration_seconds_sum
  / http_request_duration_seconds_count)

# Peak memory per job
max by (job) (
  process_resident_memory_bytes)

# 0 if any instance in the job is down
min by (job) (up)

# Series per status, not requests
count by (status) (http_requests_total)
```

`count` counts series, not a metric value. `count(up)` tells you how many targets exist. It says nothing about request volume.

### `topk` and `bottomk` return the N largest or smallest series

Use them for panels such as "which route is slowest".

```promql
# Top 5 routes by error rate
topk(5, sum by (route) (
  rate(http_requests_total{
    status=~"5.."}[5m])))

# 3 targets with the worst uptime ratio
bottomk(3, avg_over_time(up[1h]))
```

`topk` and `bottomk` need no `by` or `without`. They work on the series the inner expression produced. They return that many full series with all their original labels, not one collapsed number.

### `quantile()` is not `histogram_quantile()`

`quantile(0.95, v)` computes a quantile across a set of series at one instant. An example is "p95 memory use across all pods, now". The result is the value that ranks at φ × N among the N sample values.

`histogram_quantile()` computes a quantile from the buckets of one histogram, which you can sum first. The two solve different problems.

### Binary operators match identical label sets

Arithmetic between two instant vectors matches series with identical label sets. Across two different expressions, that is rarely what you want.

```promql
rate(http_requests_total{
  status=~"5.."}[5m])
/
sum without (status) (
  rate(http_requests_total[5m]))
```

This divides the error rate by the total rate. But the left side still has a `status` label that the right side does not. Default matching needs identical label sets, so this returns no data. Remove `status` from both sides:

```promql
sum without (status) (
  rate(http_requests_total{
    status=~"5.."}[5m]))
/
sum without (status) (
  rate(http_requests_total[5m]))
```

SQL joins always name their join keys. PromQL joins on every label both sides have, so `ignoring` and `on` make the join keys explicit.

### `on` and `group_left` match many-to-one

`on (labels)` matches only on the named labels. It is the inverse of `ignoring`. `group_left` and `group_right` say which side can match more than one series on the other side. You need them when the two sides have no strict 1:1 label match, for example a per-instance metric divided by a per-job total.

```promql
node_memory_MemAvailable_bytes
  / on (instance) group_left
node_memory_MemTotal_bytes
```

### `absent()` detects a missing series

A missing series is not the same as a series with value 0.

```promql
absent(up{job="critical-service"})
```

It returns `1` when no series matches `up{job="critical-service"}`. That happens when the job does not exist, was never scraped or lost all its instances. It returns nothing when one or more series match, whatever their value.

An `up == 0` alert misses total absence. When service discovery loses every target, no series is left to report `0`.

## Watch out

- Cross-metric division without `ignoring` or `on` returns no data, not an error. This is the most common PromQL error.
- A panel with no data looks like a panel with a wrong metric name. Different metric families usually need `ignoring` or `on`.
- `count()` counts series. `sum()` adds values. `count(http_requests_total)` is the number of method, route and status combinations.
- `topk` and `bottomk` can show different series on each refresh. This is normal: the top 5 changes over time.

## The task

Write `stub.yaml`, also named `promql-aggregations.yaml`. It holds seven aggregation queries that answer operational questions.

1. Add a `queries:` list. Each entry has `name`, `promql` and `explains`.
2. `total_request_rate`: the total request rate across all series.
3. `request_rate_by_route`: the request rate grouped by route.
4. `request_rate_collapse_instance`: the request rate with only the `instance` label collapsed.
5. `top5_error_routes`: the 5 routes with the highest 5xx rate.
6. `error_ratio`: the fraction of requests that returned a 5xx.
7. Write `error_ratio` on one line. Use `sum without (status)` on both sides of `/`.
8. `memory_utilization_ratio`: available memory over total memory, matched `on (instance) group_left`.
9. `critical_service_missing`: returns 1 when job `critical-service` has no `up` series.
10. Remove every `TODO` comment.

```yaml
queries:
  - name: total_request_rate
    promql: 'sum(rate(http_requests_total[5m]))'
    explains: >-
      Total request rate, all labels
      collapsed.

  - name: request_rate_by_route
    promql: 'sum by (route) (rate(http_requests_total[5m]))'
    explains: >-
      Request rate per route.

  - name: request_rate_collapse_instance
    promql: 'sum without (instance) (rate(http_requests_total[5m]))'
    explains: >-
      Request rate with only instance
      collapsed.

  - name: top5_error_routes
    promql: 'topk(5, sum by (route) (rate(http_requests_total{status=~"5.."}[5m])))'
    explains: >-
      The 5 routes with the highest 5xx
      rate now.

  - name: error_ratio
    promql: 'sum without (status) (rate(http_requests_total{status=~"5.."}[5m])) / sum without (status) (rate(http_requests_total[5m]))'
    explains: >-
      Fraction of requests that returned
      a 5xx. Both sides drop status, so
      the division matches.

  - name: memory_utilization_ratio
    promql: 'node_memory_MemAvailable_bytes / on (instance) group_left node_memory_MemTotal_bytes'
    explains: >-
      Available over total memory, per
      instance. group_left handles the
      many-to-one match.

  - name: critical_service_missing
    promql: 'absent(up{job="critical-service"})'
    explains: >-
      1 only when the job has no series.
      It catches total scrape loss.
```
