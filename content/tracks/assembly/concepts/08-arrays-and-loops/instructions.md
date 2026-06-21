# Arrays & Loops

## What you'll learn

How to traverse arrays using a register as a pointer, how to maintain loop counters, how scaled-index addressing maps directly to array indexing, and the `loop` instruction.

## Key concepts

### Arrays are just contiguous memory

There is no array type. An array is a base address and a stride. To access `int64_t arr[i]` at runtime:

```nasm
; Option 1: base + index*scale in the address expression
mov  rax, [rdi + rcx*8]    ; arr[rcx]  (8 bytes per element)

; Option 2: pointer walking (increment pointer each iteration)
mov  rax, [rdi]             ; *ptr
add  rdi, 8                 ; ptr++
```

Pointer walking is often faster in tight loops because `[rdi]` has a shorter encoding than `[rdi + rcx*8]` and avoids the multiply.

### Counter-based loop pattern

```nasm
; Sum int64_t arr[n]: rdi=arr, rsi=n, result in rax
    xor  eax, eax          ; sum = 0
    xor  ecx, ecx          ; i = 0
.loop:
    cmp  rcx, rsi
    jge  .done             ; if i >= n, exit
    add  rax, [rdi + rcx*8]
    inc  rcx
    jmp  .loop
.done:
```

### The `loop` instruction

`loop label` decrements `rcx` and jumps if `rcx != 0`. It's concise but has a subtle trap: it only checks `rcx`, so you must set it up as a down-counter, and it doesn't branch if `rcx` starts at 0 (which would underflow to UINT64_MAX and loop 2^64 times).

```nasm
; Same sum, using loop
    xor   eax, eax
    mov   rcx, rsi          ; rcx = n  (count)
    test  rcx, rcx
    jz    .done             ; guard: n == 0?
.loop:
    add   rax, [rdi]
    add   rdi, 8            ; advance pointer
    loop  .loop             ; rcx--; jnz
.done:
```

Always guard `loop` against `rcx == 0` on entry.

### Pointer arithmetic with `lea`

```nasm
lea  rax, [rdi + rsi*8]    ; rax = &arr[n]  (one-past-end pointer)
```

This is exactly `&arr[n]` in C — the pointer to one past the last element, useful as a loop-termination sentinel.

## vs other languages

In C, `for (int i = 0; i < n; i++) sum += arr[i]` compiles to exactly the counter-based pattern above, or to the pointer-walk variant if the compiler auto-vectorizes with pointer bumps. GCC's `-O2` will often replace the `loop` instruction with `dec rcx; jnz` because `loop` is slower on modern CPUs despite being shorter.

Java and Go iterate over slices/arrays with bounds checking inserted by the runtime. In assembly there is no bounds check — accessing `arr[-1]` or `arr[n]` silently reads adjacent memory or crashes with SIGSEGV.

## The task

Implement `array_sum` and `array_max`:

```nasm
; int64_t array_sum(int64_t *arr, int64_t n)
; rdi=arr, rsi=n
; Returns sum of all elements. Returns 0 if n==0.
array_sum:
    ; TODO

; int64_t array_max(int64_t *arr, int64_t n)
; rdi=arr, rsi=n
; Returns the maximum element. Assumes n >= 1.
array_max:
    ; TODO
```

Use a loop with `rcx` as the counter for `array_sum`. Use pointer walking for `array_max`.
