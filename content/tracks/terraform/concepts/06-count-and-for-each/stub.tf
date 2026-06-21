variable "subnet_names" {
  type    = set(string)
  default = [] # TODO: populate with the three subnet names
}

variable "environments" {
  type    = map(string)
  default = {} # TODO: map each environment name to its instance type
}

resource "aws_subnet" "app" {
  for_each = "FILL_ME_IN" # TODO: iterate over var.subnet_names

  vpc_id     = "vpc-placeholder"
  cidr_block = "FILL_ME_IN" # TODO: use each.key in the cidr somehow

  tags = {
    Name = "FILL_ME_IN" # TODO: use each.key
  }
}

resource "aws_instance" "env" {
  for_each = "FILL_ME_IN" # TODO: iterate over var.environments

  ami           = "ami-placeholder"
  instance_type = "FILL_ME_IN" # TODO: use each.value

  tags = {
    Name = "FILL_ME_IN" # TODO: use each.key
  }
}

resource "aws_eip" "nat" {
  count = 0 # TODO: set to 2

  tags = {
    Index = "FILL_ME_IN" # TODO: use count.index
  }
}
