## What you build

You write `euclidean_distance`, which returns the distance between two 2D points, and `int_to_double`, which converts an integer to a double. You use XMM registers and SSE2 scalar instructions. This lesson builds on **String Operations**.

## Key concepts

### XMM registers hold floating-point values

x86-64 has 16 XMM registers, `xmm0`–`xmm15`, each 128 bits wide. A scalar double (64-bit IEEE 754) uses only the low 64 bits. SSE2 instructions with the `sd` suffix work on one double in that low lane.

The System V AMD64 ABI passes the first eight floating-point arguments in `xmm0`–`xmm7`. It returns a floating-point result in `xmm0`.

```nasm
; double f(double a, double b)
; a = xmm0, b = xmm1, result in xmm0
addsd  xmm0, xmm1
ret
```

### `movsd` moves a double

There is no move from an immediate to an XMM register. Put a constant in `.data` or `.rodata` and load it. To zero a register, use `xorps xmm0, xmm0`.

```nasm
section .data
    ; dq stores a 64-bit double
    pi   dq 3.14159265358979

section .text
    ; load from memory into xmm0
    movsd  xmm0, [pi]
    ; store xmm0 to memory
    movsd  [pi], xmm0
    ; copy register to register
    movsd  xmm1, xmm0
```

### Arithmetic is `op dst, src`

`dst` must be an XMM register. `src` can be an XMM register or memory, such as `addsd xmm0, [rbx]`.

```nasm
; xmm0 += xmm1
addsd  xmm0, xmm1
; xmm0 -= xmm1
subsd  xmm0, xmm1
; xmm0 *= xmm1
mulsd  xmm0, xmm1
; xmm0 /= xmm1
divsd  xmm0, xmm1
; xmm0 = sqrt(xmm1)
sqrtsd xmm0, xmm1
```

### Two instructions convert between integers and doubles

`cvtsi2sd` takes an integer register or memory as the source. `cvttsd2si` truncates toward zero, like `(int64_t)x` in C. The extra `t` means truncate. `cvtsd2si` rounds by the MXCSR rounding mode, which is round-to-nearest by default.

```nasm
; int64 -> double
; xmm0 = (double)rax
cvtsi2sd  xmm0, rax

; double -> int64, toward zero
; rax = (int64_t)xmm0
cvttsd2si rax, xmm0
```

### `ucomisd` compares doubles with unsigned jumps

`ucomisd` sets ZF, PF and CF in RFLAGS. Use the unsigned jumps after it. A NaN operand sets ZF, PF and CF together, so test `jp` first.

```nasm
; compare xmm0 and xmm1
ucomisd  xmm0, xmm1
; either is NaN (parity flag)
jp   .unordered
; xmm0 < xmm1 (unsigned below)
jb   .less
je   .equal
; xmm0 > xmm1
ja   .greater
```

### Compilers use SSE2, not x87

In C, `double y = x * 2.0;` compiles to `movsd` and `mulsd`. The x87 FPU (`fld`, `fstp`) is still in the instruction set, but x86-64 compilers use SSE2. You see x87 only in old code or 32-bit builds. Go `float64` math uses the same SSE2 instructions.

```nasm
; y = x * 2.0
movsd  xmm0, [x]
mulsd  xmm0, [two]
```

## Watch out

- Do not compare doubles for exact equality. Rounding error can change the last bit. Compare with an epsilon, as the test does.
- After `ucomisd`, `je` and `jne` work, because they read ZF. `jl` and `jg` do not. Use `jb` and `ja`.
- `cvttsd2si` truncates; `cvtsd2si` rounds. For `2.9`, truncation gives 2 and rounding gives 3.
- All XMM registers are caller-saved in the System V ABI. A value in an XMM register does not survive a `call`.

## The task

Write `euclidean_distance` and `int_to_double`.

1. `euclidean_distance` takes four doubles: `xmm0 = x1`, `xmm1 = y1`, `xmm2 = x2` and `xmm3 = y2`.
2. It returns `sqrt((x2-x1)^2 + (y2-y1)^2)` in `xmm0`.
3. Use `subsd`, `mulsd`, `addsd` and `sqrtsd`.
4. `int_to_double` takes a signed integer in `rdi`.
5. It returns that value as a double in `xmm0`. Use `cvtsi2sd`.

`xmm0`–`xmm3` are caller-saved, so you can overwrite `x1` and `y1`. The result must end in `xmm0`. The test accepts a result within `0.001` of the expected value. The distance from a point to itself is 0. Negative coordinates and negative integers work the same way.

```nasm
; double euclidean_distance(
;     double x1, double y1,
;     double x2, double y2)
euclidean_distance:
    ; TODO
    ret

; double int_to_double(int64_t n)
int_to_double:
    ; TODO
    ret

; euclidean_distance(...):
;   (0, 0, 3, 4)    -> 5.0
;   (0, 0, 1, 1)    -> 1.4142135...
;   (3, 4, 3, 4)    -> 0.0
;   (-3, -4, 0, 0)  -> 5.0
int_to_double(10)  ; 10.0
int_to_double(0)   ; 0.0
int_to_double(42)  ; 42.0
int_to_double(-7)  ; -7.0
```
