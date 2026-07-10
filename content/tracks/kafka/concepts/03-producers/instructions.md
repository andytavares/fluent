# Producers

## What you'll learn

The producer is where most Kafka performance and correctness tuning actually happens — the broker just appends what it's given. This lesson walks the send path end to end, defines `acks` precisely (a setting people get subtly wrong constantly), and covers the batching and backpressure knobs that trade latency for throughput.

## Key concepts

**The send path: serializer → partitioner → accumulator → sender.** Calling `producer.send(record)` does *not* make a network call. It:

1. **Serializes** the key and value (`key.serializer` / `value.serializer` — e.g., `StringSerializer`, `ByteArraySerializer`, or an Avro/Protobuf serializer backed by a schema registry).
2. **Partitions** — decides which partition this record goes to (explicit partition, key hash, or the sticky/round-robin default for null keys — full detail in the keys/ordering lesson).
3. **Accumulates** — appends the serialized record into an in-memory batch for that specific partition, held in the `RecordAccumulator`. This is where `batch.size` and `linger.ms` operate.
4. A background **sender thread** picks up completed (or expired) batches and ships them to the partition's leader broker over the network, handling retries and in-flight tracking.

`send()` returns immediately with a `Future<RecordMetadata>` (or takes a callback) — the actual network write happens asynchronously, later, on the sender thread. This is why a producer that exits right after calling `send()` without calling `.flush()` or waiting on the future can silently drop messages still sitting in the accumulator.

**`acks` controls durability, and the three values mean very different things:**

| `acks` | Producer considers the write "done" when... | Data-loss risk |
|---|---|---|
| `0` | The record is handed to the network socket. No broker response is even read. | Highest — network drop, or the message never being received, is invisible to the producer. |
| `1` | The **partition leader** has written the record to its own local log. | Followers haven't necessarily replicated it yet — if the leader dies before followers catch up, the record is lost even though the producer got a success ack. |
| `all` (`-1`) | Every replica currently in the **ISR** (in-sync replica set — see the replication lesson) has acknowledged the write, gated further by `min.insync.replicas`. | Lowest — combined with `min.insync.replicas ≥ 2`, survives a single broker failure with zero acknowledged data loss. |

`acks=all` is not "wait for all replicas that exist" — it's "wait for all replicas currently in the ISR," which is why it must be paired with `min.insync.replicas` (covered fully in the replication lesson) to actually guarantee durability under failure.

**`batch.size` vs `linger.ms` is the core throughput/latency tradeoff.** Each partition gets its own batch. A batch is sent when *either* it fills up to `batch.size` bytes *or* `linger.ms` milliseconds have elapsed since the batch started — whichever happens first.

```
low-traffic partition, linger.ms=0:  every record sent immediately, tiny batches, low latency, poor throughput
same partition, linger.ms=20:        producer waits up to 20ms hoping to fill the batch, fewer/bigger network requests
```

Setting `linger.ms=0` (the default) prioritizes latency — a record with nothing else queued behind it goes out immediately. Setting `linger.ms` to a small positive number (5-50ms is typical) trades a small, bounded amount of added latency for dramatically better batching under load, because more records get grouped into fewer, larger requests. `batch.size` bounds memory per batch and gives batching an upper limit even without waiting for `linger.ms` to elapse.

**Compression (`compression.type`)** happens on whole batches, not individual records — another reason bigger batches help: compression ratio improves with more data per batch. `lz4` and `zstd` are the common production choices (fast, good ratio); `gzip` compresses better but costs more CPU; `snappy` is fast but compresses less. Compression is set on the producer and is transparent to consumers.

**`buffer.memory` and `max.block.ms` are the backpressure valve.** `buffer.memory` is the total memory the producer will use across *all* partitions' accumulators. If the producer is producing faster than the sender thread can drain batches to the network (broker is slow, network is saturated, etc.), the accumulator fills up. Once `buffer.memory` is exhausted, `send()` **blocks** the calling thread for up to `max.block.ms` waiting for space, then throws `TimeoutException` if it never frees up. This is intentional backpressure — better to block/fail the producer than buffer unboundedly and OOM.

## vs other systems

Unlike a traditional message broker client (e.g., RabbitMQ's publisher-confirms model), Kafka's producer batches *by default* and asynchronously — the throughput/latency tradeoff is explicit and tunable, not just "call and confirm one at a time." Unlike synchronous RPC, `send()` returning doesn't mean the write happened; you must inspect the `Future`/callback or configure `acks` and `delivery.timeout.ms` to know the outcome.

## Watch out

- **`acks=1` looks safe but isn't durable against leader failure.** It's a common "seems fine in testing" config that loses data during a real broker crash, because the follower replication lag is invisible until the leader actually dies.
- **`linger.ms=0` under high throughput wastes network round-trips** — you'll see far more requests-per-second than necessary, and worse tail latency under load than a small nonzero `linger.ms` would give you, because now every record pays a full network round-trip's worth of overhead individually.
- **A full accumulator doesn't drop data — it blocks the caller.** If your application isn't handling `TimeoutException` from `send()` (or checking the returned future), an undersized `buffer.memory` under load looks like the application hanging, not an obvious buffer-full error.

## The task

Write **two** producer configuration sections in `stub.properties`, exactly under these two comment markers, in this order:

```properties
# === throughput-tuned producer ===
...

# === correctness-safe producer ===
...
```

**Throughput-tuned producer** — for a high-volume analytics pipeline where losing an occasional record on leader failure is acceptable, but throughput matters:
- `acks=1` (leader-only ack — accept some durability risk for speed)
- `batch.size=65536` (64 KB batches)
- `linger.ms=20` (wait up to 20ms to fill a batch)
- `compression.type=lz4`
- `buffer.memory=67108864` (64 MB accumulator budget)

**Correctness-safe producer** — for financial event records where zero acknowledged data loss is required:
- `acks=all` (wait for every in-sync replica)
- `enable.idempotence=true` (safe retries — covered fully in the delivery-semantics lesson)
- `retries=2147483647` (retry indefinitely rather than give up)
- `max.in.flight.requests.per.connection=5` (bounded in-flight requests — safe with idempotence enabled)
- `delivery.timeout.ms=120000` (give up and fail the send only after 2 minutes of retrying)
