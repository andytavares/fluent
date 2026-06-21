variable "environment" {
  type    = string
  default = "staging"
}

variable "project" {
  type    = string
  default = "myapp"
}

module "network" {
  source = "FILL_ME_IN" # TODO: point to the local VPC module path

  cidr_block  = "FILL_ME_IN"  # TODO: set the 10.0.0.0/16 CIDR block
  environment = "FILL_ME_IN"  # TODO: pass var.environment
  project     = "FILL_ME_IN"  # TODO: pass var.project
}

module "managed_vpc" {
  source  = "FILL_ME_IN" # TODO: use the public AWS VPC module from the registry
  version = "FILL_ME_IN" # TODO: pin to the ~> 5.0 constraint

  name = "managed"
  cidr = "FILL_ME_IN" # TODO: set the 10.1.0.0/16 CIDR block
}

output "vpc_id" {
  value = "FILL_ME_IN" # TODO: module.network.vpc_id
}

output "managed_vpc_id" {
  value = "FILL_ME_IN" # TODO: module.managed_vpc.vpc_id
}
