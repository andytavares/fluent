## What you build

You write a production configuration for the `payments` topic and its clients in `stub.properties`. It joins the best practice of every earlier concept. You also learn the metrics that predict an incident, capacity math and quotas. This lesson builds on **Kafka Streams** and **Replication and ISR**.

## Key concepts

### Four metrics predict most incidents

- **Consumer lag** (`records-lag-max`, or latest offset minus committed offset): how far a group is behind the head of the log. Steady growth means the group cannot keep up. Add consumers, up to the partition count, or find the slow processing. A spike that recovers is often a deploy or a rebalance.
- **Under-replicated partitions** (`UnderReplicatedPartitions`, broker JMX): partitions whose ISR is smaller than the replica set. Non-zero means durability margin is low now, even while writes succeed. A `min.insync.replicas` rejection can be one failure away.
- **Request latency percentiles** (produce and fetch `p99`, `p999`, broker JMX): tail latency, not the average. A good p50 with a p99 50x higher means many requests suffer. Common causes: GC pauses, disk I/O contention, a noisy topic on the same broker.
- **ISR shrink rate** (`IsrShrinksPerSec`, broker JMX): how often replicas leave the ISR. A high or rising rate means followers cannot keep up with the leader. Common causes: too little network or disk throughput, or an overloaded leader. It threatens the `min.insync.replicas` guarantee.

Consumer lag and under-replicated partitions together catch the two most common incidents. Lag shows "we are falling behind". Under-replication shows "our durability margin is gone". Both warn you before an outage.

### Capacity planning adds storage and cluster limits

The Topics lesson sizing rule is `partitions ≥ max(throughput / per-partition throughput, consumer parallelism)`. Production planning adds storage per topic. Multiply partitions, replication factor, average message size and messages over the retention window.

An error under-provisions disk or pays for unused capacity. The total partitions per broker, across all topics, also affect controller metadata size and failover time. Plan each topic with the cluster-wide total in mind.

### Quotas stop one client from starving the others

Kafka enforces byte-rate and request-rate quotas per client (`client.id`) or per authenticated user. Quotas are a dynamic cluster-wide config, not a `server.properties` entry:

```
QUOTAS='producer_byte_rate=...'
QUOTAS+=',consumer_byte_rate=...'
kafka-configs.sh \
  --entity-type clients \
  --entity-name <id> \
  --add-config "$QUOTAS"
```

With no quotas, one bad or new high-volume client can saturate broker network and disk I/O. Every other client's latency then gets worse. Set quotas as soon as two teams or services share a cluster.

### The production checklist joins every concept

- **Topics**: size partitions for throughput and consumer parallelism (Topics). Set `min.insync.replicas = replication.factor - 1` (Replication). Set an explicit `cleanup.policy` and retention for an event log or a changelog (Retention).
- **Brokers**: set `advertised.listeners` to addresses that real client networks can reach (Brokers). Set `unclean.leader.election.enable=false`, unless stale data is better than unavailability (Replication).
- **Producers**: use `acks=all` and `enable.idempotence=true` where correctness matters. Tune `linger.ms`, `batch.size` and `compression.type` for throughput elsewhere (Producers). Use `transactional.id` only for cross-partition atomicity (Transactions).
- **Consumers**: tune `session.timeout.ms` and `max.poll.interval.ms` to the failure each one detects; do not confuse them (Consumers). Commit manually, after processing (Offset Management). Use `CooperativeStickyAssignor` when stop-the-world eager rebalances hurt the group.
- **Observability**: alert on consumer lag, under-replicated partitions, request latency percentiles and ISR shrink rate. A dashboard alone is not enough.

These priorities match any replicated, log-structured system, such as etcd or Cassandra. Kafka measures lag per group per partition, so alert per group, not only on cluster totals.

## Watch out

- A dashboard with no alerts is not monitoring. Nobody looks at it until the outage.
- Give consumer lag, under-replicated partitions, p99 latency and ISR shrink rate alert thresholds.
- Averages hide tail latency. Alert on p99 and p999, where users feel pain first.
- Set quotas on a shared cluster before the first noisy-neighbor incident, not after it.

## The task

Write the production configuration for the `payments` topic and its infrastructure. `stub.properties` has five sections. Each section starts with its exact marker line.

1. **Topic config**: `min.insync.replicas=2`, `cleanup.policy=delete`, `retention.ms=604800000` (7 days).

2. **Broker config**: `default.replication.factor=3`, `unclean.leader.election.enable=false`.

3. **Producer config**: `acks=all`, `enable.idempotence=true`, `compression.type=lz4`, `linger.ms=10`.

4. **Consumer config**: `session.timeout.ms=45000`, `max.poll.interval.ms=300000`, `enable.auto.commit=false`. Set `partition.assignment.strategy` to the `CooperativeStickyAssignor` class.

5. **Monitoring**: four comment lines, one for each metric this configuration needs watched.

Use exactly this content:

```properties
# === topic config ===
min.insync.replicas=2
cleanup.policy=delete
retention.ms=604800000

# === broker config ===
default.replication.factor=3
unclean.leader.election.enable=false

# === producer config ===
acks=all
enable.idempotence=true
compression.type=lz4
linger.ms=10

# === consumer config ===
session.timeout.ms=45000
max.poll.interval.ms=300000
enable.auto.commit=false
partition.assignment.strategy=org.apache.kafka.clients.consumer.CooperativeStickyAssignor

# === monitoring ===
# monitor=consumer-lag
# monitor=under-replicated-partitions
# monitor=request-latency-p99
# monitor=isr-shrink-rate
```
