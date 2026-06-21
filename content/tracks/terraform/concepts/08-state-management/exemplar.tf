resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name = "web-server"
  }
}

resource "aws_instance" "app" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.small"

  tags = {
    Name = "app-server"
  }
}

import {
  to = aws_instance.web
  id = "i-0abc123def456"
}

output "web_instance_id" {
  value = aws_instance.web.id
}

output "app_instance_id" {
  value = aws_instance.app.id
}
