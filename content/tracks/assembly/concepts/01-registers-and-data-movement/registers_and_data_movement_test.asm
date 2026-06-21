; registers-and-data-movement — test suite
; Compile: nasm -f elf64 stub.asm -o stub.o && nasm -f elf64 registers_and_data_movement_test.asm -o test.o && ld stub.o test.o -o test && ./test

global _start
extern set_registers

section .data
    msg_pass_rax  db "PASS: rax = 1", 10
    len_pass_rax  equ $ - msg_pass_rax
    msg_fail_rax  db "FAIL: rax != 1", 10
    len_fail_rax  equ $ - msg_fail_rax

    msg_pass_rbx  db "PASS: rbx = 2", 10
    len_pass_rbx  equ $ - msg_pass_rbx
    msg_fail_rbx  db "FAIL: rbx != 2", 10
    len_fail_rbx  equ $ - msg_fail_rbx

    msg_pass_rcx  db "PASS: rcx = 3", 10
    len_pass_rcx  equ $ - msg_pass_rcx
    msg_fail_rcx  db "FAIL: rcx != 3", 10
    len_fail_rcx  equ $ - msg_fail_rcx

    msg_pass_rdx  db "PASS: rdx = 0", 10
    len_pass_rdx  equ $ - msg_pass_rdx
    msg_fail_rdx  db "FAIL: rdx != 0", 10
    len_fail_rdx  equ $ - msg_fail_rdx

    msg_pass_rsi  db "PASS: rsi = 100", 10
    len_pass_rsi  equ $ - msg_pass_rsi
    msg_fail_rsi  db "FAIL: rsi != 100", 10
    len_fail_rsi  equ $ - msg_fail_rsi

    msg_summary_pass db "All tests passed", 10
    len_summary_pass equ $ - msg_summary_pass
    msg_summary_fail db "Some tests FAILED", 10
    len_summary_fail equ $ - msg_summary_fail

section .bss
    saved_rax resq 1
    saved_rbx resq 1
    saved_rcx resq 1
    saved_rdx resq 1
    saved_rsi resq 1

section .text

; write(1, msg, len)
%macro print 2
    mov  rax, 1
    mov  rdi, 1
    mov  rsi, %1
    mov  rdx, %2
    syscall
%endmacro

_start:
    ; Poison registers with non-zero sentinel before calling
    mov  rax, 0xDEADBEEF
    mov  rbx, 0xDEADBEEF
    mov  rcx, 0xDEADBEEF
    mov  rdx, 0xDEADBEEF
    mov  rsi, 0xDEADBEEF

    call set_registers

    ; Capture results (syscall will clobber rax/rdi/rsi/rdx/rcx/r11)
    mov  [saved_rax], rax
    mov  [saved_rbx], rbx
    mov  [saved_rcx], rcx
    mov  [saved_rdx], rdx
    mov  [saved_rsi], rsi

    xor  r15d, r15d          ; r15 = failure count

    ; Check rax == 1
    mov  rax, [saved_rax]
    cmp  rax, 1
    jne  .fail_rax
    print msg_pass_rax, len_pass_rax
    jmp  .check_rbx
.fail_rax:
    print msg_fail_rax, len_fail_rax
    inc  r15

    ; Check rbx == 2
.check_rbx:
    mov  rax, [saved_rbx]
    cmp  rax, 2
    jne  .fail_rbx
    print msg_pass_rbx, len_pass_rbx
    jmp  .check_rcx
.fail_rbx:
    print msg_fail_rbx, len_fail_rbx
    inc  r15

    ; Check rcx == 3
.check_rcx:
    mov  rax, [saved_rcx]
    cmp  rax, 3
    jne  .fail_rcx
    print msg_pass_rcx, len_pass_rcx
    jmp  .check_rdx
.fail_rcx:
    print msg_fail_rcx, len_fail_rcx
    inc  r15

    ; Check rdx == 0
.check_rdx:
    mov  rax, [saved_rdx]
    test rax, rax
    jnz  .fail_rdx
    print msg_pass_rdx, len_pass_rdx
    jmp  .check_rsi
.fail_rdx:
    print msg_fail_rdx, len_fail_rdx
    inc  r15

    ; Check rsi == 100
.check_rsi:
    mov  rax, [saved_rsi]
    cmp  rax, 100
    jne  .fail_rsi
    print msg_pass_rsi, len_pass_rsi
    jmp  .summary
.fail_rsi:
    print msg_fail_rsi, len_fail_rsi
    inc  r15

.summary:
    test r15, r15
    jnz  .fail_summary
    print msg_summary_pass, len_summary_pass
    mov  eax, 60
    xor  edi, edi
    syscall
.fail_summary:
    print msg_summary_fail, len_summary_fail
    mov  eax, 60
    mov  edi, 1
    syscall
