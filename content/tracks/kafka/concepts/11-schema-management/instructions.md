# Schema Management

## What you'll learn

Kafka itself is schema-agnostic — a record's value is just bytes. That's exactly why schema management matters: producers and consumers are decoupled in time (a consumer might read data written months ago by a producer version that no longer exists), so *something* has to enforce that today's producer and yesterday's consumer can still understand each other's bytes. This lesson covers the schema registry model and compatibility modes — the actual mechanism that makes safe schema evolution possible.

## Key concepts

**In a decoupled log, the schema is a contract across time, not just across a single request/response.** In a synchronous API, a client and server negotiate compatibility live, per call. In Kafka, a producer writes a record today; a consumer might read it a year from now, written by a producer version that's since been redeployed twice. There's no live negotiation — compatibility has to be enforced *before* an incompatible schema is ever allowed to reach the topic, or you find out about it in production when an old consumer chokes on new data.

**The schema registry stores schemas under subjects, each with a version history and an id.** A **subject** is typically `{topic}-value` or `{topic}-key` (the default `TopicNameStrategy`) — the registry doesn't version "schemas" in the abstract, it versions "the schema used for this topic's values (or keys)." Each time a compatible new schema is registered under a subject, it gets the next **version** number and a globally unique **schema id**. Serialized records carry only the small schema id (not the full schema) as a prefix — the consumer looks the id up in the registry (cached locally after the first lookup) to get the full schema needed to deserialize. This is what keeps messages small even though schemas can be large and change over time.

```
producer: serialize record with schema id 47 -> [magic byte][schema id: 47][avro bytes...]
consumer: read schema id 47 from the record -> fetch schema 47 from registry (cached) -> deserialize
```

**Compatibility modes decide what schema changes are allowed for a subject, checked at registration time:**

| Mode | Allows | Guarantees |
|---|---|---|
| `BACKWARD` | New schema can read data written with the **previous** schema. | Consumers upgrade first, safely — they understand old data with the new schema. |
| `FORWARD` | Data written with the **new** schema can be read by the **previous** schema. | Producers upgrade first, safely — old consumers keep working against new data. |
| `FULL` | Both backward and forward. | Producers and consumers can upgrade in either order. |
| `BACKWARD_TRANSITIVE` / `FORWARD_TRANSITIVE` / `FULL_TRANSITIVE` | Same as above, but checked against **every previous version**, not just the immediately prior one. | Protects against a schema being compatible with v2 but not v1 — a real gap plain `BACKWARD` doesn't catch. |

**Concrete evolution examples** (Avro, the most common case in practice):

- **Adding a field with a default value** — `BACKWARD` compatible. A new-schema consumer reading old data just uses the default for the missing field. This is the single safest, most common evolution.
- **Adding a field with no default** — **not** `BACKWARD` compatible. Old data has no value for that field and no default to fall back to — the new schema can't deserialize it.
- **Removing a field** — `BACKWARD` compatible only if the removed field had a default in the *old* schema (so the old schema itself could be "read" ignoring that field going forward is fine, but going the other way — new consumer reading old data with the now-removed field present — needs the reader schema to just ignore extra fields, which Avro does by default, so this direction is generally fine either way in practice). This is why field defaults are the load-bearing detail in almost every real evolution decision, not the field name or type alone.
- **Changing a field's type** (e.g., `int` → `string`) — generally **not** compatible in any mode without an explicit, registry-supported type-promotion path (Avro allows a few numeric widenings like `int`→`long`, but arbitrary type changes require a new field, not renaming/retyping an old one in place).

**Serialization format choice: Avro vs Protobuf vs JSON Schema.**

| | Avro | Protobuf | JSON Schema |
|---|---|---|---|
| Schema definition | `.avsc` (JSON) | `.proto` | JSON Schema |
| Wire format | Compact binary | Compact binary | Plain JSON (larger) |
| Schema required to deserialize | Yes, always (schema id lookup) | No — self-describing via generated code, though registry integration still tracks compatibility | No — self-describing |
| Ecosystem fit | Deep, historical default in the Kafka/Confluent ecosystem, first-class Kafka Streams/KSQL support | Strong if you already have gRPC/Protobuf elsewhere in your stack | Best when human-readable payloads matter more than size/speed (debugging, low-volume topics) |
| Compatibility checking | Registry-native, mature | Registry-native, mature | Registry-native, less commonly used for this purpose |

Avro remains the most common default specifically in Kafka-centric shops because of how deeply the ecosystem (Kafka Streams, ksqlDB, Kafka Connect converters) assumes it; Protobuf is the common choice when a company standardizes on it across both RPC and streaming; JSON Schema trades wire efficiency for human readability.

## vs other systems

This problem doesn't exist in a synchronous request/response API (REST/gRPC) the same way, because client and server negotiate compatibility on every call, live — an incompatible client simply fails its next request, immediately, and you find out right away. Kafka's asynchronous, long-lived-log model means an incompatible schema change can silently corrupt or break consumption of data written *before* anyone notices — which is why registry-enforced compatibility checks at write time (not read time) are the standard defense.

## Watch out

- **`auto.register.schemas=true` (a common default in dev) lets any producer silently register a new schema version on first use** — fine for local development, dangerous in production, where schema changes should go through the same review/CI process as any other contract change. Set it `false` in production and register schemas explicitly as part of your deploy pipeline.
- **Plain `BACKWARD`/`FORWARD` only checks against the immediately previous version, not the whole history** — a schema can pass a `BACKWARD` check against v2 while still being incompatible with v1's actual data. Use the `_TRANSITIVE` variants when your topic has meaningfully long retention and you can't guarantee every historical version was itself perfectly compatible with its immediate predecessor.
- **A field default in the schema is not the same as a sensible default in your application** — Avro will happily deserialize old data with `0` or `""` for a newly added field; whether that's semantically correct for your domain is your call to make, not the registry's.

## The task

Configure Avro serialization with schema registry integration for a producer writing to the `orders` topic, requiring that new consumers can always read data written by older producer versions (the standard, safest evolution direction), and that schema changes never register implicitly from a running producer.

Write `stub.properties` with:

- `key.serializer=org.apache.kafka.common.serialization.StringSerializer`
- `value.serializer=io.confluent.kafka.serializers.KafkaAvroSerializer`
- `schema.registry.url=http://schema-registry:8081`
- `auto.register.schemas=false` (schemas are registered explicitly via CI/deploy pipeline, not implicitly by a running producer)
- A commented design-answer line stating the compatibility mode: `# compatibility-mode=BACKWARD`
- A commented design-answer line stating the safe evolution rule this setup relies on: `# evolution-rule=new-fields-must-have-defaults`
