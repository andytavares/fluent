# Lambda Event Sources

## What you'll learn

Lambda functions are invoked *by something* — this concept covers the two fundamentally different invocation models (push vs poll), the specific mechanics of S3 notifications and SQS event-source mappings (including partial-batch failure handling), asynchronous invocation with destinations/DLQs, and why idempotency stops being optional once any of this is in play. Builds on `lambda-functions`.

## Key concepts

### Push vs poll — two different invocation models

- **Push sources** (S3, SNS, API Gateway, EventBridge): the source service calls `Invoke` on your function directly, the moment the event happens. Lambda scales execution environments to match the incoming rate.
- **Poll sources** (SQS, DynamoDB Streams, Kinesis): Lambda itself runs a poller **on your behalf** that continuously reads from the source and batches records into invocations — your function never registers itself as a "consumer" the way it would with a traditional message-queue client library; Lambda's infrastructure does the polling.

Knowing which model a given source uses tells you where the retry/backpressure logic lives: for push sources it's the source service's problem (S3 retries a failed async delivery, per the async-invoke section below); for poll sources it's the **event source mapping's** configuration (batch size, error handling) that controls it.

### S3 event notifications (push)

```bash
aws --endpoint-url http://localhost:4566 lambda add-permission \
  --function-name process-upload \
  --statement-id s3invoke \
  --action lambda:InvokeFunction \
  --principal s3.amazonaws.com \
  --source-arn arn:aws:s3:::fluent-uploads

aws --endpoint-url http://localhost:4566 s3api put-bucket-notification-configuration \
  --bucket fluent-uploads \
  --notification-configuration '{
    "LambdaFunctionConfigurations": [{
      "LambdaFunctionArn": "arn:aws:lambda:us-east-1:000000000000:function:process-upload",
      "Events": ["s3:ObjectCreated:*"]
    }]
  }'
```

`add-permission` grants the S3 service principal permission to invoke your function — this is a **resource-based policy on the Lambda function itself**, separate from the function's execution role (which governs what the function can do once running, not who can start it). Forgetting `add-permission` is the single most common reason "I configured S3 notifications and nothing happens" — the notification configuration is accepted, but S3's invoke attempt is silently denied.

### SQS event source mappings (poll)

```bash
aws --endpoint-url http://localhost:4566 lambda create-event-source-mapping \
  --function-name process-order \
  --event-source-arn arn:aws:sqs:us-east-1:000000000000:orders-queue \
  --batch-size 10 \
  --function-response-types ReportBatchItemFailures
```

- **`--batch-size`**: how many SQS messages Lambda bundles into a single invocation (up to 10,000 for standard queues, fewer for FIFO). Larger batches mean fewer invocations (cheaper, more throughput) but a slower per-invocation failure blast radius.
- **`--function-response-types ReportBatchItemFailures`**: without this, if *any* message in the batch throws, Lambda's default behavior is to retry the **entire batch** — including the messages that succeeded, which then get processed twice. With this flag, your function returns a list of specifically which message IDs failed; only those go back to the queue for redelivery. This is the standard, expected configuration for any production SQS-to-Lambda pipeline — the alternative silently reprocesses successful work.

### Async invoke: destinations and DLQs

```bash
aws --endpoint-url http://localhost:4566 lambda put-function-event-invoke-config \
  --function-name process-upload \
  --maximum-retry-attempts 2 \
  --destination-config '{
    "OnSuccess": {"Destination": "arn:aws:sqs:us-east-1:000000000000:upload-success-queue"},
    "OnFailure": {"Destination": "arn:aws:sqs:us-east-1:000000000000:upload-dlq"}
  }'
```

