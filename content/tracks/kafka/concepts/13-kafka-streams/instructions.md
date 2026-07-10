# Kafka Streams

## What you'll learn

Kafka Streams is a library (not a separate cluster — it's just your JVM application) for building stream-processing topologies directly on top of the concepts you've already covered: partitions, consumer groups, compacted changelog topics, and transactions. This lesson covers the topology model, the crucial KStream/KTable/GlobalKTable distinction, how stateful operations stay fault-tolerant via changelog topics, windowing, and `exactly_once_v2`.

## Key concepts

**A topology is a graph of sources, processors, and sinks — and it's just a regular application, not a separate service to deploy.** You define a **source** (read from a topic), a chain of **processors** (map, filter, join, aggregate...), and a **sink** (write to a topic). Kafka Streams compiles this into an actual execution plan and runs it using ordinary consumer/producer clients under the hood — scaling out means running more instances of your application (each instance's threads pick up a share of the input topic's partitions, exactly like a consumer group).

```
source (orders topic) -> filter(valid orders) -> map(enrich) -> sink (enriched-orders topic)
```

**KStream is an unbounded record stream; KTable is a changelog of latest-value-per-key; GlobalKTable is a fully-replicated KTable on every instance.**

| | Semantics | Backed by |
|---|---|---|
| `KStream` | Every record is a distinct event — an insert, not an update. | A regular topic, read as a stream of individual records. |
| `KTable` | Each key has one current value — a new record for an existing key **updates** it (like a database row), not appends. | A **compacted** changelog topic (see the retention/compaction lesson) — this is exactly why compacted topics exist. |
| `GlobalKTable` | Same update semantics as `KTable`, but **every application instance holds a full copy of the entire table**, not just a partitioned slice. | A compacted topic, replicated in full to every instance rather than partitioned across them. |

The practical consequence: joining a `KStream` to a `KTable` requires both to be **co-partitioned** (same keys hash to matching partitions across both), because each task only has its local partition-slice of the table. Joining to a `GlobalKTable` has no co-partitioning requirement at all, since every instance has the whole table locally — the tradeoff is memory and replication cost for that convenience, appropriate for smaller reference/lookup data (e.g., a product catalog), not for tables as large as your primary event volume.

**Stateful operations (aggregations, joins, windowed counts) need a state store, and every state store is backed by a changelog topic for fault tolerance.** When your topology aggregates or joins, Kafka Streams keeps that running state in a local **state store** (RocksDB-backed by default, or in-memory) on whichever instance owns that partition. Every state store update is also written to an internal, compacted **changelog topic** — so if an instance crashes and its partitions get reassigned elsewhere, the new owner rebuilds its local state store by replaying that changelog, rather than losing the aggregation state entirely. This is the same compacted-topic mechanism from the retention lesson, applied automatically by the framework on your behalf.

**Windowing groups records into time buckets for aggregation, and the window type changes what "belongs together" means:**

| Window type | Behavior |
|---|---|
| **Tumbling** | Fixed-size, non-overlapping, back-to-back windows (e.g., every 5 minutes exactly once). |
| **Hopping** | Fixed-size, but overlapping — a new window starts every "advance" interval, shorter than the window size itself (e.g., a 10-minute window advancing every 5 minutes — every record can belong to more than one window). |
| **Sliding** | A window per record pair whose timestamps are within the window size of each other — used for join-style "records close together in time" semantics rather than fixed buckets. |
| **Session** | Dynamic-length windows closed by a gap of inactivity (no fixed size — a session ends after N minutes with no new records for that key, then a new session starts on the next one). |

**`exactly_once_v2` is Kafka Streams applying the transactions machinery (from the previous lesson) automatically to your whole topology.** Setting `processing.guarantee=exactly_once_v2` wraps every task's consume-process-produce cycle (including state store changelog writes and offset commits) in a Kafka transaction — you get the same atomicity guarantee the transactions lesson described for a hand-rolled consume-transform-produce loop, without writing any of that transaction-management code yourself. This is strictly a config change (plus the same operational considerations — transaction timeouts, `read_committed` consumers downstream) not an application-code change.

## vs other systems

Kafka Streams' "it's just a library, not a cluster" model is distinct from systems like Flink or Spark Streaming, which run as their own dedicated processing clusters with separate deployment and job-submission models. The tradeoff: Kafka Streams instances are exactly as scalable/fault-tolerant as the consumer-group model already gives you (add instances, they rebalance partitions), with no separate infrastructure to operate — at the cost of being tied more tightly to the JVM and to Kafka itself as the sole data source/sink, rather than a general-purpose engine that can read from many different systems.

## Watch out

- **Joining a `KStream` to a `KTable` (or two KTables) that aren't co-partitioned fails or silently produces wrong results** — matching partition counts and the same keying scheme on both sides isn't optional, it's a hard requirement of how the join is executed locally per-partition.
- **A `GlobalKTable` fully replicated on every instance is not free** — appropriate for genuinely small reference data, a real footgun if applied to a table as large as your main event stream, since every instance now holds the entire dataset in memory/local storage.
- **`exactly_once_v2` inherits every transactions caveat from the previous lesson** — a stalled task can still stall downstream `read_committed` consumers, and transaction timeout tuning still matters; enabling it isn't "set and forget."

## The task

Configure a Kafka Streams application `order-enrichment-app` that joins an order events stream to a product-catalog reference table (small, globally replicated for the join), aggregates order totals in 5-minute tumbling windows, and needs end-to-end exactly-once processing across the whole topology.

Write `stub.properties` with:

- `application.id=order-enrichment-app`
- `processing.guarantee=exactly_once_v2`
- `num.stream.threads=4`
- `state.dir=/var/lib/kafka-streams`
- `cache.max.bytes.buffering=10485760` (10 MB record-cache before forwarding downstream/writing changelog updates)
- A commented design-answer line describing the topology shape: `# topology=orders-KStream-join-catalog-GlobalKTable-aggregate-KTable`
- A commented design-answer line describing the windowing choice: `# window-type=tumbling-5-minutes`
