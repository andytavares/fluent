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

## The task

Implement the procedure `set_registers`:

```nasm
; void set_registers(void)
; Sets: rax = 1, rbx = 2, rcx = 3, rdx = 0 (using xor), rsi = 100
; The test reads these register values immediately after call returns.
; Callee-saved registers (rbx) must be preserved by you if you use them —
; for this exercise the test will check values before rbp/rsp are touched.
set_registers:
    ; TODO
```

The procedure takes no arguments and returns nothing via rax. The test runner will inspect register state immediately after `set_registers` returns.
