; control-flow — test suite
; Compile: nasm -f elf64 stub.asm -o stub.o && nasm -f elf64 control_flow_test.asm -o test.o && ld stub.o test.o -o test && ./test

global _start
extern clamp

section .data
    msg_p1  db "PASS: clamp(5,0,10)=5", 10
    len_p1  equ $ - msg_p1
    msg_f1  db "FAIL: clamp(5,0,10)!=5", 10
    len_f1  equ $ - msg_f1

    msg_p2  db "PASS: clamp(-5,0,10)=0", 10
    len_p2  equ $ - msg_p2
    msg_f2  db "FAIL: clamp(-5,0,10)!=0", 10
    len_f2  equ $ - msg_f2

    msg_p3  db "PASS: clamp(15,0,10)=10", 10
    len_p3  equ $ - msg_p3
    msg_f3  db "FAIL: clamp(15,0,10)!=10", 10
    len_f3  equ $ - msg_f3

    msg_p4  db "PASS: clamp(0,0,10)=0 (boundary)", 10
    len_p4  equ $ - msg_p4
    msg_f4  db "FAIL: clamp(0,0,10)!=0", 10
    len_f4  equ $ - msg_f4

    msg_p5  db "PASS: clamp(10,0,10)=10 (boundary)", 10
    len_p5  equ $ - msg_p5
    msg_f5  db "FAIL: clamp(10,0,10)!=10", 10
    len_f5  equ $ - msg_f5

    msg_p6  db "PASS: clamp(-100,-50,50)=-50 (neg range)", 10
    len_p6  equ $ - msg_p6
    msg_f6  db "FAIL: clamp(-100,-50,50)!=-50", 10
    len_f6  equ $ - msg_f6

    msg_ok  db "All tests passed", 10
    len_ok  equ $ - msg_ok
    msg_ng  db "Some tests FAILED", 10
    len_ng  equ $ - msg_ng

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

%macro check 5   ; value, min, max, expected, test_num
    mov  rdi, %1
    mov  rsi, %2
    mov  rdx, %3
    call clamp
    cmp  rax, %4
    jne  %%fail
    print msg_p %+ %5, len_p %+ %5
    jmp  %%done
%%fail:
    print msg_f %+ %5, len_f %+ %5
    inc  r15
%%done:
%endmacro

_start:
    xor  r15d, r15d

    check  5,    0,   10,   5,  1
    check  -5,   0,   10,   0,  2
    check  15,   0,   10,  10,  3
    check  0,    0,   10,   0,  4
    check  10,   0,   10,  10,  5
    check  -100, -50,  50, -50, 6

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
