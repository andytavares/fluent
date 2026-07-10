# SNS & EventBridge

## What you'll learn

SNS and EventBridge are AWS's two pub/sub services, and they solve overlapping but distinct problems. This concept covers SNS topics/subscriptions/filter policies, the SNS→SQS fan-out pattern (the standard way to get durable, replayable delivery to multiple independent consumers), EventBridge's rule/pattern model, and when to reach for each. Builds on `sqs`.

## Key concepts

### SNS: topics, subscriptions, fan-out

An SNS **topic** is a named pub/sub channel. Publishers send one message to the topic; SNS pushes a copy to every current **subscription** (SQS queue, Lambda function, HTTP(S) endpoint, email, SMS) — this is fan-out: one publish, many independent deliveries, each subscriber unaware of the others.

```bash
aws --endpoint-url http://localhost:4566 sns create-topic --name order-events

aws --endpoint-url http://localhost:4566 sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:000000000000:order-events \
  --protocol sqs \
  --notification-endpoint arn:aws:sqs:us-east-1:000000000000:orders-queue
```

### Why fan out to SQS specifically

SNS itself does **not** retry indefinitely or persist messages for a subscriber that's down — an HTTP(S) subscriber endpoint that's unreachable gets a bounded number of retries, then the message is dropped for that subscriber. Fanning out to an **SQS queue per consumer** (the "fan-out pattern") fixes this: SNS's job becomes just "duplicate this message into N queues," and each queue then behaves exactly like the durable, redrivable, replayable queue from the previous concept — a consumer that's down for an hour simply finds its message waiting when it comes back, no special retry logic needed on SNS's side at all.

```
Publisher → SNS topic → SQS queue A → Consumer A
                       → SQS queue B → Consumer B
                       → SQS queue C → Consumer C
```

This is the standard shape for "notify multiple independent services that something happened" — each service owns its own queue and consumes at its own pace, with SNS doing pure duplication.

### Raw message delivery

By default, a message delivered from SNS to SQS arrives wrapped in an SNS envelope (`{"Type": "Notification", "MessageId": ..., "Message": "<your actual body>", ...}`) — your consumer has to unwrap it. `RawMessageDelivery` strips the envelope so the SQS message body is exactly what was published, unchanged:

```bash
aws --endpoint-url http://localhost:4566 sns set-subscription-attributes \
  --subscription-arn arn:aws:sns:us-east-1:000000000000:order-events:abc-123 \
  --attribute-name RawMessageDelivery \
  --attribute-value "true"
```

Enable this whenever the consumer doesn't need the SNS metadata — which is almost always, for SQS subscribers.

### Filter policies

Without a filter policy, every subscriber receives every message published to the topic. A filter policy lets a subscriber opt in to only the subset of messages it cares about, based on message attributes:

```bash
aws --endpoint-url http://localhost:4566 sns set-subscription-attributes \
  --subscription-arn arn:aws:sns:us-east-1:000000000000:order-events:abc-123 \
  --attribute-name FilterPolicy \
  --attribute-value '{"eventType": ["OrderShipped", "OrderCancelled"]}'
```

Publishers attach message attributes; SNS evaluates each subscription's filter policy against those attributes **before** delivering — a non-matching subscriber never receives (and is never billed for) that message. This lets one topic serve many differently-interested consumers without every consumer having to filter irrelevant messages itself after the fact.

### EventBridge: rules and event patterns

EventBridge is AWS's newer, more structured event bus. Instead of a flat topic, events flow through a **bus**, matched against **rules** with **event patterns** (structural JSON matching on the event's actual fields, not just publisher-supplied attributes), and routed to one or more **targets**:

```bash
aws --endpoint-url http://localhost:4566 events put-rule \
  --name high-value-orders \
  --event-pattern '{
    "source": ["orders.service"],
    "detail-type": ["OrderPlaced"],
    "detail": {"total": [{"numeric": [">=", 500]}]}
  }'

aws --endpoint-url http://localhost:4566 events put-targets \
  --rule high-value-orders \
  --targets '[{"Id": "1", "Arn": "arn:aws:sqs:us-east-1:000000000000:vip-orders-queue"}]'
```

