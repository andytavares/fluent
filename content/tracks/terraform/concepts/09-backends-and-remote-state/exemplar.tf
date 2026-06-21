terraform {
  required_version = ">= 1.5.0"

  backend "s3" {
    bucket         = "my-tf-state-prod"
    key            = "app/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

data "terraform_remote_state" "network" {
  backend = "s3"
  config = {
    bucket = "my-tf-state-prod"
    key    = "network/terraform.tfstate"
    region = "us-east-1"
  }
}

resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  subnet_id     = data.terraform_remote_state.network.outputs.public_subnet_id
}

output "instance_id" {
  value = aws_instance.app.id
}
