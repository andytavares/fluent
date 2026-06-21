; the-stack — stub
; Target: x86-64 Linux, NASM syntax
; Assemble: nasm -f elf64 stub.asm -o stub.o && ld stub.o -o stub && ./stub

global swap_via_stack
global _start

section .bss
    val_a  resq 1
    val_b  resq 1

section .text

; void swap_via_stack(int64_t *a, int64_t *b)
; rdi = &a, rsi = &b
; Must swap *a and *b using push/pop (no extra registers for temp)
swap_via_stack:
    push rbp
    mov  rbp, rsp
    ; TODO: use push/pop to swap the values at *rdi and *rsi
    mov  rsp, rbp
    pop  rbp
    ret

_start:
    mov  qword [val_a], 10
    mov  qword [val_b], 20
    lea  rdi, [val_a]
    lea  rsi, [val_b]
    call swap_via_stack

    ; exit(0)
    mov  eax, 60
    xor  edi, edi
    syscall
