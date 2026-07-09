# State Management

## What you'll learn

What Terraform state is, why it exists, how to inspect and manipulate it safely, and what to do when the real world diverges from what state believes.

## Key concepts

### What state is

Terraform keeps a mapping between your HCL configuration and the real infrastructure objects it manages in `terraform.tfstate` (JSON). Every resource Terraform creates gets an entry in state with:

- The resource address (`aws_instance.web`)
- The provider-assigned ID (`i-0abc123def456`)
- All current attribute values

This lets Terraform answer: "Does this resource already exist? What does it look like? What needs to change?"

Without state, every `terraform plan` would have to query every resource from scratch — slow and often impossible for resources with no stable query key.

### State is sensitive

`terraform.tfstate` may contain secrets (database passwords, private keys) in plaintext. Never commit it to version control. Use a remote backend with encryption (S3 + SSE, Terraform Cloud, etc.) — covered in concept 09.

### `terraform state` subcommands

```bash
# List all resources in state
terraform state list

# Inspect a single resource's full state
terraform state show aws_instance.web

# Move a resource to a new address (rename without destroy/recreate)
terraform state mv aws_instance.web aws_instance.app

# Remove a resource from state without destroying it
# (use when you want Terraform to stop managing something)
terraform state rm aws_s3_bucket.legacy

# Pull the current state as JSON
terraform state pull

# Push a local state file to the remote backend (use with extreme care)
terraform state push terraform.tfstate
```

### State drift

Drift happens when real infrastructure is changed outside Terraform (manual console edits, other tools, failed applies). Terraform detects drift during `terraform plan` by comparing state to the live API.

```bash
# Refresh state against live infrastructure without planning/applying
terraform refresh  # deprecated in favor of: terraform apply -refresh-only
```

`terraform apply -refresh-only` shows you what drifted and, if approved, updates state to match reality without making any infrastructure changes. It does not automatically revert drift.

To revert drift (make real infra match your config), run a normal `terraform apply`.

### Importing existing resources

If infrastructure already exists and you want Terraform to start managing it:

```bash
terraform import aws_instance.web i-0abc123def456
```

This creates a state entry but doesn't generate HCL. You write the `resource` block manually, import to create the state entry, then `terraform plan` to verify zero diff.

Terraform 1.5+ supports `import` blocks in HCL for version-controlled, reviewable imports:

```hcl
import {
  to = aws_instance.web
  id = "i-0abc123def456"
}
```

## vs other tools

| Tool | State/drift model |
|------|------------------|
| **CloudFormation** | Stack state is managed by AWS; drift detection is a separate, slower API call |
| **Pulumi** | Same concept (a state backend); Pulumi Cloud or self-managed; `pulumi refresh` for drift |
| **Ansible** | Stateless by default; idempotency is the playbook's responsibility, not a stored mapping |
| **CDK** | Compiles to CF — inherits CF stack state |

Terraform's state model gives more control than CloudFormation (you can surgically move, remove, or import individual resources) at the cost of needing to manage the state file yourself.

## Watch out

- **`terraform state rm` does not destroy anything in the real world.** It only removes the state *entry* — the object keeps running, Terraform just forgets about it. Confusing this with `terraform destroy` is a classic "why is this still in AWS" mistake.
- **`import` blocks describe intent, not a one-time action.** Once an `import { to = ..., id = ... }` block exists and has been applied, it's safe to leave in the config — Terraform skips imports for addresses already present in state. Some teams remove it after the first successful apply; either is fine, but leaving it is not an error.
- **An imported resource has no HCL until you write it.** `terraform import` (or an `import` block) only populates *state*. If the matching `resource` block doesn't exist, or doesn't match the real object's attributes, the very next plan will show a diff trying to "correct" the resource back to what your HCL says — potentially destructively.
- **`terraform state mv` renames an address without recreating anything** — this is the standard tool for refactoring resource names or moving a resource into/out of a module without downtime.

## The task

You're managing two EC2 instances in HCL and bringing a third, pre-existing instance under Terraform's management via an `import` block, so all three end up tracked in state.

```hcl
resource "aws_instance" "web" {
  # ami, instance_type, tags
}

resource "aws_instance" "app" {
  # ami, instance_type, tags
}

import {
  # to, id
}

output "web_instance_id" {
  # value
}

output "app_instance_id" {
  # value
}
```

Fill it in so that:

1. `resource "aws_instance" "web"` sets `ami = "ami-0c55b159cbfafe1f0"`, `instance_type = "t3.micro"`, and a tag `Name = "web-server"`.
2. `resource "aws_instance" "app"` sets `ami = "ami-0c55b159cbfafe1f0"`, `instance_type = "t3.small"`, and a tag `Name = "app-server"`.
3. An `import` block sets `to = aws_instance.web` (an HCL address, not a string) and `id = "i-0abc123def456"` (the provider's real instance ID, as a string).
4. `output "web_instance_id"` has `value = aws_instance.web.id`.
5. `output "app_instance_id"` has `value = aws_instance.app.id`.
