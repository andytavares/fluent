; registers-and-data-movement — stub
; Target: x86-64 Linux, NASM syntax
; Assemble: nasm -f elf64 stub.asm -o stub.o && ld stub.o -o stub && ./stub

global set_registers
global _start

section .text

; void set_registers(void)
; Set: rax=1, rbx=2, rcx=3, rdx=0 (via xor), rsi=100
set_registers:
    ; TODO: use mov and xor to load the required values
    ret

_start:
    call set_registers

    ; exit(0)
    mov eax, 60
    xor edi, edi
    syscall
