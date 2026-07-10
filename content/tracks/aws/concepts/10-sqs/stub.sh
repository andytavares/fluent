#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566

# TODO: sqs create-queue --queue-name orders-queue

# TODO: sqs create-queue --queue-name orders-queue.fifo
#       --attributes FifoQueue=true,ContentBasedDeduplication=true

# TODO: sqs create-queue --queue-name orders-dlq

# TODO: sqs set-queue-attributes on orders-queue — RedrivePolicy pointing at orders-dlq ARN, maxReceiveCount 5

# TODO: sqs send-message to orders-queue.fifo — body {"orderId": "456"},
#       --message-group-id customer-123, --message-deduplication-id order-456-v1

# TODO: sqs receive-message from orders-queue with --wait-time-seconds 20

# TODO: add a comment: # answer: <why a second consumer can receive the same in-flight message>
