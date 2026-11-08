## What you build

You write `clamp`, a procedure that limits a value to a range. You build the branches from `cmp` and conditional jumps. This lesson builds on **Arithmetic & Flags**.

## Key concepts

### `cmp` and `test` only set flags

Neither instruction stores a result. `test rax, rax` is the usual check for zero or negative, and it is shorter than `cmp rax, 0`.

```nasm
; rax - rbx, sets ZF/SF/CF/OF
cmp  rax, rbx
; rax & rax, sets ZF/SF
test rax, rax
```

### Conditional jumps read the flags

A conditional jump reads the flags from the last `cmp` or `test`.

| Instruction | Meaning | Flags checked |
|-------------|-----------------|---------------|
| `je` / `jz`  | equal / zero     | ZF=1 |
| `jne` / `jnz`| not equal        | ZF=0 |
| `jl` / `jnge`| less than (signed) | SF≠OF |
| `jle`        | less or equal (signed) | ZF=1 or SF≠OF |
| `jg` / `jnle`| greater than (signed) | ZF=0 and SF=OF |
| `jge` / `jnl`| greater or equal (signed) | SF=OF |
| `jb` / `jc`  | below (unsigned) | CF=1 |
| `ja`         | above (unsigned) | CF=0 and ZF=0 |

```nasm
; if (rax == rbx) goto equal
cmp  rax, rbx
je   equal
; the else path continues here
```

### `jmp` always jumps to a label

A label is a name for an address. The assembler converts it to an offset.

```nasm
    cmp  rdi, 0
    jl   negative
    ; non-negative path
    mov  rax, 1
    jmp  done
negative:
    mov  rax, -1
done:
    ret
```

### A loop is a compare and a jump back

There is no loop syntax. Every `if`, `while` and `for` in C, Go, Java and Python compiles to `cmp` or `test` and a conditional jump.

```nasm
; for (rcx = 0; rcx < 10; rcx++)
;     rax += rcx
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

### A dot label belongs to the label above it

A label that starts with `.` is local to the nearest label above it without a dot. Two procedures can each have a `.done` label.

```nasm
clamp:
    jmp  .done
; full name: clamp.done
.done:
    ret
```

### `switch` uses a jump table or a chain

A compiler turns a dense `switch` into a jump table: an array of addresses indexed by the case value. A sparse `switch` becomes a chain of `cmp` and `je`.

```nasm
; sparse switch on rdi
cmp  rdi, 1
je   .case_one
cmp  rdi, 100
je   .case_hundred
```

## Watch out

- `jl` and `jg` read SF and OF. `jb` and `ja` read CF. Do not mix signed and unsigned jumps.
- The wrong jump type fails only when the top bit is set: negative numbers or huge unsigned values.
- `cmp rcx, 10` with `jge .done` runs the body for `rcx` 0 to 9. A `jg` adds an extra, out-of-bounds pass.
- `.done` always means the local label under the current procedure. To reach another procedure's label, use its full name, such as `clamp.done`.
- An `if` branch without a closing `jmp` runs the next block too. This mistake is common when you add a third branch.

## The task

Write `clamp`. It limits a signed 64-bit value to the inclusive range from `min_val` to `max_val`.

1. The inputs are `rdi = value`, `rsi = min_val` and `rdx = max_val`.
2. If `value` is less than `min_val`, return `min_val`.
3. If `value` is greater than `max_val`, return `max_val`.
4. Otherwise, return `value`.
5. Return the result in `rax`.

Use `cmp` and conditional jumps. Do not call a library. You can change `rdi`, `rsi` and `rdx`, because they are caller-saved. You can assume `min_val <= max_val`. A value equal to a bound returns that bound. Negative ranges follow the same rules.

```nasm
; int64_t clamp(int64_t value,
;     int64_t min_val, int64_t max_val)
clamp:
    ; TODO
    ret

clamp(5, 0, 10)       ; 5
clamp(-5, 0, 10)      ; 0
clamp(15, 0, 10)      ; 10
clamp(0, 0, 10)       ; 0
clamp(10, 0, 10)      ; 10
clamp(-100, -50, 50)  ; -50
```
