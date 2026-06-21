# Arithmetic & Flags

## What you'll learn

How x86-64 performs integer arithmetic (`add`, `sub`, `imul`, `idiv`), how every arithmetic instruction updates RFLAGS, and what those flags mean for conditional branching.

## Key concepts

### Basic arithmetic

```nasm
add  rax, rbx     ; rax += rbx
sub  rax, rbx     ; rax -= rbx
inc  rax          ; rax++  (does NOT affect CF — use add rax,1 if you need CF)
dec  rax          ; rax--
neg  rax          ; rax = -rax  (two's complement negation)
not  rax          ; rax = ~rax  (bitwise NOT, does not affect flags)
```

### Multiplication: `imul`

`imul` (signed multiply) has three forms:

```nasm
imul rbx              ; rdx:rax = rax * rbx  (128-bit result, rarely used)
imul rax, rbx         ; rax = rax * rbx      (truncated to 64 bits)
imul rax, rbx, 10     ; rax = rbx * 10       (three-operand: dst, src, imm)
```

The two- and three-operand forms are what compilers emit for normal multiplication. The single-operand form is for big-number work.

### Division: `idiv`

Division is the awkward one. `idiv` always divides the `rdx:rax` pair:

```nasm
; Divide rax by rcx, signed
cqo           ; sign-extend rax into rdx:rax  (critical — must do this first)
idiv rcx      ; rax = quotient, rdx = remainder
```

`cqo` (Convert Quadword to Octword) sign-extends `rax` into `rdx`. Forgetting it is a classic bug — if `rdx` has leftover garbage, the division result is wrong. For unsigned division use `xor edx, edx` to zero `rdx` then `div`.

### RFLAGS

Every arithmetic instruction sets these flags in RFLAGS based on the result:

| Flag | Meaning |
|------|---------|
| **ZF** (Zero Flag) | Result was zero |
| **SF** (Sign Flag) | Result's MSB is 1 (result is negative in two's complement) |
| **CF** (Carry Flag) | Unsigned overflow/borrow |
| **OF** (Overflow Flag) | Signed overflow |

```nasm
sub  rax, rax    ; ZF=1, SF=0, CF=0, OF=0
mov  rax, -1
add  rax, 1      ; rax=0, ZF=1, CF=1 (unsigned wrap), OF=0
```

Conditional jump instructions read these flags — you never touch them directly.

## vs other languages

In C, `a / b` compiles to `cqo` + `idiv`. The compiler handles the `rdx` setup for you. If you write division in assembly and skip `cqo`, you're writing a bug the C compiler never makes.

`inc` and `dec` do not affect CF, which surprises people expecting them to behave exactly like `add reg, 1`. Compilers often prefer `add` over `inc` for this reason in loop contexts.

Integer overflow in C is undefined behavior for signed types. At the hardware level, OF is just a flag — the CPU keeps running. There is no trap.

## The task

Implement `arithmetic_ops` which takes two 64-bit signed integers in `rdi` and `rsi`, and returns a struct-like pair via memory. The procedure signature:

```nasm
; void arithmetic_ops(int64_t a, int64_t b, int64_t *out_sum, int64_t *out_product)
; rdi = a, rsi = b, rdx = out_sum, rcx = out_product
; Writes a+b to *out_sum and a*b to *out_product
arithmetic_ops:
    ; TODO
```

Use `add` for the sum and the two-operand `imul` for the product.
