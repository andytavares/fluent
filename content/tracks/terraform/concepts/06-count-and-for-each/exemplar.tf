variable "subnet_names" {
  type    = set(string)
  default = toset(["public", "private", "data"])
}

variable "environments" {
  type = map(string)
  default = {
    staging    = "t3.micro"
    production = "t3.large"
  }
}

resource "aws_subnet" "app" {
  for_each = var.subnet_names

  vpc_id     = "vpc-placeholder"
  cidr_block = "10.0.${index(tolist(var.subnet_names), each.key)}.0/24"

  tags = {
    Name = each.key
  }
}

resource "aws_instance" "env" {
  for_each = var.environments

  ami           = "ami-placeholder"
  instance_type = each.value

  tags = {
    Name = each.key
  }
}

resource "aws_eip" "nat" {
  count = 2

  tags = {
    Index = count.index
  }
}
