## What you build

You write `arithmetic_ops`, a procedure that adds and multiplies two signed 64-bit integers. It stores both results through pointers that the caller gives. This lesson builds on **Registers & Data Movement**.

## Key concepts

### Basic arithmetic works in place

Each instruction writes its result into the first operand. `inc` does not change CF; use `add rax, 1` when you need CF. `not` changes no flags.

```nasm
; rax += rbx
add  rax, rbx
; rax -= rbx
sub  rax, rbx
; rax++, CF unchanged
inc  rax
; rax--
dec  rax
; rax = -rax (two's complement)
neg  rax
; rax = ~rax (bitwise, no flags)
not  rax
```

### `imul` has three forms

`imul` is the signed multiply. Compilers emit the two-operand and three-operand forms for normal multiplication. The one-operand form gives a 128-bit result for big-number work.

```nasm
; rdx:rax = rax * rbx (128-bit)
imul rbx
; rax = rax * rbx (truncated to 64 bits)
imul rax, rbx
; rax = rbx * 10 (dst, src, imm)
imul rax, rbx, 10
```

### `idiv` divides the `rdx:rax` pair

The dividend of `idiv` is 128 bits wide: `rdx` holds the upper half. `cqo` (Convert Quadword to Octword) sign-extends `rax` into `rdx`. In C, `a / b` compiles to `cqo` and `idiv`.

```nasm
; signed: rax / rcx
; sign-extend rax into rdx:rax first
cqo
; rax = quotient, rdx = remainder
idiv rcx
```

For unsigned division, zero `rdx` with `xor edx, edx`, then use `div`.

### Arithmetic sets the flags in RFLAGS

Each arithmetic instruction sets these flags from its result. Conditional jumps read the flags; you never write them directly.

| Flag | Meaning |
|------|---------|
| **ZF** (Zero Flag) | The result is zero |
| **SF** (Sign Flag) | The top bit of the result is 1 (negative in two's complement) |
| **CF** (Carry Flag) | Unsigned overflow or borrow |
| **OF** (Overflow Flag) | Signed overflow |

```nasm
; ZF=1, SF=0, CF=0, OF=0
sub  rax, rax
mov  rax, -1
; rax=0, ZF=1, CF=1 (unsigned wrap), OF=0
add  rax, 1
```

### Overflow does not stop the CPU

The C standard leaves signed overflow undefined. In hardware, OF is only a flag, and the CPU continues. There is no trap.

```nasm
; wraps to a 64-bit result, sets OF
imul rax, rbx
; jump if the multiply overflowed
jo   .overflow
```

## Watch out

- Only arithmetic and logic instructions update RFLAGS. A `mov` keeps the flags; another `add` or `cmp` replaces them.
- A missing `cqo` before `idiv` leaves old data in `rdx`. You get a wrong quotient that looks plausible.
- `imul reg, reg` wraps on overflow with no trap. Use `jo` to detect it.
- `inc` and `dec` do not change CF. A loop that checks CF after `inc` never sees an overflow. Use `add reg, 1`.

## The task

Write `arithmetic_ops`. It takes two signed 64-bit integers and stores their sum and product in caller memory.

1. The inputs are `rdi = a`, `rsi = b`, `rdx = out_sum` and `rcx = out_product`.
2. Store `a + b` at the address in `rdx`. Use `add`.
3. Store `a * b` at the address in `rcx`. Use the two-operand `imul`.
4. Return nothing.

Use `rax` as a scratch register. `rax`, `rcx`, `rdx`, `rsi` and `rdi` are caller-saved. You can change them without a save and restore.

Negative operands need no special code: `add` and `imul` handle two's complement values. Zero plus zero gives zero.

```nasm
; void arithmetic_ops(int64_t a,
;     int64_t b, int64_t *out_sum,
;     int64_t *out_product)
arithmetic_ops:
    ; TODO
    ret

; arithmetic_ops(6, 7, ...)
;   sum = 13, product = 42
; arithmetic_ops(-3, 5, ...)
;   sum = 2, product = -15
; arithmetic_ops(0, 0, ...)
;   sum = 0
```
