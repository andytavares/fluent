; string-operations — test suite
; Compile: nasm -f elf64 stub.asm -o stub.o && nasm -f elf64 string_operations_test.asm -o test.o && ld stub.o test.o -o test && ./test

global _start
extern my_strlen
extern my_strcpy

section .data
    s_hello   db "Hello", 0          ; len=5
    s_empty   db 0                   ; len=0
    s_one     db "X", 0              ; len=1
    s_long    db "Hello, World!", 0  ; len=13

    msg_p1  db "PASS: strlen('Hello')=5", 10
    len_p1  equ $ - msg_p1
    msg_f1  db "FAIL: strlen('Hello')!=5", 10
    len_f1  equ $ - msg_f1

    msg_p2  db "PASS: strlen('')=0", 10
    len_p2  equ $ - msg_p2
    msg_f2  db "FAIL: strlen('')!=0", 10
    len_f2  equ $ - msg_f2

    msg_p3  db "PASS: strlen('X')=1", 10
    len_p3  equ $ - msg_p3
    msg_f3  db "FAIL: strlen('X')!=1", 10
    len_f3  equ $ - msg_f3

    msg_p4  db "PASS: strlen('Hello, World!')=13", 10
    len_p4  equ $ - msg_p4
    msg_f4  db "FAIL: strlen('Hello, World!')!=13", 10
    len_f4  equ $ - msg_f4

    msg_p5  db "PASS: strcpy copies 'Hello'", 10
    len_p5  equ $ - msg_p5
    msg_f5  db "FAIL: strcpy result wrong", 10
    len_f5  equ $ - msg_f5

    msg_p6  db "PASS: strcpy NUL terminates", 10
    len_p6  equ $ - msg_p6
    msg_f6  db "FAIL: strcpy missing NUL", 10
    len_f6  equ $ - msg_f6

    msg_ok  db "All tests passed", 10
    len_ok  equ $ - msg_ok
    msg_ng  db "Some tests FAILED", 10
    len_ng  equ $ - msg_ng

section .bss
    copy_buf  resb 64

section .text

%macro print 2
    push rdi
    push rsi
    push rdx
    push rcx
    push r11
    mov  rax, 1
    mov  rdi, 1
    mov  rsi, %1
    mov  rdx, %2
    syscall
    pop  r11
    pop  rcx
    pop  rdx
    pop  rsi
    pop  rdi
%endmacro

_start:
    xor  r15d, r15d

    ; Test 1: strlen("Hello") = 5
    lea  rdi, [s_hello]
    call my_strlen
    cmp  rax, 5
    jne  .f1
    print msg_p1, len_p1
    jmp  .t2
.f1: print msg_f1, len_f1
    inc  r15

    ; Test 2: strlen("") = 0
.t2:
    lea  rdi, [s_empty]
    call my_strlen
    test rax, rax
    jnz  .f2
    print msg_p2, len_p2
    jmp  .t3
.f2: print msg_f2, len_f2
    inc  r15

    ; Test 3: strlen("X") = 1
.t3:
    lea  rdi, [s_one]
    call my_strlen
    cmp  rax, 1
    jne  .f3
    print msg_p3, len_p3
    jmp  .t4
.f3: print msg_f3, len_f3
    inc  r15

    ; Test 4: strlen("Hello, World!") = 13
.t4:
    lea  rdi, [s_long]
    call my_strlen
    cmp  rax, 13
    jne  .f4
    print msg_p4, len_p4
    jmp  .t5
.f4: print msg_f4, len_f4
    inc  r15

    ; Test 5: strcpy("Hello") — check first byte
.t5:
    ; zero out copy_buf first
    lea  rdi, [copy_buf]
    mov  ecx, 64
    xor  al, al
    cld
    rep  stosb

    lea  rdi, [copy_buf]
    lea  rsi, [s_hello]
    call my_strcpy

    ; verify copy_buf[0..4] == 'H','e','l','l','o'
    lea  rsi, [copy_buf]
    cmp  byte [rsi],   'H'
    jne  .f5
    cmp  byte [rsi+1], 'e'
    jne  .f5
    cmp  byte [rsi+2], 'l'
    jne  .f5
    cmp  byte [rsi+3], 'l'
    jne  .f5
    cmp  byte [rsi+4], 'o'
    jne  .f5
    print msg_p5, len_p5
    jmp  .t6
.f5: print msg_f5, len_f5
    inc  r15

    ; Test 6: strcpy NUL terminates at index 5
.t6:
    lea  rsi, [copy_buf]
    cmp  byte [rsi+5], 0
    jne  .f6
    print msg_p6, len_p6
    jmp  .summary
.f6: print msg_f6, len_f6
    inc  r15

.summary:
    test r15, r15
    jnz  .fail
    print msg_ok, len_ok
    mov  eax, 60
    xor  edi, edi
    syscall
.fail:
    print msg_ng, len_ng
    mov  eax, 60
    mov  edi, 1
    syscall
