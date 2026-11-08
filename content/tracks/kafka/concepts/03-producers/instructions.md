## What you build

You write two producer configurations in `stub.properties`: one tuned for throughput, one safe for correctness. Most Kafka performance and correctness tuning happens in the producer, because the broker only appends what it gets. This lesson builds on **Brokers and KRaft**.

## Key concepts

### `send()` passes a record through four stages

A call to `producer.send(record)` does *not* make a network call. It does this:

1. **Serialize** the key and value with `key.serializer` and `value.serializer`. Examples: `StringSerializer`, `ByteArraySerializer`, or an Avro or Protobuf serializer backed by a schema registry.
2. **Partition**: pick the partition. The source is an explicit partition, a key hash, or the sticky default for null keys. The keys lesson covers this.
3. **Accumulate**: append the record to an in-memory batch for that partition, in the `RecordAccumulator`. `batch.size` and `linger.ms` work here.
4. A background **sender thread** takes full or expired batches and sends them to the partition leader. It also handles retries and tracks in-flight requests.

```
send() -> serializer -> partitioner
       -> accumulator -> sender thread
       -> leader broker
```

`send()` returns at once with a `Future<RecordMetadata>`, or takes a callback. The network write happens later, on the sender thread. A producer that exits right after `send()` can silently drop records still in the accumulator. Call `flush()` or wait on the future first.

### `acks` sets when a write counts as done

| `acks` | Done when | Data-loss risk |
|---|---|---|
| `0` | The record goes to the socket. The producer reads no broker response. | Highest. A network drop is invisible to the producer. |
| `1` | The **partition leader** writes the record to its own log. | The leader can die before followers copy the record. The producer got a success ack, but the record is lost. |
| `all` (`-1`) | Every replica in the **ISR** (in-sync replica set) acknowledges the write. `min.insync.replicas` sets the minimum. | Lowest. With `min.insync.replicas` of 2 or more, it survives one broker failure with no acknowledged data loss. |

`acks=all` does not wait for every replica that exists. It waits for every replica now in the ISR. That is why it needs `min.insync.replicas` to guarantee durability under failure. The replication lesson covers this in full.

### `batch.size` and `linger.ms` trade latency for throughput

Each partition has its own batch. The producer sends a batch when it reaches `batch.size` bytes or when `linger.ms` has passed, whichever comes first.

```
low traffic, linger.ms=0:
  each record goes at once:
  tiny batches, low latency,
  poor throughput
linger.ms=20:
  waits up to 20 ms to fill the batch:
  fewer, bigger requests
```

`linger.ms=0` puts latency first: a lone record goes out at once. A small positive value, typically 5 to 50 ms, adds a small, bounded delay. In return, more records go into fewer, larger requests under load. Since Kafka 4.0 the default is `5`; before 4.0 it was `0`. `batch.size` bounds the memory per batch and caps batch size without waiting for `linger.ms`.

### Compression works on whole batches

`compression.type` compresses whole batches, not single records. Bigger batches compress better, which is one more reason to batch. `lz4` and `zstd` are the common production choices: fast with a good ratio. `gzip` compresses better but uses more CPU. `snappy` is fast but compresses less. You set compression on the producer, and consumers decompress without extra config.

### `buffer.memory` and `max.block.ms` give backpressure

`buffer.memory` is the total memory for the accumulators of all partitions. The accumulator fills when the producer writes faster than the sender thread can send. A slow broker or a saturated network causes this.

When `buffer.memory` is full, `send()` **blocks** the caller for up to `max.block.ms`. If no space frees up, it throws `TimeoutException`. This is deliberate backpressure: a blocked or failed producer is better than an unbounded buffer and an out-of-memory crash.

Kafka batches asynchronously by default, unlike RabbitMQ publisher confirms, which confirm one message at a time.

## Watch out

- `acks=1` passes tests but is not durable when the leader fails. Follower lag stays invisible until the leader crashes.
- `linger.ms=0` under high throughput wastes network round-trips. Each record pays the full overhead alone, so tail latency gets worse.
- A full accumulator does not drop data. It blocks the caller.
- Handle `TimeoutException` from `send()`, or check the future. Otherwise a small `buffer.memory` looks like a hung application.
- A return from `send()` does not mean the write happened. Check the future or callback for the result.

## The task

Write two producer configurations in `stub.properties`. Put each one under its exact marker line, in this order:

```properties
# === throughput-tuned producer ===

# === correctness-safe producer ===
```

The **throughput-tuned producer** serves a high-volume analytics pipeline. It accepts the loss of a rare record on leader failure. Set these keys:

1. `acks=1`: only the leader acknowledges.
2. `batch.size=65536`: 64 KB batches.
3. `linger.ms=20`: wait up to 20 ms to fill a batch.
4. `compression.type=lz4`.
5. `buffer.memory=67108864`: a 64 MB accumulator.

The **correctness-safe producer** writes financial events. It must lose no acknowledged record. Set these keys:

1. `acks=all`: every in-sync replica acknowledges.
2. `enable.idempotence=true`: retries create no duplicates. The delivery semantics lesson covers this.
3. `retries=2147483647`: retry without a count limit.
4. `max.in.flight.requests.per.connection=5`: this bound is safe with idempotence.
5. `delivery.timeout.ms=120000`: fail the send only after 2 minutes of retries.

The file must not contain the text `TODO`.

The complete file:

```properties
# === throughput-tuned producer ===
acks=1
batch.size=65536
linger.ms=20
compression.type=lz4
buffer.memory=67108864

# === correctness-safe producer ===
acks=all
enable.idempotence=true
retries=2147483647
max.in.flight.requests.per.connection=5
delivery.timeout.ms=120000
```
