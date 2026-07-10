# Brokers and KRaft

## What you'll learn

Every Kafka behavior you configure eventually runs on a **broker** — a JVM process that owns some partitions, serves reads/writes, and participates in cluster metadata. This lesson covers broker identity, the listener/advertised-listener split that trips up nearly everyone the first time they run Kafka behind a proxy or in a container, and KRaft — the Raft-based consensus mode that replaced ZooKeeper as of Kafka 3.3+ (and is the *only* mode as of Kafka 4.0).

## Key concepts

**A broker is identified by `node.id`** (the modern name for what used to be `broker.id` in ZooKeeper mode). It must be a unique non-negative integer across the cluster. Brokers use this id in partition leader/replica metadata (`Leader: 2`, `Replicas: [1,2,3]`) — it's how the cluster refers to "which machine."

**Listeners are where the broker binds sockets; advertised listeners are what it tells clients to connect to.** This split exists because the address a broker binds to (often `0.0.0.0` or an internal interface) is frequently *not* the address a client should use to reach it — think Docker port mapping, a load balancer, or a broker with separate internal/external NICs.

```properties
listeners=PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093
advertised.listeners=PLAINTEXT://broker-3.prod.internal:9092
```

The connection sequence that makes this matter: a client bootstraps against *any* broker, asks "who's the leader for partition X?", and the broker answers with the address from **its own `advertised.listeners`** — not the socket the client happened to connect through. If that advertised address isn't reachable from the client (e.g., it's a Docker-internal hostname and the client is outside the container network), the client fails after the *first* connection succeeds, which is exactly why this bug is so confusing to debug: bootstrap works, then everything after it times out.

**KRaft replaces ZooKeeper with a built-in Raft-based metadata quorum.** Historically, Kafka brokers stored cluster metadata (topic configs, partition assignments, ACLs) in an external ZooKeeper ensemble. Since Kafka 3.3 KRaft is production-ready and the default for new clusters; Kafka 4.0 removed ZooKeeper support entirely. In KRaft mode, a subset of nodes act as the **controller quorum** using Raft consensus directly inside Kafka — no external system.

```properties
process.roles=broker,controller
node.id=3
controller.quorum.voters=1@broker-1.internal:9093,2@broker-2.internal:9093,3@broker-3.internal:9093
controller.listener.names=CONTROLLER
```

- `process.roles` — `broker`, `controller`, or `broker,controller` (a "combined" node doing both — common for small/dev clusters; larger production clusters often run **dedicated controller-only nodes** to isolate metadata-plane load from data-plane load).
- `controller.quorum.voters` — the fixed list of `{node.id}@{host}:{port}` for every node that participates in the Raft quorum. This list must be identical across every node's config in the cluster (it's how each node finds the quorum on startup).
- One controller is elected **active controller** (the Raft leader for metadata) at any time; the others are quorum followers, ready to take over on failure — this replaces ZooKeeper's own leader election.

**`inter.broker.listener.name`** tells brokers which listener to use when talking to *each other* (replication traffic, etc.) — this can differ from the listener clients use, e.g., an internal-only network for broker-to-broker traffic and a public one for clients.

## vs other systems

| | ZooKeeper mode (legacy) | KRaft mode |
|---|---|---|
| Metadata store | External ZooKeeper ensemble | Internal Raft quorum among Kafka nodes |
| Extra system to operate | Yes (separate ZK cluster) | No |
| Controller failover | ZK-mediated leader election | Raft leader election, sub-second |
| Max partitions (practical) | Lower — ZK read/write is a bottleneck | Higher — metadata log scales better |
| Status | Removed in Kafka 4.0 | Default since 3.3+, only option in 4.0+ |

If you've operated etcd-backed systems (Kubernetes itself, Consul), KRaft's quorum concept will feel familiar — it's the same Raft-log-of-metadata-changes idea, just embedded in Kafka's own process instead of a separate binary.

## Watch out

- **The advertised-listeners bug is the #1 "Kafka doesn't work in Docker/K8s" issue.** If you don't set `advertised.listeners` explicitly, Kafka defaults to advertising whatever it bound to, which inside a container is often a hostname or IP unreachable from outside. Always set it explicitly for anything beyond a single-process local dev setup.
- **`controller.quorum.voters` must match, byte-for-byte, across every node in the cluster.** A typo or a mismatched port on just one node causes that node to silently fail to join the quorum.
- **You cannot mix ZooKeeper mode and KRaft mode in one cluster**, and migrating an existing ZK cluster to KRaft is a defined, multi-step migration procedure — not a config flag flip.

## The task

Write `server.properties` for **node 3** of a 3-node KRaft cluster where every node is a **combined** broker+controller. The cluster's controller quorum is:

- node 1 at `broker-1.internal:9093`
- node 2 at `broker-2.internal:9093`
- node 3 at `broker-3.internal:9093` (this node)

Requirements:

- This node's id is `3`.
- It acts as both broker and controller.
- It binds a client-facing `PLAINTEXT` listener on port `9092` and a `CONTROLLER` listener on port `9093`, both bound to `0.0.0.0` so they accept connections on any interface.
- Clients outside the container network must reach this broker at `broker-3.internal:9092` — set the advertised listener accordingly (the controller listener is never advertised to clients, only the broker listener is).
- The controller quorum voters list includes all three nodes, in `node.id@host:port` form.
- `controller.listener.names` is set to `CONTROLLER`.
- Broker-to-broker (inter-broker) traffic uses the `PLAINTEXT` listener.
- Log data is stored at `/var/lib/kafka/data`.

Use exactly these keys:

```properties
node.id=3
process.roles=broker,controller
listeners=PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093
advertised.listeners=PLAINTEXT://broker-3.internal:9092
controller.listener.names=CONTROLLER
inter.broker.listener.name=PLAINTEXT
controller.quorum.voters=1@broker-1.internal:9093,2@broker-2.internal:9093,3@broker-3.internal:9093
log.dirs=/var/lib/kafka/data
```
