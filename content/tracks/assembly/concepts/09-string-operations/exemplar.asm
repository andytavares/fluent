; string-operations — exemplar
; Target: x86-64 Linux, NASM syntax

global my_strlen
global my_strcpy
global _start

section .data
    test_str  db "Hello", 0
    dest_buf  times 64 db 0

section .text

; int64_t my_strlen(const char *s)
; rdi = null-terminated string
my_strlen:
    xor   ecx, ecx
    not   rcx               ; rcx = UINT64_MAX
    xor   al, al            ; searching for NUL
    cld
    repne scasb             ; scan until [rdi] == 0
    not   rcx               ; rcx = consumed count
    dec   rcx               ; subtract NUL byte
    mov   rax, rcx
    ret

; void my_strcpy(char *dst, const char *src)
; rdi=dst, rsi=src
my_strcpy:
    cld
.loop:
    lodsb                   ; al = [rsi]; rsi++
    stosb                   ; [rdi] = al; rdi++
    test  al, al
    jnz   .loop             ; continue until NUL is copied
    ret

_start:
    lea  rdi, [test_str]
    call my_strlen

    lea  rdi, [dest_buf]
    lea  rsi, [test_str]
    call my_strcpy

    mov  eax, 60
    xor  edi, edi
    syscall
