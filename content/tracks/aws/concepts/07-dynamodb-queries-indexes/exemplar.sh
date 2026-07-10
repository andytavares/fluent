#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566

aws --endpoint-url "$ENDPOINT_URL" dynamodb query \
  --table-name Orders \
  --key-condition-expression "PK = :pk" \
  --expression-attribute-values '{":pk": {"S": "CUSTOMER#123"}}'

aws --endpoint-url "$ENDPOINT_URL" dynamodb scan \
  --table-name Orders
# answer: scan reads every item in the entire table regardless of what you
# need, so cost scales with total table size; query jumps straight to the
# CUSTOMER#123 partition and only reads the items that actually match.

aws --endpoint-url "$ENDPOINT_URL" dynamodb query \
  --table-name Orders \
  --key-condition-expression "PK = :pk" \
  --filter-expression "Status = :status" \
  --expression-attribute-values '{
    ":pk": {"S": "CUSTOMER#123"},
    ":status": {"S": "SHIPPED"}
  }'
# answer: the filter expression is applied after DynamoDB has already read and
# billed for every item matching the key condition — it only trims the
# response payload, it does not reduce the read cost or items scanned.

aws --endpoint-url "$ENDPOINT_URL" dynamodb update-table \
  --table-name Orders \
  --attribute-definitions AttributeName=Status,AttributeType=S \
  --global-secondary-index-updates '[{
    "Create": {
      "IndexName": "StatusIndex",
      "KeySchema": [{"AttributeName": "Status", "KeyType": "HASH"}],
      "Projection": {"ProjectionType": "ALL"}
    }
  }]'

aws --endpoint-url "$ENDPOINT_URL" dynamodb query \
  --table-name Orders \
  --key-condition-expression "PK = :pk" \
  --expression-attribute-values '{":pk": {"S": "CUSTOMER#123"}}' \
  --page-size 25
