; control-flow — stub
; Target: x86-64 Linux, NASM syntax
; Assemble: nasm -f elf64 stub.asm -o stub.o && ld stub.o -o stub && ./stub

global clamp
global _start

section .text

; int64_t clamp(int64_t value, int64_t min_val, int64_t max_val)
; rdi=value, rsi=min_val, rdx=max_val
; Returns clamped value in rax
clamp:
    ; TODO: return value clamped to [min_val, max_val]
    mov  rax, rdi   ; placeholder: returns value unchanged
    ret

_start:
    mov  rdi, 5
    mov  rsi, 0
    mov  rdx, 10
    call clamp      ; expected: 5

    ; exit(0)
    mov  eax, 60
    xor  edi, edi
    syscall
