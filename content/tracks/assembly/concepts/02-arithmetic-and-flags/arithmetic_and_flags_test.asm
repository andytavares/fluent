; arithmetic-and-flags — test suite
; Compile: nasm -f elf64 stub.asm -o stub.o && nasm -f elf64 arithmetic_and_flags_test.asm -o test.o && ld stub.o test.o -o test && ./test

global _start
extern arithmetic_ops

section .data
    msg_pass1  db "PASS: 6+7 = 13", 10
    len_pass1  equ $ - msg_pass1
    msg_fail1  db "FAIL: sum 6+7 != 13", 10
    len_fail1  equ $ - msg_fail1

    msg_pass2  db "PASS: 6*7 = 42", 10
    len_pass2  equ $ - msg_pass2
    msg_fail2  db "FAIL: product 6*7 != 42", 10
    len_fail2  equ $ - msg_fail2

    msg_pass3  db "PASS: -3+5 = 2", 10
    len_pass3  equ $ - msg_pass3
    msg_fail3  db "FAIL: sum -3+5 != 2", 10
    len_fail3  equ $ - msg_fail3

    msg_pass4  db "PASS: -3*5 = -15", 10
    len_pass4  equ $ - msg_pass4
    msg_fail4  db "FAIL: product -3*5 != -15", 10
    len_fail4  equ $ - msg_fail4

    msg_pass5  db "PASS: 0+0 = 0", 10
    len_pass5  equ $ - msg_pass5
    msg_fail5  db "FAIL: sum 0+0 != 0", 10
    len_fail5  equ $ - msg_fail5

    msg_ok  db "All tests passed", 10
    len_ok  equ $ - msg_ok
    msg_ng  db "Some tests FAILED", 10
    len_ng  equ $ - msg_ng

section .bss
    sum     resq 1
    product resq 1

section .text

%macro print 2
    mov  rax, 1
    mov  rdi, 1
    mov  rsi, %1
    mov  rdx, %2
    syscall
%endmacro

_start:
    xor  r15d, r15d    ; failure count

    ; Test 1: 6 + 7 = 13
    mov  rdi, 6
    mov  rsi, 7
    lea  rdx, [sum]
    lea  rcx, [product]
    call arithmetic_ops
    mov  rax, [sum]
    cmp  rax, 13
    jne  .f1
    print msg_pass1, len_pass1
    jmp  .t2
.f1: print msg_fail1, len_fail1
    inc  r15

    ; Test 2: 6 * 7 = 42
.t2:
    mov  rax, [product]
    cmp  rax, 42
    jne  .f2
    print msg_pass2, len_pass2
    jmp  .t3
.f2: print msg_fail2, len_fail2
    inc  r15

    ; Test 3: -3 + 5 = 2
.t3:
    mov  rdi, -3
    mov  rsi, 5
    lea  rdx, [sum]
    lea  rcx, [product]
    call arithmetic_ops
    mov  rax, [sum]
    cmp  rax, 2
    jne  .f3
    print msg_pass3, len_pass3
    jmp  .t4
.f3: print msg_fail3, len_fail3
    inc  r15

    ; Test 4: -3 * 5 = -15
.t4:
    mov  rax, [product]
    cmp  rax, -15
    jne  .f4
    print msg_pass4, len_pass4
    jmp  .t5
.f4: print msg_fail4, len_fail4
    inc  r15

    ; Test 5: 0 + 0 = 0
.t5:
    mov  rdi, 0
    mov  rsi, 0
    lea  rdx, [sum]
    lea  rcx, [product]
    call arithmetic_ops
    mov  rax, [sum]
    test rax, rax
    jnz  .f5
    print msg_pass5, len_pass5
    jmp  .summary
.f5: print msg_fail5, len_fail5
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
