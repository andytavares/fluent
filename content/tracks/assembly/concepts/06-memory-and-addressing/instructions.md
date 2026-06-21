# Memory & Addressing

## What you'll learn

How NASM sections map to memory segments, how to declare initialized and uninitialized data, and the full x86-64 effective address syntax including scaled-index addressing.

## Key concepts

### Sections

```nasm
section .data     ; initialized read-write data (goes into the binary)
section .rodata   ; initialized read-only data (string literals, constants)
section .bss      ; uninitialized data (zero-filled by OS, no space in binary)
section .text     ; executable code
```

### Data declarations

In `.data` and `.rodata`:

| Directive | Size | Example |
|-----------|------|---------|
| `db` | 1 byte | `db 0x41` or `db "hello", 0` |
| `dw` | 2 bytes | `dw 1000` |
| `dd` | 4 bytes | `dd 3.14` |
| `dq` | 8 bytes | `dq 0xDEADBEEFCAFEBABE` |

In `.bss` (reserve without initializing):

| Directive | Size |
|-----------|------|
| `resb` | 1 byte |
| `resw` | 2 bytes |
| `resd` | 4 bytes |
| `resq` | 8 bytes (quad) |

```nasm
section .data
    greeting  db "Hello", 10, 0   ; "Hello\n\0"
    count     dq 42

section .bss
    buffer    resb 256            ; 256 uninitialised bytes
    matrix    resq 16             ; 16 x 8-byte slots = 128 bytes
```

### Effective address syntax

x86-64 memory operands use the form `[base + index*scale + displacement]`:

```nasm
mov rax, [rbx]               ; load from address in rbx
mov rax, [rbx + 8]           ; load from rbx+8
mov rax, [rbx + rcx*8]       ; load from rbx + rcx*8  (scale must be 1,2,4,8)
mov rax, [rbx + rcx*8 + 16]  ; full form: base + index*scale + disp
```

`scale` can only be 1, 2, 4, or 8 — matching the natural sizes of byte, word, dword, and qword arrays.

### `lea` — Load Effective Address

`lea` computes the address expression but does **not** dereference it. It's like `&` in C:

```nasm
lea  rax, [rbx + rcx*8 + 16]   ; rax = address, not the value there
```

Compilers use `lea` as a cheap way to do multi-operand arithmetic — `lea rax, [rdi + rdi*2]` computes `rdi * 3` without using `imul`.

### Size specifiers

When the operand size is ambiguous, use a size qualifier:

```nasm
mov  byte  [rbx], 1     ; store 1 byte
mov  word  [rbx], 1     ; store 2 bytes
mov  dword [rbx], 1     ; store 4 bytes
mov  qword [rbx], 1     ; store 8 bytes
```

## vs other languages

In C, `int arr[4]; arr[2] = 7;` compiles to `mov dword [rdi + 8], 7` — the compiler multiplies the index by the element size. You do that multiplication explicitly in assembly, or let scaled-index addressing do it for you.

`lea` has no direct syntactic equivalent in high-level languages. It surfaces in compiler output whenever an address computation is cheaper than a multiply, or when you need a pointer to a stack local (`lea rdi, [rbp-16]`).

## The task

Implement `pack_bytes` which reads four individual bytes from separate memory locations and packs them into a single 64-bit integer:

```nasm
; uint64_t pack_bytes(uint8_t *b0, uint8_t *b1, uint8_t *b2, uint8_t *b3)
; rdi=b0, rsi=b1, rdx=b2, rcx=b3
; Returns (b0 | b1<<8 | b2<<16 | b3<<24)
pack_bytes:
    ; TODO: load each byte with movzx, shift, OR together, return in rax
```

Use `movzx` to zero-extend bytes into 64-bit registers before shifting.
