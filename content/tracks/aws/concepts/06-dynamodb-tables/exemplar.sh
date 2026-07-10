#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566

aws --endpoint-url "$ENDPOINT_URL" dynamodb create-table \
  --table-name Orders \
  --attribute-definitions \
    AttributeName=PK,AttributeType=S \
    AttributeName=SK,AttributeType=S \
  --key-schema \
    AttributeName=PK,KeyType=HASH \
    AttributeName=SK,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

aws --endpoint-url "$ENDPOINT_URL" dynamodb put-item \
  --table-name Orders \
  --item '{
    "PK": {"S": "CUSTOMER#123"},
    "SK": {"S": "ORDER#456"},
    "Total": {"N": "89.99"},
    "Status": {"S": "SHIPPED"}
  }'

aws --endpoint-url "$ENDPOINT_URL" dynamodb get-item \
  --table-name Orders \
  --key '{"PK": {"S": "CUSTOMER#123"}, "SK": {"S": "ORDER#456"}}'

# answer: Status only has a handful of distinct values (PENDING/SHIPPED/DONE),
# so every item would hash into one of a few partitions no matter how the
# table scales, creating hot partitions instead of spreading load evenly.
