#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566

aws --endpoint-url "$ENDPOINT_URL" sqs create-queue --queue-name orders-queue

aws --endpoint-url "$ENDPOINT_URL" sqs create-queue \
  --queue-name orders-queue.fifo \
  --attributes FifoQueue=true,ContentBasedDeduplication=true

aws --endpoint-url "$ENDPOINT_URL" sqs create-queue --queue-name orders-dlq

aws --endpoint-url "$ENDPOINT_URL" sqs set-queue-attributes \
  --queue-url http://localhost:4566/000000000000/orders-queue \
  --attributes '{
    "RedrivePolicy": "{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:000000000000:orders-dlq\",\"maxReceiveCount\":\"5\"}"
  }'

aws --endpoint-url "$ENDPOINT_URL" sqs send-message \
  --queue-url http://localhost:4566/000000000000/orders-queue.fifo \
  --message-body '{"orderId": "456"}' \
  --message-group-id customer-123 \
  --message-deduplication-id order-456-v1

aws --endpoint-url "$ENDPOINT_URL" sqs receive-message \
  --queue-url http://localhost:4566/000000000000/orders-queue \
  --wait-time-seconds 20

# answer: receive-message only hides a message for the visibility timeout
# window, not until it's deleted; if the first consumer is still processing
# when that window expires, the message becomes visible again and a second
# consumer's receive-message call can pick up the same message.
