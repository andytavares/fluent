# Registers & Data Movement

## What you'll learn

How x86-64 general-purpose registers are named and sized, how to move data between them with `mov`, and how to zero a register cheaply with `xor`.

## Key concepts

### The register file

x86-64 has 16 general-purpose 64-bit registers. Each one has overlapping sub-register names that address 32, 16, or 8 bits of the same physical register:

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

**Critical side effect**: writing to a 32-bit register (e.g., `eax`) **zero-extends** into the full 64-bit register. Writing to a 16- or 8-bit register does **not** — the upper bits are unchanged. This is a frequent source of bugs.

```nasm
mov rax, 0xFFFFFFFFFFFFFFFF   ; rax = all ones
mov eax, 1                     ; rax = 0x0000000000000001 (zero-extended!)
mov ax,  1                     ; rax = 0xFFFFFFFF00000001 (upper 48 bits unchanged)
```

### The `mov` instruction

`mov dst, src` — copies src into dst. The operands must be the same size.

```nasm
mov rax, 42          ; rax = 42  (immediate to register)
mov rbx, rax         ; rbx = rax (register to register)
mov rax, [rbx]       ; rax = memory at address rbx (load)
mov [rbx], rax       ; memory at address rbx = rax  (store)
mov rax, 0x1234ABCD  ; 32-bit immediate, zero-extended to 64 bits
```

There is no `mov mem, mem` — you cannot copy directly from one memory location to another. You must route through a register.

### Zeroing registers

`mov rax, 0` works, but the encoding is 7 bytes. `xor eax, eax` encodes in 2 bytes and is the idiomatic way to zero a register. Because it writes a 32-bit result, it zero-extends into `rax`.

```nasm
xor eax, eax    ; rax = 0  (idiomatic, 2 bytes)
mov rax, 0      ; rax = 0  (also correct, 7 bytes)
```

Every compiler generates `xor eax, eax` — you'll see it constantly in disassembly.

## vs other languages

In C, `int x = 0;` compiles to `xor eax, eax`. In Go or Java the runtime may zero memory through memset-like loops. In assembly you pick the exact register and instruction yourself — the compiler's job is now yours.

The 32-bit zero-extension rule is x86-64-specific. There is no equivalent in any high-level language; it exists because AMD chose backward-compatibility with 32-bit x86 when extending the ISA to 64 bits.

## Watch out

- Writing a 16- or 8-bit sub-register (`ax`, `al`) leaves the upper bits of the full 64-bit register untouched — if you expect a clean value in `rax` afterward, write `eax` (or `rax`) instead.
- `xor eax, eax` sets flags (ZF=1, SF=0, CF=0, OF=0) as a side effect of the XOR — if you were relying on flags from an earlier `cmp`, this instruction clobbers them.
- `rbx` is normally callee-saved (lesson 5 covers this in full) — a real procedure that touches `rbx` must `push`/`pop` it before returning. This exercise's test inspects registers immediately after `call`, before any caller code resumes, so it deliberately lets you set `rbx` directly without saving it. Don't take this as license to skip callee-saved discipline in later lessons.

## The task

Implement the procedure `set_registers`, which takes no arguments and returns nothing:

```nasm
; void set_registers(void)
; Sets: rax = 1, rbx = 2, rcx = 3, rdx = 0, rsi = 100
set_registers:
    ; TODO
```

Register contract: on return, `rax`, `rbx`, `rcx`, `rdx`, `rsi` must hold the exact values above. `rdx` should be zeroed with `xor edx, edx` (the idiomatic form) — the test only checks the value, not which instruction produced it. Any register not listed (`rdi`, `r8`–`r15`) may be left in any state; the test does not inspect them.

The test runner poisons all five registers with a sentinel value before calling `set_registers`, then reads each one immediately after it returns — so a no-op `ret` fails every check.
