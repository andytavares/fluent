#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566

aws --endpoint-url "$ENDPOINT_URL" iam create-user --user-name deploy-bot

cat > s3-read-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadOnlyOnOneBucket",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::fluent-data",
        "arn:aws:s3:::fluent-data/*"
      ]
    }
  ]
}
EOF

aws --endpoint-url "$ENDPOINT_URL" iam create-policy \
  --policy-name s3-read-only \
  --policy-document file://s3-read-policy.json

aws --endpoint-url "$ENDPOINT_URL" iam attach-user-policy \
  --user-name deploy-bot \
  --policy-arn arn:aws:iam::000000000000:policy/s3-read-only

aws --endpoint-url "$ENDPOINT_URL" iam create-access-key --user-name deploy-bot

# answer: scoping Action to the two operations actually needed and Resource to
# the one bucket actually used means a leaked deploy-bot credential can only
# read that bucket, not read/write/delete every object in the whole account.
