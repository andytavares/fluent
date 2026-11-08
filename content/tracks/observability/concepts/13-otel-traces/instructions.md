## What you build

You write a tracing configuration for a checkout service: three spans, context propagation, tail sampling and exemplars. Traces show where the time went, across every service one request touched. This lesson builds on **OpenTelemetry Fundamentals**.

## Key concepts

### A trace is a tree of spans

A span is one unit of work: one HTTP handler call, one database query, one function you measure. A trace is all spans with the same `trace_id`. Each span has a `span_id` and a `parent_span_id`, which form the call tree of one request.

```
trace_id: 4bf92f3577b34da6a3ce929d0e0e4736
POST /checkout                (100ms)
├─ validate-cart              (5ms)
├─ charge-payment             (60ms)
│  └─ stripe.charge (client)  (55ms)
└─ write-order-db             (20ms)
```

### A span has attributes, events and a status

- **Attributes**: key-value data that follows the semantic conventions, for example `http.request.method`, `db.query.text` and `http.response.status_code`.
- **Events**: timestamped things that happen during the span, such as a caught exception, a retry or a cache miss. An event costs less than a child span when you need a timestamp, not a duration.
- **Status**: `Unset`, `Ok` or `Error`, set by the instrumentation. An HTTP 500 sets the status to `Error`, separate from the status code attribute.

```yaml
span:
  name: charge-payment
  kind: internal
  attributes:
    payment.provider: stripe
    payment.amount_cents: 4200
  events:
    - name: retry-attempted
      attributes:
        retry.count: 1
  status: Ok
```

### Context propagation connects services

Inside one process, the SDK tracks the current span in memory. Across a network call, the context must travel with the request. OTel uses the W3C `traceparent` HTTP header. It carries the trace ID, the parent span ID and the trace flags, such as "sampled". The receiver then adds its spans as children of the caller's span, not as a new trace.

```
traceparent: 00-<trace-id>-<parent-id>-01
# 00: version
# trace-id: 32 hex characters
# parent-id: 16 hex characters
# 01: flags (sampled)
```

Every hop must pass the header on, or the trace breaks at that hop. Auto-instrumentation for HTTP clients and servers does this for you. With manual instrumentation and no instrumented client, you must inject and extract the header yourself.

### The span kind gives the role of a span

| Kind | Meaning |
|---|---|
| `internal` | Work inside one process (default) |
| `server` | Handles an incoming request |
| `client` | Makes an outgoing request or database query |
| `producer` | Sends a message to a queue |
| `consumer` | Receives a message from a queue |

A `client` span in the caller links to a `server` span in the callee through the propagated context. The tracing UI then draws "service A called service B" with the time on each side. Network or queue time often makes up the difference.

### Sampling decides which traces to keep

At scale, you cannot keep every trace.

- **Head sampling** decides at the start of the trace, before any span exists. It usually keeps a fixed share, such as 10%. It is cheap and simple, but it decides before it knows if the trace has an error or is slow.
- **Tail sampling** decides after the trace is complete. A Collector buffers all spans and applies rules, such as "keep it if any span has an error or the trace took over 1s". It keeps the traces that matter, but costs Collector memory and complexity.

With tail sampling, every span still goes to the Collector. Head sampling saves network and ingest cost. Tail sampling saves storage and keeps the interesting traces.

### Exemplars link a metric to a trace

An exemplar is a trace ID attached to one histogram observation. On a Grafana latency spike, you click straight into the slow trace behind that data point. You do not search a trace backend for the right time window. This works because metrics and traces share the OTel and OTLP pipeline.

Jaeger and Zipkin predate OTel. Jaeger and Grafana Tempo now accept OTLP directly, so you instrument with OTel and pick the trace backend separately.

## Watch out

- A hop that does not propagate `traceparent` starts a new, disconnected trace.
- Common causes are a hand-written HTTP call or a queue producer. One request then shows as several short traces.
- A flat 1% head sample almost never keeps your rarest, worst requests.
- To catch every error, sample errors at a much higher rate, or 100%. Most head samplers support such rules.
- A wrong span kind, such as `internal` at a service boundary, breaks the cross-process view in the tracing UI.

## The task

Write `stub.yaml`: the tracing configuration `tracing-config.yaml` for the checkout service. Use the `server`, `internal`, `client` chain of span kinds.

1. Under `spans:`, add a list of three spans. Each has `name`, `kind` and an `attributes` map.
2. Span 1: `name: "POST /checkout"`, `kind: server`, with `http.method: POST` and `http.route: /checkout`.
3. Span 2: `name: charge-payment`, `kind: internal`, with `payment.provider: stripe`.
4. Span 3: `name: stripe.charge`, `kind: client`, with `http.method: POST` and `peer.service: stripe`.
5. Under `propagation:`, set `header: traceparent` and `standard: w3c`.
6. Under `sampling:`, set `strategy: tail`.
7. Add a `rules:` list with two entries, each with `sample_rate: 1.0`.
8. Rule 1 has `condition: "status == Error"`. Rule 2 has `condition: "duration > 1s"`.
9. Set `default_sample_rate: 0.1`.
10. Under `exemplars:`, set `enabled: true` and `linked_metric: http_request_duration_seconds`.

`http.method` is the older name of `http.request.method`. Do not leave `TODO` comments in the file.

```yaml
spans:
  - name: "POST /checkout"
    kind: server
    attributes:
      http.method: POST
      http.route: /checkout

  - name: charge-payment
    kind: internal
    attributes:
      payment.provider: stripe

  - name: stripe.charge
    kind: client
    attributes:
      http.method: POST
      peer.service: stripe

propagation:
  header: traceparent
  standard: w3c

sampling:
  strategy: tail
  rules:
    - condition: "status == Error"
      sample_rate: 1.0
    - condition: "duration > 1s"
      sample_rate: 1.0
  default_sample_rate: 0.1

exemplars:
  enabled: true
  linked_metric: http_request_duration_seconds
```