The event pattern matches directly against the shape of the event JSON (`source`, `detail-type`, and arbitrary fields inside `detail`, including numeric/prefix/anything-but operators) — richer matching than SNS's flat attribute-based filter policy. EventBridge also natively ingests from 200+ AWS services and SaaS partners without you publishing anything yourself (e.g., "an EC2 instance changed state," "a CodePipeline stage failed").

### SNS vs EventBridge — when each

| | SNS | EventBridge |
|---|---|---|
| Model | Flat pub/sub topic | Rule-matched event bus |
| Filtering | Message attributes, flat key/value | Structural pattern matching on the whole event body |
| Built-in AWS service sources | No — you publish | Yes — many services emit natively |
| Mobile push / SMS / email | Yes, first-class | No |
| Best for | Simple fan-out, mobile notifications, tight SQS integration | Structured event-driven architectures, cross-service/SaaS event routing, "react to AWS account activity" |

Rule of thumb: reach for SNS when you need simple fan-out or non-AWS delivery channels (SMS/email); reach for EventBridge when you're building an event-driven architecture with many event *types* that need routing by content, or when you want to react to native AWS service events without wiring up your own publisher.

## vs other tools

| | SNS/EventBridge | Kafka topics | RabbitMQ exchanges |
|---|---|---|---|
| Durability without a subscriber | None on its own (needs fan-out to SQS) / EventBridge archives optional | Retained per topic retention policy regardless of consumers | None without a durable queue bound to the exchange |
| Routing logic | Filter policy (SNS) / event pattern (EventBridge) | Consumer-side (partition + consumer group) | Exchange type (direct/topic/fanout) + binding keys |
| Structural content matching | EventBridge yes, SNS no (flat attributes only) | No (application-level) | No (application-level) |

EventBridge's `detail`-field pattern matching most closely resembles a RabbitMQ topic exchange's routing-key matching, but operating on structured JSON rather than a dot-delimited string.

## Watch out

- **A filter policy on SNS matches message *attributes*, not the message body.** A pattern that inspects fields inside the JSON payload itself is an EventBridge capability (`detail.<field>`), not something SNS filter policies can do directly.
- **Without `RawMessageDelivery=true`, an SQS consumer expecting a plain JSON body will fail to parse the SNS envelope wrapper** — a very common "why is my consumer erroring on valid-looking messages" bug when adding an SNS→SQS subscription to an existing SQS consumer.
- **SNS delivery to a down HTTP(S) endpoint is not durable** — only the SNS→SQS fan-out pattern gives you the queue's redrive/backoff semantics; a raw HTTP subscriber can permanently lose messages during an outage.
- **EventBridge rules match on the *event envelope* fields (`source`, `detail-type`) as well as `detail` contents** — forgetting to match `source`/`detail-type` (leaving them unconstrained) is a common way to end up matching far more events than intended.

## The task

Fill in `stub.sh` so it, in order:

1. Creates an SNS topic named `order-events`.
2. Subscribes the SQS queue `orders-queue` (ARN `arn:aws:sqs:us-east-1:000000000000:orders-queue`) to that topic with protocol `sqs`.
3. Enables raw message delivery on that subscription (attribute name `RawMessageDelivery`, value `"true"`) — use the ARN `arn:aws:sns:us-east-1:000000000000:order-events:demo-sub-id` for the subscription.
4. Sets a filter policy on the same subscription so it only receives messages with `eventType` of `OrderShipped` or `OrderCancelled`.
5. Creates an EventBridge rule named `high-value-orders` with an event pattern matching `source: ["orders.service"]`, `detail-type: ["OrderPlaced"]`, and `detail.total >= 500` (using EventBridge's numeric matching syntax).
6. Adds the SQS queue `vip-orders-queue` (ARN `arn:aws:sqs:us-east-1:000000000000:vip-orders-queue`, target id `"1"`) as a target of that rule.
7. Adds a comment `# answer: <one sentence>` explaining when you'd choose EventBridge's event pattern over an SNS filter policy.

### Run it for real

```bash
docker run -d --name localstack -p 4566:4566 localstack/localstack
# (create orders-queue and vip-orders-queue first)
bash stub.sh   # once filled in
```
