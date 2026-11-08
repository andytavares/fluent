## What you build

You write `set_registers`, a procedure that loads five registers with fixed values. You use `mov` to copy values and `xor` to zero a register.

## Key concepts

### x86-64 has 16 general-purpose registers

Each register is 64 bits wide. Other names address the low 32, 16 or 8 bits of the same physical register.

| 64-bit | 32-bit | 16-bit | 8-bit (low) |
|--------|--------|--------|-------------|
| `rax`  | `eax`  | `ax`   | `al`        |
| `rbx`  | `ebx`  | `bx`   | `bl`        |
| `rcx`  | `ecx`  | `cx`   | `cl`        |
| `rdx`  | `edx`  | `dx`   | `dl`        |
| `rsi`  | `esi`  | `si`   | `sil`       |
| `rdi`  | `edi`  | `di`   | `dil`       |
| `rsp`  | `esp`  | `sp`   | `spl`       |
| `rbp`  | `ebp`  | `bp`   | `bpl`       |
| `r8`   | `r8d`  | `r8w`  | `r8b`       |
| `r9`–`r15` | same pattern | | |

### A 32-bit write clears the upper 32 bits

A write to a 32-bit register, such as `eax`, zero-extends into the full 64-bit register. A write to a 16-bit or 8-bit register leaves the upper bits unchanged. This rule exists only in x86-64: AMD kept compatibility with 32-bit x86 when it extended the instruction set.

```nasm
; rax = all ones
mov rax, 0xFFFFFFFFFFFFFFFF
; rax = 0x0000000000000001
mov eax, 1
; rax = 0xFFFFFFFF00000001
mov ax,  1
```

### `mov dst, src` copies `src` into `dst`

The two operands must have the same size. A source in brackets reads memory at that address. A destination in brackets writes memory.

```nasm
; immediate to register
mov rax, 42
; register to register
mov rbx, rax
; load: rax = memory at address rbx
mov rax, [rbx]
; store: memory at address rbx = rax
mov [rbx], rax
; 32-bit immediate, zero-extended
mov rax, 0x1234ABCD
```

There is no `mov mem, mem`. To copy from one memory location to another, go through a register.

### `xor eax, eax` is the usual way to zero a register

`mov rax, 0` has a 7-byte encoding. `xor eax, eax` has a 2-byte encoding. It writes a 32-bit result, so it zero-extends into `rax`. Compilers emit it everywhere: in C, `int x = 0;` compiles to `xor eax, eax`.

```nasm
; rax = 0, 2 bytes
xor eax, eax
; rax = 0, 7 bytes
mov rax, 0
```

## Watch out

- A write to `ax` or `al` keeps the upper bits of `rax`. To get a clean value in `rax`, write `eax` or `rax`.
- `xor eax, eax` sets flags: ZF=1, SF=0, CF=0, OF=0. It destroys the flags from an earlier `cmp`.
- `rbx` is callee-saved, and a real procedure that changes it must `push` and `pop` it. The concept on procedures explains this rule.
- This task lets you set `rbx` without saving it, because the test reads it right after `call`. Later tasks do not allow this.

## The task

Write the procedure `set_registers`. It takes no arguments and returns nothing. It only loads registers.

1. Set `rax` to 1.
2. Set `rbx` to 2.
3. Set `rcx` to 3.
4. Set `rdx` to 0. Use the usual form, `xor edx, edx`. The test checks only the value.
5. Set `rsi` to 100.

The test puts the sentinel `0xDEADBEEF` in all five registers before the call. A procedure that only does `ret` fails every check. The test does not read `rdi` or `r8`–`r15`, so their values do not matter.

```nasm
; void set_registers(void)
set_registers:
    ; TODO
    ret

; After call set_registers:
; rax = 1
; rbx = 2
; rcx = 3
; rdx = 0
; rsi = 100
```
