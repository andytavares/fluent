; memory-and-addressing — test suite
; Compile: nasm -f elf64 stub.asm -o stub.o && nasm -f elf64 memory_and_addressing_test.asm -o test.o && ld stub.o test.o -o test && ./test

global _start
extern pack_bytes

section .data
    ; Test inputs
    t1_b0  db 0x01
    t1_b1  db 0x02
    t1_b2  db 0x03
    t1_b3  db 0x04

    t2_b0  db 0xFF
    t2_b1  db 0x00
    t2_b2  db 0xFF
    t2_b3  db 0x00

    t3_b0  db 0x00
    t3_b1  db 0x00
    t3_b2  db 0x00
    t3_b3  db 0x00

    t4_b0  db 0xAB
    t4_b1  db 0xCD
    t4_b2  db 0xEF
    t4_b3  db 0x12

    msg_p1  db "PASS: pack(01,02,03,04)=0x04030201", 10
    len_p1  equ $ - msg_p1
    msg_f1  db "FAIL: pack(01,02,03,04) wrong", 10
    len_f1  equ $ - msg_f1

    msg_p2  db "PASS: pack(FF,00,FF,00)=0x00FF00FF", 10
    len_p2  equ $ - msg_p2
    msg_f2  db "FAIL: pack(FF,00,FF,00) wrong", 10
    len_f2  equ $ - msg_f2

    msg_p3  db "PASS: pack(0,0,0,0)=0", 10
    len_p3  equ $ - msg_p3
    msg_f3  db "FAIL: pack(0,0,0,0) != 0", 10
    len_f3  equ $ - msg_f3

    msg_p4  db "PASS: pack(AB,CD,EF,12)=0x12EFCDAB", 10
    len_p4  equ $ - msg_p4
    msg_f4  db "FAIL: pack(AB,CD,EF,12) wrong", 10
    len_f4  equ $ - msg_f4

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

    ; Test 1: 0x01,0x02,0x03,0x04 -> 0x04030201
    lea  rdi, [t1_b0]
    lea  rsi, [t1_b1]
    lea  rdx, [t1_b2]
    lea  rcx, [t1_b3]
    call pack_bytes
    cmp  rax, 0x04030201
    jne  .f1
    print msg_p1, len_p1
    jmp  .t2
.f1: print msg_f1, len_f1
    inc  r15

    ; Test 2: 0xFF,0x00,0xFF,0x00 -> 0x00FF00FF
.t2:
    lea  rdi, [t2_b0]
    lea  rsi, [t2_b1]
    lea  rdx, [t2_b2]
    lea  rcx, [t2_b3]
    call pack_bytes
    cmp  rax, 0x00FF00FF
    jne  .f2
    print msg_p2, len_p2
    jmp  .t3
.f2: print msg_f2, len_f2
    inc  r15

    ; Test 3: all zeros -> 0
.t3:
    lea  rdi, [t3_b0]
    lea  rsi, [t3_b1]
    lea  rdx, [t3_b2]
    lea  rcx, [t3_b3]
    call pack_bytes
    test rax, rax
    jnz  .f3
    print msg_p3, len_p3
    jmp  .t4
.f3: print msg_f3, len_f3
    inc  r15

    ; Test 4: 0xAB,0xCD,0xEF,0x12 -> 0x12EFCDAB
.t4:
    lea  rdi, [t4_b0]
    lea  rsi, [t4_b1]
    lea  rdx, [t4_b2]
    lea  rcx, [t4_b3]
    call pack_bytes
    cmp  rax, 0x12EFCDAB
    jne  .f4
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
