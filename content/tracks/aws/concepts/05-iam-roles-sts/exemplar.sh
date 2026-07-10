#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566

cat > trust-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"Service": "lambda.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

aws --endpoint-url "$ENDPOINT_URL" iam create-role \
  --role-name lambda-exec-role \
  --assume-role-policy-document file://trust-policy.json

aws --endpoint-url "$ENDPOINT_URL" iam attach-role-policy \
  --role-name lambda-exec-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

aws --endpoint-url "$ENDPOINT_URL" sts assume-role \
  --role-arn arn:aws:iam::000000000000:role/lambda-exec-role \
  --role-session-name demo-session

# answer: the Lambda service assumes the role on the function's behalf before
# invocation and hands the running code temporary, auto-rotated credentials —
# there is never a static access key to leak, rotate, or accidentally commit.
