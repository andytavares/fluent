#!/usr/bin/env bash
set -euo pipefail

# TODO: export AWS_ACCESS_KEY_ID=test
# TODO: export AWS_SECRET_ACCESS_KEY=test
# TODO: export AWS_DEFAULT_REGION=us-east-1

# TODO: define ENDPOINT_URL=http://localhost:4566

# TODO: health check — aws --endpoint-url "$ENDPOINT_URL" sts get-caller-identity

# TODO: create bucket fluent-cli-demo — aws --endpoint-url "$ENDPOINT_URL" s3 mb s3://fluent-cli-demo

# TODO: list buckets as a table — aws --endpoint-url "$ENDPOINT_URL" s3api list-buckets --output table

# TODO: list just bucket names as flat text using --query 'Buckets[].Name' --output text
