## What you build

You write `server.properties` for one node of a 3-node KRaft cluster. A **broker** is a JVM process that owns partitions, serves reads and writes, and takes part in cluster metadata. This lesson builds on **Topics, Partitions, and Offsets**.

## Key concepts

### `node.id` identifies a broker

`node.id` is the modern name for `broker.id` from ZooKeeper mode. It must be a unique non-negative integer in the cluster. Partition metadata uses it to name machines, for example `Leader: 2` and `Replicas: [1,2,3]`.

### Listeners bind sockets; advertised listeners tell clients where to connect

The broker binds to the addresses in `listeners`, often `0.0.0.0` or an internal interface. Clients often cannot use that address. Docker port mapping, a load balancer, or separate internal and external NICs all cause this gap.

```properties
listeners=PLAINTEXT://0.0.0.0:9092,\
  CONTROLLER://0.0.0.0:9093
advertised.listeners=\
  PLAINTEXT://broker-3.prod.internal:9092
```

A client first connects to *any* broker and asks for the leader of a partition. The broker answers with the address in **its own `advertised.listeners`**, not the socket the client used. If the client cannot reach that address, the first connection works and every request after it times out.

### KRaft replaces ZooKeeper with a built-in Raft quorum

Older Kafka clusters stored metadata in an external ZooKeeper ensemble: topic configs, partition assignments and ACLs. In KRaft mode, some nodes form the **controller quorum** and run Raft consensus inside Kafka. KRaft is production ready for new clusters since Kafka 3.3. Kafka 4.0 removed ZooKeeper support.

```properties
process.roles=broker,controller
node.id=3
controller.quorum.voters=\
  1@broker-1.internal:9093,\
  2@broker-2.internal:9093,\
  3@broker-3.internal:9093
controller.listener.names=CONTROLLER
```

- `process.roles` is `broker`, `controller`, or `broker,controller`. A combined node does both, which is common for small and dev clusters. Large production clusters often run **dedicated controller nodes** to keep metadata load away from data traffic.
- `controller.quorum.voters` lists each quorum member as `{node.id}@{host}:{port}`. The list must be identical on every node, because each node finds the quorum from it at startup.
- One controller is the **active controller**, the Raft leader for metadata. The others follow and take over on failure. This replaces ZooKeeper's leader election.

Without ZooKeeper, there is no extra system to operate. Controller failover uses Raft leader election, and the metadata log supports more partitions than ZooKeeper did. KRaft works like the Raft metadata log in etcd, which backs Kubernetes, but runs inside the Kafka process.

### `inter.broker.listener.name` picks the listener between brokers

Brokers use this listener for traffic to each other, such as replication. It can differ from the client listener. For example, brokers can talk on an internal network while clients use a public one.

## Watch out

- An unset `advertised.listeners` is the top cause of "Kafka fails in Docker or Kubernetes". Kafka then advertises its bind address.
- Clients outside a container often cannot reach its bind address. Set `advertised.listeners` for anything beyond a one-process local setup.
- `controller.quorum.voters` must match byte for byte on every node. One typo or wrong port, and that node silently fails to join.
- You cannot mix ZooKeeper mode and KRaft mode in one cluster.
- A move from ZooKeeper to KRaft is a multi-step migration procedure, not one config flag.

## The task

Write `stub.properties` with the `server.properties` for **node 3** of a 3-node KRaft cluster. Every node is a combined broker and controller. The controller quorum is:

- node 1 at `broker-1.internal:9093`
- node 2 at `broker-2.internal:9093`
- node 3 at `broker-3.internal:9093` (this node)

Follow these rules:

1. Set the node id to `3`.
2. Make the node both a broker and a controller.
3. Bind a `PLAINTEXT` listener on port `9092` and a `CONTROLLER` listener on port `9093`.
4. Bind both listeners to `0.0.0.0`, so they accept connections on any interface.
5. Advertise `PLAINTEXT://broker-3.internal:9092` to clients.
6. Do not advertise the `CONTROLLER` listener. Clients never use it.
7. List all three nodes as quorum voters, in `node.id@host:port` form.
8. Set `controller.listener.names` to `CONTROLLER`.
9. Send broker-to-broker traffic over the `PLAINTEXT` listener.
10. Store log data at `/var/lib/kafka/data`.

The file must not contain the text `TODO`.

Use exactly this content:

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
