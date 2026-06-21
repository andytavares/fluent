variable "region" {
  type        = string
  description = "AWS region to deploy resources into."
  default     = "us-east-1"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"

  validation {
    condition     = contains(["t3.micro", "t3.small", "t3.medium"], var.instance_type)
    error_message = "instance_type must be one of: t3.micro, t3.small, t3.medium."
  }
}

variable "db_password" {
  type      = string
  sensitive = true
}

output "region" {
  value = var.region
}

output "instance_type" {
  value       = var.instance_type
  description = "The EC2 instance type used for application servers."
}
