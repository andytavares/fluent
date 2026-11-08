## What you build

You write `swap_via_stack`, a procedure that swaps two values in memory. It uses the stack, not a spare register, to hold the temporary value. This lesson builds on **Control Flow**.

## Key concepts

### The stack grows downward

`rsp` points to the top of the stack, which is the lowest address in use. `push` subtracts 8 from `rsp`, then stores the value. `pop` loads the value, then adds 8 to `rsp`.

```nasm
; rsp -= 8; [rsp] = rax
push rax
; rbx = [rsp]; rsp += 8
pop  rbx
```

### `sub rsp` reserves space

You can change `rsp` directly to reserve or release local space.

```nasm
; reserve 32 bytes of local space
sub  rsp, 32
; use [rsp], [rsp+8], [rsp+16], [rsp+24]
; release
add  rsp, 32
```

### A prologue and an epilogue make a stack frame

Debuggers and unwinders walk the chain of stack frames. Leaf functions and code built with `-fomit-frame-pointer` can skip `rbp`. You still must know the pattern, because debuggers depend on it.

```nasm
my_function:
    ; save the caller's base pointer
    push rbp
    ; set our frame pointer
    mov  rbp, rsp
    ; 32 bytes for locals
    sub  rsp, 32

    ; body: locals at [rbp-8], [rbp-16]

    ; restore the stack to the frame base
    mov  rsp, rbp
    ; restore the caller's base pointer
    pop  rbp
    ret
```

### `rsp` must be 16-byte aligned at each `call`

The System V AMD64 ABI sets this rule. At entry, `rsp % 16 == 8`, because `call` pushed an 8-byte return address. `push rbp` restores the alignment, so a local allocation must be a multiple of 16.

```nasm
; at entry: rsp % 16 == 8
; now rsp % 16 == 0
push rbp
; 32 is a multiple of 16: still aligned
sub  rsp, 32
; sub rsp, 24 gives rsp % 16 == 8: wrong
```

A misaligned stack makes SSE instructions fault with `SIGSEGV` or `SIGBUS`. It is one of the most common assembly bugs.

### `push` and `pop` save callee-saved registers

Pop the registers in the reverse order of the pushes.

```nasm
my_func:
    ; callee-saved: restore before ret
    push rbx
    push r12
    push r13

    ; use rbx, r12, r13 here

    pop  r13
    pop  r12
    pop  rbx
    ret
```

### High-level languages manage the frame for you

In C, Go, Rust and Java, the compiler or runtime manages `rsp` and `rbp`. Go grows a goroutine stack by copying it to a new location, so its stack pointer can move. In assembly, you own `rsp`. If you do not restore it before `ret`, the CPU jumps to a wrong address.

```nasm
    push rax
    ; no pop: ret jumps to the value of rax
    ret
```

## Watch out

- Match each `push` with a `pop` or an `add rsp, N` before `ret`. Otherwise `ret` jumps to a wrong address.
- `push` and `pop` always move 8 bytes on x86-64. `push eax` does not exist.
- Alignment must hold at every `call`, not only at entry. An odd number of pushes breaks it for the next call.
- Before `sub rsp, N` runs, `[rbp-8]` is not your memory yet. It holds old data from earlier use.

## The task

Write `swap_via_stack`. It swaps the two 64-bit values at the addresses in `rdi` and `rsi`.

1. The inputs are `rdi = a` and `rsi = b`. Both are pointers.
2. Set up a stack frame with `push rbp` and `mov rbp, rsp`.
3. Use `push` and `pop` as the temporary storage. Do not hold the value in a spare register.
4. After the call, `*a` holds the old `*b`, and `*b` holds the old `*a`.
5. Restore `rsp` to its value at entry, then return nothing.

`rdi` and `rsi` are caller-saved, so you can change them after you read through them. An unbalanced stack makes `ret` jump to a wrong address, which usually crashes the test. Equal values stay equal after the swap. Negative values swap like any other value.

```nasm
; void swap_via_stack(int64_t *a,
;     int64_t *b)
swap_via_stack:
    push rbp
    mov  rbp, rsp
    ; TODO
    mov  rsp, rbp
    pop  rbp
    ret

; a = 10, b = 20 -> a = 20, b = 10
; a = -1, b = 99 -> a = 99, b = -1
; a = 42, b = 42 -> a = 42, b = 42
```
