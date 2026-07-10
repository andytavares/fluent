#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566

# TODO: create-table Orders — PK (S) as HASH key, SK (S) as RANGE key, --billing-mode PAY_PER_REQUEST

# TODO: put-item — PK=CUSTOMER#123, SK=ORDER#456, Total=89.99 (N), Status=SHIPPED (S)

# TODO: get-item — key PK=CUSTOMER#123, SK=ORDER#456

# TODO: add a comment: # answer: <why Status would be a poor partition key>
