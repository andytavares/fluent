data "aws_vpc" "main" {
  filter {
    name   = "tag:Name"
    values = ["production-vpc"]
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"

  tags = {
    VpcId = data.aws_vpc.main.id
  }
}

output "vpc_id" {
  value = data.aws_vpc.main.id
}
