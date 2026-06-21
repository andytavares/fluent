; control-flow — exemplar
; Target: x86-64 Linux, NASM syntax

global clamp
global _start

section .text

; int64_t clamp(int64_t value, int64_t min_val, int64_t max_val)
; rdi=value, rsi=min_val, rdx=max_val
clamp:
    mov  rax, rdi        ; rax = value
    cmp  rax, rsi
    jge  .check_max      ; if value >= min, skip min clamp
    mov  rax, rsi        ; rax = min_val
.check_max:
    cmp  rax, rdx
    jle  .done           ; if value <= max, done
    mov  rax, rdx        ; rax = max_val
.done:
    ret

_start:
    mov  rdi, 5
    mov  rsi, 0
    mov  rdx, 10
    call clamp

    mov  eax, 60
    xor  edi, edi
    syscall
