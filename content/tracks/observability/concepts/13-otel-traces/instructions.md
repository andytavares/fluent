# OpenTelemetry Traces

## What you'll learn

Traces are the signal that answers "where did the time go, across every service this one request touched." This lesson covers the anatomy of a span, how context propagates across process boundaries (the mechanism that makes a *distributed* trace possible at all), span kinds, the sampling decision every tracing system has to make (and why), and exemplars — the direct link from a metric spike to the actual trace that explains it.

## Key concepts

**A trace is a tree of spans.** A span represents one unit of work — one HTTP handler invocation, one DB query, one function call you cared to measure. A trace is the set of spans sharing a `trace_id`, connected by parent/child relationships (a `span_id` and a `parent_span_id`), forming a tree/DAG that shows the whole call graph for one request.

```
trace_id: 4bf92f3577b34da6a3ce929d0e0e4736
├─ span: POST /checkout            (100ms)
   ├─ span: validate-cart          (5ms)
   ├─ span: charge-payment         (60ms)
   │  └─ span: stripe.charge (client)  (55ms)
   └─ span: write-order-db         (20ms)
```

**Span anatomy** — the fields that matter:

- **Attributes** — key-value metadata following semantic conventions from the last lesson (`http.method`, `db.statement`, `http.status_code`).
- **Events** — timestamped things that happened *during* the span, not separate spans of their own (an exception being caught, a retry happening, a cache miss) — cheaper than a full child span when you just need a timestamped annotation, not a duration.
- **Status** — `Unset`, `Ok`, or `Error`, set explicitly by instrumentation (an HTTP 500 response sets the span's status to `Error`, distinct from the HTTP status code attribute itself).

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

**Context propagation — what makes a *distributed* trace possible.** Within one process, the current span is tracked in-memory. Across a network call, that context has to travel with the request — OTel does this via the **W3C `traceparent` header**, an HTTP header carrying the trace ID, parent span ID, and trace flags (e.g., "sampled or not") so the receiving service can attach its new spans as children of the caller's span instead of starting an unrelated new trace:

```
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             ^^ version    ^^ trace-id (32 hex)     ^^ parent-id (16 hex) ^^ flags
```

Every hop in a call chain must propagate this header (or lose the trace at that hop) — this is exactly what OTel auto-instrumentation for HTTP clients/servers handles for you automatically; manual instrumentation across a network boundary requires explicitly injecting/extracting this header if you're not using an instrumented HTTP client.

**Span kinds** — describe the span's role in a distributed operation, letting backends correctly visualize cross-process relationships:

| Kind | Meaning |
|---|---|
| `internal` | Work inside one process, no cross-process edge (default) |
| `server` | Handling an incoming request (an HTTP server span) |
| `client` | Making an outgoing request (an HTTP client call, a DB query) |
| `producer` | Sending a message to a queue |
| `consumer` | Receiving a message from a queue |

A `client` span in one service and the corresponding `server` span in the callee, linked via the propagated context, is what lets a tracing UI draw "service A called service B, here's exactly how long each side thought the call took" (the difference between the two is often network/queueing time).

**Sampling — you cannot keep every trace at scale, so you decide which to keep.**

- **Head sampling** — the decision ("keep this trace" / "drop it") is made at the *start* of the trace, before any span exists, usually a fixed percentage (e.g., "keep 10% of traces," or "keep 100% of traces flagged `error`, 1% otherwise"). Cheap, simple, but the decision is made blind — you don't yet know if the trace will turn out to be interesting (e.g., contain an error or be unusually slow).
- **Tail sampling** — the decision is made *after* the full trace completes, by a collector buffering all spans and applying a rule ("keep it if any span had an error, or if total duration exceeded 1s"). Far more useful (you keep the traces that actually matter) but requires buffering complete traces before deciding, which costs memory/complexity in the collector (next lesson) and means every span still has to be *sent* to the collector before the decision — head sampling saves network/ingestion cost, tail sampling saves storage cost while keeping the interesting stuff.

**Exemplars — linking a metric spike straight to the trace that explains it.** A histogram sample can carry an "exemplar": a specific trace ID attached to that one observation, so a Grafana panel showing a latency spike lets you click directly into the actual slow trace behind that specific data point, instead of separately searching a trace backend and hoping you find the right one from the right time window. This is the concrete payoff of metrics and traces sharing the OTel/OTLP pipeline rather than being two unrelated tools.

## vs other tools

Jaeger and Zipkin predate OTel and have their own wire formats/UIs; OTel doesn't replace them as *backends* — Jaeger and Grafana Tempo both accept OTLP directly now, so the instrumentation-vs-backend split from the fundamentals lesson applies here too: instrument with OTel, choose Jaeger or Tempo (or a vendor) as the trace *storage and UI* without re-instrumenting. AWS X-Ray and Google Cloud Trace both now accept OTLP ingestion as well, for the same reason every vendor adopted it — it was cheaper than losing every OTel-instrumented customer.

## Watch out

- **A span without propagated context starts a brand-new, disconnected trace** — the most common distributed tracing bug is a network hop (a manually-written HTTP call, a message queue producer) that doesn't propagate `traceparent`, silently fragmenting one logical request into multiple unconnected traces that look like separate, shorter operations.
- **Head sampling at a flat percentage misses rare but important traces** — a 1% sample rate will almost never happen to capture your rarest, worst outlier requests; if you need to catch every error, sample errors at a much higher rate (or 100%) than successful requests, which most head-sampling configs support as a rule, not just a flat percentage.
- **Using a `client`/`server` span kind mismatch (or `internal` where you meant a boundary)** breaks a tracing UI's ability to draw the cross-process relationship correctly — always set the span kind matching what's actually happening at that call.

## The task

Write `tracing-config.yaml`: a tracing configuration covering span design, sampling, and exemplar linkage for the checkout service.

Requirements:

Under `spans:`, a list of three span definitions, each with `name`, `kind`, and `attributes` (a map):
1. `name: POST /checkout`, `kind: server`, attributes including `http.method: POST` and `http.route: /checkout`.
2. `name: charge-payment`, `kind: internal`, attributes including `payment.provider: stripe`.
3. `name: stripe.charge`, `kind: client`, attributes including `http.method: POST` and `peer.service: stripe`.

Under `propagation:`, `header: traceparent` and `standard: w3c`.

Under `sampling:`, `strategy: tail`, and a `rules:` list with two entries: `{ condition: "status == Error", sample_rate: 1.0 }` and `{ condition: "duration > 1s", sample_rate: 1.0 }`, plus a `default_sample_rate: 0.1`.

Under `exemplars:`, `enabled: true` and `linked_metric: http_request_duration_seconds`.

Expected shape:

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

The `server` → `internal` → `client` span-kind chain is the load-bearing detail: get it wrong and a tracing UI can no longer correctly distinguish "this service handled a request" from "this service called out to something else."
