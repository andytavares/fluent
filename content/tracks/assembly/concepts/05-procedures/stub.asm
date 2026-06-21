; procedures — stub
; Target: x86-64 Linux, NASM syntax
; Assemble: nasm -f elf64 stub.asm -o stub.o && ld stub.o -o stub && ./stub

global apply_twice
global _start

section .text

; int64_t apply_twice(int64_t (*fn)(int64_t), int64_t x)
; rdi = fn pointer, rsi = x
; Returns fn(fn(x))
apply_twice:
    ; TODO: call fn(x), then call fn(result), return final result
    ; Hint: save rdi across the first call using a callee-saved register
    xor  eax, eax    ; placeholder
    ret

; Helper for testing: double(x) = x * 2
double_val:
    mov  rax, rdi
    imul rax, 2
    ret

_start:
    lea  rdi, [double_val]
    mov  rsi, 3
    call apply_twice     ; expected: double(double(3)) = 12

    ; exit(0)
    mov  eax, 60
    xor  edi, edi
    syscall
