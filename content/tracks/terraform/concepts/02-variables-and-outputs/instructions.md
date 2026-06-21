# Variables & Outputs

## What you'll learn

How Terraform parameterizes configurations with `variable` blocks and surfaces results with `output` blocks. Variables are the public API of a module; outputs are the public API it returns to its caller.

## Key concepts

### `variable` blocks

```hcl
variable "environment" {
  type        = string
  description = "Deployment environment (staging or production)."
  default     = "staging"
}
```

- `type` enforces the shape: `string`, `number`, `bool`, `list(string)`, `map(string)`, `object({...})`, `set(string)`.
- `default` makes the variable optional. Without it, Terraform prompts (or errors in CI unless `-var` is passed).
- `description` shows up in `terraform plan` output and auto-generated docs.

Reference with `var.environment`.

### Validation blocks

```hcl
variable "instance_type" {
  type    = string
  default = "t3.micro"

  validation {
    condition     = contains(["t3.micro", "t3.small", "t3.medium"], var.instance_type)
    error_message = "instance_type must be one of: t3.micro, t3.small, t3.medium."
  }
}
```

Validation runs at plan time, before any API call is made. The `condition` is any expression that returns `bool`.

### Sensitive variables

```hcl
variable "db_password" {
  type      = string
  sensitive = true
}
```

Terraform redacts the value in plan/apply output and state file display. It does **not** encrypt the value in `terraform.tfstate` on disk — that's the backend's job.

### `output` blocks

```hcl
output "vpc_id" {
  value       = aws_vpc.main.id
  description = "The ID of the created VPC."
}

output "db_endpoint" {
  value     = aws_db_instance.primary.endpoint
  sensitive = true
}
```

Outputs are printed at the end of `terraform apply` and accessible via `terraform output`. When this module is called from another module, the caller reads outputs with `module.network.vpc_id`.

## vs other tools

| Tool | Equivalent concept |
|------|--------------------|
| **CloudFormation** | `Parameters` (input) and `Outputs` (output) — same idea, YAML-only, no type system beyond basic CF types |
| **Pulumi** | Config values (`pulumi.Config`) and stack outputs; typed, but read from code not HCL |
| **Helm** | `values.yaml` with `--set` overrides; no built-in validation blocks |

Terraform's validation block is more powerful than CloudFormation's `AllowedValues` — it can express arbitrary conditions using the full expression language.

## The task

Write a Terraform configuration that:

1. Declares a `variable "region"` of type `string` with default `"us-east-1"` and a description.
2. Declares a `variable "instance_type"` of type `string` with default `"t3.micro"` and a `validation` block that only allows `"t3.micro"`, `"t3.small"`, or `"t3.medium"`.
3. Declares a `variable "db_password"` of type `string` with `sensitive = true` and no default.
4. Declares an `output "region"` that outputs `var.region`.
5. Declares an `output "instance_type"` that outputs `var.instance_type` with a description.
