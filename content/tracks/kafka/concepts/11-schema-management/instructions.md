## What you build

You configure an Avro producer for the `orders` topic in `stub.properties`, with schema registry integration. Kafka stores a record value as bytes and knows no schema. A schema registry makes sure today's producer and yesterday's consumer still understand each other. This lesson builds on **Producers** and **Retention and Compaction**.

## Key concepts

### The schema is a contract across time

In a synchronous API, the client and server check compatibility live, on each call. In Kafka, a consumer can read a record a year after a producer wrote it. That producer version can be gone. Nothing negotiates at read time, so the registry must block an incompatible schema before it reaches the topic. Otherwise, an old consumer fails on new data in production.

### The registry versions schemas per subject

A **subject** is usually `{topic}-value` or `{topic}-key`, from the default `TopicNameStrategy`. The registry versions "the schema for this topic's values", not schemas in the abstract. Each compatible new schema gets the next **version** number and a globally unique **schema id**.

A record carries only the small schema id as a prefix, not the full schema. The consumer looks up the id in the registry and caches the result. Messages stay small, even with large schemas that change.

```
producer, schema id 47:
  [magic byte][id 47][avro bytes...]
consumer:
  read id 47 -> fetch schema 47
  (cached) -> deserialize
```

### Compatibility modes decide which changes the registry accepts

The registry checks the mode when you register a new schema for a subject:

- **`BACKWARD`**: the new schema can read data written with the previous schema. Consumers upgrade first.
- **`FORWARD`**: the previous schema can read data written with the new schema. Producers upgrade first.
- **`FULL`**: both. Producers and consumers upgrade in any order.
- **`BACKWARD_TRANSITIVE`**, **`FORWARD_TRANSITIVE`**, **`FULL_TRANSITIVE`**: the same checks against every earlier version, not only the last one.

The transitive modes close a real gap. A schema can be compatible with v2 but not with v1, and plain `BACKWARD` does not catch that.

### Field defaults decide most Avro evolutions

Avro is the most common case:

- **Add a field with a default**: `BACKWARD` compatible. A new consumer uses the default for old data. This is the safest, most common change.
- **Add a field with no default**: not `BACKWARD` compatible. Old data has no value and there is no default.
- **Remove a field**: `BACKWARD` compatible, because the new reader ignores the extra field in old data. It is `FORWARD` compatible only when the old schema gave the field a default. An old reader then fills in the missing value.
- **Change a field's type**, for example `int` to `string`: not compatible in any mode. Avro allows a few numeric widenings, such as `int` to `long`. For other type changes, add a new field.

The default, not the field name or type, is the detail that decides almost every evolution.

### Avro, Protobuf and JSON Schema trade size for readability

- **Avro**: `.avsc` schemas in JSON and compact binary on the wire. The consumer always needs the schema, through the id lookup. It is the historic default of the Kafka ecosystem: Kafka Streams, ksqlDB and Connect converters assume it.
- **Protobuf**: `.proto` schemas and compact binary. Generated code decodes the data, and the registry still tracks compatibility. It is the common choice when a company also uses gRPC.
- **JSON Schema**: plain JSON on the wire, so larger messages. Payloads are readable, which helps debugging and low-volume topics.

All three have registry-native compatibility checks. Avro and Protobuf checks are mature; JSON Schema checks are less common.

## Watch out

- `auto.register.schemas=true` lets any producer register a new schema version on first use.
- Auto-registration is fine for local development and dangerous in production.
- In production, set `auto.register.schemas=false`. Register schemas through your review and deploy pipeline.
- Plain `BACKWARD` and `FORWARD` check only the last version. Use `_TRANSITIVE` for topics with long retention.
- A schema default is not always a correct domain value. Avro fills `0` or `""`, and you decide if that is correct.

## The task

A producer writes Avro records to the `orders` topic. New consumers must always read data from older producer versions. A running producer must never register a schema.

Write `stub.properties` with these lines:

1. `key.serializer` set to the Kafka `StringSerializer`.
2. `value.serializer` set to the Confluent `KafkaAvroSerializer`.
3. `schema.registry.url=http://schema-registry:8081`.
4. `auto.register.schemas=false`. The deploy pipeline registers schemas. Do not set it to `true`.
5. A comment with the compatibility mode: `# compatibility-mode=BACKWARD`.
6. A comment with the evolution rule: `# evolution-rule=new-fields-must-have-defaults`.

Use exactly this content:

```properties
key.serializer=org.apache.kafka.common.serialization.StringSerializer
value.serializer=io.confluent.kafka.serializers.KafkaAvroSerializer
schema.registry.url=http://schema-registry:8081
auto.register.schemas=false
# compatibility-mode=BACKWARD
# evolution-rule=new-fields-must-have-defaults
```
