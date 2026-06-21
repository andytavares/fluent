; the-stack — exemplar
; Target: x86-64 Linux, NASM syntax

global swap_via_stack
global _start

section .bss
    val_a  resq 1
    val_b  resq 1

section .text

; void swap_via_stack(int64_t *a, int64_t *b)
; rdi = &a, rsi = &b
swap_via_stack:
    push rbp
    mov  rbp, rsp

    ; Load both values, push onto stack in order, pop in reverse
    mov  rax, [rdi]       ; rax = *a
    mov  rcx, [rsi]       ; rcx = *b
    push rax              ; stack: [*a]
    push rcx              ; stack: [*b, *a]
    pop  rax              ; rax = *b
    pop  rcx              ; rcx = *a
    mov  [rdi], rax       ; *a = old *b
    mov  [rsi], rcx       ; *b = old *a

    mov  rsp, rbp
    pop  rbp
    ret

_start:
    mov  qword [val_a], 10
    mov  qword [val_b], 20
    lea  rdi, [val_a]
    lea  rsi, [val_b]
    call swap_via_stack

    mov  eax, 60
    xor  edi, edi
    syscall
