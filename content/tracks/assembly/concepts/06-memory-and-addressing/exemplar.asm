; memory-and-addressing — exemplar
; Target: x86-64 Linux, NASM syntax

global pack_bytes
global _start

section .data
    b0  db 0x01
    b1  db 0x02
    b2  db 0x03
    b3  db 0x04

section .text

; uint64_t pack_bytes(uint8_t *b0, uint8_t *b1, uint8_t *b2, uint8_t *b3)
; rdi=b0, rsi=b1, rdx=b2, rcx=b3
pack_bytes:
    movzx  rax, byte [rdi]      ; rax = b0
    movzx  r8,  byte [rsi]
    shl    r8,  8
    or     rax, r8              ; rax |= b1 << 8

    movzx  r8,  byte [rdx]
    shl    r8,  16
    or     rax, r8              ; rax |= b2 << 16

    movzx  r8,  byte [rcx]
    shl    r8,  24
    or     rax, r8              ; rax |= b3 << 24
    ret

_start:
    lea  rdi, [b0]
    lea  rsi, [b1]
    lea  rdx, [b2]
    lea  rcx, [b3]
    call pack_bytes

    mov  eax, 60
    xor  edi, edi
    syscall
