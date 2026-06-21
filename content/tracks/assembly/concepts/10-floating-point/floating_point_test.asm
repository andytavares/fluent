; floating-point — test suite
; Compile: nasm -f elf64 stub.asm -o stub.o && nasm -f elf64 floating_point_test.asm -o test.o && ld stub.o test.o -o test && ./test

global _start
extern euclidean_distance
extern int_to_double

section .data
    ; Test constants
    d_0_0    dq 0.0
    d_3_0    dq 3.0
    d_4_0    dq 4.0
    d_5_0    dq 5.0
    d_1_0    dq 1.0
    d_sqrt2  dq 1.4142135623730951   ; sqrt(2), for (0,0)-(1,1)
    d_10_0   dq 10.0
    d_42_0   dq 42.0
    d_0_001  dq 0.001                ; epsilon for float comparison

    msg_p1  db "PASS: dist((0,0),(3,4))=5.0", 10
    len_p1  equ $ - msg_p1
    msg_f1  db "FAIL: dist((0,0),(3,4)) != ~5.0", 10
    len_f1  equ $ - msg_f1

    msg_p2  db "PASS: dist((0,0),(1,1))~=sqrt(2)", 10
    len_p2  equ $ - msg_p2
    msg_f2  db "FAIL: dist((0,0),(1,1)) wrong", 10
    len_f2  equ $ - msg_f2

    msg_p3  db "PASS: dist(same point)=0.0", 10
    len_p3  equ $ - msg_p3
    msg_f3  db "FAIL: dist(same point) != 0.0", 10
    len_f3  equ $ - msg_f3

    msg_p4  db "PASS: int_to_double(10)=10.0", 10
    len_p4  equ $ - msg_p4
    msg_f4  db "FAIL: int_to_double(10) != 10.0", 10
    len_f4  equ $ - msg_f4

    msg_p5  db "PASS: int_to_double(0)=0.0", 10
    len_p5  equ $ - msg_p5
    msg_f5  db "FAIL: int_to_double(0) != 0.0", 10
    len_f5  equ $ - msg_f5

    msg_p6  db "PASS: int_to_double(42)=42.0", 10
    len_p6  equ $ - msg_p6
    msg_f6  db "FAIL: int_to_double(42) != 42.0", 10
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

; Compare xmm0 with [mem] within epsilon [d_0_001]
; Sets ZF-like condition via r14: r14=0 means within epsilon, r14=1 means not
%macro approx_eq 1
    movsd   xmm1, [%1]
    subsd   xmm0, xmm1
    ; abs(xmm0): clear sign bit
    movsd   xmm2, xmm0
    xorps   xmm3, xmm3
    subsd   xmm3, xmm0      ; xmm3 = -xmm0
    maxsd   xmm2, xmm3      ; xmm2 = abs(xmm0)
    movsd   xmm4, [d_0_001]
    ucomisd xmm2, xmm4      ; compare |diff| with epsilon
    ; ja means |diff| > epsilon => not equal
    seta    r14b             ; r14 = 1 if above (not equal), 0 if within epsilon
%endmacro

_start:
    xor  r15d, r15d

    ; Test 1: euclidean_distance(0,0,3,4) = 5.0
    movsd  xmm0, [d_0_0]
    movsd  xmm1, [d_0_0]
    movsd  xmm2, [d_3_0]
    movsd  xmm3, [d_4_0]
    call   euclidean_distance
    approx_eq d_5_0
    test   r14, r14
    jnz    .f1
    print  msg_p1, len_p1
    jmp    .t2
.f1: print msg_f1, len_f1
    inc    r15

    ; Test 2: euclidean_distance(0,0,1,1) ~= sqrt(2)
.t2:
    movsd  xmm0, [d_0_0]
    movsd  xmm1, [d_0_0]
    movsd  xmm2, [d_1_0]
    movsd  xmm3, [d_1_0]
    call   euclidean_distance
    approx_eq d_sqrt2
    test   r14, r14
    jnz    .f2
    print  msg_p2, len_p2
    jmp    .t3
.f2: print msg_f2, len_f2
    inc    r15

    ; Test 3: euclidean_distance(same point) = 0.0
.t3:
    movsd  xmm0, [d_3_0]
    movsd  xmm1, [d_4_0]
    movsd  xmm2, [d_3_0]
    movsd  xmm3, [d_4_0]
    call   euclidean_distance
    approx_eq d_0_0
    test   r14, r14
    jnz    .f3
    print  msg_p3, len_p3
    jmp    .t4
.f3: print msg_f3, len_f3
    inc    r15

    ; Test 4: int_to_double(10) = 10.0
.t4:
    mov    rdi, 10
    call   int_to_double
    approx_eq d_10_0
    test   r14, r14
    jnz    .f4
    print  msg_p4, len_p4
    jmp    .t5
.f4: print msg_f4, len_f4
    inc    r15

    ; Test 5: int_to_double(0) = 0.0
.t5:
    mov    rdi, 0
    call   int_to_double
    approx_eq d_0_0
    test   r14, r14
    jnz    .f5
    print  msg_p5, len_p5
    jmp    .t6
.f5: print msg_f5, len_f5
    inc    r15

    ; Test 6: int_to_double(42) = 42.0
.t6:
    mov    rdi, 42
    call   int_to_double
    approx_eq d_42_0
    test   r14, r14
    jnz    .f6
    print  msg_p6, len_p6
    jmp    .summary
.f6: print msg_f6, len_f6
    inc    r15

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
