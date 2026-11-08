## What you build

You write the topic configuration for `clickstream`, a high-volume event topic, in `stub.properties`. Kafka is a distributed, append-only commit log. Ordering, delivery, replication and consumer groups all follow from that design.

## Key concepts

### A partition is the physical log of a topic

A topic is a named category, for example `orders` or `clickstream`. Kafka splits each topic into one or more **partitions**. Each partition is an ordered, append-only sequence of records in segment files on a broker's disk.

```
topic: orders (3 partitions)
p0: [m0][m1][m2][m3] -> broker 1
p1: [m0][m1][m2]     -> broker 2
p2: [m0][m1][m2][m3] -> broker 3
```

Segment files have names such as `00000000000000000000.log` and `00000000000000368769.log`. Kafka never changes a record in place. A producer appends to the tail. A consumer reads forward from a position.

### Order exists only inside one partition

Each partition lives on a broker, with replicas on other brokers. The partition is the unit that Kafka spreads across the cluster and across consumers. A topic has no global order, only per-partition order.

### An offset is a bookmark inside one partition

The broker gives each record a number when it appends it: 0, 1, 2, 3. This number is the **offset**, and it always increases. A consumer tracks the offset it has reached in *each* partition it reads.

An offset means nothing without its partition. `(orders, partition 1, offset 4502)` identifies one record. `offset 4502` alone identifies nothing.

```
partition 1:
offset  0   1   2   3   4   5   6
       [A] [B] [C] [D] [E] [F] [G]
                ^
committed 3: next read is offset 3 ("D")
```

To replay data, you move a *consumer* to an earlier offset on a *partition*. Kafka has no "rewind the topic", only "rewind this partition's read position".

### The partition count limits consumer parallelism

Inside one consumer group, Kafka gives each partition to exactly one consumer at a time.

- With 12 partitions, at most 12 consumers in one group do useful work. A 13th consumer stays idle.
- Fewer consumers than partitions is fine. Each consumer then reads more than one partition.
- You can add partitions later with `kafka-topics.sh --alter --partitions N`. You can never remove them.

Adding partitions changes the partition of every existing key. The keys lesson covers this. Plan the partition count for order and parallelism at the start.

### Size partitions from throughput and parallelism

A rule of thumb:

```
partitions >= max(
  target_throughput
    / per_partition_throughput,
  max_consumer_parallelism)
```

One partition on modern hardware writes about 5 to 20 MB/s. The rate depends on record size, compression and replication. A 100 MB/s target alone gives 10 to 20 partitions. Round up to the consumer parallelism you want.

### More partitions have a cost

Each partition is an open file handle on every broker with a replica, times the replication factor. Each one adds controller metadata. More partitions also make leader election slower when a broker fails. Thousands of partitions per broker is a real operational limit, so do not add spare partitions with no need.

## Watch out

- "Ordered" without a scope is wrong. Kafka orders records only inside one partition.
- Two records with different keys usually go to different partitions. They have no relative order, even from one producer.
- An offset is not a timestamp or a row count. Two partitions at offset 500 hold unrelated data.
- You cannot reduce the partition count. To shrink, you must create a new topic and move the data.
- Too few partitions is the safer mistake. You can add partitions later, but not remove them.

## The task

You create the configuration for `clickstream`, a high-volume event topic. You pass the file to `kafka-topics.sh --create --topic clickstream --config <file>`. `--partitions` and `--replication-factor` are CLI flags, not `--config` entries. So you record them as comment lines.

Write `stub.properties` with these rules:

1. Add the comment `# topic=clickstream`.
2. Add the comment `# partitions=12`. One consumer group runs 12 consumers, and all 12 must work in parallel.
3. Add the comment `# replication.factor=3`. The topic must survive one broker failure: one leader and 2 followers.
4. Set `cleanup.policy=delete`. This topic is a plain event log, not a compacted changelog.
5. Set `retention.ms=604800000`. That is exactly 7 days, for reprocessing.
6. Set `min.insync.replicas=2`. At least 2 in-sync replicas must acknowledge each write.

The file must not set `cleanup.policy=compact`. It must not contain the text `TODO`.

Use exactly this content:

```properties
# topic=clickstream
# partitions=12
# replication.factor=3
cleanup.policy=delete
retention.ms=604800000
min.insync.replicas=2
```
