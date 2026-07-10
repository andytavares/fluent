# Kafka Connect

## What you'll learn

Connect is Kafka's answer to "stop writing bespoke producer/consumer glue code to move data in and out of Kafka" — a framework for running reusable, configuration-driven connectors instead of custom applications. This lesson covers source vs sink connectors, the worker/task/distributed-mode execution model, the converter configuration that trips up nearly everyone, Single Message Transforms, and dead-letter-queue error handling.

## Key concepts

**Source connectors pull data into Kafka; sink connectors push data out of Kafka.** A **source connector** reads from an external system (a database's CDC log, a filesystem, an API) and produces records to a Kafka topic. A **sink connector** consumes records from a Kafka topic and writes them to an external system (a database, Elasticsearch, S3, a data warehouse). Both are configuration, not code you write — you configure an existing connector plugin (JDBC, Debezium, S3, Elasticsearch, etc.) rather than hand-writing a producer or consumer application.

**A Connect cluster is workers running tasks, and distributed mode is how it scales and survives failure.** A **worker** is a JVM process running the Connect runtime. A **connector** (the logical job — "sink these Kafka topics into this Postgres table") is split into one or more **tasks** — the actual units of parallel work, up to `tasks.max`. In **distributed mode**, multiple workers form a cluster (coordinated the same way a consumer group is — via a group protocol), and Connect automatically distributes tasks across available workers and rebalances if a worker joins or leaves. This gives you horizontal scaling and failover without any custom orchestration code — a worker dying just means its tasks get reassigned to the surviving workers.

**Converters translate between Kafka's wire bytes and Connect's internal data format — this is the config almost everyone gets wrong at least once.** `key.converter` and `value.converter` are configured on the **worker** (or overridden per-connector) and control how Connect serializes/deserializes the actual Kafka record bytes — this is a different layer from a producer/consumer application's own serializers. A common mistake: a topic was written with an Avro serializer via the schema registry, but the sink connector's `value.converter` is left at the default `JsonConverter` — the connector doesn't error clearly, it just fails to correctly deserialize the bytes, because it's using the wrong format entirely.

```properties
key.converter=org.apache.kafka.connect.storage.StringConverter
value.converter=io.confluent.connect.avro.AvroConverter
value.converter.schema.registry.url=http://schema-registry:8081
```

Converters are configured independently for key and value, and must match whatever format actually produced the data on that topic — this is a topic-level fact, not a connector preference, so get it from how the topic is actually written, not from what's convenient to configure.

**Single Message Transforms (SMTs) do lightweight, in-flight record modification without a full stream-processing job.** Configured as a chain on a connector (`transforms=<name1>,<name2>`, then per-transform config), SMTs handle things like renaming/masking a field, routing to a different topic based on a field value, or flattening a nested structure — small, stateless, single-record transformations. For anything stateful (joins, aggregations, windowing), that's Kafka Streams territory (covered in the next lesson), not an SMT.

**Error tolerance and dead-letter queues decide what happens when a record can't be processed.** `errors.tolerance` controls the connector's reaction to a processing failure (a bad record that fails conversion, a downstream write rejection, etc.):

| `errors.tolerance` | Behavior on a failed record |
|---|---|
| `none` (default) | The connector task **fails and stops** on the first error — safest for catching problems immediately, but one bad record halts the whole task. |
| `all` | The connector **logs and skips** the failed record, continuing with the rest — combined with a dead-letter queue, the bad record isn't silently lost, just routed elsewhere for later inspection. |

```properties
errors.tolerance=all
errors.deadletterqueue.topic.name=orders-sink-dlq
errors.deadletterqueue.context.headers.enable=true
```

The DLQ topic receives the raw failed record plus (with `context.headers.enable=true`) headers describing *why* it failed and which connector/task produced the failure — essential for actually debugging DLQ contents later rather than just accumulating an unexplained pile of rejected records.

## vs other systems

Connect's worker/task/distributed-mode model is conceptually similar to a Kubernetes-style controller reconciling desired state (connector configs) against actual running work (tasks on workers), specifically for the "move data between Kafka and an external system" problem. Compared to hand-rolling a producer/consumer bridge application, Connect trades some flexibility for a large ecosystem of pre-built, battle-tested connectors and a standard operational model (REST API for connector management, standard offset tracking, standard error handling) that a bespoke bridge app would have to reimplement from scratch.

## Watch out

- **A converter mismatch is usually a silent, confusing failure, not a clear error** — always match the converter to how the topic was actually serialized, never to "whatever's simplest to configure."
- **`errors.tolerance=none` (the default) means one malformed record can halt an entire sink task**, which is often the wrong default for a high-volume production pipeline where a handful of bad records shouldn't block the other 99.99% of good ones — but `all` without a configured DLQ means those bad records are simply logged and dropped, not preserved for investigation.
- **SMTs are for lightweight, single-record, stateless changes — reaching for them to do joins, aggregation, or anything needing state or multiple records is the wrong tool; that's Kafka Streams.**

## The task

Configure a sink connector that writes the `orders` topic (Avro-serialized values, string keys) into a Postgres table, tolerating individual bad records without halting the whole pipeline, routing failures to a dead-letter queue with enough context to debug them later.

Write `stub.properties` with:

- `name=postgres-orders-sink`
- `connector.class=io.confluent.connect.jdbc.JdbcSinkConnector`
- `tasks.max=4`
- `topics=orders`
- `connection.url=jdbc:postgresql://db:5432/orders`
- `key.converter=org.apache.kafka.connect.storage.StringConverter`
- `value.converter=io.confluent.connect.avro.AvroConverter`
- `value.converter.schema.registry.url=http://schema-registry:8081`
- `errors.tolerance=all`
- `errors.deadletterqueue.topic.name=orders-sink-dlq`
- `errors.deadletterqueue.context.headers.enable=true`
