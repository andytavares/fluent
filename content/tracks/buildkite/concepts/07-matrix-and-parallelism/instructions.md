## What you build

You write three steps that each turn one step definition into many jobs: two with `matrix` and one with `parallelism`. The two mechanisms solve different problems and do not replace each other. This lesson builds on **Conditionals** and **Agents and Targeting**.

## Key concepts

### `matrix` runs one command shape with different inputs

A matrix expands one step template across a list of values. Buildkite puts each value into `{{matrix}}` in `label`, `command` or `commands`, `env`, `plugins` and `agents`.

```yaml
steps:
  - label: ":test_tube: Test {{matrix}}"
    command: "make test V={{matrix}}"
    matrix:
      - "3.9"
      - "3.10"
      - "3.11"
```

This makes three jobs, one per Python version. Use a single-dimension matrix when only one value changes between jobs.

### `matrix.setup` makes every combination

For more than one changing value, use `setup` with named dimensions. Buildkite creates the full cross-product. Refer to each dimension as `{{matrix.<dimension-name>}}`.

```yaml
steps:
  - label: "{{matrix.os}}/{{matrix.arch}}"
    command: >-
      echo {{matrix.os}} {{matrix.arch}}
    matrix:
      setup:
        os:
          - "linux"
          - "windows"
        arch:
          - "amd64"
          - "arm64"
```

Two dimensions of two values each make four jobs (2 × 2). The `>-` folds the next line into one string value.

### `adjustments` changes one combination

With `matrix.setup`, an `adjustments` list can change single combinations. `skip: true` removes a combination. `soft_fail` lets it fail without failing the build. Use `soft_fail` for a known-broken or low-priority combination that you still want to see.

```yaml
    matrix:
      setup:
        os: ["linux", "windows"]
        arch: ["amd64", "arm64"]
      adjustments:
        - with:
            os: "windows"
            arch: "arm64"
          skip: true
```

### `parallelism` splits one workload

`parallelism: N` creates N identical jobs from one step, with the same command and environment. Use it to split one large workload, often a test suite, across workers.

Each job gets `BUILDKITE_PARALLEL_JOB`, its 0-based index, and `BUILDKITE_PARALLEL_JOB_COUNT`, the total. Your test runner or a split script reads them to choose its part of the work.

```yaml
steps:
  - label: ":test_tube: Sharded tests"
    # reads BUILDKITE_PARALLEL_JOB
    command: "make test-shard"
    parallelism: 4
```

### Matrix and parallelism solve different problems

A matrix runs a step against N different inputs, such as versions, OSes or architectures. Each job is different. `parallelism` splits one workload across N identical workers for speed. Each job differs only in the part of the work it takes.

You cannot use `matrix:` and `parallelism:` on the same step. You can use both in one build, on separate steps. GitHub Actions uses its one `matrix` mechanism for both jobs. Buildkite keeps two attributes, by design.

## Watch out

- `key` and `concurrency_group` do not accept `{{matrix}}`. Matrix jobs get no unique key automatically.
- Only `env`, `label`, `commands`, `plugins` and `agents` accept `{{matrix}}`.
- `parallelism` does not split anything. Your test runner must read the two variables, or each job runs the whole suite.
- `adjustments` needs `matrix.setup`. A bare list-form matrix cannot have `adjustments`.

## The task

Write a pipeline in `stub.yaml` with three command steps. Step labels are free text: the checks do not read them, so a label can differ from the stub's comment.

1. Version matrix: `label: ":test_tube: Test {{matrix}}"`, `key: "test-matrix"`, `command: "make test LANG_VERSION={{matrix}}"`.
2. Give the version matrix a single-dimension `matrix:` list: `"3.9"`, `"3.10"`, `"3.11"`.
3. OS and arch matrix: `label: "{{matrix.os}}/{{matrix.arch}}"`, `key: "test-matrix-multi"`. Its command echoes both dimensions.
4. Give it a `matrix.setup` with `os` (`"linux"`, `"windows"`) and `arch` (`"amd64"`, `"arm64"`). Write each value on its own line.
5. Add an `adjustments` entry that skips the `windows` and `arm64` combination with `skip: true`.
6. Sharded tests: `label: ":test_tube: Sharded tests"`, `key: "test-shards"`, `command: "make test-shard"`, `parallelism: 4`.

The sharded step must not have `matrix:`.

```yaml
steps:
  - label: ":test_tube: Test {{matrix}}"
    key: "test-matrix"
    command: "make test LANG_VERSION={{matrix}}"
    matrix:
      - "3.9"
      - "3.10"
      - "3.11"

  - label: "{{matrix.os}}/{{matrix.arch}}"
    key: "test-matrix-multi"
    command: >-
      echo {{matrix.os}} {{matrix.arch}}
    matrix:
      setup:
        os:
          - "linux"
          - "windows"
        arch:
          - "amd64"
          - "arm64"
      adjustments:
        - with:
            os: "windows"
            arch: "arm64"
          skip: true

  - label: ":test_tube: Sharded tests"
    key: "test-shards"
    command: "make test-shard"
    parallelism: 4
```
