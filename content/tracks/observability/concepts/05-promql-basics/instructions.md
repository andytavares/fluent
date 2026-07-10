# PromQL Basics

## What you'll learn

PromQL is the query language every dashboard panel, alert, and recording rule in this track is built from. This lesson covers its two core data types (instant vector, range vector), label matchers/selectors, and the single most consequential function family — `rate()`, `irate()`, `increase()` — including how they silently handle counter resets, which is the thing that breaks people's first real dashboards.

## Key concepts

**Instant vector** — one sample per matching series, at a single point in time. A bare metric name is an instant vector query:

```promql
http_requests_total
```

This returns the *current* (most recent, within staleness bounds) value of every series named `http_requests_total`, each still carrying its labels.

**Range vector** — a *range* of samples per matching series, over a trailing time window, written with `[duration]`:

```promql
http_requests_total[5m]
```

This is not directly graphable — it returns a set of raw samples per series, not one number. Range vectors exist to be fed into range functions (`rate`, `increase`, `avg_over_time`, etc.) that reduce them back down to an instant vector, one number per series, which *is* graphable.

**Selectors and matchers** — filter which series a query touches:

```promql
http_requests_total{job="web-app"}                    # exact match
http_requests_total{status=~"5.."}                     # regex match (=~)
http_requests_total{status!~"2..|3.."}                  # negated regex (!~)
http_requests_total{job="web-app", method!="GET"}       # negated exact match (!=), AND'd with job
```

Label matchers inside `{}` are always ANDed together. There's no OR across different label names in one selector — for that you need `or` between two full vector expressions, covered in the aggregations lesson.

**`rate()` — the function you use for counters, almost always.** It computes the per-second average rate of increase over the range window, and — critically — automatically detects and corrects for counter resets (a process restart that zeroes the counter):

```promql
rate(http_requests_total[5m])
```

This does not give you "requests in the last 5 minutes" — it gives you the *per-second rate*, averaged over that 5-minute window. Multiply by the window if you want a total: that's what `increase()` does for you.

**`increase()` — total increase over the window**, computed as `rate() * window_seconds` internally, with the same counter-reset correction:

```promql
increase(http_requests_total[5m])   # approx total requests in the last 5m
```

Note the word "approx" — `increase()` extrapolates slightly at the boundaries of the range if samples don't land exactly on the edges, so it's not an exact count, just very close.

**`irate()` — instant rate, using only the last two samples in the range** instead of averaging across the whole window:

```promql
irate(http_requests_total[1m])
```

`irate()` reacts fast to spikes but is noisy and unsuitable for alerting or slow-moving dashboards — a single delayed scrape can swing the value wildly. **Use `rate()` for dashboards and alerts; reserve `irate()` for ad-hoc investigation of fast-changing counters** where you specifically want to see a spike, not a smoothed trend.

**The window must be at least 4x your scrape interval.** `rate()` needs at least two samples inside the window to compute anything — with a 15s scrape interval, a `[15s]` window might only ever contain one sample and return nothing (or `NaN`) intermittently. `[1m]` is the practical minimum at a 15s scrape interval; `[5m]` is the conventional default for dashboards, trading responsiveness for a smoother line.

**`offset` — look at a shifted point in time**, useful for week-over-week or day-over-day comparisons:

```promql
rate(http_requests_total[5m]) offset 1d   # same query, as of 24h ago
```

**The golden rule: rate first, aggregate second.** `rate()` must be applied directly to the raw counter — never to an already-summed or already-averaged series — because rate's reset-detection logic needs the raw per-series counter history, not a value that's already been collapsed across series. `sum(rate(x[5m]))` is correct; `rate(sum(x)[5m])` is subtly wrong (summing first can mask individual series' resets and mixes reset points from different series into one blended series that no longer behaves like a monotonic counter). You'll use this rule constantly starting with the aggregations lesson next.

## vs other tools

SQL has no concept of "range vector then reduce" — the closest analogy is a window function, but PromQL bakes counter-reset handling directly into `rate()`, something you'd otherwise have to hand-code with `LAG()` and a `CASE WHEN current < previous THEN ...`. InfluxQL/Flux has similar rate functions but requires you to pick the reset-handling strategy explicitly; PromQL's `rate()` reset detection is automatic and usually invisible, which is convenient until you need to know exactly what it did — the reset-handling rule to remember is: a decrease between consecutive samples is treated as "the counter reset to zero and kept counting," and the value lost is added back in.

## Watch out

- **Never graph a bare counter.** `http_requests_total` on its own is a monotonically increasing line that tells you almost nothing useful visually — always wrap it in `rate()` or `increase()`.
- **`irate()` on a dashboard produces a spiky, hard-to-read graph** and is unsuitable for alert thresholds because a single slow scrape can make it swing to zero or spike enormously. Default to `rate()`.
- **A window smaller than ~4x scrape interval intermittently returns no data**, which shows up as gaps in a graph or a rule that silently never fires. If your scrape interval changes, revisit your window sizes.

## The task

Write `promql-queries.yaml`: an annotated set of PromQL queries demonstrating instant vectors, selectors, and the rate family, each with a one-line comment explaining what it answers.

Requirements — a `queries:` list, each entry with `name`, `promql`, and `explains` (a one-sentence description):

1. `name: current_request_total` — `promql: 'http_requests_total{job="web-app"}'` — an instant vector selecting only the `web-app` job.
2. `name: five_xx_rate` — `promql: 'http_requests_total{status=~"5.."}'` — selects series with any 5xx status via regex match.
3. `name: request_rate_5m` — `promql: 'rate(http_requests_total[5m])'` — per-second request rate over a 5-minute window.
4. `name: request_increase_5m` — `promql: 'increase(http_requests_total[5m])'` — approximate total requests over the last 5 minutes.
5. `name: request_rate_spike_check` — `promql: 'irate(http_requests_total[1m])'` — instant rate from the last two samples, for investigating a fast-changing spike.
6. `name: request_rate_day_over_day` — `promql: 'rate(http_requests_total[5m]) offset 1d'` — the same rate query as of 24 hours ago, for comparison.

Expected shape:

```yaml
queries:
  - name: current_request_total
    promql: 'http_requests_total{job="web-app"}'
    explains: "Instant vector of the current value of every web-app request-count series."

  - name: five_xx_rate
    promql: 'http_requests_total{status=~"5.."}'
    explains: "Selects only series whose status label matches the 5xx regex."

  - name: request_rate_5m
    promql: 'rate(http_requests_total[5m])'
    explains: "Per-second request rate, averaged over a 5 minute window, with counter-reset correction."

  - name: request_increase_5m
    promql: 'increase(http_requests_total[5m])'
    explains: "Approximate total number of requests in the last 5 minutes."

  - name: request_rate_spike_check
    promql: 'irate(http_requests_total[1m])'
    explains: "Instant rate from only the last two samples — reacts fast but noisy, for ad-hoc investigation only."

  - name: request_rate_day_over_day
    promql: 'rate(http_requests_total[5m]) offset 1d'
    explains: "The same rate query evaluated 24 hours in the past, for day-over-day comparison."
```

Getting the function choice right per row — `rate` for dashboards, `irate` for spike investigation only, `increase` for totals, plus the exact `[5m]`/`[1m]` windows and `offset 1d` syntax — is what this task checks.
