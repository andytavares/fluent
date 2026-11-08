## What you build

You write `stub.sh`, a script that creates standard, FIFO and dead-letter queues, sends a message and receives one with long polling. SQS failure handling rests on one mechanism: the visibility timeout. This lesson builds on **Lambda Event Sources**.

## Key concepts

The examples leave out `--endpoint-url http://localhost:4566`. They use `$QUEUES` for `http://localhost:4566/000000000000`, the queue URL prefix in LocalStack.

### Standard queues scale, FIFO queues keep order

| | Standard | FIFO |
|---|---|---|
| Order | Best effort | Strict, per message group |
| Delivery | At least once | Exactly once, 5-minute dedup window |
| Throughput | Nearly unlimited | 300 msg/s, 3,000 with batching |
| Needs | Nothing | `MessageGroupId`, dedup ID |

High-throughput mode raises the FIFO limit far above 3,000. A FIFO queue name ends in `.fifo`. Every FIFO message needs a `MessageGroupId`. It also needs a `MessageDeduplicationId`, unless the queue uses content-based deduplication.

```bash
aws sqs create-queue \
  --queue-name orders-queue

aws sqs create-queue \
  --queue-name orders-queue.fifo \
  --attributes FifoQueue=true,\
ContentBasedDeduplication=true
```

Use standard queues by default. Use FIFO only when the application needs strict order and exactly-once delivery. An example: three events for one entity must run in the order they happened. The FIFO throughput limit and the required IDs are real costs.

### A received message becomes invisible, not deleted

`ReceiveMessage` does not delete the message. SQS hides it from other consumers for the visibility timeout, 30 seconds by default. SQS assumes the consumer processes the message and deletes it in that time.

Here is what happens when processing runs long:

1. Consumer A calls `receive-message`. The message is invisible for 30 seconds.
2. Consumer A calls a downstream API that is slow.
3. 30 seconds pass. Consumer A is still working. It did not extend the timeout.
4. The message becomes visible again. SQS sends no error and does not tell consumer A.
5. Consumer B calls `receive-message` and gets the same message. Two consumers now do the same work.
6. Consumer A finishes and calls `delete-message`. The message is gone, but consumer B processes it too.

So redelivery is routine for any consumer whose processing time can reach the visibility timeout. It does not need a crash. **Lambda Event Sources** explains why this makes idempotency mandatory.

### Extend the timeout for a long job

```bash
aws sqs change-message-visibility \
  --queue-url "$QUEUES/orders-queue" \
  --receipt-handle "$RECEIPT_HANDLE" \
  --visibility-timeout 120
```

When you know that a job runs long, call `change-message-visibility` during processing. It buys more time before the window expires. This is the heartbeat pattern, and it fixes steps 3 and 4 above.

### Long polling waits for a message

```bash
aws sqs receive-message \
  --queue-url "$QUEUES/orders-queue" \
  --wait-time-seconds 20 \
  --max-number-of-messages 10
```

Without `--wait-time-seconds`, `receive-message` returns at once, even from an empty queue. This is short polling. You poll again at once and pay for empty responses.

`--wait-time-seconds` (20 at most) makes the server wait until a message arrives or the time runs out. The queue attribute `ReceiveMessageWaitTimeSeconds` does the same. Always use long polling. It gives fewer empty responses and lower cost, with no downside. The Lambda event source mapping poller does this for you.

### A dead-letter queue catches poison messages

A dead-letter queue (DLQ) is an ordinary queue that receives messages after too many failed attempts. It stops a broken message, a "poison pill", from coming back forever.

```bash
aws sqs create-queue \
  --queue-name orders-dlq

aws sqs set-queue-attributes \
  --queue-url "$QUEUES/orders-queue" \
  --attributes file://redrive.json
```

`redrive.json` holds a `RedrivePolicy` with `deadLetterTargetArn` and `maxReceiveCount`. The policy value is a JSON string inside JSON, so its quotes need escapes. The task shows the full value.

