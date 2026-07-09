# The Stack

## What you'll learn

How the x86-64 stack works mechanically: `push`/`pop`, `rsp` as the stack pointer, how to set up and tear down a stack frame, and the 16-byte alignment rule that causes cryptic crashes.

## Key concepts

### The stack grows downward

`rsp` points to the top of the stack, which is the **lowest** address currently in use. `push` decrements `rsp` by 8 then stores the value; `pop` loads the value then increments `rsp` by 8.

```nasm
push rax      ; rsp -= 8; [rsp] = rax
pop  rbx      ; rbx = [rsp]; rsp += 8
```

You can also manipulate `rsp` directly to reserve space:

```nasm
sub  rsp, 32    ; allocate 32 bytes of local space
; use [rsp], [rsp+8], [rsp+16], [rsp+24]
add  rsp, 32    ; release
```

### Stack frame setup and teardown

The conventional prologue and epilogue create a **stack frame** that debuggers and unwinders can walk:

```nasm
my_function:
    push rbp          ; save caller's base pointer
    mov  rbp, rsp     ; establish our frame pointer
    sub  rsp, 32      ; allocate 32 bytes for locals (must be multiple of 16 after push rbp)

    ; function body — access locals via [rbp-8], [rbp-16], etc.

    mov  rsp, rbp     ; restore stack to frame base
    pop  rbp          ; restore caller's base pointer
    ret
```

`rbp` is optional in leaf functions and in code compiled with `-fomit-frame-pointer`, but it's mandatory to understand because debuggers depend on it.

### 16-byte alignment

The System V AMD64 ABI requires `rsp` to be 16-byte aligned **at the point of a `call` instruction**. At function entry (just after `call`), `rsp` is 8-byte aligned because `call` pushed the 8-byte return address. `push rbp` restores 16-byte alignment. If you then allocate locals, the allocation must be a multiple of 16.

```nasm
; At entry: rsp % 16 == 8  (call pushed 8-byte return address)
push rbp          ; rsp % 16 == 0  (pushed 8 bytes, now aligned)
sub  rsp, 32      ; rsp % 16 == 0  (32 is a multiple of 16 — correct)
; sub rsp, 24 would give rsp % 16 == 8 — wrong, SSE ops will crash
```

Violating alignment produces `SIGSEGV` or `SIGBUS` when SSE instructions access misaligned memory. It's one of the most common assembly bugs.

### Saving registers across calls

`push`/`pop` pairs are how callee-saved registers are preserved:

```nasm
my_func:
    push rbx          ; callee-saved: must restore before ret
    push r12
    push r13

    ; use rbx, r12, r13 freely here

    pop  r13
    pop  r12
    pop  rbx
    ret
```

## vs other languages

Every function call in C, Go, Rust, and Java creates a stack frame. The language runtime manages `rsp` and `rbp` for you. In assembly you own it entirely — forget to restore `rsp` before `ret` and the CPU jumps to garbage.

Go's goroutines use segmented/copyable stacks, which means Go's stack pointer can move. The hardware stack mechanics are the same; the runtime wraps them.

## Watch out

- Every `push` must be matched by a `pop` (or an equivalent `add rsp, N`) before `ret`. One unbalanced `push` shifts `rsp` so that `ret` pops the wrong 8 bytes as a return address — the CPU jumps to garbage instead of returning to the caller.
- `push`/`pop` always move a full 8 bytes on x86-64, regardless of which register name you use — there's no `push eax` equivalent that moves 4.
- 16-byte alignment must hold at every `call`, not just at function entry. Pushing an odd number of registers before calling out breaks alignment for that call even if your own frame was set up correctly.
- Once you `sub rsp, N` to reserve locals, reading `[rbp-8]` before that `sub` executes reads stack memory that isn't yours yet (it may belong to whatever the CPU last used at that address).

## The task

Implement `swap_via_stack`, which swaps the values at two memory addresses using the stack as temporary storage — no spare general-purpose register may hold the temp value:

```nasm
; void swap_via_stack(int64_t *a, int64_t *b)
; rdi = pointer to a, rsi = pointer to b
; Swaps *a and *b using push/pop. Returns nothing (void).
swap_via_stack:
    ; TODO: set up a proper stack frame, then use push/pop to swap *a and *b
```

Register contract: `rdi` and `rsi` are input pointers (caller-saved — clobber freely once dereferenced). On return, `rsp` must be exactly what it was at entry (after the standard `push rbp` / `mov rbp, rsp` prologue is undone) — an unbalanced stack is a test failure even if the swapped values happen to be correct.

```nasm
int64_t a = 10, b = 20;
swap_via_stack(&a, &b);   // a == 20, b == 10

int64_t x = -1, y = 99;
swap_via_stack(&x, &y);   // x == 99, y == -1

int64_t p = 42, q = 42;
swap_via_stack(&p, &q);   // p == 42, q == 42 — equal values swap to the same result
```

The test verifies both the swap result and that `rsp` is properly restored on return.
