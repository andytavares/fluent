#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566

# TODO: sns create-topic --name order-events

# TODO: sns subscribe --topic-arn arn:aws:sns:us-east-1:000000000000:order-events
#       --protocol sqs --notification-endpoint arn:aws:sqs:us-east-1:000000000000:orders-queue

# TODO: sns set-subscription-attributes on arn:aws:sns:us-east-1:000000000000:order-events:demo-sub-id
#       --attribute-name RawMessageDelivery --attribute-value "true"

# TODO: sns set-subscription-attributes on the same subscription
#       --attribute-name FilterPolicy --attribute-value '{"eventType": ["OrderShipped", "OrderCancelled"]}'

# TODO: events put-rule --name high-value-orders
#       --event-pattern matching source orders.service, detail-type OrderPlaced, detail.total >= 500

# TODO: events put-targets --rule high-value-orders
#       --targets id "1" arn arn:aws:sqs:us-east-1:000000000000:vip-orders-queue

# TODO: add a comment: # answer: <when to choose EventBridge pattern over SNS filter policy>
