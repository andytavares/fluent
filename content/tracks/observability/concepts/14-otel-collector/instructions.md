## What you build

You write an OpenTelemetry Collector configuration. It receives OTLP, transforms the data in a correctly ordered processor chain, and sends metrics to Prometheus and traces to Tempo. This lesson builds on **OpenTelemetry Fundamentals** and **OpenTelemetry Traces**.

## Key concepts

### The Collector is a separate pipeline process

The Collector receives telemetry, transforms it and sends it to one or more backends. Your application code does not know where the data lands.

- **Receivers** bring data in. `otlp` takes gRPC or HTTP from instrumented services. `prometheus` scrapes existing `/metrics` endpoints into the pipeline.
- **Processors** transform data in flight: filter, batch, limit, add or remove attributes.
- **Exporters** send data out. `prometheusremotewrite` pushes to Prometheus or Mimir. `otlp` forwards to another Collector or a trace backend. `otlphttp` and vendor exporters also exist.
- **Pipelines** connect receivers, ordered processors and exporters. Each pipeline carries one signal type: `traces`, `metrics` or `logs`.

```yaml
receivers:
  otlp:
    protocols:
      grpc:
      http:

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 512
  batch:
    timeout: 5s
    send_batch_size: 1024

exporters:
  prometheusremotewrite:
    endpoint: >-
      http://prometheus:9090/api/v1/write
  otlp/tempo:
    endpoint: "tempo:4317"

service:
  pipelines:
    metrics:
      receivers: [otlp]
      processors:
        [memory_limiter, batch]
      exporters: [prometheusremotewrite]
    traces:
      receivers: [otlp]
      processors:
        [memory_limiter, batch]
      exporters: [otlp/tempo]
```

### `memory_limiter` goes first, `batch` goes last

Almost every production pipeline needs both processors, in this order in every processor list.

- `memory_limiter` protects the Collector from running out of memory in a traffic spike. It checks memory use on an interval and refuses data before the process crashes. A crash loses all data in flight, which is worse than dropping some data. It runs first, so it rejects data before other processors spend memory or CPU on it.
- `batch` groups spans, metrics and logs into larger batches before export. This cuts the number of outgoing requests and connections. It runs last, right before the exporters, so every other transform applies first.

The most common production mistake is `batch` before `memory_limiter`, or no `memory_limiter` at all. The Collector then has no backpressure protection. A traffic spike can kill it with an out-of-memory error during an incident, when you need telemetry most.

### The resource and attributes processors transform data

```yaml
processors:
  resource:
    attributes:
      - key: deployment.environment
        value: production
        action: upsert
  attributes:
    actions:
      # strip full URLs, which can hold
      # sensitive data, before export
      - key: http.url
        action: delete
      - key: team
        value: platform
        action: insert
```

The `resource` processor edits resource attributes, the "who", for all data that passes through. The `attributes` processor edits the attributes of each span or metric point. The `action` sets the behavior:

- `upsert`: add the key, or change it if it exists.
- `insert`: add the key only if it is absent.
- `update`: change the key only if it exists.
- `delete`: remove the key.

A common use is to strip high-cardinality or sensitive attributes, such as raw URLs and query strings. The Collector then enforces the cardinality rules from **Observability Foundations** in one place. You do not trust every service to never emit them.

### One pipeline can fan out to several backends

A pipeline can list several exporters, and the Collector sends the data to all of them.

```yaml
service:
  pipelines:
    metrics:
      receivers: [otlp]
      processors:
        [memory_limiter, batch]
      exporters:
        - prometheusremotewrite
        - otlp/vendor-backup
```

Prometheus stays the main metrics backend, and a SaaS vendor gets a copy for long retention or another team. You do not instrument twice or run two agents on every host.

### Agents and gateways are two deployment tiers

- **Agent**: one Collector per host or pod, as a sidecar or DaemonSet. It does light work, such as batching and basic filtering, then forwards. It adds few network hops and can add host context cheaply.
- **Gateway**: a few central Collectors, as a Deployment behind a Service, that agents forward to. They do the heavy work and the fan-out to backends.

Tail sampling must see all spans of a trace in one place. So all spans of one trace usually go to the same gateway instance. A common topology: agents on every node run `memory_limiter` and a light `batch`. They forward to a gateway tier that does tail sampling, attribute scrubbing and the final export.

Fluent Bit and Fluentd solve the same problem for logs only. One Collector binary handles all three signals with one configuration format.

## Watch out

- `batch` before `memory_limiter` defeats `memory_limiter`. The data is already held in memory in batches when it arrives.
- Tail sampling needs every span of a trace on the same Collector instance.
- A load balancer that sends spans of one trace to different replicas breaks tail sampling.
- That is why gateway tiers use an exporter that load-balances by trace ID.
- `memory_limiter` with no `limit_mib` does not protect the process.
- A `limit_mib` above the container memory limit also fails. Set it below the memory you have.

## The task

Write `stub.yaml`: the Collector configuration `collector-config.yaml`. It receives OTLP, sends metrics to Prometheus and sends traces to Tempo.

1. Under `receivers:`, add an `otlp:` block with `protocols:` containing `grpc: {}` and `http: {}`.
2. Under `processors:`, define exactly three processors, in this order in the file.
3. `memory_limiter:` with `check_interval: 1s` and `limit_mib: 512`.
4. `resource:` with an `attributes:` list of one entry: `key: deployment.environment`, `value: production`, `action: upsert`.
5. `batch:` with `timeout: 5s` and `send_batch_size: 1024`.
6. Under `exporters:`, add `prometheusremotewrite:` with `endpoint: "http://prometheus:9090/api/v1/write"`.
7. Add `otlp/tempo:` with `endpoint: "tempo:4317"`.
8. Under `service.pipelines:`, add a `metrics:` pipeline: `receivers: [otlp]`, exporter `prometheusremotewrite`.
9. Add a `traces:` pipeline: `receivers: [otlp]`, exporter `otlp/tempo`.
10. Both pipelines use `processors: [memory_limiter, resource, batch]`, on one line, in this order.

`memory_limiter` comes first, for backpressure before any other work. `batch` comes last, right before export. Do not leave `TODO` comments in the file.

```yaml
receivers:
  otlp:
    protocols:
      grpc: {}
      http: {}

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 512
  resource:
    attributes:
      - key: deployment.environment
        value: production
        action: upsert
  batch:
    timeout: 5s
    send_batch_size: 1024

exporters:
  prometheusremotewrite:
    endpoint: "http://prometheus:9090/api/v1/write"
  otlp/tempo:
    endpoint: "tempo:4317"

service:
  pipelines:
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, resource, batch]
      exporters: [prometheusremotewrite]
    traces:
      receivers: [otlp]
      processors: [memory_limiter, resource, batch]
      exporters: [otlp/tempo]
```
