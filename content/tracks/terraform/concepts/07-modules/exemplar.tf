variable "environment" {
  type    = string
  default = "staging"
}

variable "project" {
  type    = string
  default = "myapp"
}

module "network" {
  source = "./modules/vpc"

  cidr_block  = "10.0.0.0/16"
  environment = var.environment
  project     = var.project
}

module "managed_vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "managed"
  cidr = "10.1.0.0/16"
}

output "vpc_id" {
  value = module.network.vpc_id
}

output "managed_vpc_id" {
  value = module.managed_vpc.vpc_id
}
