## What you build

You write `stub.sh`, a script that fans out an SNS topic to an SQS queue and routes high-value orders with an EventBridge rule. SNS and EventBridge are the two AWS pub/sub services. Their problems overlap, but they are not the same. This lesson builds on **SQS**.

## Key concepts

The examples leave out `--endpoint-url http://localhost:4566`. Add it to every call when you use LocalStack.

### An SNS topic copies each message to every subscription

An SNS topic is a named pub/sub channel. A publisher sends one message to the topic. SNS pushes a copy to every current subscription: an SQS queue, a Lambda function, an HTTP(S) endpoint, email or SMS. This is fan-out: one publish, many independent deliveries. No subscriber knows about the others.

```bash
aws sns create-topic \
  --name order-events

aws sns subscribe \
  --topic-arn "$TOPIC_ARN" \
  --protocol sqs \
  --notification-endpoint "$QUEUE_ARN"
```

### Fan out to one SQS queue per consumer

SNS does not keep messages for a subscriber that is down. An unreachable HTTP(S) endpoint gets a limited number of retries. Then SNS drops the message for that subscriber.

The fan-out pattern fixes this: give each consumer its own SQS queue. SNS then only copies the message into N queues. Each queue is the durable queue with redrive from the **SQS** concept. A consumer that is down for an hour finds its message waiting when it comes back. SNS needs no special retry logic.

```
Publisher -> SNS topic
  -> SQS queue A -> Consumer A
  -> SQS queue B -> Consumer B
  -> SQS queue C -> Consumer C
```

Use this shape to tell several independent services that something happened. Each service owns its queue and consumes at its own pace.

### Raw message delivery removes the SNS envelope

By default, SNS wraps a message for SQS in an envelope. Your consumer must unwrap it:

```json
{
  "Type": "Notification",
  "MessageId": "...",
  "Message": "<your body>"
}
```

`RawMessageDelivery` removes the envelope. Then the SQS message body is exactly what the publisher sent.

```bash
aws sns set-subscription-attributes \
  --subscription-arn "$SUB_ARN" \
  --attribute-name RawMessageDelivery \
  --attribute-value "true"
```

Turn it on when the consumer does not need the SNS metadata. For SQS subscribers, that is almost always.

### A filter policy picks messages by attribute

Without a filter policy, every subscriber gets every message. A filter policy lets a subscriber take only the messages it wants, based on message attributes.

```bash
aws sns set-subscription-attributes \
  --subscription-arn "$SUB_ARN" \
  --attribute-name FilterPolicy \
  --attribute-value '{"eventType":
  ["OrderShipped", "OrderCancelled"]}'
```

Publishers attach message attributes. SNS checks each filter policy against them before delivery. A subscriber that does not match never receives the message and never pays for it. One topic then serves many consumers, and no consumer filters messages after delivery.

### EventBridge rules match the event structure

EventBridge is the newer, more structured AWS event bus. Events flow through a bus. Rules with event patterns match them, and the rules send them to one or more targets.

```bash
aws events put-rule \
  --name high-value-orders \
  --event-pattern '{
  "source": ["orders.service"],
  "detail-type": ["OrderPlaced"],
  "detail": {"total":
    [{"numeric": [">=", 500]}]}
}'

aws events put-targets \
  --rule high-value-orders \
  --targets '[{"Id": "1",
  "Arn": "<vip-orders-queue ARN>"}]'
```

An event pattern matches the JSON of the event itself: `source`, `detail-type` and any field inside `detail`. It supports numeric, prefix and anything-but operators. That is richer than the flat attributes of an SNS filter policy.

EventBridge also takes events from more than 200 AWS services and SaaS partners, with no publisher code. Examples: an EC2 instance changed state, or a CodePipeline stage failed.

### Choose SNS for fan-out, EventBridge for routing by content

| | SNS | EventBridge |
|---|---|---|
| Model | Flat topic | Bus with rules |
| Filter | Flat attributes | Whole event body |
| AWS sources | No | Yes |
| SMS, email, push | Yes | No |

