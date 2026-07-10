#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1

ENDPOINT_URL=http://localhost:4566

aws --endpoint-url "$ENDPOINT_URL" sts get-caller-identity

aws --endpoint-url "$ENDPOINT_URL" s3 mb s3://fluent-cli-demo

aws --endpoint-url "$ENDPOINT_URL" s3api list-buckets --output table

aws --endpoint-url "$ENDPOINT_URL" s3api list-buckets --query 'Buckets[].Name' --output text
