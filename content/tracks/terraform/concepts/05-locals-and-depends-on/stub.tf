variable "project" {
  type    = string
  default = "myapp"
}

variable "environment" {
  type    = string
  default = "production"
}

locals {
  name_prefix = "FILL_ME_IN" # TODO: combine project and environment into a name prefix

  is_prod = false # TODO: set to true when in the production environment

  common_tags = {} # TODO: add Project and Environment tag keys
}

resource "aws_iam_role" "app" {
  name               = "FILL_ME_IN" # TODO: use the name_prefix local
  assume_role_policy = "{}"

  tags = {} # TODO: apply the common_tags local
}

resource "aws_iam_role_policy_attachment" "app_basic" {
  role       = "FILL_ME_IN" # TODO: reference the IAM role's name attribute
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "app" {
  function_name = "${local.name_prefix}-handler"
  role          = "FILL_ME_IN" # TODO: reference the IAM role's ARN attribute

  # TODO: add a depends_on block referencing the policy attachment above
}
