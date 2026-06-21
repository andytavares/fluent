; procedures — exemplar
; Target: x86-64 Linux, NASM syntax

global apply_twice
global _start

section .text

; int64_t apply_twice(int64_t (*fn)(int64_t), int64_t x)
; rdi = fn pointer, rsi = x
; Returns fn(fn(x))
apply_twice:
    push r12             ; save callee-saved register
    push r13

    mov  r12, rdi        ; r12 = fn  (safe across calls)
    mov  rdi, rsi        ; first arg = x

    call r12             ; rax = fn(x)

    mov  rdi, rax        ; first arg = fn(x)
    call r12             ; rax = fn(fn(x))

    pop  r13
    pop  r12
    ret

; Helper: double(x) = x * 2
double_val:
    mov  rax, rdi
    imul rax, 2
    ret

_start:
    lea  rdi, [double_val]
    mov  rsi, 3
    call apply_twice     ; 12

    mov  eax, 60
    xor  edi, edi
    syscall
