#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566

aws --endpoint-url "$ENDPOINT_URL" lambda add-permission \
  --function-name process-upload \
  --statement-id s3invoke \
  --action lambda:InvokeFunction \
  --principal s3.amazonaws.com \
  --source-arn arn:aws:s3:::fluent-uploads

aws --endpoint-url "$ENDPOINT_URL" s3api put-bucket-notification-configuration \
  --bucket fluent-uploads \
  --notification-configuration '{
    "LambdaFunctionConfigurations": [{
      "LambdaFunctionArn": "arn:aws:lambda:us-east-1:000000000000:function:process-upload",
      "Events": ["s3:ObjectCreated:*"]
    }]
  }'

aws --endpoint-url "$ENDPOINT_URL" lambda create-event-source-mapping \
  --function-name process-order \
  --event-source-arn arn:aws:sqs:us-east-1:000000000000:orders-queue \
  --batch-size 10 \
  --function-response-types ReportBatchItemFailures

aws --endpoint-url "$ENDPOINT_URL" lambda put-function-event-invoke-config \
  --function-name process-upload \
  --maximum-retry-attempts 2 \
  --destination-config '{
    "OnSuccess": {"Destination": "arn:aws:sqs:us-east-1:000000000000:upload-success-queue"},
    "OnFailure": {"Destination": "arn:aws:sqs:us-east-1:000000000000:upload-dlq"}
  }'

# answer: a message that times out or errors mid-processing becomes visible
# again and is redelivered to the function, so the same logical event will be
# invoked more than once as routine behavior — without an idempotency check,
# the side effect (e.g. charging a payment) happens twice.
