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

## Watch out

- `loop` decrements `rcx` and jumps if the result is nonzero. If `rcx` is 0 on entry, it wraps to `0xFFFFFFFFFFFFFFFF` and the CPU appears to hang — always test `n == 0` before the first `loop`.
- Off-by-one at the loop bound: `cmp rcx, n` / `jge .done` correctly processes indices `0..n-1`; using `jg` instead runs one iteration past the end of the array.
- Pointer-walking loops must advance the pointer by the element's size every iteration. Forgetting `add rdi, 8` for an `int64_t` array re-reads element 0 forever instead of advancing.
- `array_max`'s precondition `n >= 1` is a real contract, not just documentation — calling it with `n == 0` dereferences `[rdi]` before the array has any valid elements, reading whatever memory happens to precede it.

## The task

Implement `array_sum` and `array_max`, both operating on arrays of `int64_t`:

```nasm
; int64_t array_sum(int64_t *arr, int64_t n)
; rdi=arr, rsi=n
; Returns the sum of all n elements in rax. Returns 0 if n == 0.
array_sum:
    ; TODO

; int64_t array_max(int64_t *arr, int64_t n)
; rdi=arr, rsi=n
; Returns the maximum element in rax. Precondition: n >= 1 (undefined for n == 0).
array_max:
    ; TODO
```

Register contract: `rdi` (array pointer) and `rsi` (count) are inputs, both caller-saved — clobber freely once read. Return the result in `rax`.

```nasm
array_sum([1,2,3,4,5], 5);        // 15
array_sum([-10,0,10,5,-5], 5);    // 0
array_sum([], 0);                 // 0   — empty array
array_sum([42], 1);                // 42  — single element

array_max([1,2,3,4,5], 5);        // 5
array_max([-10,0,10,5,-5], 5);    // 10
```

Use a loop with `rcx` as the down-counter for `array_sum` (guard against `n == 0` before the first `loop`). Use pointer walking (advance `rdi` by 8 each iteration) for `array_max`.
