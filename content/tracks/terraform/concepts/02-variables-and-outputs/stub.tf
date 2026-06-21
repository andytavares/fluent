variable "region" {
  type        = string
  description = "FILL_ME_IN" # TODO: add a description
  default     = "FILL_ME_IN" # TODO: set the default region
}

variable "instance_type" {
  type    = string
  default = "t3.micro"

  # TODO: add a validation block that allows only t3.micro, t3.small, t3.medium
}

variable "db_password" {
  type      = string
  sensitive = false # TODO: mark as sensitive = true
}

output "region" {
  value = "FILL_ME_IN" # TODO: output var.region
}

output "instance_type" {
  value       = "FILL_ME_IN"  # TODO: output var.instance_type
  description = "FILL_ME_IN"  # TODO: add a description
}
