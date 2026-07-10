# Histograms and Quantiles

## What you'll learn

You know histograms exist; now the mechanics that determine whether the p99 on your dashboard is trustworthy. Bucket boundaries, `histogram_quantile()`'s interpolation, why the answer it gives you is an *estimate* with a known error bound, how to pick boundaries for SLOs, and the native-histogram alternative that's reshaping this whole area.

## Key concepts

**Buckets are cumulative, not exclusive.** Each `le` (less-than-or-equal) bucket counts *every* observation at or below that boundary, not just observations in that band:

```
http_request_duration_seconds_bucket{le="0.1"}  80211   <- count of requests <= 0.1s
http_request_duration_seconds_bucket{le="0.5"}  84100   <- count of requests <= 0.5s (includes the 80211 above)
http_request_duration_seconds_bucket{le="1"}    84200   <- count of requests <= 1s
http_request_duration_seconds_bucket{le="+Inf"} 84213   <- count of ALL requests (equals _count)
```

The `+Inf` bucket is mandatory and always equals the total observation count — it's what makes the histogram self-describing without needing a separate "did we account for every observation" check.

**`histogram_quantile()` estimates by linear interpolation within a bucket**, it does not know the exact values inside a bucket — only how many observations fall in it. To estimate the 0.95 quantile:

```promql
histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))
```

Read this right to left: `rate(..._bucket[5m])` gives the per-second increase rate of each cumulative bucket counter; `sum by (le)` collapses multiple instances/pods into one fleet-wide histogram (this is the aggregation property histograms have and summaries don't); `histogram_quantile(0.95, ...)` finds the bucket where the cumulative count crosses 95% of the total, and linearly interpolates *within that bucket's range* to produce an estimated value. If your buckets are `le="0.5"` (90% of requests) and `le="1"` (97% of requests), the estimated p95 is interpolated somewhere between 0.5 and 1 — **not** the true p95, unless your data happens to be uniformly distributed across that range, which it usually isn't.

**Accuracy is bounded by your bucket boundaries, not by sample count.** This is the single most misunderstood thing about Prometheus histograms: adding more traffic does not make the quantile more accurate — only tighter buckets around the values you care about do. If you need an accurate p99 near 200ms, put bucket boundaries close together around 200ms (`0.15, 0.2, 0.25, 0.3`), not evenly spaced from 0 to 10 seconds.

**Choosing bucket boundaries for SLOs.** Start from your SLO target, not from a generic default ladder. If your SLO is "99% of requests under 300ms," you need a bucket boundary *at or near* 0.3 — without it, `histogram_quantile` can't tell you whether you're meeting that SLO, only interpolate a guess. A reasonable pattern:

```
buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.3, 0.5, 1, 2.5, 5, 10]
```

— dense near your SLO threshold(s), sparser far from them. Prometheus client libraries default to `prometheus.DefBuckets` (roughly this shape) if you don't set your own, but the default is generic; always override it once you know your actual latency targets.

**Native histograms** (Prometheus 2.40+, stable in recent releases) replace fixed manual buckets with automatically-sized exponential buckets at high resolution, stored far more compactly than the classic one-series-per-bucket approach. They remove the "did I pick the right boundaries" problem almost entirely and are the direction Prometheus is heading, but classic histograms remain the interoperable default (every client library, every existing dashboard, every `histogram_quantile()` query you'll write in this track) — know that native histograms exist and why they matter, but expect classic bucketed histograms in almost every production system you touch today.

**Histogram vs summary — the actual decision.** Use a histogram unless you have a specific reason not to:

| | Histogram | Summary |
|---|---|---|
| Aggregatable across instances | Yes (`sum by (le)`) | No |
| Exact quantile | No (interpolated) | Yes, at scrape time |
| Client-side CPU cost | Low (just bucket counters) | Higher (streaming quantile calculation) |
| Configurable after the fact | Yes (query-time quantile choice) | No (quantiles fixed at instrumentation time) |

The "configurable after the fact" row is decisive in practice: with a histogram, you can add a p99.9 panel to a dashboard next year without redeploying the service; with a summary, if you didn't configure `{quantile="0.999"}` at instrumentation time, that data was never recorded and is gone.

## vs other tools

Datadog's "distribution" metric type solves the same aggregatability problem summaries have, using client-side sketching (similar to a t-digest) rather than fixed buckets — closer in spirit to Prometheus's native histograms than to classic histograms. StatsD timers are effectively summaries — always check whether your StatsD-to-Prometheus bridge is exposing an aggregatable histogram or a per-instance summary before trusting a fleet-wide p99 from one.

## Watch out

- **`histogram_quantile()` on too few buckets near your threshold gives a confidently wrong number**, not an error — it will happily interpolate between `le="0.1"` and `le="10"` and hand you a p99 estimate that could be off by an order of magnitude. Always sanity-check bucket density against your actual SLO thresholds.
- **Never `avg()` a set of per-instance quantiles.** Averaging quantiles is not the same as the quantile of the combined data — it's a common, silently wrong pattern people carry over from summaries. Sum the raw bucket rates first, then take one quantile of the combined histogram.
- **Missing the `+Inf` bucket** (hand-rolling exposition format instead of using a client library) breaks `histogram_quantile()` silently — it needs the true total count to compute percentages correctly.

## The task

Write `histogram-slo.yaml`: a histogram metric definition tuned for a 300ms SLO, plus the PromQL queries to read it.

Requirements:

Under `histogram_definition:`, define `name: http_request_duration_seconds` with a `buckets:` list that includes at least these exact boundaries relevant to a 300ms SLO: `0.1`, `0.25`, `0.3`, `0.5`, `1`, and `2.5` (order ascending; you may include more).

Under `queries:`, a list of three named query entries, each with `name` and `promql`:
1. `name: p50_latency` — `promql: 'histogram_quantile(0.5, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))'`
2. `name: p95_latency` — `promql: 'histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))'`
3. `name: p99_latency_per_route` — `promql: 'histogram_quantile(0.99, sum by (le, route) (rate(http_request_duration_seconds_bucket[5m])))'` (note the extra `route` label preserved in the `by` clause so the quantile is computed per-route rather than collapsed across all routes)

Expected shape:

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

The `0.3` bucket boundary is the load-bearing detail — without a boundary at or near your actual SLO threshold, none of these quantile queries can tell you whether the SLO is being met, only estimate a nearby number.
