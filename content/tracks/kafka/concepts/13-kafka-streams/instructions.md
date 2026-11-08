## What you build

You configure the Kafka Streams application `order-enrichment-app` in `stub.properties`. Kafka Streams is a library inside your JVM application, not a separate cluster. It builds on partitions, consumer groups, compacted changelog topics and transactions. This lesson builds on **Transactions** and **Retention and Compaction**.

## Key concepts

### A topology is a graph inside your application

You define a **source** that reads a topic, a chain of **processors**, and a **sink** that writes a topic. Processors map, filter, join and aggregate. Kafka Streams turns the graph into an execution plan with ordinary consumer and producer clients. To scale out, run more instances. Their threads share the input partitions, like a consumer group.

```
orders topic -> filter(valid)
  -> map(enrich) -> enriched-orders
```

### `KStream`, `KTable` and `GlobalKTable` differ in meaning

- **`KStream`**: each record is a separate event, an insert. A regular topic backs it.
- **`KTable`**: each key has one current value. A new record for a key updates it, like a database row. A **compacted** changelog topic backs it; this is why compacted topics exist.
- **`GlobalKTable`**: the same update semantics as `KTable`. Every application instance holds a full copy, not a partition slice.

A `KStream`-to-`KTable` join needs both sides **co-partitioned**: the same keys hash to matching partitions. Each task holds only its local slice of the table. A join to a `GlobalKTable` has no co-partitioning rule, because each instance has the whole table. It costs memory and replication, so use it for small reference data, such as a product catalog.

### Every state store has a changelog topic

Aggregations, joins and windowed counts keep running state in a local **state store**. RocksDB backs it by default; in-memory is the other choice. The instance that owns the partition holds the store.

Kafka Streams also writes each store update to an internal, compacted **changelog topic**. When an instance crashes, another instance takes its partitions. It rebuilds the state store from the changelog, so no aggregation state is lost.

### The window type decides which records belong together

- **Tumbling**: fixed-size windows that do not overlap, back to back. Example: every 5 minutes.
- **Hopping**: fixed-size windows that overlap. A new window starts each "advance" interval, shorter than the window size. Example: a 10-minute window that advances every 5 minutes. One record can be in several windows.
- **Sliding**: a window for each pair of records whose timestamps are within the window size. Use it for "records close in time", as in joins.
- **Session**: no fixed size. A gap of inactivity for a key ends the session. The next record for that key starts a new one.

### `exactly_once_v2` applies transactions to the whole topology

`processing.guarantee=exactly_once_v2` wraps each task's consume-process-produce cycle in a Kafka transaction. The cycle includes changelog writes and offset commits. You get the atomicity of the Transactions lesson with no transaction code. It is a configuration change, not a code change. Transaction timeouts and `read_committed` downstream consumers still matter.

Flink and Spark Streaming run as dedicated processing clusters. Kafka Streams scales like a consumer group with no extra infrastructure, but it ties you to the JVM and to Kafka.

## Watch out

- A join of streams or tables that are not co-partitioned fails or gives wrong results.
- Co-partitioning needs matching partition counts and the same keys on both sides.
- Each instance holds a full `GlobalKTable`. A table as large as your main stream fills memory and disk.
- `exactly_once_v2` keeps every transaction caveat. A stalled task can still stall `read_committed` consumers.

## The task

`order-enrichment-app` joins an order stream to a small product catalog table. Each instance holds the full catalog. The application sums order totals in 5-minute tumbling windows. The topology needs end-to-end exactly-once processing.

Write `stub.properties` with these lines:

1. `application.id=order-enrichment-app`.
2. `processing.guarantee=exactly_once_v2`. Do not use `at_least_once`.
3. `num.stream.threads=4`.
4. `state.dir=/var/lib/kafka-streams`.
5. `cache.max.bytes.buffering=10485760`. This 10 MB cache buffers records before changelog writes and downstream forwarding.
6. A comment with the topology shape: `# topology=orders-KStream-join-catalog-GlobalKTable-aggregate-KTable`.
7. A comment with the window choice: `# window-type=tumbling-5-minutes`.

Use exactly this content:

```properties
application.id=order-enrichment-app
processing.guarantee=exactly_once_v2
num.stream.threads=4
state.dir=/var/lib/kafka-streams
cache.max.bytes.buffering=10485760
# topology=orders-KStream-join-catalog-GlobalKTable-aggregate-KTable
# window-type=tumbling-5-minutes
```
