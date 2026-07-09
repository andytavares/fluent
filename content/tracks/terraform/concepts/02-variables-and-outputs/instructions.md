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

## Watch out

- **A variable with no `default` is a required input.** Omitting `default` on `db_password` is intentional here — it forces every caller to supply a value rather than silently deploying with an empty password. Don't add a `default` to "fix" a plan-time prompt; that defeats the point of `sensitive`.
- **`type` is not optional in practice.** You can omit it (Terraform infers `any`), but then a caller passing a number where you expected a string won't be caught until it breaks something downstream. Always declare `type`.
- **`validation.condition` must reference `var.<name>` of the *same* variable it's attached to** — you cannot validate one variable's block against another variable directly (use a `precondition` elsewhere for cross-variable checks).
- **`sensitive = true` only redacts CLI/UI output.** It does not encrypt the value at rest in `terraform.tfstate`. Anyone with read access to the state file (or the backend) can still see it in plaintext.

## The task

You're defining the input/output surface for a small module: three variables (a public region config, a validated instance size, a secret) and two outputs that echo the non-secret ones back.

```hcl
variable "region" {
  # type, default, description
}

variable "instance_type" {
  # type, default, and a validation { } block
}

variable "db_password" {
  # type, sensitive — required (no default)
}

output "region" {
  # value
}

output "instance_type" {
  # value, description
}
```

Fill it in so that:

1. `variable "region"` has `type = string`, `default = "us-east-1"`, and a `description`.
2. `variable "instance_type"` has `type = string`, `default = "t3.micro"`, and a `validation` block whose `condition` uses `contains([...], var.instance_type)` to allow only `"t3.micro"`, `"t3.small"`, or `"t3.medium"`, plus an `error_message`.
3. `variable "db_password"` has `type = string`, `sensitive = true`, and **no `default`** (it must be a required input).
4. `output "region"` has `value = var.region`.
5. `output "instance_type"` has `value = var.instance_type` and a `description`.
