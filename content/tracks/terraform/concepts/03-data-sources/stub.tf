data "aws_vpc" "main" {
  filter {
    name   = "tag:Name"
    values = ["FILL_ME_IN"] # TODO: filter for the production VPC name
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true          # TODO: set to true
  owners      = ["FILL_ME_IN"] # TODO: use Canonical's numeric owner ID

  filter {
    name   = "name"
    values = ["FILL_ME_IN"] # TODO: use the Ubuntu Jammy 22.04 AMI glob pattern
  }
}

resource "aws_instance" "web" {
  ami           = "FILL_ME_IN" # TODO: reference data.aws_ami.ubuntu.id
  instance_type = "t3.micro"

  tags = {
    VpcId = "FILL_ME_IN" # TODO: reference data.aws_vpc.main.id
  }
}

output "vpc_id" {
  value = "FILL_ME_IN" # TODO: output data.aws_vpc.main.id
}
