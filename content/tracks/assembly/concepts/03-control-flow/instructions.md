# Control Flow

## What you'll learn

How x86-64 implements `if`, `else`, and loops using `cmp`/`test` to set flags and conditional jumps to branch on them.

## Key concepts

### `cmp` and `test`

Neither instruction stores a result — they exist only to set flags.

```nasm
cmp  rax, rbx    ; computes rax - rbx, discards result, sets ZF/SF/CF/OF
test rax, rax    ; computes rax & rax, discards result, sets ZF/SF
```

`test rax, rax` is the idiomatic way to check if a register is zero or negative. It's shorter than `cmp rax, 0`.

### Conditional jumps

Jump instructions read the flags set by the preceding `cmp` or `test`:

| Instruction | Meaning (signed) | Flags checked |
|-------------|-----------------|---------------|
| `je` / `jz`  | equal / zero     | ZF=1 |
| `jne` / `jnz`| not equal        | ZF=0 |
| `jl` / `jnge`| less than        | SF≠OF |
| `jle`        | less or equal    | ZF=1 or SF≠OF |
| `jg` / `jnle`| greater than     | ZF=0 and SF=OF |
| `jge` / `jnl`| greater or equal | SF=OF |
| `jb` / `jc`  | below (unsigned) | CF=1 |
| `ja`         | above (unsigned) | CF=0 and ZF=0 |

```nasm
; if (rax == rbx) goto equal
cmp  rax, rbx
je   equal
; else path falls through here
```

### Unconditional jump and labels

`jmp label` transfers control unconditionally. Labels are just symbolic addresses — the assembler resolves them to offsets.

```nasm
    cmp  rdi, 0
    jl   negative
    mov  rax, 1        ; non-negative path
    jmp  done
negative:
    mov  rax, -1
done:
    ret
```

### Implementing loops

There's no loop syntax — you build it from `cmp`/conditional jump:

```nasm
; for (rcx = 0; rcx < 10; rcx++)  rax += rcx
    xor  eax, eax
    xor  ecx, ecx
.loop:
    cmp  rcx, 10
    jge  .done
    add  rax, rcx
    inc  rcx
    jmp  .loop
.done:
```

Labels starting with `.` are local to the nearest non-dot label — they won't conflict across procedures.

## vs other languages

Every `if`/`while`/`for` in C, Go, Java, and Python compiles to exactly this pattern: `cmp`/`test` followed by a conditional jump. Decompilers reconstruct high-level control flow from these primitives. When you read compiler output in Godbolt, this is what you're looking at.

`switch` typically compiles to a jump table (an array of addresses indexed by the switch value) when the cases are dense, or a chain of `cmp`/`je` when they're sparse.

## The task

Implement `clamp`, which clamps a value to `[min_val, max_val]`:

```nasm
; int64_t clamp(int64_t value, int64_t min_val, int64_t max_val)
; rdi = value, rsi = min_val, rdx = max_val
; Returns clamped value in rax
clamp:
    ; TODO
```

Use `cmp` and conditional jumps. No library calls needed.
