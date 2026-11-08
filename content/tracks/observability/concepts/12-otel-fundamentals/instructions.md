## What you build

You write an OpenTelemetry (OTel) SDK configuration for a service: its resource attributes, its instrumentation and an OTLP exporter. This lesson builds on **Observability Foundations** and **Instrumenting Services**.

## Key concepts

### OTel separates instrumentation from the backend

Before OTel, you instrumented with one vendor SDK, such as Datadog, New Relic or the Prometheus client. A new backend meant new instrumentation in every service. OTel is a CNCF standard, the merger of OpenTracing and OpenCensus. You instrument once against the OTel API. You configure separately where the SDK exports: Prometheus, Jaeger, Tempo, or any vendor with OTLP ingest.

For a new backend, you then change only the configuration. Every major vendor, Datadog and New Relic included, now ingests OTLP directly.

### One project covers metrics, traces and logs

OTel defines all three signal types with one data model, one SDK design and one export protocol. Before, each signal needed its own tool, agent and format.

### Libraries use the API, applications set up the SDK

The **API** is what code calls: `tracer.start_span(...)`, `meter.create_counter(...)`. The **SDK** implements it: samplers, processors, exporters. Library authors depend only on the API, so a shared library forces no SDK or backend on its users. The application sets up the SDK once at startup, with its exporters and sampling. Without an SDK, API calls do nothing, so an instrumented library works in any application.

### A resource says who emits the data

A `Resource` is a fixed set of attributes that describes the process, pod or host. The SDK sets it once at startup and adds it to every signal. It is the OTel version of Prometheus target labels.

```yaml
resource:
  attributes:
    service.name: checkout-api
    service.version: 2.4.1
    deployment.environment: production
    k8s.pod.name: checkout-api-7d9f8c-x2kq1
```

### Semantic conventions give attributes one meaning

Semantic conventions are the attribute names that OTel publishes for common ideas: `http.request.method`, `http.response.status_code`, `db.system`, `k8s.pod.name`. Two teams with two libraries then produce attributes you can query together. They are the industry-wide version of the Prometheus naming conventions.

### Auto and manual instrumentation work together

Auto-instrumentation hooks into the runtime: a Java agent, the Python `opentelemetry-instrument` wrapper, .NET profiler hooks. It instruments known frameworks, such as your HTTP server and database driver, with no code changes. You get RED-style spans and metrics at those boundaries.

Manual instrumentation is your own API calls in business logic, for domain values the agent cannot know. Examples: the time to compute a pricing quote, the number of items in a cart. Production systems use both.

### OTLP is the wire protocol

The OpenTelemetry Protocol (OTLP) is what SDKs export over: gRPC or HTTP/protobuf. The target is a Collector or a backend that speaks OTLP. OTLP is the shared format, whatever the destination.

```yaml
exporter:
  otlp:
    # 4317 is the default gRPC port
    endpoint: "otel-collector:4317"
    protocol: grpc
```

## Watch out

- A shared library instrumented against the SDK forces your SDK and exporter on every user. Use the API.
- A wrong `service.name` marks every metric, span and log from that process.
- A missing `service.name` shows as `unknown_service`. People often find it after they build dashboards on it.
- Semantic conventions change between versions. For example, OTel reworked the HTTP conventions.
- Pin the semantic-convention version of your instrumentation libraries. Do not assume attribute names stay the same.

## The task

Write `stub.yaml`: the SDK configuration `otel-sdk-config.yaml` for a service. It points the OTLP exporter at a Collector, not at a vendor backend.

1. Under `resource:`, add an `attributes:` map with exactly four keys.
2. Set `service.name: checkout-api`.
3. Set `service.version: "2.4.1"`, in quotes.
4. Set `deployment.environment: production`.
5. Set `k8s.pod.name: checkout-api-7d9f8c-x2kq1`.
6. Under `instrumentation:`, set `auto: [http-server, http-client, db-driver]`: the auto-instrumented boundaries.
7. Under `instrumentation:`, set `manual: [pricing-quote-duration, cart-item-count]`: the domain measurements.
8. Write both lists in flow style, on one line each.
9. Under `exporters:`, add an `otlp:` block with `endpoint: "otel-collector:4317"` and `protocol: grpc`.

Do not leave `TODO` comments in the file.

```yaml
resource:
  attributes:
    service.name: checkout-api
    service.version: "2.4.1"
    deployment.environment: production
    k8s.pod.name: checkout-api-7d9f8c-x2kq1

instrumentation:
  auto: [http-server, http-client, db-driver]
  manual: [pricing-quote-duration, cart-item-count]

exporters:
  otlp:
    endpoint: "otel-collector:4317"
    protocol: grpc
```
