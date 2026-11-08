## What you build

You write `stub.sh`, a script that connects Lambda functions to S3 and SQS and routes async results. This lesson builds on **Lambda Functions**.

## Key concepts

The examples leave out `--endpoint-url http://localhost:4566`. Add it to every call when you use LocalStack.

### Sources push events or Lambda polls them

- **Push sources** (S3, SNS, API Gateway, EventBridge) call `Invoke` on your function at the moment the event happens. Lambda scales environments to match the incoming rate.
- **Poll sources** (SQS, DynamoDB Streams, Kinesis) do not call your function. Lambda runs a poller on your behalf. It reads the source and batches records into invocations.

Your function never registers as a consumer, as it would with a message-queue client library. Lambda does the polling.

The model tells you where retry and backpressure logic lives. For a push source, the source service owns it: S3 retries a failed async delivery. For a poll source, the event source mapping owns it, through its batch size and error settings.

### S3 needs permission to invoke the function

```bash
aws lambda add-permission \
  --function-name process-upload \
  --statement-id s3invoke \
  --action lambda:InvokeFunction \
  --principal s3.amazonaws.com \
  --source-arn arn:aws:s3:::fluent-uploads
```

Then `s3api put-bucket-notification-configuration` tells the bucket to call the function on `s3:ObjectCreated:*` events.

`add-permission` adds a resource-based policy to the function itself. It controls who can invoke the function. The execution role is separate: it controls what the running function can do.

A missing `add-permission` is the most common reason that S3 notifications do nothing. S3 accepts the notification configuration, then AWS denies its invoke attempt without an error.

### An event source mapping polls SQS

```bash
aws lambda create-event-source-mapping \
  --function-name process-order \
  --event-source-arn "$QUEUE_ARN" \
  --batch-size 10 \
  --function-response-types \
  ReportBatchItemFailures
```

- `--batch-size`: the number of SQS messages in one invocation. The maximum is 10,000 for standard queues and less for FIFO queues. Larger batches mean fewer invocations, lower cost and more throughput. One failure then affects more messages.
- `--function-response-types ReportBatchItemFailures`: your function returns the IDs of the messages that failed. Only those messages go back to the queue.

Without `ReportBatchItemFailures`, one failed message makes Lambda retry the whole batch. The messages that succeeded run twice. Every production SQS-to-Lambda pipeline needs this setting.

### Async invocations retry, then go to a destination

```bash
aws lambda \
  put-function-event-invoke-config \
  --function-name process-upload \
  --maximum-retry-attempts 2 \
  --destination-config file://dest.json
```

`dest.json` names one target for each outcome:

```json
{
  "OnSuccess": {"Destination": "<arn>"},
  "OnFailure": {"Destination": "<arn>"}
}
```

An async invocation comes from a push source such as S3 or SNS, or from `--invocation-type Event`. The caller does not wait, so failures need another place to go. Lambda retries a failed async invocation twice by default. Then it sends the final result to the destination for that outcome.

A destination can be an SQS queue, an SNS topic, another Lambda function or an EventBridge bus. A dead-letter queue (`--dead-letter-config`) is the older mechanism and supports only SQS and SNS. It does a subset of what destinations do. Use destinations for new code, but expect DLQs in existing infrastructure.

### Your function runs more than once for one event

Poll sources redeliver a message after a failed or timed-out attempt. The **SQS** concept explains why. Async invocations retry. So your function runs more than once for the same event as a normal part of operation, not as a rare edge case.

A function behind any of these sources must be safe to run twice with the same input. A payment function needs an idempotency key check, not only a try/catch. Before the side effect, check and atomically claim an idempotency key. A DynamoDB conditional `put-item` keyed on the message ID or event ID is the usual choice. Your function then skips a redelivered event.

### AWS runs the poller and scales the consumer

With a traditional consumer, such as a worker that reads from RabbitMQ, you write the poll loop and scale the workers. With Lambda, AWS runs the poller for SQS, Kinesis and DynamoDB Streams. Queue depth drives the scaling. The number of active readers is a property of your concurrency settings and the source, not a count of your own processes. `ReportBatchItemFailures` replaces per-message ack and nack.

## Watch out

- The resource-based policy and the execution role answer different questions. A missing one gives a different silent failure.
- Without `ReportBatchItemFailures`, one bad message in a batch of 10 retries all 10. Nine successes repeat their side effects.
- Destinations and DLQs apply only to async invocations. A failed synchronous `invoke` returns the error to the caller.
- A larger `--batch-size` lowers invocation count and cost. Without `ReportBatchItemFailures`, one bad record then affects more messages. Tune both together.

## The task

Write `stub.sh` to connect two functions to their event sources. Pass `--endpoint-url "$ENDPOINT_URL"` on every `aws` call.

The script does these steps, in order:

1. Run `lambda add-permission` on `process-upload` with `--statement-id s3invoke` and `--action lambda:InvokeFunction`.
2. Give it `--principal s3.amazonaws.com` and `--source-arn arn:aws:s3:::fluent-uploads`.
3. Run `s3api put-bucket-notification-configuration` on `fluent-uploads`. It invokes `process-upload` on `s3:ObjectCreated:*` events.
4. Run `lambda create-event-source-mapping` for `process-order` on the `orders-queue` ARN below.
5. Give the mapping `--batch-size 10` and `--function-response-types ReportBatchItemFailures`.
6. Run `lambda put-function-event-invoke-config` on `process-upload` with `--maximum-retry-attempts 2`.
7. In its `--destination-config`, send `OnSuccess` to `upload-success-queue` and `OnFailure` to `upload-dlq`.
8. Add a comment that starts with `# answer:`. In one sentence, say why a function behind an SQS mapping must be idempotent, even with correct error handling.

The answer must contain "idempot", "twice" or "redeliver". The queue ARNs are:

- `arn:aws:sqs:us-east-1:000000000000:orders-queue`
- `arn:aws:sqs:us-east-1:000000000000:upload-success-queue`
- `arn:aws:sqs:us-east-1:000000000000:upload-dlq`

The function ARN is `arn:aws:lambda:us-east-1:000000000000:function:process-upload`.

The finished script makes these calls:

```bash
aws lambda add-permission \
  --function-name process-upload \
  --statement-id s3invoke \
  --action lambda:InvokeFunction \
  --principal s3.amazonaws.com \
  --source-arn arn:aws:s3:::fluent-uploads

aws s3api \
  put-bucket-notification-configuration \
  --bucket fluent-uploads \
  --notification-configuration '{
  "LambdaFunctionConfigurations": [{
    "LambdaFunctionArn": "<function ARN>",
    "Events": ["s3:ObjectCreated:*"]
  }]}'

aws lambda create-event-source-mapping \
  --function-name process-order \
  --event-source-arn "<orders-queue ARN>" \
  --batch-size 10 \
  --function-response-types \
  ReportBatchItemFailures

aws lambda \
  put-function-event-invoke-config \
  --function-name process-upload \
  --maximum-retry-attempts 2 \
  --destination-config '{
  "OnSuccess": {"Destination":
    "<upload-success-queue ARN>"},
  "OnFailure": {"Destination":
    "<upload-dlq ARN>"}}'

# answer: SQS can redeliver a message,
# so the function can run twice for it.
```

Replace each `<... ARN>` with the full ARN from the list above.

### Run it for real

Create the `process-upload` and `process-order` functions, the `fluent-uploads` bucket and the queues first.

```bash
docker run -d --name localstack \
  -p 4566:4566 localstack/localstack
bash stub.sh
```
