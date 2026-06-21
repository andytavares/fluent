; arithmetic-and-flags — exemplar
; Target: x86-64 Linux, NASM syntax

global arithmetic_ops
global _start

section .bss
    out_sum     resq 1
    out_product resq 1

section .text

; void arithmetic_ops(int64_t a, int64_t b, int64_t *out_sum, int64_t *out_product)
; rdi=a, rsi=b, rdx=out_sum ptr, rcx=out_product ptr
arithmetic_ops:
    ; sum: a + b
    mov  rax, rdi
    add  rax, rsi
    mov  [rdx], rax

    ; product: a * b  (two-operand imul: rax = rdi * rsi)
    mov  rax, rdi
    imul rax, rsi
    mov  [rcx], rax

    ret

_start:
    mov  rdi, 6
    mov  rsi, 7
    lea  rdx, [out_sum]
    lea  rcx, [out_product]
    call arithmetic_ops

    ; exit(0)
    mov  eax, 60
    xor  edi, edi
    syscall
