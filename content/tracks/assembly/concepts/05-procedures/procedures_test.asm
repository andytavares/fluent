; procedures — test suite
; Compile: nasm -f elf64 stub.asm -o stub.o && nasm -f elf64 procedures_test.asm -o test.o && ld stub.o test.o -o test && ./test

global _start
extern apply_twice

section .data
    msg_p1  db "PASS: apply_twice(double,3)=12", 10
    len_p1  equ $ - msg_p1
    msg_f1  db "FAIL: apply_twice(double,3)!=12", 10
    len_f1  equ $ - msg_f1

    msg_p2  db "PASS: apply_twice(double,1)=4", 10
    len_p2  equ $ - msg_p2
    msg_f2  db "FAIL: apply_twice(double,1)!=4", 10
    len_f2  equ $ - msg_f2

    msg_p3  db "PASS: apply_twice(inc,10)=12", 10
    len_p3  equ $ - msg_p3
    msg_f3  db "FAIL: apply_twice(inc,10)!=12", 10
    len_f3  equ $ - msg_f3

    msg_p4  db "PASS: apply_twice(double,0)=0", 10
    len_p4  equ $ - msg_p4
    msg_f4  db "FAIL: apply_twice(double,0)!=0", 10
    len_f4  equ $ - msg_f4

    msg_ok  db "All tests passed", 10
    len_ok  equ $ - msg_ok
    msg_ng  db "Some tests FAILED", 10
    len_ng  equ $ - msg_ng

section .text

; double(x) = x * 2
test_double:
    mov  rax, rdi
    imul rax, 2
    ret

; inc2(x) = x + 2
test_inc2:
    lea  rax, [rdi + 2]
    ret

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

    ; Test 1: apply_twice(double, 3) = 12
    lea  rdi, [test_double]
    mov  rsi, 3
    call apply_twice
    cmp  rax, 12
    jne  .f1
    print msg_p1, len_p1
    jmp  .t2
.f1: print msg_f1, len_f1
    inc  r15

    ; Test 2: apply_twice(double, 1) = 4
.t2:
    lea  rdi, [test_double]
    mov  rsi, 1
    call apply_twice
    cmp  rax, 4
    jne  .f2
    print msg_p2, len_p2
    jmp  .t3
.f2: print msg_f2, len_f2
    inc  r15

    ; Test 3: apply_twice(inc2, 10) = 14
.t3:
    lea  rdi, [test_inc2]
    mov  rsi, 10
    call apply_twice
    cmp  rax, 14
    jne  .f3
    print msg_p3, len_p3
    jmp  .t4
.f3: print msg_f3, len_f3
    inc  r15

    ; Test 4: apply_twice(double, 0) = 0
.t4:
    lea  rdi, [test_double]
    mov  rsi, 0
    call apply_twice
    test rax, rax
    jnz  .f4
    print msg_p4, len_p4
    jmp  .summary
.f4: print msg_f4, len_f4
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
