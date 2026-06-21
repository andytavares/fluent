; system-calls — stub
; Target: x86-64 Linux, NASM syntax
; Assemble: nasm -f elf64 stub.asm -o stub.o && ld stub.o -o stub && ./stub

global print_message
global exit_with_code
global _start

section .data
    hello     db "Hello from stub!", 10
    hello_len equ $ - hello

section .text

; void print_message(const char *msg, int64_t len)
; rdi = buf, rsi = len
; Writes to stdout via write syscall
print_message:
    ; TODO: syscall write(1, rdi, rsi)
    ret

; void exit_with_code(int64_t code)
; rdi = exit status
exit_with_code:
    ; TODO: syscall exit(60) with status = rdi
    mov  eax, 60
    xor  edi, edi
    syscall

_start:
    lea  rdi, [hello]
    mov  rsi, hello_len
    call print_message

    mov  rdi, 0
    call exit_with_code
