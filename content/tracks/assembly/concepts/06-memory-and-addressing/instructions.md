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

## Watch out

- `mov r8, [ptr]` on a 1-byte value reads 8 bytes starting at `ptr`, not 1 — it pulls in three bytes of whatever memory follows. Use `movzx r8, byte [ptr]` (or a `byte`-sized destination) whenever the source is smaller than the register.
- Without `movzx`, a byte with its high bit set (e.g. `0xFF`) read via a sign-extending path would corrupt the upper bits of the register — `movzx` guarantees zero-extension, which is what you want when packing raw byte values rather than signed numbers.
- The scale in `[base + index*scale]` only accepts 1, 2, 4, or 8. `[rbx + rcx*3]` is a NASM assembly error, not a silently wrong instruction — the assembler catches it, but it's easy to reach for the wrong scale when the element size isn't a power of two (you need an extra `lea`/`imul` for that case).
- `lea` computes an address; it never reads memory. If you meant to load the value at that address, you wanted `mov`, not `lea` — this mixup compiles cleanly and fails at runtime.

## The task

Implement `pack_bytes`, which reads four individual bytes from four separate memory locations and packs them into a single 64-bit integer with `b0` as the least-significant byte:

```nasm
; uint64_t pack_bytes(uint8_t *b0, uint8_t *b1, uint8_t *b2, uint8_t *b3)
; rdi=b0, rsi=b1, rdx=b2, rcx=b3
; Returns (b0 | b1<<8 | b2<<16 | b3<<24) in rax
pack_bytes:
    ; TODO: load each byte with movzx, shift, OR together, return in rax
```

Register contract: `rdi`, `rsi`, `rdx`, `rcx` are input pointers, all caller-saved — clobber freely once read. Return the packed value in `rax`. Any other register (`r8`–`r11` are natural scratch choices) may be used without saving.

```nasm
pack_bytes(&0x01, &0x02, &0x03, &0x04);  // 0x04030201
pack_bytes(&0xFF, &0x00, &0xFF, &0x00);  // 0x00FF00FF
pack_bytes(&0x00, &0x00, &0x00, &0x00);  // 0x0000000000000000
pack_bytes(&0xAB, &0xCD, &0xEF, &0x12);  // 0x12EFCDAB
```

Edge case: a byte value of `0xFF` must contribute exactly `0xFF` at its shifted position — not sign-extend into the bits above it. Use `movzx` to zero-extend each byte into a 64-bit register before shifting.
