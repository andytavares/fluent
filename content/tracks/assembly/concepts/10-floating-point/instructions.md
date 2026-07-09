# Floating-Point with SSE2

## What you'll learn

How x86-64 handles floating-point using XMM registers and SSE2 scalar instructions: `movsd`, `addsd`, `mulsd`, `divsd`, `sqrtsd`, and the integer conversion pair `cvtsi2sd`/`cvttsd2si`.

## Key concepts

### XMM registers and SSE2

x86-64 has 16 XMM registers (`xmm0`–`xmm15`), each 128 bits wide. For scalar double-precision floating-point (64-bit IEEE 754), only the low 64 bits are used. SSE2 instructions with the `sd` suffix operate on a single double in the low lane.

The System V AMD64 ABI passes the first eight floating-point arguments in `xmm0`–`xmm7` and returns floating-point results in `xmm0`.

### Moving data

```nasm
section .data
    pi   dq 3.14159265358979   ; dq stores a 64-bit double

section .text
    movsd  xmm0, [pi]         ; load from memory into xmm0
    movsd  [pi], xmm0         ; store xmm0 to memory
    movsd  xmm1, xmm0         ; copy register to register
```

There is no immediate-to-XMM move. To load a constant you must define it in `.data`/`.rodata` and load from memory, or use `xorps xmm0, xmm0` to zero.

### Arithmetic

All scalar double instructions follow the pattern `op dst, src` where `dst` must be an XMM register:

```nasm
addsd  xmm0, xmm1     ; xmm0 += xmm1
subsd  xmm0, xmm1     ; xmm0 -= xmm1
mulsd  xmm0, xmm1     ; xmm0 *= xmm1
divsd  xmm0, xmm1     ; xmm0 /= xmm1
sqrtsd xmm0, xmm1     ; xmm0 = sqrt(xmm1)
```

`src` can also be a memory operand: `addsd xmm0, [rbx]`.

### Integer conversion

```nasm
; int64 -> double
cvtsi2sd  xmm0, rax    ; xmm0 = (double)rax

; double -> int64 (truncate toward zero, like C cast)
cvttsd2si rax, xmm0    ; rax = (int64_t)xmm0
```

`cvtsi2sd` takes an integer register or memory as the source. `cvttsd2si` (note the extra `t` for truncate) is the equivalent of `(int64_t)x` in C, which always truncates. The non-truncating `cvtsd2si` rounds according to the MXCSR rounding mode (default: round to nearest).

### Comparison

SSE2 comparison doesn't update RFLAGS. Use `ucomisd` then the **unsigned** integer jump variants:

```nasm
ucomisd  xmm0, xmm1    ; compare xmm0 and xmm1, sets ZF/PF/CF
jb   .less             ; jump if xmm0 < xmm1  (unsigned below)
je   .equal
ja   .greater          ; jump if xmm0 > xmm1
jp   .unordered        ; jump if either is NaN (parity flag)
```

## vs other languages

In C, `double x = 3.14; double y = x * 2.0;` compiles to `movsd xmm0, [const]` / `mulsd xmm0, [const2]`. The x87 FPU (the older `fld`/`fstp` instruction set) is still in the ISA but compilers have targeted SSE2 exclusively since around 2005. You will only see x87 in very old code or 32-bit builds.

Go's `float64` maps directly to SSE2 scalar doubles. The Go compiler emits identical SSE2 instructions for floating-point math.

## Watch out

- Never compare doubles for exact equality. Floating-point arithmetic accumulates rounding error, so two mathematically-equal expressions can differ in their last bit — always compare with an epsilon tolerance, the way the test suite does.
- `ucomisd` sets flags differently from integer `cmp`. `je`/`jne` happen to work correctly afterward (both read `ZF`), but `jl`/`jg` do **not** — use the unsigned forms `jb`/`ja` after `ucomisd`, even though the operands are signed doubles.
- `cvttsd2si` truncates toward zero (like a C cast); `cvtsd2si` rounds per the current MXCSR mode (nearest, by default). Reaching for the wrong one silently changes the result for values like `2.5` — truncating gives `2`, rounding gives `2`, but `2.9` gives `2` vs `3`.
- All XMM registers (`xmm0`–`xmm15`) are caller-saved in the System V ABI — never assume a value in an XMM register survives a `call` the way `rbx` would.

## The task

Implement `euclidean_distance`, which computes the 2D Euclidean distance between two points, and `int_to_double`, which converts a signed integer to its double-precision representation:

```nasm
; double euclidean_distance(double x1, double y1, double x2, double y2)
; xmm0=x1, xmm1=y1, xmm2=x2, xmm3=y2
; Returns sqrt((x2-x1)^2 + (y2-y1)^2) in xmm0
euclidean_distance:
    ; TODO: compute dx=x2-x1, dy=y2-y1, return sqrt(dx*dx + dy*dy)

; double int_to_double(int64_t n)
; rdi = integer
; Returns (double)n in xmm0
int_to_double:
    ; TODO
```

Register contract: for `euclidean_distance`, `xmm0`–`xmm3` are inputs and all caller-saved, so clobbering them (including the ones that hold `x1`/`y1`) is fine as long as the final result ends up in `xmm0`. For `int_to_double`, `rdi` is the input integer; the result goes in `xmm0`.

```nasm
euclidean_distance(0.0, 0.0, 3.0, 4.0);   // 5.0            — classic 3-4-5 triangle
euclidean_distance(0.0, 0.0, 1.0, 1.0);   // ~1.4142135...  — sqrt(2)
euclidean_distance(3.0, 4.0, 3.0, 4.0);   // 0.0            — distance to itself
euclidean_distance(-3.0, -4.0, 0.0, 0.0); // 5.0            — negative coordinates

int_to_double(10);   // 10.0
int_to_double(0);     // 0.0
int_to_double(42);    // 42.0
int_to_double(-7);    // -7.0
```

Test comparisons use an epsilon of `0.001` — you don't need bit-exact results, just standard IEEE 754 double arithmetic via `subsd`/`mulsd`/`addsd`/`sqrtsd`.
