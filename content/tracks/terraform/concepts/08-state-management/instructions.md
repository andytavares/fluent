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

## The task

This concept is about operational knowledge, not HCL authoring. The "stub" is a configuration you'd operate against. Write a Terraform configuration that:

1. Declares an `aws_instance` resource named `"web"` with `ami = "ami-0c55b159cbfafe1f0"`, `instance_type = "t3.micro"`, and a tag `Name = "web-server"`.
2. Declares an `aws_instance` resource named `"app"` with `ami = "ami-0c55b159cbfafe1f0"`, `instance_type = "t3.small"`, and a tag `Name = "app-server"`.
3. Declares an `import` block that maps the HCL address `aws_instance.web` to the provider ID `"i-0abc123def456"`.
4. Declares an `output "web_instance_id"` with value `aws_instance.web.id`.
5. Declares an `output "app_instance_id"` with value `aws_instance.app.id`.