Use SNS for simple fan-out, mobile push, SMS or email, and tight SQS integration. Use EventBridge for many event types that need routing by content, or to react to native AWS service events.

An EventBridge pattern on `detail` fields is closest to a RabbitMQ topic exchange, but it matches structured JSON, not a dotted routing key.

### Neither service stores messages on its own

SNS keeps nothing without a subscribed queue. EventBridge can archive events, but only if you turn archives on. Kafka is different: a topic keeps records for its retention period, whether or not anyone consumes them.

## Watch out

- An SNS filter policy matches message attributes, not the body. Matching on body fields needs EventBridge (`detail.<field>`).
- Without `RawMessageDelivery=true`, a consumer that expects plain JSON fails to parse the SNS envelope.
- This bug often appears when you add SNS in front of an existing SQS consumer.
- SNS delivery to a down HTTP(S) endpoint is not durable. A raw HTTP subscriber can lose messages during an outage.
- Only SNS-to-SQS fan-out gives you the redrive and backoff of a queue.
- EventBridge rules match envelope fields too. A rule with no `source` or `detail-type` matches far more events than you expect.

## The task

Write `stub.sh` to wire order events through SNS and EventBridge. Pass `--endpoint-url "$ENDPOINT_URL"` on every `aws` call.

The script does these steps, in order:

1. Create an SNS topic with `--name order-events`.
2. Subscribe the `orders-queue` ARN below to the topic with `--protocol sqs`.
3. Set `RawMessageDelivery` to `--attribute-value "true"` on the subscription ARN below.
4. Set a `FilterPolicy` on the same subscription. It accepts `eventType` `OrderShipped` or `OrderCancelled`.
5. Create the EventBridge rule `high-value-orders` with the event pattern below.
6. The pattern matches `source` `orders.service`, `detail-type` `OrderPlaced` and `detail.total` of 500 or more.
7. Add the `vip-orders-queue` ARN below as a target of the rule, with `"Id": "1"`.
8. Add a comment that starts with `# answer:`. In one sentence, say when you choose an EventBridge pattern over an SNS filter policy.

Use these ARNs:

- Queue: `arn:aws:sqs:us-east-1:000000000000:orders-queue`
- Subscription: `arn:aws:sns:us-east-1:000000000000:order-events:demo-sub-id`
- vip-orders-queue: `arn:aws:sqs:us-east-1:000000000000:vip-orders-queue`
- Topic: `arn:aws:sns:us-east-1:000000000000:order-events`

The numeric match must be exactly `"numeric": [">=", 500]`.

The finished script makes these calls:

```bash
aws sns create-topic --name order-events

aws sns subscribe \
  --topic-arn "<topic ARN>" \
  --protocol sqs \
  --notification-endpoint \
  arn:aws:sqs:us-east-1:000000000000:orders-queue

aws sns set-subscription-attributes \
  --subscription-arn "<subscription ARN>" \
  --attribute-name RawMessageDelivery \
  --attribute-value "true"

aws sns set-subscription-attributes \
  --subscription-arn "<subscription ARN>" \
  --attribute-name FilterPolicy \
  --attribute-value '{"eventType":
  ["OrderShipped", "OrderCancelled"]}'

aws events put-rule \
  --name high-value-orders \
  --event-pattern '{
  "source": ["orders.service"],
  "detail-type": ["OrderPlaced"],
  "detail": {"total":
    [{"numeric": [">=", 500]}]}
}'

aws events put-targets \
  --rule high-value-orders \
  --targets '[{"Id": "1",
  "Arn": "<vip-orders-queue ARN>"}]'

# answer: use an EventBridge pattern to
# match fields in the event body.
```

Replace each `<... ARN>` with the full ARN from the list above.

### Run it for real

Create `orders-queue` and `vip-orders-queue` first.

```bash
docker run -d --name localstack \
  -p 4566:4566 localstack/localstack
bash stub.sh
```
