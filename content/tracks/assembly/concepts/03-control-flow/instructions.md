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

## Watch out

- Signed vs. unsigned jumps are not interchangeable: `jl`/`jg` read `SF`/`OF`, while `jb`/`ja` read `CF`. Using the unsigned form on signed data (or vice versa) gives the wrong branch exactly when a value has its high bit set — the bug that shows up only for negative numbers or huge unsigned values.
- Off-by-one at the boundary: `cmp rcx, 10` / `jge .done` exits when `rcx == 10`, so the loop body runs for `rcx = 0..9` — ten iterations. Swapping in `jg` runs an extra, out-of-bounds iteration.
- Dot-prefixed local labels (`.done`) are scoped to the nearest preceding non-dot label. Two procedures each defining `.done` don't collide — but forgetting this and jumping from one procedure's code into another's `.done` by name will not do what you expect (NASM resolves the reference to whichever `.done` is currently in scope, which is usually a redefinition error, not a silent bug).
- Falling off the end of an `if` without a closing `jmp` executes the next block unconditionally — a classic copy-paste mistake when adding a third branch to existing `if`/`else` code.

## The task

Implement `clamp`, which clamps a value to the inclusive range `[min_val, max_val]`:

```nasm
; int64_t clamp(int64_t value, int64_t min_val, int64_t max_val)
; rdi = value, rsi = min_val, rdx = max_val
; Returns the clamped value in rax
clamp:
    ; TODO
```

Register contract: `rdi`, `rsi`, `rdx` are inputs; you may clobber any of them (they're caller-saved) once read. Return the result in `rax`.

```nasm
clamp(5, 0, 10);      // 5   — already in range
clamp(-5, 0, 10);     // 0   — clamped up to min_val
clamp(15, 0, 10);     // 10  — clamped down to max_val
clamp(0, 0, 10);      // 0   — boundary: equal to min_val
clamp(10, 0, 10);     // 10  — boundary: equal to max_val
clamp(-100, -50, 50); // -50 — negative range
```

Use `cmp` and conditional jumps. No library calls needed. Assume `min_val <= max_val`.
