# Delivery Semantics

## What you'll learn

"At-least-once," "at-most-once," and "exactly-once" get thrown around loosely in distributed systems conversations. Kafka defines them precisely, at both the produce and the consume side independently, and gives you the exact config knobs for each. This lesson pins down the definitions and the mechanics behind idempotent production — the PID/sequence-number scheme that makes safe retries possible.

## Key concepts

**Delivery semantics are actually two separate questions: produce-side and consume-side.** A pipeline's end-to-end guarantee is the weaker of its producer guarantee and its consumer guarantee. Define each precisely:

| | Produce side | Consume side |
|---|---|---|
| **At-most-once** | Send, don't retry on ambiguous failure — a lost ack means the record might just be gone. | Commit the offset *before* processing — a crash mid-processing means that record is skipped forever. |
| **At-least-once** | Retry on any ambiguous failure — a lost ack gets retried, which can create a duplicate if the original write actually succeeded. | Commit the offset *after* processing completes — a crash mid-processing means that record gets reprocessed on restart. |
| **Exactly-once** | Idempotent + transactional production — retries are deduplicated by the broker itself. | Read only committed transactional output (`isolation.level=read_committed`) and commit offsets atomically with the output they produced. |

Notice the pattern: **at-most-once favors never reprocessing (risking loss); at-least-once favors never losing (risking duplicates).** Most real systems choose at-least-once plus idempotent *downstream* processing (a unique key + upsert, e.g.) rather than paying for full exactly-once machinery.

**`enable.idempotence=true` makes retries safe without duplicating, using a PID and per-partition sequence numbers.** When enabled, the producer is assigned a unique **Producer ID (PID)** by the broker at initialization. Every batch the producer sends to a given partition carries a monotonically increasing **sequence number**. The broker tracks the last sequence number it committed *per PID per partition* and rejects (silently, as a successful no-op) any batch whose sequence number it's already seen.

```
producer (PID=77) sends batch seq=5 to partition 2 -> broker commits it, remembers seq=5
network blip, producer times out, doesn't get the ack, retries batch seq=5
broker sees seq=5 again for PID=77 on partition 2 -> already applied, returns success, no duplicate write
```

This is why idempotence turns "retry on ambiguous failure" from dangerous (duplicates) into safe — the ambiguity ("did that write actually land?") is resolved by the broker deduplicating on retry, not by the producer guessing. `enable.idempotence=true` also implicitly requires `acks=all` and `max.in.flight.requests.per.connection ≤ 5` (Kafka enforces these once idempotence is on) — bounded in-flight requests are required so the broker can still resolve out-of-order sequence numbers from retries correctly.

**Exactly-once (EOS) needs idempotence *plus* transactions *plus* a cooperating consumer.** Idempotence alone only guarantees exactly-once writes to a *single partition* from a *single producer session*. Full exactly-once across multiple partitions/topics (e.g., "consume from topic A, process, produce to topic B, all atomically") requires:

1. A `transactional.id` set on the producer (survives producer restarts — the broker fences off any earlier "zombie" instance using the same id; full mechanics in the transactions lesson).
2. `acks=all` and idempotence (transactions build on top of idempotent production).
3. The consumer of the *output* topic set to `isolation.level=read_committed`, so it never sees records from an aborted or in-flight transaction.
4. Offsets for the *input* topic committed as part of the same transaction as the output writes (the "consume-transform-produce" pattern — covered in full in the transactions lesson).

## vs other systems

Traditional message queues (RabbitMQ, SQS) typically expose "at-least-once with dedup by consumer" as the practical ceiling, leaving deduplication logic to the application. Kafka's idempotent producer is unusual in doing deduplication **inside the broker** at the partition level, which is why it can offer true exactly-once *production* without any application code — something most brokers can't do without an external idempotency-key store.

## Watch out

- **At-least-once is not "no data loss" by default** — it requires committing the offset only *after* the record is durably processed. Reversing the order (auto-commit that fires before processing finishes) silently downgrades you to at-most-once even if you meant at-least-once.
- **Idempotence deduplicates per producer session, per partition — not globally.** If your producer process restarts (gets a new PID) and re-sends records it already sent in a previous run (e.g., replaying from a checkpoint), those are *not* deduplicated by the idempotent producer — that's an application-level exactly-once problem, not something `enable.idempotence` solves for you.
- **`isolation.level=read_committed` doesn't mean "wait forever" for a stuck transaction** — a hung transaction blocks consumers from reading anything *past* it (raises the "Last Stable Offset"), which is why transaction timeouts matter operationally (covered in the transactions lesson).

## The task

Write three configuration sections in `stub.properties`, in order, under exactly these markers, each combining the relevant producer and consumer keys for that semantic tier:

```properties
# === at-most-once ===
...

# === at-least-once ===
...

# === exactly-once ===
...
```

**At-most-once** — offsets commit on a timer regardless of processing outcome:
- `acks=1`
- `enable.idempotence=false`
- `enable.auto.commit=true`
- `auto.commit.interval.ms=1000`

**At-least-once** — retries are enabled; offsets only commit after processing finishes (manual commit, application-driven — not expressed as a single key here beyond disabling auto-commit):
- `acks=all`
- `enable.idempotence=false`
- `retries=2147483647`
- `enable.auto.commit=false`

**Exactly-once** — idempotent, transactional production with a read-committed consumer:
- `enable.idempotence=true`
- `transactional.id=order-processor-1`
- `acks=all`
- `isolation.level=read_committed`
- `enable.auto.commit=false`
