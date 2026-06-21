; arrays-and-loops — test suite
; Compile: nasm -f elf64 stub.asm -o stub.o && nasm -f elf64 arrays_and_loops_test.asm -o test.o && ld stub.o test.o -o test && ./test

global _start
extern array_sum
extern array_max

section .data
    arr1   dq 1, 2, 3, 4, 5          ; sum=15, max=5
    arr2   dq -10, 0, 10, 5, -5      ; sum=0,  max=10
    arr3   dq 42                      ; sum=42, max=42  (n=1)
    arr4   dq 100, 200, 300           ; sum=600, max=300
    arr5   dq 0                       ; placeholder for n=0 test (arr5 not read)

    msg_p1  db "PASS: sum([1..5])=15", 10
    len_p1  equ $ - msg_p1
    msg_f1  db "FAIL: sum([1..5])!=15", 10
    len_f1  equ $ - msg_f1

    msg_p2  db "PASS: max([1..5])=5", 10
    len_p2  equ $ - msg_p2
    msg_f2  db "FAIL: max([1..5])!=5", 10
    len_f2  equ $ - msg_f2

    msg_p3  db "PASS: sum([-10,0,10,5,-5])=0", 10
    len_p3  equ $ - msg_p3
    msg_f3  db "FAIL: sum(mixed)!=0", 10
    len_f3  equ $ - msg_f3

    msg_p4  db "PASS: max([-10,0,10,5,-5])=10", 10
    len_p4  equ $ - msg_p4
    msg_f4  db "FAIL: max(mixed)!=10", 10
    len_f4  equ $ - msg_f4

    msg_p5  db "PASS: sum(n=0)=0", 10
    len_p5  equ $ - msg_p5
    msg_f5  db "FAIL: sum(n=0)!=0", 10
    len_f5  equ $ - msg_f5

    msg_p6  db "PASS: sum([42],n=1)=42", 10
    len_p6  equ $ - msg_p6
    msg_f6  db "FAIL: sum([42])!=42", 10
    len_f6  equ $ - msg_f6

    msg_p7  db "PASS: sum([100,200,300])=600", 10
    len_p7  equ $ - msg_p7
    msg_f7  db "FAIL: sum([100,200,300])!=600", 10
    len_f7  equ $ - msg_f7

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

_start:
    xor  r15d, r15d

    ; Test 1: sum([1,2,3,4,5]) = 15
    lea  rdi, [arr1]
    mov  rsi, 5
    call array_sum
    cmp  rax, 15
    jne  .f1
    print msg_p1, len_p1
    jmp  .t2
.f1: print msg_f1, len_f1
    inc  r15

    ; Test 2: max([1,2,3,4,5]) = 5
.t2:
    lea  rdi, [arr1]
    mov  rsi, 5
    call array_max
    cmp  rax, 5
    jne  .f2
    print msg_p2, len_p2
    jmp  .t3
.f2: print msg_f2, len_f2
    inc  r15

    ; Test 3: sum([-10,0,10,5,-5]) = 0
.t3:
    lea  rdi, [arr2]
    mov  rsi, 5
    call array_sum
    test rax, rax
    jnz  .f3
    print msg_p3, len_p3
    jmp  .t4
.f3: print msg_f3, len_f3
    inc  r15

    ; Test 4: max([-10,0,10,5,-5]) = 10
.t4:
    lea  rdi, [arr2]
    mov  rsi, 5
    call array_max
    cmp  rax, 10
    jne  .f4
    print msg_p4, len_p4
    jmp  .t5
.f4: print msg_f4, len_f4
    inc  r15

    ; Test 5: sum(n=0) = 0
.t5:
    lea  rdi, [arr1]
    mov  rsi, 0
    call array_sum
    test rax, rax
    jnz  .f5
    print msg_p5, len_p5
    jmp  .t6
.f5: print msg_f5, len_f5
    inc  r15

    ; Test 6: sum([42], n=1) = 42
.t6:
    lea  rdi, [arr3]
    mov  rsi, 1
    call array_sum
    cmp  rax, 42
    jne  .f6
    print msg_p6, len_p6
    jmp  .t7
.f6: print msg_f6, len_f6
    inc  r15

    ; Test 7: sum([100,200,300]) = 600
.t7:
    lea  rdi, [arr4]
    mov  rsi, 3
    call array_sum
    cmp  rax, 600
    jne  .f7
    print msg_p7, len_p7
    jmp  .summary
.f7: print msg_f7, len_f7
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
