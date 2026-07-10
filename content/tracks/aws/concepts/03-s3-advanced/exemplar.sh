#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566
BUCKET=fluent-s3-advanced

aws --endpoint-url "$ENDPOINT_URL" s3 mb s3://fluent-s3-advanced

aws --endpoint-url "$ENDPOINT_URL" s3api put-bucket-versioning \
  --bucket "$BUCKET" --versioning-configuration Status=Enabled

aws --endpoint-url "$ENDPOINT_URL" s3api delete-object \
  --bucket "$BUCKET" --key report.csv

aws --endpoint-url "$ENDPOINT_URL" s3api list-object-versions \
  --bucket "$BUCKET" --prefix report.csv
# answer: delete-object on a versioned bucket only inserts a delete marker;
# every prior version of the object is untouched and still stored underneath.

aws --endpoint-url "$ENDPOINT_URL" s3api put-bucket-lifecycle-configuration \
  --bucket "$BUCKET" \
  --lifecycle-configuration '{
    "Rules": [{
      "ID": "archive-old-logs",
      "Status": "Enabled",
      "Filter": {"Prefix": "logs/"},
      "Transitions": [{"Days": 30, "StorageClass": "STANDARD_IA"}],
      "Expiration": {"Days": 365}
    }]
  }'

aws --endpoint-url "$ENDPOINT_URL" s3api put-bucket-policy \
  --bucket "$BUCKET" \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [{
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::fluent-s3-advanced/public/*"
    }]
  }'

aws --endpoint-url "$ENDPOINT_URL" s3api put-bucket-encryption \
  --bucket "$BUCKET" \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "aws:kms"}
    }]
  }'

aws --endpoint-url "$ENDPOINT_URL" s3api put-bucket-website \
  --bucket "$BUCKET" \
  --website-configuration '{
    "IndexDocument": {"Suffix": "index.html"},
    "ErrorDocument": {"Key": "error.html"}
  }'
