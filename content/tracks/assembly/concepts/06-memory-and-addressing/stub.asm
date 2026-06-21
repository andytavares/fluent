; memory-and-addressing — stub
; Target: x86-64 Linux, NASM syntax
; Assemble: nasm -f elf64 stub.asm -o stub.o && ld stub.o -o stub && ./stub

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
; Returns b0 | (b1<<8) | (b2<<16) | (b3<<24)
pack_bytes:
    ; TODO: load each byte with movzx, shift and OR into rax
    xor  eax, eax    ; placeholder: returns 0
    ret

_start:
    lea  rdi, [b0]
    lea  rsi, [b1]
    lea  rdx, [b2]
    lea  rcx, [b3]
    call pack_bytes   ; expected: 0x04030201

    ; exit(0)
    mov  eax, 60
    xor  edi, edi
    syscall
