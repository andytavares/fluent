variable "project" {
  type    = string
  default = "myapp"
}

variable "environment" {
  type    = string
  default = "production"
}

locals {
  name_prefix = "${var.project}-${var.environment}"

  is_prod = var.environment == "production"

  common_tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_iam_role" "app" {
  name               = local.name_prefix
  assume_role_policy = "{}"

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "app_basic" {
  role       = aws_iam_role.app.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_lambda_function" "app" {
  function_name = "${local.name_prefix}-handler"
  role          = aws_iam_role.app.arn

  depends_on = [aws_iam_role_policy_attachment.app_basic]
}
