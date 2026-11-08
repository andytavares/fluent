## What you build

You write `stub.sh`, a script that publishes a custom metric, sets an alarm, writes a log event and turns a log pattern into a metric. CloudWatch holds the metrics and logs for AWS. Every service so far already sends metrics to it: Lambda invocations, DynamoDB throttles and SQS queue depth. This lesson builds on **Lambda Functions** and **SQS**.

## Key concepts

The examples leave out `--endpoint-url http://localhost:4566`. Add it to every call when you use LocalStack.

### A metric lives in a namespace and has dimensions

A metric is a named, timestamped number. Every metric lives in a namespace: a top-level group such as `AWS/Lambda`, `AWS/DynamoDB` or your own. Dimensions are key/value tags, such as `FunctionName=create-order` or `Environment=prod`. They let you query one metric name at different levels of detail.

```bash
aws cloudwatch put-metric-data \
  --namespace "Fluent/Orders" \
  --metric-name OrdersProcessed \
  --value 1 \
  --dimensions \
  Environment=prod,Service=order-processor
```

Each unique set of namespace, metric name and dimensions is its own time series. CloudWatch bills per unique metric. A dimension per customer can create thousands of series by accident, so choose dimensions with care.

### An alarm needs consecutive breaches

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name high-error-rate \
  --namespace "Fluent/Orders" \
  --metric-name OrderErrors \
  --statistic Sum \
  --period 60 \
  --evaluation-periods 3 \
  --threshold 5 \
  --comparison-operator \
  GreaterThanThreshold \
  --treat-missing-data notBreaching
```

- `--period`: the length of one evaluation window, in seconds. Here, each window is 60 seconds.
- `--evaluation-periods`: the number of consecutive periods that must breach before the alarm fires. Here, 3 means three full minutes over the threshold, not one spike. This setting stops a one-off blip from paging someone.
- `--threshold` and `--comparison-operator`: the condition itself. Operators include `GreaterThanThreshold`, `LessThanThreshold` and `GreaterThanOrEqualToThreshold`.

### `--treat-missing-data` decides what "no data" means

Missing data means that no data points arrived in a period. That differs from data below the threshold. The values are `missing`, `notBreaching`, `breaching` and `ignore`. The default is `missing`.

Many engineers misunderstand this setting. With `missing`, an alarm can stay in a state that does not match reality.

- **`notBreaching`** treats missing data as healthy. Use it for most "something bad happened" alarms. An error-count alarm must not fire because no requests came in.
- **`breaching`** treats missing data as a breach. Use it to detect a source that stopped reporting, as a health check does.

### Log groups hold log streams

```bash
GROUP=/fluent/order-processor
MSG="ERROR: payment declined for order 456"
TS=$(date +%s000)

aws logs create-log-group \
  --log-group-name "$GROUP"

aws logs create-log-stream \
  --log-group-name "$GROUP" \
  --log-stream-name "2024-01-15"

aws logs put-log-events \
  --log-group-name "$GROUP" \
  --log-stream-name "2024-01-15" \
  --log-events \
  "timestamp=$TS,message=$MSG"
```

A log group is the top-level container. Lambda creates one per function: `/aws/lambda/<function-name>`. A log stream is one ordered sequence of events inside a group. Lambda creates about one new stream per execution environment.

### A filter pattern matches log content

```bash
aws logs filter-log-events \
  --log-group-name "$GROUP" \
  --filter-pattern "ERROR"
```

A filter pattern matches plain text or structured logs. It supports substrings, JSON fields such as `{ $.level = "ERROR" }`, and boolean combinations. Metric filters use the same pattern language.

### A metric filter turns log lines into a metric

A metric filter counts matching log lines into a CloudWatch metric, or extracts a value from them. You then alarm on that metric like any other.

```bash
aws logs put-metric-filter \
  --log-group-name "$GROUP" \
  --filter-name payment-declined-count \
  --filter-pattern "\"payment declined\"" \
  --metric-transformations \
metricName=PaymentDeclinedCount,\
metricNamespace=Fluent/Orders,\
metricValue=1
```

This is the standard way to alarm on unstructured logs, with no `put-metric-data` call in your code. Match the line, count the matches into a metric and alarm on the metric. It connects an app that only writes logs to a real numeric alarm.

### Dimensions work like Prometheus labels

CloudWatch dimensions and Prometheus labels solve the same problem: time series with many dimensions. Prometheus users learn to fear label cardinality. In CloudWatch, unique dimension sets drive cost and per-metric limits, and the risk is as real.

## Watch out

- A dimension per user ID or request ID creates one billed metric per value. This is easy to do by accident.
- Always set `--treat-missing-data`. Do not rely on the default; state your intent in the alarm.
- A metric filter processes only log events after you create it. It does not count past events.
- Many `--evaluation-periods` can delay a real, sustained alarm. Balance false-alarm control against detection delay.

## The task

Write `stub.sh` to add metrics, an alarm and log processing for the order service. Pass `--endpoint-url "$ENDPOINT_URL"` on every `aws` call.

The script does these steps, in order:

1. Publish the metric `OrdersProcessed` with `--namespace "Fluent/Orders"` and value `1`.
2. Give it the dimensions `Environment=prod,Service=order-processor`.
3. Create the alarm `high-error-rate` on `OrderErrors` in `--namespace "Fluent/Orders"`.
4. Give the alarm `--statistic Sum`, `--period 60`, `--evaluation-periods 3` and `--threshold 5`.
5. Give it `--comparison-operator GreaterThanThreshold` and `--treat-missing-data notBreaching`.
6. Create the log group `/fluent/order-processor`.
7. Create the log stream `2024-01-15` in that group.
8. Write the event `ERROR: payment declined for order 456` to that stream.
9. Create the metric filter `payment-declined-count` on the group, with the pattern `"payment declined"`.
10. The filter writes value `1` to the metric `PaymentDeclinedCount` in namespace `Fluent/Orders`.

The finished script makes these calls:

```bash
aws cloudwatch put-metric-data \
  --namespace "Fluent/Orders" \
  --metric-name OrdersProcessed \
  --value 1 \
  --dimensions \
  Environment=prod,Service=order-processor

aws cloudwatch put-metric-alarm \
  --alarm-name high-error-rate \
  --namespace "Fluent/Orders" \
  --metric-name OrderErrors \
  --statistic Sum \
  --period 60 \
  --evaluation-periods 3 \
  --threshold 5 \
  --comparison-operator \
  GreaterThanThreshold \
  --treat-missing-data notBreaching

GROUP=/fluent/order-processor
MSG="ERROR: payment declined for order 456"

aws logs create-log-group \
  --log-group-name "$GROUP"

aws logs create-log-stream \
  --log-group-name "$GROUP" \
  --log-stream-name "2024-01-15"

aws logs put-log-events \
  --log-group-name "$GROUP" \
  --log-stream-name "2024-01-15" \
  --log-events \
  "timestamp=$(date +%s000),message=$MSG"

aws logs put-metric-filter \
  --log-group-name "$GROUP" \
  --filter-name payment-declined-count \
  --filter-pattern "\"payment declined\"" \
  --metric-transformations \
metricName=PaymentDeclinedCount,\
metricNamespace=Fluent/Orders,\
metricValue=1
```

### Run it for real

```bash
docker run -d --name localstack \
  -p 4566:4566 localstack/localstack
bash stub.sh
aws logs filter-log-events \
  --endpoint-url http://localhost:4566 \
  --filter-pattern "ERROR" \
  --log-group-name /fluent/order-processor
```
