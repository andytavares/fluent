#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566

# TODO: lambda add-permission --function-name process-upload --statement-id s3invoke
#       --action lambda:InvokeFunction --principal s3.amazonaws.com
#       --source-arn arn:aws:s3:::fluent-uploads

# TODO: s3api put-bucket-notification-configuration on fluent-uploads
#       invoking process-upload on s3:ObjectCreated:*

# TODO: lambda create-event-source-mapping --function-name process-order
#       --event-source-arn arn:aws:sqs:us-east-1:000000000000:orders-queue
#       --batch-size 10 --function-response-types ReportBatchItemFailures

# TODO: lambda put-function-event-invoke-config --function-name process-upload
#       --maximum-retry-attempts 2 --destination-config with OnSuccess/OnFailure queues

# TODO: add a comment: # answer: <why the function must be idempotent behind an SQS mapping>
