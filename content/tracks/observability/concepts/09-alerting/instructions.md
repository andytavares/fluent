# Alerting

## What you'll learn

This is where metrics stop being dashboards and start paging people. Prometheus alerting rules (`for`, `keep_firing_for`, labels vs annotations, templating), the symptom-vs-cause philosophy that determines what's worth paging on, and the real pattern behind SLO burn-rate alerting — multi-window, multi-burn-rate — which is the industry-standard way to alert on error budgets without either missing fast incidents or drowning in noise from tiny blips. A brief tour of Alertmanager's routing/grouping/inhibition/silences closes out how an alert becomes a page.

## Key concepts

**An alerting rule is a PromQL expression plus firing conditions**, evaluated on the same schedule as recording rules:

```yaml
groups:
  - name: web-app-alerts
    rules:
      - alert: HighErrorRate
        expr: job:http_request_errors:ratio_rate5m > 0.05
        for: 5m
        labels:
          severity: page
        annotations:
          summary: "{{ $labels.job }} error rate is {{ $value | humanizePercentage }}"
          description: "Error ratio has been above 5% for at least 5 minutes."
```

The rule "fires" the instant `expr` becomes true for a series, but doesn't *alert* (transition to `firing` state externally) until it's stayed true continuously for `for` — this is what prevents a one-scrape blip from paging anyone.

**`for` vs `keep_firing_for`** — two different jobs:
- `for` delays the *start* of an alert: how long a condition must hold before it counts as real.
- `keep_firing_for` (added in Prometheus 2.42+) delays the *end*: once firing, keep the alert active for this long even after `expr` stops being true, which absorbs a metric that briefly dips below threshold due to a delayed/missed scrape rather than flapping the alert resolved-then-refired.

**Labels vs annotations — a distinction that determines Alertmanager behavior.** Labels are used for *routing and grouping* (Alertmanager groups/routes/inhibits based on label equality) and must therefore have low, known cardinality — `severity`, `team`, `service`. Annotations are free-form, human-readable text for *display* (`summary`, `description`, often a `runbook_url`) and are never used for routing.

```yaml
labels:
  severity: page
  team: platform
annotations:
  summary: "{{ $labels.job }} error rate is {{ $value | humanizePercentage }}"
  runbook_url: "https://runbooks.internal/high-error-rate"
```

**Templating** — annotations (and label values) use Go templates with access to `$labels` (the firing series' labels) and `$value` (the expression's result). `humanizePercentage`, `humanizeDuration`, and `printf` are the template functions you'll reach for most: `{{ $value | humanizePercentage }}` turns `0.057` into `5.7%` in the alert text a human reads.

**Symptom-based vs cause-based alerting.** Symptom-based alerts fire on user-visible impact — error rate, latency, availability — regardless of root cause. Cause-based alerts fire on a specific internal condition — "disk 90% full," "GC pause > 200ms," "replica lag > 30s." **Page on symptoms, use cause-based conditions as tickets or dashboard context, not pages.** A disk at 90% full that never actually impacts users shouldn't wake anyone up at 3am; error rate actually spiking should. The exception: cause-based conditions that are a *leading indicator with high confidence of imminent symptom impact* (disk about to hit 100% and take the service down) earn a page — the test is "will this definitely become a symptom soon," not "is this a number I'm curious about."

**SLO burn-rate alerting — the real pattern.** A naive alert ("error ratio > 1% for 5 minutes") has two failure modes: it's too slow to catch a severe, fast-burning outage that's still under 1% momentarily, or too noisy on brief blips if you tighten the window. The standard solution (from Google's SRE workbook) is **multi-window, multi-burn-rate alerting**: combine a short window (fast to clear once fixed) and a long window (resistant to noise) with a burn-rate multiplier tied to how fast the condition would exhaust your error budget.

For a 99.9% SLO (0.1% = 0.001 allowed error budget over 30 days), the standard four-tier table:

| Long window | Short window | Burn rate | Budget consumed if sustained | Severity |
|---|---|---|---|---|
| 1h | 5m | 14.4 | 2% in 1h | page |
| 6h | 30m | 6 | 5% in 6h | page |
| 1d | 2h | 3 | 10% in 1d | ticket |
| 3d | 6h | 1 | 10% in 3d | ticket |

A burn rate of 14.4 means "at this rate, you'd exhaust the entire 30-day error budget in 1/14.4 of 30 days (~50 hours)" — high burn rate = fast page, low burn rate = slow ticket. The alert expression ANDs the long and short window so a real, sustained problem trips both, while a short spike that only trips the short window doesn't page (and a long-standing elevated rate that only shows in the long window without a current short-window match also doesn't need urgent paging — it already tripped a slower-tier alert):

