## What you build

You define a latency histogram with bucket boundaries for a 300 ms SLO. You write three `histogram_quantile()` queries that read it. This lesson builds on **Metric Types**.

## Key concepts

### Buckets are cumulative

Each `le` bucket counts every observation at or below its boundary, not only the observations in its band.

```
# Requests <= 0.1s
..._bucket{le="0.1"}  80211
# Requests <= 0.5s, including the 80211
..._bucket{le="0.5"}  84100
# Requests <= 1s
..._bucket{le="1"}    84200
# All requests, equal to _count
..._bucket{le="+Inf"} 84213
```

The `+Inf` bucket is mandatory, and it always equals the total observation count. It makes the histogram self-describing: you need no separate check that it counted every observation.

### `histogram_quantile()` interpolates inside one bucket

The function knows only how many observations fall in each bucket, not their exact values.

```promql
histogram_quantile(0.95,
  sum by (le) (rate(
  http_request_duration_seconds_bucket[5m]
)))
```

Read it from the inside out:

1. `rate(..._bucket[5m])` gives the per-second rate of increase of each cumulative bucket counter.
2. `sum by (le)` merges all instances and pods into one fleet-wide histogram. Summaries cannot do this.
3. `histogram_quantile(0.95, ...)` finds the bucket where the cumulative count crosses 95% of the total.
4. It then interpolates linearly inside that bucket's range to estimate the value.

Suppose `le="0.5"` holds 90% of requests and `le="1"` holds 97%. The estimated p95 is somewhere between 0.5 and 1. It is the true p95 only if the data is uniform across that range, which is rare.

### Bucket boundaries set the accuracy

More traffic does not make the quantile more accurate. Only tighter buckets around the values you care about do. For an accurate p99 near 200 ms, put boundaries close together around 200 ms: `0.15, 0.2, 0.25, 0.3`. Do not spread them evenly from 0 to 10 seconds.

### Start the buckets from the SLO

Suppose your SLO is "99% of requests under 300 ms". You need a boundary at or near 0.3. Without it, `histogram_quantile` cannot tell you whether you meet the SLO. It can only interpolate a guess.

```
buckets: [0.005, 0.01, 0.025, 0.05,
  0.1, 0.25, 0.3, 0.5, 1, 2.5, 5, 10]
```

Put the boundaries close together near the SLO thresholds and further apart away from them. Client libraries use a generic default ladder when you set none, for example `prometheus.DefBuckets` in the Go client. Replace it when you know your latency targets.

### Native histograms size the buckets for you

Native histograms use exponential buckets that the client sizes at high resolution. Prometheus stores them in much less space than the classic one-series-per-bucket form. They almost remove the "did I pick the right boundaries?" problem.

Prometheus v2.40.0 added them as an experimental feature, and v3.8.0 made them stable. Classic histograms remain the interoperable default: every client library, existing dashboard and query in this track uses them. Expect classic histograms in most production systems.

### Use a histogram unless you have a reason not to

| | Histogram | Summary |
|---|---|---|
| Aggregate across instances | Yes, `sum by (le)` | No |
| Exact quantile | No, estimated | Yes |
| Client CPU cost | Low | Higher |
| Choose quantile at query time | Yes | No |

The last row decides most cases. With a histogram, you can add a p99.9 panel next year with no deploy. With a summary, a `{quantile="0.999"}` that you did not configure at instrumentation time was never recorded.

Datadog distributions use client-side sketches instead of fixed buckets, which puts them closer to native histograms than to classic ones. StatsD timers act as summaries. Check whether a StatsD bridge exposes a histogram before you trust a fleet-wide p99 from it.

## Watch out

- Too few buckets near a threshold give a wrong number, not an error. An estimate between `le="0.1"` and `le="10"` can be off tenfold.
- Do not `avg()` per-instance quantiles. Sum the bucket rates first, then take one quantile of the combined histogram.
- A hand-written exposition without the `+Inf` bucket breaks `histogram_quantile()` with no error. It needs the true total count.

## The task

Write `stub.yaml`, also named `histogram-slo.yaml`. It holds a histogram tuned for a 300 ms SLO and the queries that read it.

1. Add `histogram_definition:` with `name: http_request_duration_seconds`.
2. Give it a `buckets:` list in ascending order, on one line.
3. The list must include `0.1`, `0.25`, `0.3`, `0.5`, `1` and `2.5`. It can include more.
4. Add a `queries:` list. Each entry has `name` and `promql`.
5. `p50_latency`: the 0.5 quantile, summed `by (le)`.
6. `p95_latency`: the 0.95 quantile, summed `by (le)`.
7. `p99_latency_per_route`: the 0.99 quantile, summed `by (le, route)`.
8. The `route` label in `by` gives one quantile per route, not one for all routes.
9. Each query applies `rate()` to `http_request_duration_seconds_bucket` over `[5m]`.
10. Remove every `TODO` comment.

```yaml
histogram_definition:
  name: http_request_duration_seconds
  buckets: [0.1, 0.25, 0.3, 0.5, 1, 2.5]

queries:
  - name: p50_latency
    promql: 'histogram_quantile(0.5, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))'

  - name: p95_latency
    promql: 'histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))'

  - name: p99_latency_per_route
    promql: 'histogram_quantile(0.99, sum by (le, route) (rate(http_request_duration_seconds_bucket[5m])))'
```
