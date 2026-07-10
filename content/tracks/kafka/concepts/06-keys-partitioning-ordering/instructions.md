# Keys, Partitioning, and Ordering

## What you'll learn

Which partition a record lands in isn't random — it's a deterministic function of the key, and that determinism is the entire mechanism behind Kafka's ordering guarantee. This lesson covers exactly how keys map to partitions, why "ordering" only ever means "within a partition," and the two operational traps that catch people who assume otherwise: hot-key skew and partition-count changes silently breaking key routing.

## Key concepts

**The default partitioner hashes the key to choose a partition, deterministically.** With a non-null key, `DefaultPartitioner` computes `murmur2(key) % numPartitions` (roughly — modern versions add a small amount of extra logic, but the core is a stable hash mod partition count). The same key **always** maps to the same partition, as long as the partition count doesn't change. This is what gives you ordering: every record with key `customer-42` goes to the same partition, in the order it was produced, so a consumer reading that partition sees `customer-42`'s events in order.

```
key "customer-42"  --murmur2 hash--> partition 7   (always, while partitions=12)
key "customer-99"  --murmur2 hash--> partition 2   (always, while partitions=12)
```

**Ordering is per-partition, full stop — there is no cross-partition ordering guarantee, ever.** Two records with different keys landing on different partitions have no defined relative order, even if they were produced by the same producer, back to back, with `acks=all`. If your application logic implicitly assumes "the order I called `send()` in is the order everything downstream sees globally," that assumption breaks the moment two different keys are involved. The only way to get global ordering is a single partition for the whole topic — which caps your throughput and consumer parallelism at 1 (see the topics lesson).

**Null keys use round-robin-ish "sticky" partitioning, not a hash.** When a record has no key, there's nothing to hash — modern Kafka producers (since KIP-480) use the **sticky partitioner**: it picks one partition and sends an entire *batch* of null-key records to it before switching to another partition (rather than round-robining per-record), which improves batching efficiency. Null-keyed records have no ordering relationship to each other at all — they're explicitly unordered by design, so this is safe.

**Hot keys cause partition skew — one key with disproportionate volume overloads one partition (and the consumer assigned to it), while every other partition/consumer sits comfortably under load.** This is a data-distribution problem, not a Kafka bug — some real-world key distributions genuinely are skewed (a small number of extremely active accounts, a viral piece of content, a large customer tenant). Mitigations:

- **Composite/salted keys** — append a shard suffix to spread one hot logical key across N physical partitions (e.g., `customer-42#3` instead of `customer-42`), at the cost of losing strict per-entity ordering (you now only get ordering within each shard).
- **A custom partitioner** — override `partitioner.class` to implement key-aware logic beyond a plain hash (e.g., explicitly route known-hot keys to a dedicated pool of partitions).
- **Accept the skew and size for it** — if it's a handful of keys, sometimes the simplest fix is over-provisioning partitions and consumer capacity for the worst case, rather than adding partitioning complexity.

**Changing partition count remaps every key.** `murmur2(key) % numPartitions` depends on `numPartitions` — increase the partition count and the modulo changes, so keys that used to land on partition 3 may now land on partition 9. This isn't a gradual migration; it's instantaneous and total for all *new* writes the moment the partition count changes, while all the *old* data for that key sits wherever it was written before, on the old partition. Any code or operational assumption relying on "this key's history is all in one partition" breaks retroactively for any key whose new hash target differs from its old one. This is the single strongest argument for provisioning partition count generously up front (see the topics lesson) rather than planning to grow it later for a topic where per-key ordering matters.

## vs other systems

Traditional queue systems with "FIFO" modes (SQS FIFO, for instance) typically scope ordering to a "message group id," which is directly analogous to Kafka's partition key — the same principle (ordering only within a shard/group, parallelism across shards/groups) shows up anywhere a system needs both ordering and horizontal scale simultaneously. What's distinctly Kafka is that the *mapping itself* (hash mod partition count) is exposed and stable, rather than hidden — which is powerful (you can reason about and even predict routing) but also the reason partition-count changes have the blast radius they do.

## Watch out

- **"It's ordered" without saying "within a partition, for a given key" is always an incomplete (and usually wrong) claim.**
- **Don't increase partition count on a topic where per-key history-in-one-partition matters**, without a deliberate migration plan — it silently and permanently changes where new records for existing keys land, while old records stay put.
- **A custom partitioner is a footgun if it isn't deterministic and pure** — any partitioner logic that depends on wall-clock time, external state, or randomness breaks the "same key always same partition" guarantee that ordering depends on.

## The task

You're documenting the partitioning design for the `orders` topic, keyed by `customer_id`, at **12** partitions, where a handful of very large customers produce disproportionately more order events than everyone else (hot-key skew).

Write `stub.properties` recording:

- The producer uses the standard hash-based default partitioner (no custom partitioner class).
- Three commented design-answer lines stating: the key field used for partitioning, the true scope of the ordering guarantee this setup provides, and the chosen mitigation for the hot-key skew problem described above (a salted/composite key approach).
- A commented metadata line recording the topic's partition count, since it's directly relevant to why the ordering guarantee and hot-key mitigation are scoped the way they are.

Use exactly this shape:

```properties
# topic=orders
# key=customer_id
# partitions=12
partitioner.class=org.apache.kafka.clients.producer.internals.DefaultPartitioner
# ordering-guarantee=per-partition-only
# hot-key-mitigation=salted-composite-key
```