```promql
(
  job:http_request_errors:ratio_rate1h  > (14.4 * 0.001)
  and
  job:http_request_errors:ratio_rate5m  > (14.4 * 0.001)
)
```

**Alertmanager: routing, grouping, inhibition, silences** — the layer between "Prometheus decided this alert is firing" and "a human got paged":

- **Routing** — a tree of matchers that sends alerts to the right receiver (PagerDuty, Slack, email) based on labels (`severity: page` → PagerDuty; `severity: ticket` → Jira).
- **Grouping** — bundles multiple simultaneously-firing alerts that share labels (e.g., every route's `HighErrorRate` firing at once because the whole service is down) into a single notification, instead of paging once per alert.
- **Inhibition** — suppresses a lower-priority alert when a related higher-priority alert is already firing (a `ServiceDown` alert inhibits every `HighErrorRate`/`HighLatency` alert for that same service — no point paging about symptoms of an outage you already know about).
- **Silences** — a manually created, time-bounded mute for alerts matching a label set, used during planned maintenance.

## vs other tools

PagerDuty/Opsgenie's own alert-correlation and deduplication features overlap with what Alertmanager's grouping/inhibition do — many teams run both, with Alertmanager doing the metric-aware grouping (which alerts are "the same incident" based on labels) and PagerDuty doing on-call scheduling/escalation on top. Datadog's monitors combine what Prometheus splits into two layers (alerting rule + Alertmanager routing) into one UI-configured object, trading flexibility for simplicity.

## Watch out

- **A single-window error-rate alert is a real design flaw, not a simplification** — it either misses fast severe incidents (long window) or pages on noise (short window). Multi-window multi-burn-rate isn't a nice-to-have refinement, it's the fix for a structurally broken naive alert.
- **Putting high-cardinality values in alert labels** (not annotations) breaks Alertmanager grouping — grouping only works because firing alerts with identical labels bundle into one notification; a label with a unique value per alert (e.g., a `route` value when you meant to group across routes) defeats that.
- **`for` set too short pages on transient blips; set too long, delays a real page.** There's no universal right number — set it relative to your scrape interval and how long a "real" incident actually needs to sustain before it's worth waking someone.

## The task

Write `slo-burn-rate-alerts.yaml`: an alerting rules file implementing two-tier multi-window, multi-burn-rate SLO alerts for a 99.9% availability SLO, assuming the recording rules `job:http_request_errors:ratio_rate5m`, `job:http_request_errors:ratio_rate1h`, `job:http_request_errors:ratio_rate30m`, and `job:http_request_errors:ratio_rate6h` already exist (built the same way as the last lesson's `ratio_rate5m`, just at different windows).

Requirements — a `groups:` list with one group `name: web-app-slo-alerts`, containing two alerting rules:

1. `alert: ErrorBudgetBurnFast` — fires at burn rate 14.4 (page-severity, fast-burning outage):
   - `expr:` `(job:http_request_errors:ratio_rate1h > (14.4 * 0.001)) and (job:http_request_errors:ratio_rate5m > (14.4 * 0.001))`
   - `for: 2m`
   - `labels: severity: page`
   - `annotations: summary` referencing `{{ $labels.job }}` and `{{ $value | humanizePercentage }}`, plus `runbook_url`

2. `alert: ErrorBudgetBurnSlow` — fires at burn rate 6 (ticket-severity, slower burn):
   - `expr:` `(job:http_request_errors:ratio_rate6h > (6 * 0.001)) and (job:http_request_errors:ratio_rate30m > (6 * 0.001))`
   - `for: 15m`
   - `labels: severity: ticket`
   - `annotations: summary` referencing `{{ $labels.job }}` and `{{ $value | humanizePercentage }}`

Expected shape:

```yaml
groups:
  - name: web-app-slo-alerts
    rules:
      - alert: ErrorBudgetBurnFast
        expr: |
          (job:http_request_errors:ratio_rate1h > (14.4 * 0.001))
          and
          (job:http_request_errors:ratio_rate5m > (14.4 * 0.001))
        for: 2m
        labels:
          severity: page
        annotations:
          summary: "{{ $labels.job }} is burning error budget fast ({{ $value | humanizePercentage }})"
          runbook_url: "https://runbooks.internal/error-budget-burn"

      - alert: ErrorBudgetBurnSlow
        expr: |
          (job:http_request_errors:ratio_rate6h > (6 * 0.001))
          and
          (job:http_request_errors:ratio_rate30m > (6 * 0.001))
        for: 15m
        labels:
          severity: ticket
        annotations:
          summary: "{{ $labels.job }} is burning error budget ({{ $value | humanizePercentage }})"
```

The load-bearing detail is the AND of a long and short window at each tier — either window alone reintroduces the noise/latency tradeoff this whole lesson exists to fix.
