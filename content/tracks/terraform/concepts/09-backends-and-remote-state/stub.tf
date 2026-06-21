terraform {
  required_version = ">= 1.5.0"

  backend "s3" {
    bucket         = "FILL_ME_IN"  # TODO: set the S3 bucket name for state
    key            = "FILL_ME_IN"  # TODO: set the state file path within the bucket
    region         = "FILL_ME_IN"  # TODO: set the AWS region
    encrypt        = false          # TODO: enable encryption
    dynamodb_table = "FILL_ME_IN"  # TODO: set the DynamoDB lock table name
  }
}

data "terraform_remote_state" "network" {
  backend = "FILL_ME_IN" # TODO: set the backend type
  config = {
    bucket = "FILL_ME_IN"  # TODO: set the S3 bucket name
    key    = "FILL_ME_IN"  # TODO: set the network layer state path
    region = "FILL_ME_IN"  # TODO: set the AWS region
  }
}

resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  subnet_id     = "FILL_ME_IN" # TODO: data.terraform_remote_state.network.outputs.public_subnet_id
}

output "instance_id" {
  value = "FILL_ME_IN" # TODO: aws_instance.app.id
}
