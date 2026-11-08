## What you build

You define the inputs and outputs of a small module: three variables and two outputs. Variables are the public API of a module, and outputs are what it returns to its caller. This lesson builds on **Providers & Resources**.

## Key concepts

### A `variable` block declares an input

```hcl
variable "environment" {
  type        = string
  description = "staging or production"
  default     = "staging"
}
```

- `type` sets the shape: `string`, `number`, `bool`, `list(string)`, `map(string)`, `set(string)` or `object({...})`.
- `default` makes the variable optional. With no default, Terraform prompts for a value. In CI, it fails unless you pass `-var`.
- `description` documents the purpose of the variable and the value it expects.

Read the value with `var.environment`.

### A `validation` block checks the value

```hcl
variable "instance_type" {
  type    = string
  default = "t3.micro"

  validation {
    condition = contains([
      "t3.micro", "t3.small", "t3.medium",
    ], var.instance_type)
    error_message = "Not an allowed type."
  }
}
```

The `condition` is any expression that returns a `bool`. Terraform checks it at plan time, before any API call. CloudFormation's `AllowedValues` lists fixed values only; a Terraform `condition` can use the full expression language.

### `sensitive` hides a value in the output

```hcl
variable "db_password" {
  type      = string
  sensitive = true
}
```

Terraform redacts the value in the plan and apply output. It does **not** encrypt the value in `terraform.tfstate`. Encryption at rest is the job of the backend.

### An `output` block returns a value

```hcl
output "vpc_id" {
  value       = aws_vpc.main.id
  description = "The ID of the VPC."
}

output "db_endpoint" {
  value     = aws_db_instance.main.endpoint
  sensitive = true
}
```

Terraform prints outputs at the end of `terraform apply`, and `terraform output` shows them again. A module that calls this module reads them as `module.network.vpc_id`.

## Watch out

- A variable with no `default` is a required input. Do not add a default to stop the prompt for a secret.
- If you omit `type`, Terraform accepts any type. A wrong type then fails later, far from the cause. Always declare `type`.
- Before Terraform 1.9, a `condition` can reference only its own variable. Terraform 1.9 and later accepts references to other input variables.
- `sensitive = true` hides the value in CLI output only. Anyone who can read the state file sees it in plain text.

## The task

Define the inputs and outputs of a small module. It has a region, a validated instance size, a secret and two outputs.

1. `variable "region"` has `type = string`, `default = "us-east-1"` and a `description`.
2. `variable "instance_type"` has `type = string` and `default = "t3.micro"`.
3. `instance_type` has a `validation` block. Its `condition` uses `contains([...], var.instance_type)`.
4. The condition allows only `"t3.micro"`, `"t3.small"` and `"t3.medium"`. The block also sets an `error_message`.
5. `variable "db_password"` has `type = string` and `sensitive = true`.
6. `db_password` has no `default`, so every caller must supply it.
7. `output "region"` has `value = var.region`.
8. `output "instance_type"` has `value = var.instance_type` and a `description`.

```hcl
variable "region" {
  # type, default, description
}

variable "instance_type" {
  # type, default, validation { }
}

variable "db_password" {
  # type, sensitive; no default
}

output "region" {
  # value
}

output "instance_type" {
  # value, description
}
```
