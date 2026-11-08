## What you build

You record the partitioning design for an `orders` topic in `stub.properties`. The key decides the partition, and the partition decides the order. This lesson builds on **Topics, Partitions, and Offsets** and **Producers**.

## Key concepts

### The key picks the partition

The default partitioner hashes the key with murmur2. It divides the hash by the partition count and uses the remainder. The same key always goes to the same partition while the partition count stays the same.

```
# 12 partitions
customer-42 -> murmur2 -> partition 7
customer-99 -> murmur2 -> partition 2
```

A consumer of partition 7 gets the events for `customer-42` in the order the producer sent them. SQS FIFO scopes order to a message group id in the same way.

### Order exists only inside one partition

Kafka gives no order across partitions. Two records with different keys can arrive in any order, even from one producer with `acks=all`. For one global order, the topic needs one partition. That limits throughput and consumer parallelism to 1.

### Records with no key use the sticky partitioner

A record with no key has nothing to hash. Since KIP-480, the producer sends a full batch to one partition, then moves to the next. This improves batching. Records with no key have no order between them.

### A hot key overloads one partition

One key with very high volume sends all its records to one partition. That partition and its consumer fall behind, while the others stay idle. Three fixes:

- **Salt the key.** Add a shard suffix, for example `customer-42#3`. The order then holds only inside each shard.
- **Write a custom partitioner.** Set `partitioner.class` to send known hot keys to a reserved set of partitions.
- **Size for the skew.** If only a few keys are hot, add partitions and consumers for the worst case.

### More partitions move every key

The partition is `hash % partitionCount`. Change the count and most keys go to a new partition. Old records stay on the old partition, so the history of one key splits in two. Create enough partitions at the start.

## Watch out

- "It's ordered" is incomplete. Say "ordered within a partition, for one key."
- Do not add partitions to a topic that needs per-key history. Plan a migration first.
- A custom partitioner must give the same result for the same key every time. Do not read the clock, random values or external state.
- Kafka 3.3 deprecated `DefaultPartitioner` (KIP-794), and Kafka 4.0 removed it. This task targets a 3.x client, where the class still loads. On 4.0 or later, leave `partitioner.class` unset for key hashing.

## The task

The `orders` topic has 12 partitions and uses `customer_id` as the key. A few large customers produce most of the events.

Write `stub.properties` with these six lines:

1. A comment with the topic name.
2. A comment with the key field.
3. A comment with the partition count.
4. `partitioner.class` set to the default partitioner, as a Kafka 3.x client needs.
5. A comment with the scope of the order guarantee.
6. A comment with the hot-key fix: a salted composite key.

Use exactly this content:

```properties
# topic=orders
# key=customer_id
# partitions=12
partitioner.class=org.apache.kafka.clients.producer.internals.DefaultPartitioner
# ordering-guarantee=per-partition-only
# hot-key-mitigation=salted-composite-key
```
