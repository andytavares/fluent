; registers-and-data-movement — exemplar
; Target: x86-64 Linux, NASM syntax

global set_registers
global _start

section .text

; void set_registers(void)
; Sets rax=1, rbx=2, rcx=3, rdx=0, rsi=100
set_registers:
    mov  rax, 1          ; rax = 1
    mov  rbx, 2          ; rbx = 2
    mov  rcx, 3          ; rcx = 3
    xor  edx, edx        ; rdx = 0  (idiomatic zero: 2-byte encoding, zero-extends)
    mov  rsi, 100        ; rsi = 100
    ret

_start:
    call set_registers

    ; exit(0)
    mov  eax, 60
    xor  edi, edi
    syscall
