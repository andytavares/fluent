variable "environment" {
  type    = string
  default = "staging"
}

variable "project" {
  type    = string
  default = "myapp"
}

variable "region" {
  type    = string
  default = "us-east-1"
}

locals {
  bucket_name = "${var.project}-${var.environment}-assets"

  instance_type = var.environment == "production" ? "t3.large" : "t3.micro"

  common_tags = merge(
    { Project = var.project },
    { Environment = var.environment }
  )

  az_set = toset(["us-east-1a", "us-east-1b", "us-east-1a"])
}

output "bucket_name" {
  value = local.bucket_name
}

output "instance_type" {
  value = local.instance_type
}
