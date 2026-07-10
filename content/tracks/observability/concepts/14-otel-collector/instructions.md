# The OpenTelemetry Collector

## What you'll learn

The Collector is the piece that turns "every service exports OTLP somewhere" into an actual production pipeline: a standalone process that receives telemetry, transforms it, and fans it out to one or more backends — Prometheus for metrics, Tempo/Jaeger for traces, without your application code knowing or caring where data ultimately lands. This closing lesson covers the receiver/processor/exporter/pipeline model, the two processors every production config needs (`memory_limiter`, `batch`) and their required order, common transform processors, fan-out to multiple backends, and agent-vs-gateway deployment.

## Key concepts

**The model: receivers → processors → exporters, wired into pipelines.**

- **Receivers** — how data gets *in*. `otlp` (gRPC/HTTP from instrumented services), `prometheus` (scrape existing `/metrics` endpoints, pulling them into the OTel pipeline instead of a separate Prometheus server).
- **Processors** — transform data in flight: filter, batch, rate-limit, add/remove attributes.
- **Exporters** — how data gets *out*: `prometheusremotewrite` (push to Prometheus/Mimir), `otlp` (forward to another Collector or a tracing backend), `otlphttp`, vendor-specific exporters.
- **Pipelines** — named wiring of receivers → processors (ordered) → exporters, one pipeline per signal type (`traces`, `metrics`, `logs`).

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
    endpoint: "http://prometheus:9090/api/v1/write"
  otlp/tempo:
    endpoint: "tempo:4317"

service:
  pipelines:
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [prometheusremotewrite]
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [otlp/tempo]
```

**`memory_limiter` and `batch` — required in nearly every production pipeline, and order matters.** The official, load-bearing ordering rule: **`memory_limiter` first, `batch` last**, in every processor list.

- **`memory_limiter`** protects the Collector process itself from OOMing under a traffic spike — it checks memory usage on an interval and starts refusing/dropping data before the process runs out of memory and crashes (which would lose *everything* in flight, a much worse outcome than dropping some data under backpressure). It must run first so it can reject data before any other processor spends memory/CPU on it.
- **`batch`** groups individual spans/metrics/logs into larger batches before export, dramatically reducing the number of outbound network requests/connections to your backends. It should run *last*, immediately before exporters, so every other transform has already been applied to the data before it's batched and shipped.

Putting `batch` before `memory_limiter`, or omitting `memory_limiter` entirely, is the single most common OTel Collector production misconfiguration — the collector has no backpressure protection and a traffic spike can OOM-kill it, taking down the telemetry pipeline exactly when you need it most (during an incident, which is usually when traffic/error volume spikes).

**Resource and attributes processors — the transform layer between "what the application sent" and "what actually lands in the backend":**

```yaml
processors:
  resource:
    attributes:
      - key: deployment.environment
        value: production
        action: upsert
  attributes:
    actions:
      - key: http.url
        action: delete    # strip potentially sensitive full URLs before export
      - key: team
        value: platform
        action: insert
```

`resource` processor edits Resource-level attributes (the "who," from the fundamentals lesson) uniformly for everything passing through; `attributes` processor edits per-span/per-metric-point attributes. `action: upsert/insert/delete/update` controls whether it can add new, only add if absent, remove, or only modify existing keys — a common real use is stripping high-cardinality or sensitive attributes (raw URLs, query strings) at the Collector rather than trusting every instrumented service to never emit them, which is a natural place to *also* enforce the cardinality discipline from the second lesson of this track, centrally.

**Fan-out to multiple backends** — one pipeline can list multiple exporters, and data is sent to *all* of them:

```yaml
service:
  pipelines:
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [prometheusremotewrite, otlp/vendor-backup]
```

This is how you run Prometheus as your primary metrics backend while also forwarding a copy to a SaaS vendor for long-term retention or a secondary team, without instrumenting twice or standing up two competing agents on every host.

**Agent vs gateway deployment** — two topologies, often used together:

- **Agent** — a Collector instance per host/pod (sidecar or DaemonSet), close to the application, doing lightweight processing (batching, basic filtering) before forwarding onward. Minimizes network hops from the app and can enrich data with host-local context cheaply.
- **Gateway** — a smaller number of centralized Collector instances (a Deployment behind a Service) that agents forward to, doing heavier processing (tail sampling requires seeing a trace's spans in one place, which usually means routing all spans for a given trace to the same gateway instance) and the actual fan-out to backends.

A common production topology: agents (DaemonSet) on every node doing `memory_limiter` + light `batch`, forwarding to a gateway tier doing tail sampling, attribute scrubbing, and the final export/fan-out to Prometheus and a tracing backend.

## vs other tools

Fluent Bit/Fluentd solve the equivalent problem for logs specifically (receivers/parsers/outputs) but predate and aren't signal-unified with metrics/traces the way the OTel Collector is — one Collector binary handles all three signals with one config format. Vendor agents (Datadog Agent, New Relic Infrastructure Agent) bundle a similar receiver/processor/exporter pipeline internally but as a closed, vendor-specific black box; the OTel Collector's pipeline is config-driven and inspectable, which is why "run the OTel Collector, export wherever" has become the default architecture even for teams whose ultimate destination is a commercial vendor.

## Watch out

- **`batch` before `memory_limiter` in a processor list defeats the entire purpose of `memory_limiter`** — by the time data reaches it, it's already been batched (held in memory) by the processor that was supposed to run after it.
- **Tail sampling requires every span of a trace to reach the same Collector instance** — if your agents fan out directly to backends without a gateway tier doing tail sampling, you cannot correctly implement tail sampling (a load balancer routing spans of the same trace to different Collector replicas breaks the "see the whole trace before deciding" requirement); this is the direct reason the gateway tier and its own dedicated load-balancing-by-trace-ID exporter exist in serious deployments.
- **Missing `limit_mib` (or setting it above the container's actual memory limit) on `memory_limiter`** makes it useless — it needs a real ceiling below your container/host's actual available memory to trigger before an OOM kill, not an arbitrary large number.

## The task

Write `collector-config.yaml`: a complete OTel Collector configuration receiving OTLP, transforming, and fanning out metrics to Prometheus and traces to a tracing backend, with a correctly-ordered processor chain.

Requirements:

Under `receivers:`, an `otlp:` block with `protocols: { grpc: {}, http: {} }`.

Under `processors:`, exactly three processors, in this order in the YAML (order in the file should match the required pipeline order):
1. `memory_limiter:` with `check_interval: 1s` and `limit_mib: 512`.
2. `resource:` with `attributes:` a list containing one entry `{ key: deployment.environment, value: production, action: upsert }`.
3. `batch:` with `timeout: 5s` and `send_batch_size: 1024`.

Under `exporters:`, two exporters:
1. `prometheusremotewrite:` with `endpoint: "http://prometheus:9090/api/v1/write"`.
2. `otlp/tempo:` with `endpoint: "tempo:4317"`.

Under `service.pipelines:`, two pipelines:
1. `metrics:` with `receivers: [otlp]`, `processors: [memory_limiter, resource, batch]`, `exporters: [prometheusremotewrite]`.
2. `traces:` with `receivers: [otlp]`, `processors: [memory_limiter, resource, batch]`, `exporters: [otlp/tempo]`.

Expected shape:

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

The `processors: [memory_limiter, resource, batch]` order in both pipelines is the load-bearing detail this task checks — `memory_limiter` must come first (backpressure before any other work) and `batch` must come last (batching happens after every other transform, immediately before export).
