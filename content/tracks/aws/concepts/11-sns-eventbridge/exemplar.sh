#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566

aws --endpoint-url "$ENDPOINT_URL" sns create-topic --name order-events

aws --endpoint-url "$ENDPOINT_URL" sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:000000000000:order-events \
  --protocol sqs \
  --notification-endpoint arn:aws:sqs:us-east-1:000000000000:orders-queue

aws --endpoint-url "$ENDPOINT_URL" sns set-subscription-attributes \
  --subscription-arn arn:aws:sns:us-east-1:000000000000:order-events:demo-sub-id \
  --attribute-name RawMessageDelivery \
  --attribute-value "true"

aws --endpoint-url "$ENDPOINT_URL" sns set-subscription-attributes \
  --subscription-arn arn:aws:sns:us-east-1:000000000000:order-events:demo-sub-id \
  --attribute-name FilterPolicy \
  --attribute-value '{"eventType": ["OrderShipped", "OrderCancelled"]}'

aws --endpoint-url "$ENDPOINT_URL" events put-rule \
  --name high-value-orders \
  --event-pattern '{
    "source": ["orders.service"],
    "detail-type": ["OrderPlaced"],
    "detail": {"total": [{"numeric": [">=", 500]}]}
  }'

aws --endpoint-url "$ENDPOINT_URL" events put-targets \
  --rule high-value-orders \
  --targets '[{"Id": "1", "Arn": "arn:aws:sqs:us-east-1:000000000000:vip-orders-queue"}]'

# answer: reach for EventBridge's event pattern when routing decisions depend
# on the structure/content of the event body itself (like a numeric threshold
# inside "detail"), since SNS filter policies can only match flat message
# attributes, not fields nested in the payload.
