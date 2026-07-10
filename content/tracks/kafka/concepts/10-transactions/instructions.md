# Transactions

## What you'll learn

Transactions are what turn Kafka's per-partition idempotent production into a guarantee that spans multiple partitions and topics — including the classic "consume from A, transform, produce to B, commit the input offset" loop atomically. This lesson covers `transactional.id` and fencing (how Kafka kills off a stale "zombie" producer instance), the read-committed consumer's isolation behavior, and when this machinery is actually worth its cost.

## Key concepts

**`transactional.id` is a stable identity that survives producer restarts, and that's the whole point.** Unlike the ephemeral PID assigned to any idempotent producer (covered in the delivery-semantics lesson), `transactional.id` is a string *you* choose and configure — typically tied to a logical role (`order-processor-1`), not a process instance. On `initTransactions()`, the broker's **transaction coordinator** looks up any prior PID registered under that same `transactional.id`, bumps an internal **epoch**, and — critically — **fences off the previous producer instance using that id**: any in-flight or future request from the old instance is rejected once the new epoch is active.

**Fencing is how Kafka kills "zombies" — old producer instances that are still alive but no longer should be trusted.** The classic zombie scenario: a producer process pauses (GC, network partition, a slow deploy that doesn't fully kill the old process) long enough that its orchestrator restarts a replacement with the same `transactional.id`. Without fencing, both the old ("zombie") and new instances could produce concurrently, corrupting a transaction. With fencing, the moment the new instance calls `initTransactions()`, the old instance's producer epoch is invalidated — any write it attempts afterward is rejected with a fencing error, even if the zombie has no idea it's been superseded.

**The consume-transform-produce loop is where transactions earn their keep.** The canonical stream-processing pattern:

```
beginTransaction()
  records = consumer.poll(...)
  results = transform(records)
  producer.send(results, to: outputTopic)
  producer.sendOffsetsToTransaction(consumerOffsets, consumerGroupId)  // commit input offsets INSIDE the transaction
commitTransaction()
```

`sendOffsetsToTransaction` is the piece that makes this atomic end-to-end: the **input offset commit** and the **output records** are committed (or aborted) together, as one unit. Without it, you're back to two independent operations that can succeed/fail independently — e.g., the output write succeeds but the input offset commit fails, and a restart reprocesses input records that already produced output, duplicating downstream results.

**`isolation.level=read_committed` on the consumer is what makes the "commit" side of a transaction actually mean something to readers.** By default (`read_uncommitted`), a consumer sees every record as soon as it's written to the log — including records from a transaction that later **aborts**. `read_committed` withholds transactional records from consumers until the producer commits (or aborts, in which case they're never delivered) — implemented via the **Last Stable Offset (LSO)**, the point up to which all transactions are resolved (committed or aborted). A `read_committed` consumer never reads past the LSO, so it can never see uncommitted transactional writes.

```
partition log:  [A][B][txn-start][C][D][E][txn-commit? or abort?]
                                              ^ LSO sits here until resolved
read_committed consumer: blocked from reading C, D, E until the transaction resolves
```

**A hung transaction stalls read_committed consumers, not just the producer.** If a transactional producer begins a transaction and then never commits or aborts it (crashes, hangs, network partition), the LSO can't advance past that transaction's first record — every `read_committed` consumer is blocked from reading *anything newer*, even on unrelated keys, until the transaction resolves. `transaction.timeout.ms` bounds this: the broker proactively aborts a transaction that's been open longer than this window, unblocking consumers.

**Transactions aren't free, and aren't always worth it.** They add: a round trip to the transaction coordinator per transaction (`beginTransaction`/`commitTransaction`), broker-side bookkeeping for the transaction log, and the LSO-stall risk above. For a single-partition, single-topic pipeline with no fan-out and no "read A, write B" coupling, plain idempotent production (`enable.idempotence=true`, no `transactional.id`) already gives exactly-once-per-partition without any of that overhead. Reach for full transactions specifically when you need atomicity **across** multiple partitions/topics — most commonly the consume-transform-produce pattern above, which is exactly what Kafka Streams uses under the hood for its `exactly_once_v2` processing guarantee (covered in the Kafka Streams lesson).

## vs other systems

Kafka's transaction model is narrower than a traditional ACID database transaction — it only spans Kafka writes (and the specific offset-commit API), not arbitrary external side effects. Writing to a database and a Kafka topic "transactionally" in the traditional two-phase-commit sense isn't what Kafka transactions do; that's a separate distributed-transaction or outbox-pattern problem. Kafka transactions solve the narrower (but very common) problem of atomically writing to multiple Kafka partitions/topics plus committing consumer offsets, in one unit.

## Watch out

- **A stalled/hung transaction blocks every `read_committed` consumer on that partition from reading anything newer, not just the transaction's own records.** Set `transaction.timeout.ms` deliberately — too long and a stuck producer can stall consumers for a long time; too short and legitimately slow (but healthy) transactions get aborted.
- **Reusing a `transactional.id` across genuinely different logical producers causes spurious fencing.** Fencing assumes "same `transactional.id` means same logical role, only one live instance at a time" — sharing an id across unrelated producers causes one to unintentionally fence out the other.
- **`read_committed` doesn't retroactively hide already-consumed uncommitted records** — it only changes what a consumer is allowed to fetch going forward; it's a fetch-time filter, not a guarantee about what any consumer might have already read under `read_uncommitted` in the past.

## The task

Configure a transactional producer/consumer pair for the consume-transform-produce pattern: a service reads from an input topic, transforms records, and writes to an output topic, needing atomicity across the input offset commit and the output write.

Write `stub.properties` with two sections, exactly under these markers:

```properties
# === transactional producer ===
...

# === downstream consumer ===
...
```

**Transactional producer**:
- `transactional.id=order-processor-1`
- `enable.idempotence=true`
- `acks=all`
- `transaction.timeout.ms=60000` (abort a transaction that's been open more than 60s, to avoid stalling consumers indefinitely)

**Downstream consumer** (reads the output topic):
- `isolation.level=read_committed`
- `enable.auto.commit=false`
- `group.id=order-processor-consumers`
