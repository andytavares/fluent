#!/usr/bin/env bash
set -euo pipefail

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1
ENDPOINT_URL=http://localhost:4566

# TODO: cloudwatch put-metric-data --namespace "Fluent/Orders" --metric-name OrdersProcessed
#       --value 1 --dimensions Environment=prod,Service=order-processor

# TODO: cloudwatch put-metric-alarm --alarm-name high-error-rate --namespace "Fluent/Orders"
#       --metric-name OrderErrors --statistic Sum --period 60 --evaluation-periods 3
#       --threshold 5 --comparison-operator GreaterThanThreshold --treat-missing-data notBreaching

# TODO: logs create-log-group --log-group-name /fluent/order-processor

# TODO: logs create-log-stream --log-group-name /fluent/order-processor --log-stream-name "2024-01-15"

# TODO: logs put-log-events with message "ERROR: payment declined for order 456"

# TODO: logs put-metric-filter --log-group-name /fluent/order-processor
#       --filter-name payment-declined-count --filter-pattern "\"payment declined\""
#       --metric-transformations metricName=PaymentDeclinedCount,metricNamespace="Fluent/Orders",metricValue=1
