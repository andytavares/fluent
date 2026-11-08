## What you build

You write a Prometheus alerting rules file with two SLO burn-rate alerts. Each alert checks a long and a short window together. This lesson builds on **Recording Rules**.

## Key concepts

### An alerting rule is PromQL plus firing conditions

Prometheus evaluates alerting rules on the same schedule as recording rules. When `expr` is true for a series, the alert is pending. It fires only after `expr` stays true for the full `for` duration. A one-scrape blip pages nobody.

```yaml
groups:
- name: web-app-alerts
  rules:
  - alert: HighErrorRate
    expr: >-
      job:http_request_errors:ratio_rate5m
      > 0.05
    for: 5m
    labels:
      severity: page
    annotations:
      summary: >-
        {{ $labels.job }} error rate is
        {{ $value | humanizePercentage }}
      description: >-
        Error ratio above 5% for 5 minutes.
```

### `for` delays the start, `keep_firing_for` delays the end

- `for` sets how long a condition must hold before the alert fires.
- `keep_firing_for` keeps a firing alert active for a set time after `expr` stops being true. Prometheus 2.42 added it.

`keep_firing_for` absorbs a short dip from a late or missed scrape. Without it, the alert resolves and fires again: it flaps.

### Labels route, annotations describe

Alertmanager groups, routes and inhibits alerts by label equality. Labels must therefore have low, known cardinality: `severity`, `team`, `service`. Annotations are free text for people to read, such as `summary`, `description` and `runbook_url`. Alertmanager never routes on them.

```yaml
labels:
  severity: page
  team: platform
annotations:
  summary: >-
    {{ $labels.job }} error rate is
    {{ $value | humanizePercentage }}
  runbook_url: >-
    https://runbooks.internal/high-errors
```

### Annotations use Go templates

Templates can read `$labels`, the labels of the firing series, and `$value`, the result of the expression. The common functions are `humanizePercentage`, `humanizeDuration` and `printf`. `{{ $value | humanizePercentage }}` turns `0.057` into `5.7%`.

### Page on symptoms, not causes

A symptom alert fires on impact that users see: error rate, latency, availability. A cause alert fires on an internal condition: "disk 90% full", "GC pause > 200ms", "replica lag > 30s". Page on symptoms. Send cause conditions to tickets or dashboards. A disk at 90% that never affects users must not wake anyone at 3am.

The exception is a cause that will certainly become a symptom soon. A disk about to reach 100% and stop the service earns a page.

### Burn-rate alerts use two windows

A single-window alert such as "error ratio > 1% for 5 minutes" fails in two ways. A long window is too slow for a severe outage. A short window pages on brief blips. The Google SRE workbook fixes this with multi-window, multi-burn-rate alerts. A short window clears fast after a fix. A long window resists noise.

The burn rate is how fast the errors use the error budget. A 99.9% SLO allows an error ratio of 0.001 over 30 days. At burn rate 14.4, the 30-day budget is gone in 30 / 14.4 days: about 50 hours.

| Long | Short | Burn | Budget used | Severity |
|---|---|---|---|---|
| 1h | 5m | 14.4 | 2% in 1h | page |
| 6h | 30m | 6 | 5% in 6h | page |
| 1d | 2h | 3 | 10% in 1d | ticket |
| 3d | 6h | 1 | 10% in 3d | ticket |

The expression joins both windows with `and`. A real, sustained problem trips both. A short spike trips only the short window and does not page. An old, elevated rate that shows only in the long window already tripped a slower tier.

```promql
(
  job:http_request_errors:ratio_rate1h
  > (14.4 * 0.001)
)
and
(
  job:http_request_errors:ratio_rate5m
  > (14.4 * 0.001)
)
```

### Alertmanager turns an alert into a page

- **Routing**: a tree of label matchers sends each alert to a receiver. For example, `severity: page` goes to PagerDuty and `severity: ticket` goes to Jira.
- **Grouping**: alerts that fire together and share labels go out as one notification. A service outage that fires `HighErrorRate` on every route sends one page, not one per route.
- **Inhibition**: a firing high-priority alert mutes related low-priority alerts. `ServiceDown` mutes `HighErrorRate` and `HighLatency` for the same service.
- **Silences**: a manual mute with an end time, for alerts that match a label set. Use them for planned maintenance.

Many teams run Alertmanager for label-aware grouping and PagerDuty or Opsgenie for on-call schedules and escalation on top.

## Watch out

- A single-window error-rate alert is a design flaw. It misses fast outages or pages on noise.
- A high-cardinality value in a label breaks grouping. Each alert gets a unique label set and its own notification.
- Put per-alert detail, such as a `route` value, in annotations when you group across routes.
- A short `for` pages on blips. A long `for` delays a real page.
- Set `for` from your scrape interval and how long a real incident lasts.

## The task

Write `stub.yaml`: the alerting rules file `slo-burn-rate-alerts.yaml` for a 99.9% availability SLO. These recording rules exist already: `job:http_request_errors:ratio_rate5m`, `ratio_rate30m`, `ratio_rate1h` and `ratio_rate6h`.

1. Add a `groups:` list with one group named `web-app-slo-alerts`.
2. Add two alerting rules to the group.
3. `ErrorBudgetBurnFast` fires at burn rate 14.4.
4. Its `expr` joins `ratio_rate1h > (14.4 * 0.001)` and `ratio_rate5m > (14.4 * 0.001)` with `and`.
5. Put `and` on a line of its own.
6. Set `for: 2m` and the label `severity: page`.
7. Give it a `summary` annotation with `{{ $labels.job }}` and `{{ $value | humanizePercentage }}`.
8. Give it a `runbook_url` annotation.
9. `ErrorBudgetBurnSlow` fires at burn rate 6.
10. Its `expr` joins `ratio_rate6h > (6 * 0.001)` and `ratio_rate30m > (6 * 0.001)` with `and`.
11. Set `for: 15m` and the label `severity: ticket`.
12. Give it a `summary` annotation with `{{ $labels.job }}` and `{{ $value | humanizePercentage }}`.

This task routes the 6x tier as a ticket. Each alert needs both windows: one window alone brings back the noise or the delay. Do not leave `TODO` comments in the file.

```yaml
groups:
- name: web-app-slo-alerts
  rules:
  - alert: ErrorBudgetBurnFast
    expr: |
      (job:http_request_errors:ratio_rate1h
        > (14.4 * 0.001))
      and
      (job:http_request_errors:ratio_rate5m
        > (14.4 * 0.001))
    for: 2m
    labels:
      severity: page
    annotations:
      summary: >-
        {{ $labels.job }} is burning error
        budget fast
        ({{ $value | humanizePercentage }})
      runbook_url: >-
        https://runbooks.internal/error-budget-burn

  - alert: ErrorBudgetBurnSlow
    expr: |
      (job:http_request_errors:ratio_rate6h
        > (6 * 0.001))
      and
      (job:http_request_errors:ratio_rate30m
        > (6 * 0.001))
    for: 15m
    labels:
      severity: ticket
    annotations:
      summary: >-
        {{ $labels.job }} is burning error
        budget
        ({{ $value | humanizePercentage }})
```
