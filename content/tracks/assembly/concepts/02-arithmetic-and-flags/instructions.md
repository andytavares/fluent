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

## Watch out

- Flags go stale fast: only arithmetic/logic instructions update RFLAGS. A `mov` between your `add`/`sub`/`imul` and a later conditional jump does **not** disturb the flags, but inserting another `add` or `cmp` in between will silently replace them.
- Forgetting `cqo` before `idiv` is the single most common division bug — leftover garbage in `rdx` corrupts the 128-bit dividend, producing a wrong (and non-obviously wrong) quotient.
- `imul reg, reg` truncates silently on overflow — there's no trap or exception, just a wrapped 64-bit result. Check `OF` yourself (`jo`) if you need to detect it.
- `inc`/`dec` do not touch `CF`. A loop that increments a counter and then checks `CF` for overflow will never see it — use `add reg, 1` instead if you need that flag.

## The task

Implement `arithmetic_ops` which takes two 64-bit signed integers and writes their sum and product to caller-provided memory. The procedure signature:

```nasm
; void arithmetic_ops(int64_t a, int64_t b, int64_t *out_sum, int64_t *out_product)
; rdi = a, rsi = b, rdx = out_sum, rcx = out_product
; Writes a+b to *out_sum and a*b to *out_product. Returns nothing (void).
arithmetic_ops:
    ; TODO
```

Register contract: `rdi`, `rsi`, `rdx`, `rcx` are inputs. You'll need a scratch register for the arithmetic itself — `rax` is the natural choice, and since `rax`/`rcx`/`rdx`/`rsi`/`rdi` are all caller-saved, you're free to clobber any of them (including the input registers, once you no longer need their values) without saving/restoring anything.

Use `add` for the sum and the two-operand `imul` for the product.

```nasm
arithmetic_ops(6, 7, &sum, &product);    // sum=13,  product=42
arithmetic_ops(-3, 5, &sum, &product);   // sum=2,   product=-15
arithmetic_ops(0, 0, &sum, &product);    // sum=0,   product=0
```

Edge cases: negative operands (two's complement — no special-casing needed, `add`/`imul` handle signed values transparently), and the zero/zero case.
