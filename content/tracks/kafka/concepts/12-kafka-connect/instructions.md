## What you build

You configure a JDBC sink connector in `stub.properties` that writes the `orders` topic to Postgres. Kafka Connect runs reusable connectors from configuration. You stop writing custom producer and consumer glue code. This lesson builds on **Schema Management**.

## Key concepts

### Source connectors write to Kafka; sink connectors read from it

A **source connector** reads from an external system and produces records to a Kafka topic. Examples: a database CDC log, a filesystem, an API. A **sink connector** consumes a topic and writes to an external system. Examples: a database, Elasticsearch, S3, a data warehouse. You configure an existing plugin, such as JDBC, Debezium or S3. You write no producer or consumer code.

### Workers run tasks, and distributed mode scales them

A **worker** is a JVM process that runs the Connect runtime. A **connector** is the logical job, for example "sink these topics into this Postgres table". Connect splits it into **tasks**, the units of parallel work, up to `tasks.max`.

In **distributed mode**, several workers form a cluster. They coordinate with a group protocol, like a consumer group. Connect spreads tasks across workers and rebalances when a worker joins or leaves. When a worker dies, the other workers take its tasks.

### Converters must match how the producer wrote the topic

`key.converter` and `value.converter` turn Kafka record bytes into Connect's internal format and back. You set them on the worker or override them per connector. They are a separate layer from an application's serializers.

```properties
key.converter=org.apache.kafka.connect.storage.StringConverter
value.converter=io.confluent.connect.avro.AvroConverter
value.converter.schema.registry.url=http://schema-registry:8081
```

The key and value converters are independent. Each must match the format of the data on the topic. That format is a fact of the topic, not a connector preference.

A common mistake: a producer writes the topic with the Avro registry serializer. The sink keeps the default `JsonConverter`. The connector gives no clear error; it reads the bytes in the wrong format.

### Single Message Transforms change one record in flight

You configure SMTs as a chain on a connector: `transforms=<name1>,<name2>`, then the settings for each one. An SMT renames or masks a field, routes to another topic by field value, or flattens a nested structure. SMTs are small, stateless and work on one record. Joins, aggregations and windows belong in Kafka Streams, the next lesson.

### `errors.tolerance` decides what a bad record does

A record can fail conversion, or the downstream system can reject the write:

- **`none`** (default): the task fails and stops on the first error. You see problems at once, but one bad record stops the task.
- **`all`**: the connector skips the failed record and continues. With a dead letter queue (DLQ), the bad record goes to another topic for later inspection.

```properties
errors.tolerance=all
errors.deadletterqueue.topic.name=orders-sink-dlq
errors.deadletterqueue.context.headers.enable=true
```

The DLQ topic gets the raw failed record. With `context.headers.enable=true`, headers say why it failed and which connector and task failed. Without them, the DLQ is a pile of rejected records with no explanation.

Connect works like a Kubernetes controller: it matches running tasks to the connector configs you declare. Compared to a custom bridge application, you trade some flexibility for many tested connectors. You also get a REST API, offset tracking and error handling.

## Watch out

- A converter mismatch usually fails silently. Match the converter to the format on the topic.
- With `errors.tolerance=none`, one malformed record stops a whole sink task.
- `errors.tolerance=all` with no DLQ drops bad records. You cannot inspect them later.
- Do not use SMTs for joins, aggregations or anything with state. Use Kafka Streams.

## The task

A sink connector writes the `orders` topic to a Postgres table. Values are Avro and keys are strings. A bad record must not stop the pipeline. Failures go to a DLQ with debug context.

Write `stub.properties` with these lines:

1. `name=postgres-orders-sink`.
2. `connector.class` set to the Confluent `JdbcSinkConnector`.
3. `tasks.max=4`.
4. `topics=orders`.
5. `connection.url=jdbc:postgresql://db:5432/orders`.
6. `key.converter` set to the Kafka `StringConverter`.
7. `value.converter` set to the Confluent `AvroConverter`.
8. `value.converter.schema.registry.url=http://schema-registry:8081`.
9. `errors.tolerance=all`. Do not leave it at `none`.
10. `errors.deadletterqueue.topic.name=orders-sink-dlq`.
11. `errors.deadletterqueue.context.headers.enable=true`.

Use exactly this content:

```properties
name=postgres-orders-sink
connector.class=io.confluent.connect.jdbc.JdbcSinkConnector
tasks.max=4
topics=orders
connection.url=jdbc:postgresql://db:5432/orders
key.converter=org.apache.kafka.connect.storage.StringConverter
value.converter=io.confluent.connect.avro.AvroConverter
value.converter.schema.registry.url=http://schema-registry:8081
errors.tolerance=all
errors.deadletterqueue.topic.name=orders-sink-dlq
errors.deadletterqueue.context.headers.enable=true
```
