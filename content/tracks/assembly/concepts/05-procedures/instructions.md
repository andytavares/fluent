## What you build

You write `apply_twice`, a procedure that calls a function pointer two times and returns `fn(fn(x))`. It keeps the pointer safe across a call in a callee-saved register. This lesson builds on **The Stack**.

## Key concepts

### `call` pushes the return address, `ret` pops it

`call label` pushes the address of the next instruction, then jumps to `label`. `ret` pops that address into `rip`.

```nasm
; push next rip; jmp my_func
call my_func
; execution continues here after ret

my_func:
    ; do work
    ; pop the return address into rip
    ret
```

### The first six arguments go in registers

The System V AMD64 ABI is the 64-bit calling convention on Linux and macOS. It passes the first six integer or pointer arguments in this order:

| Argument | Register |
|----------|----------|
| 1st | `rdi` |
| 2nd | `rsi` |
| 3rd | `rdx` |
| 4th | `rcx` |
| 5th | `r8` |
| 6th | `r9` |
| 7th and later | on the stack, right to left |

The return value goes in `rax`, and in `rdx` too for a 128-bit value.

```nasm
; int result = add_ints(3, 4)
mov  rdi, 3
mov  rsi, 4
call add_ints
; the result is in rax

add_ints:
    mov  rax, rdi
    add  rax, rsi
    ret
```

### A callee can change caller-saved registers

This split is the most important part of the ABI in practice.

- **Caller-saved** (volatile): `rax`, `rcx`, `rdx`, `rsi`, `rdi`, `r8`, `r9`, `r10`, `r11`. A callee can change them.
- **Callee-saved** (non-volatile): `rbx`, `rbp`, `r12`, `r13`, `r14`, `r15`. A callee must keep their values.

If your procedure uses `rbx` or `r12`–`r15`, `push` them at entry and `pop` them before `ret`. To keep `rdi` or `rsi` across a call, save them yourself before the call.

```nasm
my_proc:
    ; callee-saved: save
    push r12
    ; keep the first argument across calls
    mov  r12, rdi
    ; can change rdi, rsi, rax
    call some_other_func
    ; r12 still holds the old rdi
    mov  rax, r12
    ; callee-saved: restore
    pop  r12
    ret
```

### `rsp` must be 16-byte aligned before each `call`

At entry, `rsp % 16 == 8`, because `call` pushed the return address. `push rbp` restores the alignment. Local space must be a multiple of 16.

```nasm
; at entry: rsp % 16 == 8
push rbp
; now rsp % 16 == 0
call helper
```

### Compilers follow the same convention

GCC emits these pushes and pops for callee-saved registers, these `mov rdi, ...` before a call, and this `mov rax, ...` for the return value. You can now read `objdump -d` and Godbolt output. Windows x64 uses a different ABI: `rcx`, `rdx`, `r8`, `r9` for the first four arguments, and a 32-byte shadow space.

```nasm
; Windows x64: first argument
mov  rcx, 3
; Linux and macOS: first argument
mov  rdi, 3
```

### `call reg` calls a function pointer

An indirect call through a register works like `call label`. A function pointer needs no special syntax.

```nasm
; rbx holds a function address
call rbx
```

## Watch out

- Any call can change caller-saved registers, including a call through a function pointer you do not control.
- To use a value after a `call`, keep it in a callee-saved register or on the stack first.
- Pop callee-saved registers in the reverse order of the pushes. The wrong order swaps their values, and the assembler gives no error.
- An odd number of pushes before a `call` breaks alignment. The crash can happen inside the callee, far from the cause.

## The task

Write `apply_twice`. It calls a one-argument function `fn` two times. The second call gets the result of the first call.

1. The inputs are `rdi = fn`, a function address, and `rsi = x`.
2. `fn` takes its argument in `rdi` and returns its result in `rax`.
3. Call `fn(x)`, then call `fn` with that result.
4. Return `fn(fn(x))` in `rax`.
5. A call to `fn` can change `rdi` and `rsi`. Keep `fn` in a callee-saved register: `rbx` or `r12`–`r15`.
6. `push` that register at entry, and `pop` it before `ret`.

The test calls `apply_twice` with a doubling function and a function that adds 2.

```nasm
; int64_t apply_twice(
;     int64_t (*fn)(int64_t), int64_t x)
apply_twice:
    ; TODO
    ret

; double_val(x) = x * 2
apply_twice(double_val, 3)  ; 12
apply_twice(double_val, 1)  ; 4
apply_twice(double_val, 0)  ; 0
; inc2(x) = x + 2
apply_twice(inc2, 10)       ; 14
```
