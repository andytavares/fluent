# CloudWatch

## What you'll learn

CloudWatch is AWS's metrics and logs backbone — every service you've used so far (Lambda invocations/errors/duration, DynamoDB throttles, SQS queue depth) already emits metrics into it automatically. This concept covers custom metrics, alarms (and the semantics that trip people up — evaluation periods and missing-data behavior), Logs, and turning a log pattern into an alarm.

## Key concepts

### Metrics, namespaces, dimensions

A metric is a named, timestamped numeric data point. Every metric lives in a **namespace** (a top-level grouping — `AWS/Lambda`, `AWS/DynamoDB`, or your own custom namespace) and is further sliced by **dimensions** (key/value tags — `FunctionName=create-order`, `Environment=prod`) that let you query the same metric name at different granularities.

```bash
aws --endpoint-url http://localhost:4566 cloudwatch put-metric-data \
  --namespace "Fluent/Orders" \
  --metric-name OrdersProcessed \
  --value 1 \
  --dimensions Environment=prod,Service=order-processor
```

Each unique combination of namespace + metric name + dimension set is effectively its own time series. Emitting the same metric name with different dimension sets (e.g., per-customer) is a common way to accidentally create thousands of unique time series — CloudWatch bills per unique metric, so keep dimension cardinality intentional.

### Alarms — threshold, evaluation periods, missing-data semantics

```bash
aws --endpoint-url http://localhost:4566 cloudwatch put-metric-alarm \
  --alarm-name high-error-rate \
  --namespace "Fluent/Orders" \
  --metric-name OrderErrors \
  --statistic Sum \
  --period 60 \
  --evaluation-periods 3 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --treat-missing-data notBreaching
```

