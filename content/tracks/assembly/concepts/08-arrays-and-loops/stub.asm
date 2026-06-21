; arrays-and-loops — stub
; Target: x86-64 Linux, NASM syntax
; Assemble: nasm -f elf64 stub.asm -o stub.o && ld stub.o -o stub && ./stub

global array_sum
global array_max
global _start

section .data
    arr  dq 1, 2, 3, 4, 5
    n    equ 5

section .text

; int64_t array_sum(int64_t *arr, int64_t n)
; rdi=arr, rsi=n  — returns sum in rax
array_sum:
    ; TODO: loop over arr[0..n-1], accumulate sum in rax
    xor  eax, eax    ; placeholder
    ret

; int64_t array_max(int64_t *arr, int64_t n)
; rdi=arr, rsi=n  — returns max in rax (assumes n >= 1)
array_max:
    ; TODO: walk the array, track maximum in rax
    xor  eax, eax    ; placeholder
    ret

_start:
    lea  rdi, [arr]
    mov  rsi, n
    call array_sum     ; expected: 15

    lea  rdi, [arr]
    mov  rsi, n
    call array_max     ; expected: 5

    ; exit(0)
    mov  eax, 60
    xor  edi, edi
    syscall
