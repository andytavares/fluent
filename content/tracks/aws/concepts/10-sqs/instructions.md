# SQS

## What you'll learn

SQS is a managed message queue, and its entire failure-handling model hinges on one mechanism: visibility timeout. This concept teaches that mechanism through a concrete failure walkthrough, standard vs FIFO queue semantics, long polling, and dead-letter queues — the foundation the next two concepts (SNS/EventBridge fan-out, and Lambda's SQS event source mapping) build directly on.

## Key concepts

### Standard vs FIFO — precisely

| | Standard | FIFO (`.fifo` name suffix) |
|---|---|---|
| Ordering | Best-effort, not guaranteed | Strict, per message group |
| Delivery | At-least-once (duplicates possible) | Exactly-once processing (dedup within a 5-minute window) |
| Throughput | Nearly unlimited | 300 msg/s per API call without batching, 3,000/s with batching (or effectively unlimited with high-throughput mode) |
| Requires | Nothing special | `MessageGroupId` on every message; `MessageDeduplicationId` (or content-based dedup) |

```bash
aws --endpoint-url http://localhost:4566 sqs create-queue --queue-name orders-queue

aws --endpoint-url http://localhost:4566 sqs create-queue \
  --queue-name orders-queue.fifo \
  --attributes FifoQueue=true,ContentBasedDeduplication=true
```

Default to standard queues. Reach for FIFO only when strict ordering *and* exactly-once delivery are actual application requirements (e.g., "these three events for this one entity must be processed in the order they happened") — FIFO's throughput ceiling and mandatory group/dedup IDs are real constraints, not free upgrades.

### Visibility timeout — the core concept, via a failure walkthrough

When a consumer calls `ReceiveMessage`, SQS does **not** delete the message — it makes the message **invisible** to other consumers for a configurable window (the visibility timeout, default 30s), on the assumption that the consumer that just received it is about to process and delete it.

Walk through what happens when processing fails:

1. Consumer A calls `receive-message`. Message becomes invisible for 30 seconds.
2. Consumer A starts processing — say, calling a downstream API that's currently slow.
3. 30 seconds pass. Consumer A is *still* processing (it didn't finish, and didn't extend the timeout).
4. The message becomes visible again, **automatically**, with no error, no notification to consumer A. SQS doesn't know or care that A is still working on it.
5. Consumer B calls `receive-message` and gets the **same message** — now two consumers are processing the same logical work simultaneously.
6. If A eventually finishes and calls `delete-message`, the message is gone — but B is (or already has) processed it too.

This is why redelivery under normal operation (not just outright consumer failure) is a routine occurrence for any consumer whose processing time can approach the visibility timeout — see `lambda-event-sources` for why this makes idempotency mandatory, not optional, for any real consumer.

```bash
# Extend the timeout for a specific in-flight message once you know a job will run long
aws --endpoint-url http://localhost:4566 sqs change-message-visibility \
  --queue-url http://localhost:4566/000000000000/orders-queue \
  --receipt-handle "$RECEIPT_HANDLE" \
  --visibility-timeout 120
```

The fix for step 3–4 above, when you can predict a long-running job, is calling `change-message-visibility` partway through processing to buy more time before the default window expires — a "heartbeat" pattern.

### Long polling

```bash
aws --endpoint-url http://localhost:4566 sqs receive-message \
  --queue-url http://localhost:4566/000000000000/orders-queue \
  --wait-time-seconds 20 \
  --max-number-of-messages 10
```

Without `--wait-time-seconds` (or a queue-level `ReceiveMessageWaitTimeSeconds` attribute), `receive-message` returns **immediately**, even if the queue is empty — you get an empty response and have to poll again right away (short polling), burning API calls and money for no benefit. `--wait-time-seconds` (up to 20) makes the call **block** on the server side until a message arrives or the wait expires, whichever comes first. Always use long polling for any consumer that isn't Lambda's own event-source-mapping poller (which handles this internally) — it's strictly better: fewer empty responses, lower cost, no downside.

### Dead-letter queues and `maxReceiveCount`

A DLQ is an ordinary queue designated to receive messages that have failed processing too many times — the mechanism that stops a permanently-broken message ("poison pill") from being redelivered forever:

```bash
aws --endpoint-url http://localhost:4566 sqs create-queue --queue-name orders-dlq

aws --endpoint-url http://localhost:4566 sqs set-queue-attributes \
  --queue-url http://localhost:4566/000000000000/orders-queue \
  --attributes '{
    "RedrivePolicy": "{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:000000000000:orders-dlq\",\"maxReceiveCount\":\"5\"}"
  }'
```

`maxReceiveCount` is the number of times a message may be received (not necessarily *fail* — SQS only tracks receive count, not why a consumer didn't delete it) before it's automatically moved to the DLQ instead of back to the source queue. Set this deliberately: too low, and transient slowness dead-letters healthy messages; too high, and a genuinely broken message clogs the source queue's throughput for a long time before finally being pulled aside.

### Deduplication and group IDs on FIFO

```bash
aws --endpoint-url http://localhost:4566 sqs send-message \
  --queue-url http://localhost:4566/000000000000/orders-queue.fifo \
  --message-body '{"orderId": "456"}' \
  --message-group-id "customer-123" \
  --message-deduplication-id "order-456-v1"
```

- **`MessageGroupId`**: messages within the same group are strictly ordered and processed one-at-a-time (per group) — different groups *can* be processed in parallel, so a well-chosen group ID (e.g., per-customer) is how you get both strict per-entity ordering and overall parallelism.
- **`MessageDeduplicationId`**: if a message with the same dedup ID is sent again within the 5-minute deduplication window, SQS silently discards the duplicate rather than enqueuing it a second time. If you don't supply one, `ContentBasedDeduplication=true` derives it as a SHA-256 hash of the body instead.

## vs other tools

| | SQS | RabbitMQ | Kafka |
|---|---|---|---|
| Consumption model | Pull (poll or Lambda's managed poller) | Push (broker delivers) or pull | Pull, consumer tracks its own offset |
| "Redelivery" mechanism | Visibility timeout expiry | Unacked message requeue | Consumer group offset not committed |
| Ordering | Best-effort (standard) or per-group (FIFO) | Per-queue, configurable | Strict per-partition |
| Message retention after consume | Deleted on ack | Deleted on ack | Retained per topic retention policy regardless of consumption |

SQS's visibility timeout and RabbitMQ's unacked-message requeue solve the identical problem the identical way conceptually — if you've operated RabbitMQ, the "why did I get this message again" mental model transfers directly, just with different API names (`ack`/`nack` vs. deleting or letting the timeout expire).

## Watch out

- **A visibility timeout that's shorter than your actual processing time guarantees duplicate delivery under normal (non-error) operation** — this isn't a bug, it's exactly how the mechanism is specified to work. Size the timeout to your p99 processing time, or use `change-message-visibility` heartbeats for variable-length jobs.
- **Deleting a message requires the receipt handle from the *most recent* `receive-message` call, not the message ID.** The receipt handle changes every time the message is received again — an old, stale receipt handle's `delete-message` call silently fails to delete (or deletes nothing meaningful) if the message has since been redelivered.
- **`maxReceiveCount` counts receives, not failures** — a message that's received, and the consumer crashes before calling `delete-message` (for any reason, including a deploy interrupting it), still counts toward the DLQ threshold even though "the code never even ran."
- **FIFO's `MessageGroupId` is what limits your throughput**, not the queue itself — a single group ID for all messages serializes every single message account-wide; spread load across meaningfully distinct group IDs (e.g., per customer or per shard) to get real parallelism.

## The task

Fill in `stub.sh` so it, in order:

1. Creates a standard queue named `orders-queue`.
2. Creates a FIFO queue named `orders-queue.fifo` with `FifoQueue=true` and `ContentBasedDeduplication=true`.
3. Creates a DLQ named `orders-dlq`.
4. Sets a redrive policy on `orders-queue` pointing at the `orders-dlq` ARN with `maxReceiveCount` of `5`.
5. Sends a message to `orders-queue.fifo` with body `{"orderId": "456"}`, `--message-group-id customer-123`, and `--message-deduplication-id order-456-v1`.
6. Receives a message from `orders-queue` using long polling (`--wait-time-seconds 20`).
7. Adds a comment `# answer: <one sentence>` explaining, in terms of visibility timeout, why a second consumer can receive the exact same message that a first, still-working consumer already has.

### Run it for real

```bash
docker run -d --name localstack -p 4566:4566 localstack/localstack
bash stub.sh   # once filled in
```