- **`--period`**: the length of one evaluation window in seconds (here, 60s buckets).
- **`--evaluation-periods`**: how many *consecutive* periods must breach the threshold before the alarm actually fires — `3` here means 3 straight minutes over threshold, not a single spike. This is the standard defense against a one-off blip triggering a page.
- **`--threshold` / `--comparison-operator`**: `GreaterThanThreshold`, `LessThanThreshold`, `GreaterThanOrEqualToThreshold`, etc. — the actual condition.
- **`--treat-missing-data`**: what to do when no data points arrived during a period at all (as opposed to data arriving but being below threshold) — `missing`, `notBreaching`, `breaching`, or `ignore`. This is the single most misunderstood alarm setting: the default historically has surprised people by treating "no data" as `missing` (which, combined with certain evaluation logic, can leave an alarm stuck in a state that doesn't reflect current reality). For most "did something bad happen" alarms, `notBreaching` (treat missing data as fine) is the sane choice — an alarm on error count shouldn't fire just because *no requests came in at all*. For an alarm that specifically needs to detect "this thing stopped reporting entirely" (a health-check style alarm), `breaching` is what you actually want.

### CloudWatch Logs: groups, streams, filter patterns

```bash
aws --endpoint-url http://localhost:4566 logs create-log-group --log-group-name /fluent/order-processor

aws --endpoint-url http://localhost:4566 logs create-log-stream \
  --log-group-name /fluent/order-processor --log-stream-name "2024-01-15"

aws --endpoint-url http://localhost:4566 logs put-log-events \
  --log-group-name /fluent/order-processor \
  --log-stream-name "2024-01-15" \
  --log-events timestamp=$(date +%s000),message="ERROR: payment declined for order 456"
```

A **log group** is the top-level container (Lambda auto-creates one per function: `/aws/lambda/<function-name>`); a **log stream** within it is one sequence of ordered events (Lambda creates a new stream roughly per execution environment). A **filter pattern** is CloudWatch's syntax for matching structured or plain-text log content:

```bash
aws --endpoint-url http://localhost:4566 logs filter-log-events \
  --log-group-name /fluent/order-processor \
  --filter-pattern "ERROR"
```

Filter patterns support plain substring matches, JSON field matching (`{ $.level = "ERROR" }` for structured JSON logs), and boolean combinations — this is the same pattern language used for the metric filters below.

### Metric filters → alarms

A **metric filter** turns a log filter pattern into a numeric CloudWatch metric — every matching log line increments (or extracts a value into) a metric, which you can then alarm on exactly like any other metric:

```bash
aws --endpoint-url http://localhost:4566 logs put-metric-filter \
  --log-group-name /fluent/order-processor \
  --filter-name payment-declined-count \
  --filter-pattern "\"payment declined\"" \
  --metric-transformations \
    metricName=PaymentDeclinedCount,metricNamespace="Fluent/Orders",metricValue=1
```

This is the standard way to alarm on unstructured application logs without changing your application code to `put-metric-data` directly: match the log line pattern, count matches into a metric, alarm on the metric. It's the bridge between "my app just logs to stdout/CloudWatch Logs" and "I have a real numeric alarm."

## vs other tools

| | CloudWatch | Prometheus + Alertmanager | Datadog |
|---|---|---|---|
| Metric model | Namespace + name + dimensions | Metric name + labels | Metric name + tags |
| Collection | Push (`put-metric-data`) or automatic per-service | Pull (scrape) | Agent push |
| Log-derived metrics | Metric filters on Logs | `mtail`/log-exporter patterns, or structured logging + a scraper | Log-based metrics, similar concept |
| Missing-data alarm semantics | Explicit `--treat-missing-data` setting per alarm | Absence handled via `absent()` in alert rules, opt-in | Configurable per monitor |

CloudWatch's dimension model and Prometheus's label model solve the same problem (multi-dimensional time series) with different cardinality-management cultures — Prometheus users are trained to fear label cardinality explosions; the CloudWatch equivalent (unique dimension combinations driving cost and per-metric limits) is less discussed but just as real.

## Watch out

- **High-cardinality dimensions (e.g., a dimension per user ID or per request ID) create one billed metric per unique combination** — this is the CloudWatch version of a Prometheus cardinality explosion, and it's easy to do by accident with a well-meaning "let's tag everything."
- **`--treat-missing-data`'s default behavior has changed across AWS's own documentation revisions and is easy to get wrong by omission** — always set it explicitly rather than relying on whatever the current default happens to be; state your intent in the alarm definition.
- **A metric filter only processes log events *after* it's created** — it does not retroactively scan existing log history, so creating the filter is not the same as "count how many times this already happened."
- **`--evaluation-periods` with a low `--period` can make an alarm feel unresponsive to a real, sustained problem** if the periods required span longer than an on-call engineer expects — balance false-positive suppression against acceptable detection latency deliberately, don't just leave defaults.

## The task

Fill in `stub.sh` so it, in order:

1. Publishes a custom metric `OrdersProcessed` in namespace `Fluent/Orders` with value `1` and dimensions `Environment=prod,Service=order-processor`.
2. Creates a metric alarm named `high-error-rate` on metric `OrderErrors` in namespace `Fluent/Orders`, with `--statistic Sum`, `--period 60`, `--evaluation-periods 3`, `--threshold 5`, `--comparison-operator GreaterThanThreshold`, and `--treat-missing-data notBreaching`.
3. Creates a log group `/fluent/order-processor`.
4. Creates a log stream named `2024-01-15` within that group.
5. Writes a log event with message `ERROR: payment declined for order 456` to that stream.
6. Creates a metric filter named `payment-declined-count` on that log group, matching the pattern `"payment declined"`, transforming into metric `PaymentDeclinedCount` in namespace `Fluent/Orders` with metric value `1`.

### Run it for real

```bash
docker run -d --name localstack -p 4566:4566 localstack/localstack
bash stub.sh   # once filled in
aws --endpoint-url http://localhost:4566 logs filter-log-events \
  --log-group-name /fluent/order-processor --filter-pattern "ERROR"
```
