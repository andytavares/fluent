locals {
  environment = "FILL_ME_IN" # TODO: derive from the current workspace name

  is_prod = false # TODO: true only in the production workspace

  instance_type = "FILL_ME_IN" # TODO: larger size for prod, smaller otherwise

  name_prefix = "FILL_ME_IN" # TODO: prefix combining the app name and workspace
}

resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "FILL_ME_IN" # TODO: use the instance_type local

  tags = {
    Environment = "FILL_ME_IN" # TODO: use the environment local
    Name        = "FILL_ME_IN" # TODO: use name_prefix to build the instance name
  }
}

resource "aws_s3_bucket" "state_backup" {
  bucket = "FILL_ME_IN" # TODO: use name_prefix to build the bucket name

  tags = {
    Environment = "FILL_ME_IN" # TODO: use the environment local
  }
}

output "environment" {
  value = "FILL_ME_IN" # TODO: output the environment local
}

output "instance_type" {
  value = "FILL_ME_IN" # TODO: output the instance_type local
}
