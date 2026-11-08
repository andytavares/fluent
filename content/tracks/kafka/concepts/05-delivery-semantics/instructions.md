## What you build

You write three configurations in `stub.properties`: at-most-once, at-least-once and exactly-once. Kafka defines each guarantee on the produce side and the consume side separately. This lesson builds on **Consumers and Groups**.

## Key concepts

### A pipeline is only as strong as its weaker side

Delivery semantics answer two separate questions: one for the producer, one for the consumer. The end-to-end guarantee is the weaker of the two.

| | Produce side | Consume side |
|---|---|---|
| **At-most-once** | Send, and do not retry on an ambiguous failure. A lost ack can mean a lost record. | Commit the offset *before* processing. A crash mid-processing skips that record forever. |
| **At-least-once** | Retry on any ambiguous failure. If the first write landed, the retry makes a duplicate. | Commit the offset *after* processing. A crash mid-processing reprocesses that record on restart. |
| **Exactly-once** | Idempotent and transactional production. The broker removes duplicate retries. | Read only committed output (`isolation.level=read_committed`). Commit offsets atomically with the output. |

At-most-once never reprocesses and risks loss. At-least-once never loses and risks duplicates. Most real systems choose at-least-once with idempotent *downstream* processing, for example a unique key and an upsert.

### `enable.idempotence=true` makes retries safe

At startup, the broker gives the producer a unique **Producer ID (PID)**. Each batch to a partition carries a **sequence number** that always increases. The broker tracks the last sequence number per PID per partition. It drops any batch with a sequence number it already has and returns success.

```
PID=77 sends seq=5 to partition 2
  -> broker writes it, stores seq=5
timeout: no ack, producer retries seq=5
broker sees seq=5 for PID=77 again
  -> returns success, no duplicate
```

The broker settles the question "did that write land?" by removing the duplicate. The producer does not have to guess. Idempotence requires `acks=all` and `max.in.flight.requests.per.connection` of 5 or less, and Kafka enforces both. The bound lets the broker order retried sequence numbers correctly.

### Exactly-once needs idempotence, transactions and the consumer

Idempotence alone gives exactly-once writes only to *one partition* from *one producer session*. Exactly-once across partitions or topics needs four things. An example is "read topic A, process, write topic B, all atomically".

1. A `transactional.id` on the producer. It survives restarts. The broker fences off an older "zombie" instance with the same id.
2. `acks=all` and idempotence. Transactions build on idempotent production.
3. `isolation.level=read_committed` on the consumer of the *output* topic. It never sees records from an aborted or open transaction.
4. Offsets for the *input* topic committed in the same transaction as the output writes. This is the consume-transform-produce pattern.

The transactions lesson covers the full mechanics.

RabbitMQ and SQS usually stop at at-least-once and leave deduplication to the application. Kafka removes duplicates **inside the broker**, so exactly-once production needs no application code.

## Watch out

- At-least-once does not mean "no data loss" by default. Commit the offset only *after* durable processing.
- Auto-commit can fire before processing finishes. That silently turns at-least-once into at-most-once.
- Idempotence removes duplicates per producer session and per partition, not globally.
- A restarted producer gets a new PID. Records it sends again, for example from a checkpoint, become duplicates. The application must handle that.
- `read_committed` does not skip a stuck transaction. Consumers cannot read past it, so the last stable offset stops moving.
- Transaction timeouts limit how long a stuck transaction blocks consumers. The transactions lesson covers them.

## The task

Write three configurations in `stub.properties`. Each one combines producer and consumer keys for one guarantee. Put each one under its exact marker line, in this order:

```properties
# === at-most-once ===

# === at-least-once ===

# === exactly-once ===
```

**At-most-once**: offsets commit on a timer, whatever the processing result. Set these keys:

1. `acks=1`
2. `enable.idempotence=false`
3. `enable.auto.commit=true`
4. `auto.commit.interval.ms=1000`

**At-least-once**: retries are on, and the application commits offsets after processing. Set these keys:

1. `acks=all`
2. `enable.idempotence=false`
3. `retries=2147483647`
4. `enable.auto.commit=false`

**Exactly-once**: idempotent, transactional production with a read-committed consumer. Set these keys:

1. `enable.idempotence=true`
2. `transactional.id=order-processor-1`
3. `acks=all`
4. `isolation.level=read_committed`
5. `enable.auto.commit=false`

The file must not contain the text `TODO`.

The complete file:

```properties
# === at-most-once ===
acks=1
enable.idempotence=false
enable.auto.commit=true
auto.commit.interval.ms=1000

# === at-least-once ===
acks=all
enable.idempotence=false
retries=2147483647
enable.auto.commit=false

# === exactly-once ===
enable.idempotence=true
transactional.id=order-processor-1
acks=all
isolation.level=read_committed
enable.auto.commit=false
```
