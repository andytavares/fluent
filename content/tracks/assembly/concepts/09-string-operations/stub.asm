; string-operations — stub
; Target: x86-64 Linux, NASM syntax
; Assemble: nasm -f elf64 stub.asm -o stub.o && ld stub.o -o stub && ./stub

global my_strlen
global my_strcpy
global _start

section .data
    test_str  db "Hello", 0
    dest_buf  times 64 db 0

section .text

; int64_t my_strlen(const char *s)
; rdi = null-terminated string, returns length in rax
my_strlen:
    ; TODO: scan for NUL byte, return byte count (not counting NUL)
    xor  eax, eax    ; placeholder: returns 0
    ret

; void my_strcpy(char *dst, const char *src)
; rdi=dst, rsi=src — copies src to dst including NUL terminator
my_strcpy:
    ; TODO: copy bytes including NUL from src to dst
    ret

_start:
    lea  rdi, [test_str]
    call my_strlen       ; expected: 5

    lea  rdi, [dest_buf]
    lea  rsi, [test_str]
    call my_strcpy       ; dest_buf should contain "Hello\0"

    ; exit(0)
    mov  eax, 60
    xor  edi, edi
    syscall
