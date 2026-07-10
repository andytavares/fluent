#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566

aws --endpoint-url "$ENDPOINT_URL" secretsmanager create-secret \
  --name prod/orders-db/password \
  --secret-string '{"username":"app_user","password":"correct-horse-battery-staple"}'

aws --endpoint-url "$ENDPOINT_URL" secretsmanager get-secret-value \
  --secret-id prod/orders-db/password

aws --endpoint-url "$ENDPOINT_URL" ssm put-parameter \
  --name /fluent/orders/api-key \
  --value "sk_live_abc123" \
  --type SecureString

aws --endpoint-url "$ENDPOINT_URL" ssm get-parameter \
  --name /fluent/orders/api-key \
  --with-decryption

cat > secret-access-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "secretsmanager:GetSecretValue",
      "Resource": "arn:aws:secretsmanager:us-east-1:000000000000:secret:prod/orders-db/password-*"
    }
  ]
}
EOF

aws --endpoint-url "$ENDPOINT_URL" secretsmanager rotate-secret \
  --secret-id prod/orders-db/password \
  --rotation-lambda-arn arn:aws:lambda:us-east-1:000000000000:function:rotate-db-password \
  --rotation-rules AutomaticallyAfterDays=30

# answer: it violates "no secrets in code or version control" — anyone with
# read access to the repo's history (including former employees and, if the
# repo is ever made public) permanently has the production database password,
# which is exactly the risk Secrets Manager and SecureString exist to remove.
