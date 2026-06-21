; arrays-and-loops — exemplar
; Target: x86-64 Linux, NASM syntax

global array_sum
global array_max
global _start

section .data
    arr  dq 1, 2, 3, 4, 5
    n    equ 5

section .text

; int64_t array_sum(int64_t *arr, int64_t n)
; rdi=arr, rsi=n
array_sum:
    xor   eax, eax          ; sum = 0
    mov   rcx, rsi          ; rcx = n
    test  rcx, rcx
    jz    .done             ; n == 0: return 0
.loop:
    add   rax, [rdi]
    add   rdi, 8            ; ptr++
    loop  .loop             ; rcx--; jnz .loop
.done:
    ret

; int64_t array_max(int64_t *arr, int64_t n)
; rdi=arr, rsi=n  (n >= 1)
array_max:
    mov  rax, [rdi]         ; max = arr[0]
    add  rdi, 8             ; ptr = &arr[1]
    dec  rsi                ; remaining = n - 1
    jz   .done              ; only one element
.loop:
    mov  rcx, [rdi]
    cmp  rcx, rax
    jle  .no_update
    mov  rax, rcx           ; new max
.no_update:
    add  rdi, 8
    dec  rsi
    jnz  .loop
.done:
    ret

_start:
    lea  rdi, [arr]
    mov  rsi, n
    call array_sum

    lea  rdi, [arr]
    mov  rsi, n
    call array_max

    mov  eax, 60
    xor  edi, edi
    syscall
