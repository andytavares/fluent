## What you build

You configure a transactional producer and a `read_committed` consumer in `stub.properties`. Transactions extend per-partition idempotence to atomic writes across partitions and topics. This lesson builds on **Offset Management** and **Delivery Semantics**.

## Key concepts

### `transactional.id` survives producer restarts

An idempotent producer gets a temporary PID. A `transactional.id` is a string that you choose, tied to a logical role such as `order-processor-1`. On `initTransactions()`, the broker's **transaction coordinator** finds any earlier PID for that id. It bumps an internal **epoch** and fences the earlier producer instance. The broker then rejects every request from the old instance.

### Fencing stops zombie producers

A zombie is an old producer instance that is still alive but must not write. Example: a producer pauses for GC, a network partition or a slow deploy. Its orchestrator starts a replacement with the same `transactional.id`. Without fencing, both instances produce and corrupt the transaction. With fencing, the new `initTransactions()` invalidates the old epoch. The broker rejects any later write from the zombie with a fencing error, though the zombie does not know it.

### Consume-transform-produce is the main use

```
beginTransaction()
  records = consumer.poll(...)
  results = transform(records)
  producer.send(results, outputTopic)
  // input offsets commit in the txn
  producer.sendOffsetsToTransaction(
      offsets, groupId)
commitTransaction()
```

`sendOffsetsToTransaction` makes the loop atomic. The input offset commit and the output records commit or abort as one unit. Without it, the two operations succeed or fail independently. If the output write succeeds and the offset commit fails, a restart duplicates downstream results.

### `read_committed` hides open and aborted transactions

With the default `read_uncommitted`, a consumer sees each record as soon as it reaches the log. That includes records from a transaction that later aborts.

`read_committed` holds back transactional records until the producer commits. It never delivers records from an aborted transaction. It uses the **Last Stable Offset (LSO)**: the point before which every transaction has committed or aborted. A `read_committed` consumer never reads past the LSO.

```
log: A B [txn-start] C D E [commit?]
              LSO stays here ^
read_committed: C, D, E wait for the
outcome of the transaction
```

### A hung transaction stalls `read_committed` consumers

A producer can begin a transaction and never commit or abort it, after a crash or a network partition. The LSO cannot move past that transaction's first record. Every `read_committed` consumer on the partition stops, even for unrelated keys. `transaction.timeout.ms` bounds this: the broker aborts a transaction that stays open longer.

### Transactions have a cost

They add a coordinator round trip per transaction, broker bookkeeping for the transaction log, and the LSO stall risk. For one partition and one topic with no "read A, write B" coupling, use plain idempotence. `enable.idempotence=true` with no `transactional.id` already gives exactly-once per partition.

Use transactions for atomicity across partitions or topics, mostly consume-transform-produce. Kafka Streams uses them for its `exactly_once_v2` guarantee.

Kafka transactions cover only Kafka writes and the offset-commit API, unlike an ACID database transaction. A database write plus a Kafka write is a separate problem: two-phase commit or the outbox pattern.

## Watch out

- A hung transaction blocks every `read_committed` consumer on that partition, not only its own records.
- A long `transaction.timeout.ms` lets a stuck producer stall consumers for a long time.
- A short `transaction.timeout.ms` aborts slow but healthy transactions.
- Two different logical producers that share one `transactional.id` fence each other out by mistake.
- `read_committed` filters at fetch time only. It does not hide records that a `read_uncommitted` consumer already read.

## The task

A service reads an input topic, transforms records and writes an output topic. The input offset commit and the output write must be atomic.

Write `stub.properties` with two sections. Each section starts with its exact marker line.

**Transactional producer**:

1. `transactional.id=order-processor-1`.
2. `enable.idempotence=true`.
3. `acks=all`.
4. `transaction.timeout.ms=60000`. The broker aborts a transaction open for more than 60 s.

**Downstream consumer** (it reads the output topic):

1. `isolation.level=read_committed`. Do not use `read_uncommitted`.
2. `enable.auto.commit=false`.
3. `group.id=order-processor-consumers`.

Use exactly this content:

```properties
# === transactional producer ===
transactional.id=order-processor-1
enable.idempotence=true
acks=all
transaction.timeout.ms=60000

# === downstream consumer ===
isolation.level=read_committed
enable.auto.commit=false
group.id=order-processor-consumers
```
