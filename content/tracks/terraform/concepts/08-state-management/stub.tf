resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "FILL_ME_IN" # TODO: set to t3.micro

  tags = {
    Name = "FILL_ME_IN" # TODO: tag as web-server
  }
}

resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "FILL_ME_IN" # TODO: set to t3.small

  tags = {
    Name = "FILL_ME_IN" # TODO: tag as app-server
  }
}

# TODO: add an import block mapping aws_instance.web to its existing instance ID

output "web_instance_id" {
  value = "FILL_ME_IN" # TODO: aws_instance.web.id
}

output "app_instance_id" {
  value = "FILL_ME_IN" # TODO: aws_instance.app.id
}