When Lambda is invoked asynchronously (push sources like S3/SNS, or explicit `--invocation-type Event`), the caller doesn't wait for a result — so failures need somewhere else to go. Lambda automatically retries a failed async invocation (twice, by default), then routes the final outcome to whichever **destination** you configured: `OnSuccess` and `OnFailure` can each be an SQS queue, SNS topic, another Lambda function, or an EventBridge bus. A **dead-letter queue** (the older, SQS/SNS-only mechanism, configured via `--dead-letter-config` instead) is a strict subset of what destinations can do — prefer destinations for new code; DLQs still show up constantly in existing infrastructure.

### Idempotency — no longer optional

Both poll-based redelivery (a message becomes visible again after a failed/timed-out processing attempt — see the SQS concept for exactly why) and async retries mean **your function will be invoked more than once for the same logical event, as a matter of routine operation, not as a rare edge case.** A Lambda function triggered by any of these sources must be safe to run twice with the same input — "process the payment" needs an idempotency key check, not just a try/catch. The standard pattern: before doing the side-effecting work, check (and atomically claim) an idempotency key — often a DynamoDB conditional `put-item` keyed on the message/event ID — so a redelivered event is recognized and skipped rather than reprocessed.

## vs other tools

| | Lambda event sources | A traditional consumer service (e.g., a worker process reading from RabbitMQ) |
|---|---|---|
| Who runs the poller | AWS (for SQS/Kinesis/DynamoDB Streams) — you never write poll loop code | You — the consumer library's poll loop is part of your codebase |
| Scaling the consumer | Automatic, driven by queue depth/backlog | Manual (more worker processes/pods) or an autoscaler watching queue metrics |
| Partial failure handling | `ReportBatchItemFailures` — explicit, per-message | Ack/nack per message, library-dependent |

The philosophical shift: with Lambda, "how many things are reading from this queue right now" is not a question you answer by counting your own processes — it's a property of your function's concurrency configuration and the source's own scaling behavior.

## Watch out

- **A Lambda resource-based policy (`add-permission`) and the function's execution role answer two completely different questions** — "who can invoke this function" vs. "what can this function do." Missing either one produces a different, equally silent failure mode.
- **Without `ReportBatchItemFailures`, one bad message in a batch of 10 causes all 10 to be retried**, including 9 that already succeeded and had side effects — this is the most common cause of duplicate processing in SQS-to-Lambda pipelines, and it's why idempotency and partial-batch-failure reporting are always discussed together.
- **Destinations and DLQs only apply to *async* invocations.** A synchronous `invoke` call that errors returns the error directly to the caller — there's no destination/DLQ routing to fall back on, because the caller was waiting for a direct answer in the first place.
- **Increasing `--batch-size` reduces invocation *count* (and cost) but increases the *blast radius* of a single bad record** if you haven't also implemented `ReportBatchItemFailures` — tune both together, not independently.

## The task

Fill in `stub.sh` so it, in order:

1. Grants S3 permission to invoke `process-upload` via `lambda add-permission`, with `--statement-id s3invoke`, `--action lambda:InvokeFunction`, `--principal s3.amazonaws.com`, and `--source-arn arn:aws:s3:::fluent-uploads`.
2. Configures the `fluent-uploads` bucket to invoke `process-upload` on `s3:ObjectCreated:*` events, via `s3api put-bucket-notification-configuration`.
3. Creates an SQS event source mapping for function `process-order` against `arn:aws:sqs:us-east-1:000000000000:orders-queue`, with `--batch-size 10` and `--function-response-types ReportBatchItemFailures`.
4. Configures async invoke settings for `process-upload` with `--maximum-retry-attempts 2` and a destination config routing `OnSuccess` to `arn:aws:sqs:us-east-1:000000000000:upload-success-queue` and `OnFailure` to `arn:aws:sqs:us-east-1:000000000000:upload-dlq`.
5. Adds a comment `# answer: <one sentence>` explaining why a function behind an SQS event source mapping must be idempotent even if it has correct error handling.

### Run it for real

```bash
docker run -d --name localstack -p 4566:4566 localstack/localstack
# (create process-upload, process-order functions, fluent-uploads bucket, and the queues first)
bash stub.sh   # once filled in
```