`maxReceiveCount` is the number of receives before SQS moves the message to the DLQ. SQS counts receives, not failures. It does not know why a consumer did not delete a message. Choose the value with care. Too low, and slow periods send healthy messages to the DLQ. Too high, and a broken message blocks the source queue for a long time.

### FIFO group IDs set order, dedup IDs drop duplicates

```bash
aws sqs send-message \
  --queue-url "$QUEUES/orders-queue.fifo" \
  --message-body '{"orderId": "456"}' \
  --message-group-id customer-123 \
  --message-deduplication-id order-456-v1
```

- **`MessageGroupId`**: SQS delivers the messages in one group in strict order, one at a time. Different groups run in parallel. A group ID per customer gives strict order per entity and parallelism overall.
- **`MessageDeduplicationId`**: SQS discards a message with the same ID sent again within 5 minutes. With `ContentBasedDeduplication=true`, SQS uses a SHA-256 hash of the body when you give no ID.

### The visibility timeout matches a RabbitMQ requeue

RabbitMQ requeues an unacked message, and SQS makes it visible again: the same idea with different API names. Kafka is different: the consumer tracks its own offset, and the topic keeps records after consumption. SQS deletes a message only when the consumer deletes it.

## Watch out

- A visibility timeout shorter than processing time causes duplicates in normal operation. Size it to your p99 processing time.
- For jobs of variable length, use `change-message-visibility` heartbeats.
- `delete-message` needs the receipt handle from the latest receive, not the message ID.
- Each receive gives a new receipt handle. After a redelivery, a delete with the old handle does not remove the message.
- `maxReceiveCount` counts receives. A consumer that crashes before `delete-message`, even during a deploy, still adds to the count.
- `MessageGroupId` limits FIFO throughput. One group ID for all messages runs them one at a time.
- Spread FIFO load over distinct group IDs, for example per customer or per shard.

## The task

Write `stub.sh` to build an order queue with a DLQ and a FIFO twin. Pass `--endpoint-url "$ENDPOINT_URL"` on every `aws` call.

The script does these steps, in order:

1. Create a standard queue. The line ends with `--queue-name orders-queue`.
2. Create `orders-queue.fifo` with `FifoQueue=true` and `ContentBasedDeduplication=true`.
3. Create a DLQ named `orders-dlq`.
4. Set a `RedrivePolicy` on `orders-queue`. It points at the `orders-dlq` ARN with `maxReceiveCount` 5.
5. Send `{"orderId": "456"}` to `orders-queue.fifo` with `--message-group-id customer-123`.
6. Give that message `--message-deduplication-id order-456-v1`.
7. Receive a message from `orders-queue` with `--wait-time-seconds 20`.
8. Add a comment that starts with `# answer:`. In one sentence, explain why a second consumer gets the same message.

The answer must use the words "visibility timeout". The DLQ ARN is `arn:aws:sqs:us-east-1:000000000000:orders-dlq`.

The finished script makes these calls:

```bash
QUEUES="$ENDPOINT_URL/000000000000"

aws sqs create-queue \
  --queue-name orders-queue

aws sqs create-queue \
  --queue-name orders-queue.fifo \
  --attributes FifoQueue=true,\
ContentBasedDeduplication=true

aws sqs create-queue \
  --queue-name orders-dlq

aws sqs set-queue-attributes \
  --queue-url "$QUEUES/orders-queue" \
  --attributes '{"RedrivePolicy":
  "{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:000000000000:orders-dlq\",\"maxReceiveCount\":\"5\"}"}'

aws sqs send-message \
  --queue-url "$QUEUES/orders-queue.fifo" \
  --message-body '{"orderId": "456"}' \
  --message-group-id customer-123 \
  --message-deduplication-id order-456-v1

aws sqs receive-message \
  --queue-url "$QUEUES/orders-queue" \
  --wait-time-seconds 20

# answer: the visibility timeout expired
# while the first consumer still worked,
# so SQS showed the message again.
```

### Run it for real

```bash
docker run -d --name localstack \
  -p 4566:4566 localstack/localstack
bash stub.sh
```
