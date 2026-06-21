locals {
  environment = terraform.workspace

  is_prod = terraform.workspace == "production"

  instance_type = terraform.workspace == "production" ? "t3.large" : "t3.micro"

  name_prefix = "myapp-${terraform.workspace}"
}

resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = local.instance_type

  tags = {
    Environment = local.environment
    Name        = "${local.name_prefix}-app"
  }
}

resource "aws_s3_bucket" "state_backup" {
  bucket = "${local.name_prefix}-state-backup"

  tags = {
    Environment = local.environment
  }
}

output "environment" {
  value = local.environment
}

output "instance_type" {
  value = local.instance_type
}
