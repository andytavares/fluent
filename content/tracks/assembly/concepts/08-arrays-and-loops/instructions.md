## What you build

You write `array_sum` and `array_max`, two procedures that loop over an array of `int64_t`. One uses the `loop` instruction, and one walks a pointer. This lesson builds on **System Calls**.

## Key concepts

### An array is a base address and a stride

There is no array type. To read `arr[i]`, use scaled-index addressing, or move a pointer by the element size each pass. `[rdi]` has a shorter encoding than `[rdi + rcx*8]`, so pointer walking often runs faster in tight loops.

```nasm
; Option 1: base + index*scale
; arr[rcx], 8 bytes per element
mov  rax, [rdi + rcx*8]

; Option 2: pointer walking
; *ptr
mov  rax, [rdi]
; ptr++
add  rdi, 8
```

### A counter loop compares the index to `n`

In C, `for (int i = 0; i < n; i++) sum += arr[i]` compiles to this pattern or to the pointer walk.

```nasm
; sum int64_t arr[n]
; rdi = arr, rsi = n, result in rax
    ; sum = 0
    xor  eax, eax
    ; i = 0
    xor  ecx, ecx
.loop:
    cmp  rcx, rsi
    ; exit if i >= n
    jge  .done
    add  rax, [rdi + rcx*8]
    inc  rcx
    jmp  .loop
.done:
```

### `loop` counts `rcx` down to zero

`loop label` subtracts 1 from `rcx` and jumps if `rcx` is not 0. It checks only `rcx`, so `rcx` must count down. If `rcx` is 0 at entry, it wraps to 2^64 - 1, so always guard against 0. Compilers emit `dec rcx` and `jnz` instead, because `loop` is slower on modern CPUs.

```nasm
; the same sum, with loop
    xor   eax, eax
    ; rcx = n (count)
    mov   rcx, rsi
    ; guard: n == 0?
    test  rcx, rcx
    jz    .done
.loop:
    add   rax, [rdi]
    ; advance the pointer
    add   rdi, 8
    ; rcx--; jump if not zero
    loop  .loop
.done:
```

### `lea` gives a one-past-the-end pointer

This is `&arr[n]` in C. It is useful as the end condition of a pointer-walk loop.

```nasm
; rax = &arr[n], one past the end
lea  rax, [rdi + rsi*8]
```

### Assembly has no bounds check

Java and Go insert a bounds check on each array access. In assembly, `arr[-1]` or `arr[n]` reads nearby memory without a warning, or crashes with `SIGSEGV`.

```nasm
; rsi = n: reads past the end
mov  rax, [rdi + rsi*8]
```

## Watch out

- If `rcx` is 0 when `loop` first runs, it wraps to `0xFFFFFFFFFFFFFFFF`. The CPU then seems to hang. Test `n == 0` first.
- `cmp rcx, n` with `jge .done` covers indices 0 to n-1. A `jg` reads one element past the end.
- A pointer-walk loop must add the element size each pass. Without `add rdi, 8`, it reads element 0 again and again.
- `array_max` needs `n >= 1`. With `n == 0`, it reads `[rdi]`, which is not a valid element.

## The task

Write `array_sum` and `array_max`. Both take an array of `int64_t` and return a result in `rax`.

1. Both take `rdi = arr`, a pointer to the first element, and `rsi = n`, the element count.
2. `array_sum` returns the sum of all `n` elements. It returns 0 when `n` is 0.
3. In `array_sum`, use `loop` with `rcx` as the down-counter. Test for `n == 0` before the first `loop`.
4. `array_max` returns the largest element. It needs `n >= 1`.
5. In `array_max`, walk the pointer: add 8 to `rdi` each pass.

`rdi` and `rsi` are caller-saved, so you can change them. Negative elements are valid. Compare them as signed values. For a one-element array, `array_sum` returns that element.

```nasm
; int64_t array_sum(int64_t *arr,
;     int64_t n)
array_sum:
    ; TODO
    ret

; int64_t array_max(int64_t *arr,
;     int64_t n)
array_max:
    ; TODO
    ret

array_sum([1,2,3,4,5], 5)      ; 15
array_sum([-10,0,10,5,-5], 5)  ; 0
array_sum([], 0)               ; 0
array_sum([42], 1)             ; 42
array_sum([100,200,300], 3)    ; 600
array_max([1,2,3,4,5], 5)      ; 5
array_max([-10,0,10,5,-5], 5)  ; 10
```
