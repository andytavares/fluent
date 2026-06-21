; the-stack — test suite
; Compile: nasm -f elf64 stub.asm -o stub.o && nasm -f elf64 the_stack_test.asm -o test.o && ld stub.o test.o -o test && ./test

global _start
extern swap_via_stack

section .data
    msg_p1  db "PASS: swap(10,20): a=20", 10
    len_p1  equ $ - msg_p1
    msg_f1  db "FAIL: swap(10,20): a!=20", 10
    len_f1  equ $ - msg_f1

    msg_p2  db "PASS: swap(10,20): b=10", 10
    len_p2  equ $ - msg_p2
    msg_f2  db "FAIL: swap(10,20): b!=10", 10
    len_f2  equ $ - msg_f2

    msg_p3  db "PASS: swap(-1,99): a=99", 10
    len_p3  equ $ - msg_p3
    msg_f3  db "FAIL: swap(-1,99): a!=99", 10
    len_f3  equ $ - msg_f3

    msg_p4  db "PASS: swap(-1,99): b=-1", 10
    len_p4  equ $ - msg_p4
    msg_f4  db "FAIL: swap(-1,99): b!=-1", 10
    len_f4  equ $ - msg_f4

    msg_p5  db "PASS: swap(x,x): idempotent", 10
    len_p5  equ $ - msg_p5
    msg_f5  db "FAIL: swap(x,x): value changed", 10
    len_f5  equ $ - msg_f5

    msg_ok  db "All tests passed", 10
    len_ok  equ $ - msg_ok
    msg_ng  db "Some tests FAILED", 10
    len_ng  equ $ - msg_ng

section .bss
    val_a  resq 1
    val_b  resq 1

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

    ; Test 1 & 2: swap(10, 20)
    mov  qword [val_a], 10
    mov  qword [val_b], 20
    lea  rdi, [val_a]
    lea  rsi, [val_b]
    call swap_via_stack

    mov  rax, [val_a]
    cmp  rax, 20
    jne  .f1
    print msg_p1, len_p1
    jmp  .t2
.f1: print msg_f1, len_f1
    inc  r15
.t2:
    mov  rax, [val_b]
    cmp  rax, 10
    jne  .f2
    print msg_p2, len_p2
    jmp  .t3
.f2: print msg_f2, len_f2
    inc  r15

    ; Test 3 & 4: swap(-1, 99)
.t3:
    mov  qword [val_a], -1
    mov  qword [val_b], 99
    lea  rdi, [val_a]
    lea  rsi, [val_b]
    call swap_via_stack

    mov  rax, [val_a]
    cmp  rax, 99
    jne  .f3
    print msg_p3, len_p3
    jmp  .t4
.f3: print msg_f3, len_f3
    inc  r15
.t4:
    mov  rax, [val_b]
    cmp  rax, -1
    jne  .f4
    print msg_p4, len_p4
    jmp  .t5
.f4: print msg_f4, len_f4
    inc  r15

    ; Test 5: swap(42, 42) — same value
.t5:
    mov  qword [val_a], 42
    mov  qword [val_b], 42
    lea  rdi, [val_a]
    lea  rsi, [val_b]
    call swap_via_stack

    mov  rax, [val_a]
    cmp  rax, 42
    jne  .f5
    mov  rax, [val_b]
    cmp  rax, 42
    jne  .f5
    print msg_p5, len_p5
    jmp  .summary
.f5: print msg_f5, len_f5
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
