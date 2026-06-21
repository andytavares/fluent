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
  # TODO: build bucket_name using string interpolation of var.project and var.environment
  bucket_name = "FILL_ME_IN"

  # TODO: conditional — t3.large if production, else t3.micro
  instance_type = "FILL_ME_IN"

  # TODO: use merge() to combine {Project = var.project} with {Environment = var.environment}
  common_tags = {}

  # TODO: use toset() on ["us-east-1a", "us-east-1b", "us-east-1a"] to deduplicate
  az_set = []
}

output "bucket_name" {
  value = "FILL_ME_IN" # TODO: output local.bucket_name
}

output "instance_type" {
  value = "FILL_ME_IN" # TODO: output local.instance_type
}
