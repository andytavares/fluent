# Procedures & Calling Conventions

## What you'll learn

How `call`/`ret` work mechanically, the System V AMD64 ABI argument and return register assignment, and which registers you must save vs. which you can trash freely.

## Key concepts

### `call` and `ret`

`call label` pushes the return address (`rip + instruction size`) onto the stack, then jumps to `label`. `ret` pops that address back into `rip`.

```nasm
call my_func    ; push rip_next; jmp my_func
; execution resumes here after ret

my_func:
    ; do work
    ret         ; pop return address into rip
```

### System V AMD64 ABI — argument registers

The Linux/macOS 64-bit calling convention passes the first six integer/pointer arguments in registers, in this order:

| Argument | Register |
|----------|----------|
| 1st | `rdi` |
| 2nd | `rsi` |
| 3rd | `rdx` |
| 4th | `rcx` |
| 5th | `r8` |
| 6th | `r9` |
| 7th+ | pushed on stack, right-to-left |

Return value: `rax` (and `rdx` for 128-bit returns).

```nasm
; Calling: int result = add(3, 4)
mov  rdi, 3
mov  rsi, 4
call add_ints
; result now in rax

add_ints:
    mov  rax, rdi
    add  rax, rsi
    ret
```

### Caller-saved vs callee-saved registers

This is the most operationally important part of the ABI:

**Caller-saved** (volatile — callee may trash freely):
`rax`, `rcx`, `rdx`, `rsi`, `rdi`, `r8`, `r9`, `r10`, `r11`

**Callee-saved** (non-volatile — callee must preserve):
`rbx`, `rbp`, `r12`, `r13`, `r14`, `r15`

If your procedure uses `rbx` or `r12`–`r15`, you must `push` them at entry and `pop` them before `ret`. If you call another function that might clobber `rdi` or `rsi`, save them yourself before the call.

```nasm
my_proc:
    push r12          ; callee-saved: save
    mov  r12, rdi     ; keep first arg safe across nested calls

    call some_other_func   ; would trash rdi, rsi, rax, etc.

    mov  rax, r12     ; r12 still has original rdi
    pop  r12          ; callee-saved: restore
    ret
```

### `rsp` alignment reminder

Before any `call`, `rsp` must be 16-byte aligned. After `call` pushes the return address, `rsp` is 8-byte aligned at function entry. `push rbp` restores alignment. If you allocate local space, use multiples of 16.

## vs other languages

In C, Go, Java, and Rust the compiler manages all of this. When GCC compiles a C function it emits exactly these push/pop sequences for callee-saved registers, exactly these `mov rdi, ...` assignments before a call, and exactly this `mov rax, ...` for the return value. Reading compiler output with `objdump -d` or Godbolt is now directly legible to you.

Windows x64 uses a different ABI: first four args in `rcx, rdx, r8, r9` with a mandatory 32-byte shadow space. Assembly that works on Linux will not work on Windows without changes.

## The task

Implement `apply_twice`, which calls a provided function pointer twice, passing the result of the first call as the argument to the second:

```nasm
; int64_t apply_twice(int64_t (*fn)(int64_t), int64_t x)
; rdi = function pointer, rsi = x
; Returns fn(fn(x))
apply_twice:
    ; TODO
```

The function pointer is a callable address in `rdi`. You'll need to save `rdi` (caller-saved) across the first `call` using a callee-saved register.
