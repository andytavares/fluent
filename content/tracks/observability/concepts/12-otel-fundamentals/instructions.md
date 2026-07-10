# OpenTelemetry Fundamentals

## What you'll learn

Everything so far has been Prometheus-native — metrics you instrument directly with a Prometheus client library. OpenTelemetry (OTel) is the vendor-neutral layer above that: one instrumentation standard, multiple possible backends. This lesson covers why OTel exists, its API/SDK split, resources and semantic conventions, auto vs manual instrumentation, and OTLP — the wire protocol everything in the OTel ecosystem speaks.

## Key concepts

**Why OTel exists.** Before OTel, instrumenting an application meant picking a vendor's SDK (Datadog's, New Relic's, or hand-rolling Prometheus client calls) and your instrumentation code was locked to that choice — switching backends meant re-instrumenting every service. OTel is a CNCF standard (the merger of OpenTracing and OpenCensus) that separates **what you instrument** from **where the data goes**. You instrument once against the OTel API; you configure, independently, where the SDK exports data — Prometheus, Jaeger, Tempo, or any vendor with an OTLP-compatible ingest endpoint (nearly all of them, at this point). Switching backends becomes a config change, not a re-instrumentation project.

**Signals: metrics, traces, and logs, unified under one project.** OTel defines all three signal types (from the foundations lesson) with one consistent data model, one SDK architecture, one export protocol — instead of three unrelated tools each with their own agent and format.

**API vs SDK — the split that makes OTel's neutrality actually work.** The **API** is what your application code (and instrumentation libraries) call — `tracer.start_span(...)`, `meter.create_counter(...)`. The **SDK** is the actual implementation that processes and exports that data — samplers, processors, exporters. Library authors depend only on the API (so instrumenting a shared library doesn't force a specific SDK/backend on every consumer); the *application* (not the library) wires up the SDK once, at startup, choosing exporters and sampling. If no SDK is configured, API calls are effectively no-ops — instrumented libraries work whether or not the embedding application cares about telemetry.

**Resources — who is emitting this data.** A `Resource` is a fixed set of attributes describing the *entity* producing telemetry (the process/pod/host), attached once at SDK initialization and stamped onto every signal that SDK emits — the OTel analogue of Prometheus's target labels from the instrumenting-services lesson:

```yaml
resource:
  attributes:
    service.name: checkout-api
    service.version: 2.4.1
    deployment.environment: production
    k8s.pod.name: checkout-api-7d9f8c-x2kq1
```

**Semantic conventions** — a published, standardized set of attribute names for common concepts (`http.method`, `http.status_code`, `db.system`, `k8s.pod.name`), so two teams instrumenting two different services with two different libraries still produce attributes that mean the same thing and can be correlated/queried consistently. This is the OTel equivalent of the Prometheus naming conventions from the metric-types lesson, standardized across the whole industry rather than per-organization.

**Auto vs manual instrumentation.** Auto-instrumentation attaches to your language runtime (a Java agent, Python's `opentelemetry-instrument` wrapper, .NET profiler hooks) and instruments known frameworks/libraries (your HTTP server, your DB driver) with zero code changes — you get RED-style spans and metrics for free at the framework boundary. Manual instrumentation is you calling the API directly inside your own business logic, for anything domain-specific auto-instrumentation can't know about ("time spent computing a pricing quote," "number of items in a cart"). Production systems use both: auto-instrumentation for the boilerplate (HTTP/DB/queue boundaries), manual for anything that matters to your specific domain.

**OTLP — the wire protocol.** OpenTelemetry Protocol is what SDKs export over — gRPC or HTTP/protobuf — to a Collector (next lesson) or directly to a backend that speaks OTLP natively. It's the one format every OTel exporter and every modern observability vendor now accepts, which is the actual portability payoff: instrument once with OTel, and OTLP is your interchange format regardless of destination.

```yaml
exporter:
  otlp:
    endpoint: "otel-collector:4317"    # gRPC default port
    protocol: grpc
```

## vs other tools

Before OTel, "vendor-neutral instrumentation" wasn't really achievable — Datadog's `dd-trace`, New Relic's agents, and Prometheus client libraries were all separately-maintained, incompatible instrumentation surfaces, and switching vendors meant a real re-instrumentation project. Every major vendor (including Datadog and New Relic) now ingests OTLP directly, which is the strongest signal that OTel has become the actual industry-standard instrumentation layer rather than one more competing option — that's not marketing, it's supply-side incentive: implementing OTLP ingestion cost vendors far less than losing every customer who instrumented with OTel.

## Watch out

- **The API/SDK split is easy to skip in a small project** ("just import the SDK everywhere, who cares") but bites the moment you factor code into a shared library — instrument the library against the SDK directly and you've forced every consumer of that library into your SDK/exporter choices.
- **Resource attributes set once, wrong, poison every signal from that process** — `service.name` typo'd or left as a template default (`"unknown_service"`) shows up on every metric, span, and log the SDK emits, and is often only noticed much later once dashboards/traces are already built around the wrong name.
- **Semantic conventions are versioned and evolving** — attribute names have changed across OTel spec versions (e.g., HTTP conventions were reworked between spec versions); pin your instrumentation libraries' OTel spec version deliberately rather than assuming attribute names are permanently stable.

## The task

Write `otel-sdk-config.yaml`: an OTel SDK configuration for a service, covering resource attributes and exporter setup.

Requirements:

Under `resource:`, an `attributes:` map with exactly these four keys:
- `service.name: checkout-api`
- `service.version: "2.4.1"`
- `deployment.environment: production`
- `k8s.pod.name: checkout-api-7d9f8c-x2kq1`

Under `instrumentation:`, two keys:
- `auto: [http-server, http-client, db-driver]` — the list of auto-instrumented boundaries.
- `manual: [pricing-quote-duration, cart-item-count]` — the list of manually-instrumented, domain-specific measurements.

Under `exporters:`, an `otlp:` block with `endpoint: "otel-collector:4317"` and `protocol: grpc`.

Expected shape:

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

This is the shape of configuration nearly every OTel SDK (Java, Python, Go, Node, .NET) accepts in some form — resource attributes at startup, an explicit list of what's auto- vs manually-instrumented, and an OTLP exporter pointing at a Collector rather than a specific vendor backend directly.
