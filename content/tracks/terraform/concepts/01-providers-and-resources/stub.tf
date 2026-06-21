terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "FILL_ME_IN" # TODO: pin to the ~> 5.0 constraint
    }
  }
}

provider "aws" {
  region = "FILL_ME_IN" # TODO: set the us-west-2 region
}

resource "aws_vpc" "main" {
  cidr_block = "FILL_ME_IN" # TODO: use the 10.0.0.0/16 block

  tags = {
    # TODO: add Name = "main-vpc" and Environment = "production"
  }
}

resource "aws_subnet" "public" {
  vpc_id     = "FILL_ME_IN" # TODO: reference the VPC id attribute
  cidr_block = "FILL_ME_IN" # TODO: use the 10.0.1.0/24 block
}
