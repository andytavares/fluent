## What you build

You write `pack_bytes`, a procedure that reads four bytes from four addresses and packs them into one 64-bit integer. You use `movzx`, shifts and `or`. This lesson builds on **Procedures & Calling Conventions**.

## Key concepts

### Sections map to memory segments

Each section holds one kind of content. The OS fills `.bss` with zeros, so it takes no space in the binary.

```nasm
; initialized read-write data
section .data
; initialized read-only data: literals
section .rodata
; uninitialized data, zero-filled by OS
section .bss
; executable code
section .text
```

### Data directives declare or reserve memory

In `.data` and `.rodata`, these directives declare initialized data:

| Directive | Size | Example |
|-----------|------|---------|
| `db` | 1 byte | `db 0x41` or `db "hello", 0` |
| `dw` | 2 bytes | `dw 1000` |
| `dd` | 4 bytes | `dd 3.14` |
| `dq` | 8 bytes | `dq 0xDEADBEEFCAFEBABE` |

In `.bss`, these directives reserve space without a value:

| Directive | Size |
|-----------|------|
| `resb` | 1 byte |
| `resw` | 2 bytes |
| `resd` | 4 bytes |
| `resq` | 8 bytes (quad) |

```nasm
section .data
    ; "Hello\n\0"
    greeting  db "Hello", 10, 0
    count     dq 42

section .bss
    ; 256 uninitialized bytes
    buffer    resb 256
    ; 16 slots of 8 bytes = 128 bytes
    matrix    resq 16
```

### A memory operand is `[base + index*scale + disp]`

The scale can only be 1, 2, 4 or 8. These values match byte, word, dword and qword arrays.

```nasm
; load from the address in rbx
mov rax, [rbx]
; load from rbx + 8
mov rax, [rbx + 8]
; load from rbx + rcx*8
mov rax, [rbx + rcx*8]
; full form: base + index*scale + disp
mov rax, [rbx + rcx*8 + 16]
```

In C, `int arr[4]; arr[2] = 7;` compiles to `mov dword [rdi + 8], 7`. The compiler multiplies the index by the element size. In assembly, you do that multiplication, or scaled-index addressing does it.

### `lea` computes an address and does not read memory

`lea` means Load Effective Address. It works like `&` in C. Compilers use it for cheap arithmetic: `lea rax, [rdi + rdi*2]` computes `rdi * 3` without `imul`. It also gives a pointer to a stack local.

```nasm
; rax = the address, not the value there
lea  rax, [rbx + rcx*8 + 16]
; rdi = pointer to a stack local
lea  rdi, [rbp-16]
```

### A size keyword sets the operand size

When the size is not clear from the operands, add a size keyword.

```nasm
; store 1 byte
mov  byte  [rbx], 1
; store 2 bytes
mov  word  [rbx], 1
; store 4 bytes
mov  dword [rbx], 1
; store 8 bytes
mov  qword [rbx], 1
```

### `movzx` loads a small value and zero-fills the rest

`movzx` reads a byte or word and clears the upper bits of the destination. Use it for raw byte values, not signed numbers.

```nasm
; r8 = the byte at ptr, upper bits = 0
movzx r8, byte [ptr]
```

## Watch out

- `mov r8, [ptr]` reads 8 bytes from `ptr`, not 1. It pulls in the seven bytes that follow.
- Use `movzx r8, byte [ptr]` when the source is smaller than the register.
- A sign-extending load of `0xFF` fills the upper bits with ones. `movzx` keeps them zero.
- `[rbx + rcx*3]` is an assembly error. For an element size that is not a power of two, add a `lea` or `imul`.
- `lea` never reads memory. If you want the value, use `mov`. The mix-up assembles and fails at runtime.

## The task

Write `pack_bytes`. It reads four bytes from four addresses and packs them into one 64-bit integer.

1. The inputs are four byte pointers: `rdi = b0`, `rsi = b1`, `rdx = b2` and `rcx = b3`.
2. Load each byte with `movzx`, so the upper bits are zero.
3. `b0` is the least-significant byte. Shift `b1` left by 8, `b2` by 16 and `b3` by 24.
4. Combine the four values with `or`.
5. Return `b0 | b1<<8 | b2<<16 | b3<<24` in `rax`.

The input registers are caller-saved. `r8`–`r11` are good scratch registers, and you need not save them. A byte of `0xFF` gives exactly `0xFF` at its position, with no sign extension. All zero bytes give 0.

```nasm
; uint64_t pack_bytes(uint8_t *b0,
;     uint8_t *b1, uint8_t *b2,
;     uint8_t *b3)
pack_bytes:
    ; TODO
    ret

; bytes 0x01, 0x02, 0x03, 0x04
;   -> 0x04030201
; bytes 0xFF, 0x00, 0xFF, 0x00
;   -> 0x00FF00FF
; bytes 0x00, 0x00, 0x00, 0x00
;   -> 0
; bytes 0xAB, 0xCD, 0xEF, 0x12
;   -> 0x12EFCDAB
```
