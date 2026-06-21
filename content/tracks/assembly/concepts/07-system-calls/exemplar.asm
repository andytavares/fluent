; system-calls — exemplar
; Target: x86-64 Linux, NASM syntax

global print_message
global exit_with_code
global _start

section .data
    hello     db "Hello from exemplar!", 10
    hello_len equ $ - hello

section .text

; void print_message(const char *msg, int64_t len)
; rdi = buf, rsi = len
print_message:
    mov  rdx, rsi        ; arg3: count = len
    mov  rsi, rdi        ; arg2: buf = msg
    mov  rdi, 1          ; arg1: fd = stdout
    mov  rax, 1          ; syscall: write
    syscall
    ret

; void exit_with_code(int64_t code)
; rdi = exit status
exit_with_code:
    mov  rax, 60         ; syscall: exit
    syscall              ; rdi already holds the status code

_start:
    lea  rdi, [hello]
    mov  rsi, hello_len
    call print_message

    mov  rdi, 0
    call exit_with_code
