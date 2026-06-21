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

## The task

Implement `euclidean_distance` which computes the 2D Euclidean distance between two points:

```nasm
; double euclidean_distance(double x1, double y1, double x2, double y2)
; xmm0=x1, xmm1=y1, xmm2=x2, xmm3=y2
; Returns sqrt((x2-x1)^2 + (y2-y1)^2) in xmm0
euclidean_distance:
    ; TODO: compute dx=x2-x1, dy=y2-y1, return sqrt(dx*dx + dy*dy)
```

Also implement `int_to_double` for the conversion exercise:

```nasm
; double int_to_double(int64_t n)
; rdi = integer
; Returns (double)n in xmm0
int_to_double:
    ; TODO
```
