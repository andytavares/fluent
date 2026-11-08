## What you build

You write six annotated PromQL queries: selectors, `rate()`, `increase()`, `irate()` and `offset`. This lesson builds on **Metric Types**.

## Key concepts

### PromQL has two core data types

Every dashboard panel, alert and recording rule in this track uses PromQL. An **instant vector** holds one sample per matching series, at one point in time. A bare metric name is an instant vector query.

```promql
http_requests_total
```

It returns the most recent value of every `http_requests_total` series, inside the staleness limit. Each series keeps its labels.

### A range vector holds a window of samples

A range vector holds the samples of each series over a trailing time window. Write the window as `[duration]`.

```promql
http_requests_total[5m]
```

You cannot graph a range vector directly, because it holds many raw samples per series. Pass it to a range function such as `rate`, `increase` or `avg_over_time`. The function reduces it to an instant vector with one number per series, which you can graph.

### Matchers select series

```promql
# Exact match
http_requests_total{job="web-app"}
# Regex match (=~)
http_requests_total{status=~"5.."}
# Negated regex (!~)
http_requests_total{status!~"2..|3.."}
# Negated exact match (!=), AND job
http_requests_total{job="web-app",
  method!="GET"}
```

PromQL combines the matchers inside `{}` with AND. One selector has no OR across different label names. For that, put `or` between two full vector expressions. The aggregations concept covers it.

### `rate()` is the function for counters

`rate()` computes the per-second average rate of increase over the window. It detects and corrects counter resets, such as a restart that sets the counter to zero.

```promql
rate(http_requests_total[5m])
```

The result is not "requests in the last 5 minutes". It is the per-second rate, averaged over 5 minutes. For a total, multiply by the window. `increase()` does that for you.

### PromQL adds back the value lost in a reset

PromQL treats a decrease between two samples as a reset to zero, followed by more counting. It adds the lost value back. In SQL, you write this yourself with `LAG()` and a `CASE` expression.

### `increase()` gives the total over the window

`increase()` is `rate()` multiplied by the window in seconds, with the same reset correction.

```promql
# About the total requests in 5 minutes
increase(http_requests_total[5m])
```

The result is approximate. `increase()` extrapolates a little at the edges of the range when the samples do not fall exactly on them.

### `irate()` uses only the last two samples

`irate()` computes an instant rate from the last two samples in the range. It does not average across the window.

```promql
irate(http_requests_total[1m])
```

`irate()` reacts fast to spikes, but it is noisy. One late scrape can swing the value a lot. Use `rate()` for dashboards and alerts. Use `irate()` only to investigate a fast-changing counter, when you want to see a spike.

### The window must be 4 times the scrape interval or more

`rate()` needs two or more samples inside the window. With a 15s scrape interval, a `[15s]` window often holds only one sample. It then returns nothing, or `NaN`. `[1m]` is the practical minimum at a 15s interval. `[5m]` is the usual dashboard default: less responsive, but a smoother line.

### `offset` shifts the evaluation time

Use `offset` for week-over-week or day-over-day comparisons.

```promql
# The same query, 24 hours ago
rate(http_requests_total[5m]) offset 1d
```

### Apply `rate()` first, then aggregate

Apply `rate()` to the raw counter, never to a series you already summed or averaged. Its reset detection needs the history of each raw series. `sum(rate(x[5m]))` is correct.

`rate(sum(x)[5m])` is wrong. The sum can hide the reset of one series. It also mixes the resets of many series into one series that no longer only goes up. The next concept uses this rule all the time.

## Watch out

- Do not graph a bare counter. The line only goes up and shows little. Wrap it in `rate()` or `increase()`.
- `irate()` on a dashboard gives a spiky graph. One slow scrape makes it drop to zero or jump, so do not alert on it.
- A window below about 4 times the scrape interval returns no data at times. Graphs get gaps, and rules never fire.
- When the scrape interval changes, check your window sizes again.

## The task

Write `stub.yaml`, also named `promql-queries.yaml`. It holds six PromQL queries, each with a one-line explanation.

1. Add a `queries:` list. Each entry has `name`, `promql` and `explains`.
2. `explains` is one sentence that says what the query answers.
3. `current_request_total`: an instant vector for job `web-app` only.
4. `five_xx_rate`: series with any 5xx status, from the regex `status=~"5.."`.
5. `request_rate_5m`: `rate()` over a 5-minute window.
6. `request_increase_5m`: `increase()` over a 5-minute window, an approximate total.
7. `request_rate_spike_check`: `irate()` over `[1m]`, to investigate a spike.
8. `request_rate_day_over_day`: the 5-minute rate with `offset 1d`.
9. Remove every `TODO` comment.

```yaml
queries:
  - name: current_request_total
    promql: 'http_requests_total{job="web-app"}'
    explains: >-
      Current value of each web-app
      request-count series.

  - name: five_xx_rate
    promql: 'http_requests_total{status=~"5.."}'
    explains: >-
      Only series whose status label
      matches the 5xx regex.

  - name: request_rate_5m
    promql: 'rate(http_requests_total[5m])'
    explains: >-
      Per-second request rate over 5
      minutes, with reset correction.

  - name: request_increase_5m
    promql: 'increase(http_requests_total[5m])'
    explains: >-
      About the total requests in the
      last 5 minutes.

  - name: request_rate_spike_check
    promql: 'irate(http_requests_total[1m])'
    explains: >-
      Rate from the last two samples.
      Fast but noisy: for ad-hoc checks.

  - name: request_rate_day_over_day
    promql: 'rate(http_requests_total[5m]) offset 1d'
    explains: >-
      The same rate, 24 hours earlier,
      for a day-over-day comparison.
```
