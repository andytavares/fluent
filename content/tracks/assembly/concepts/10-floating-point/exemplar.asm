; floating-point — exemplar
; Target: x86-64 Linux, NASM syntax

global euclidean_distance
global int_to_double
global _start

section .text

; double euclidean_distance(double x1, double y1, double x2, double y2)
; xmm0=x1, xmm1=y1, xmm2=x2, xmm3=y2
euclidean_distance:
    subsd  xmm2, xmm0         ; dx = x2 - x1
    subsd  xmm3, xmm1         ; dy = y2 - y1
    mulsd  xmm2, xmm2         ; dx^2
    mulsd  xmm3, xmm3         ; dy^2
    addsd  xmm2, xmm3         ; dx^2 + dy^2
    sqrtsd xmm0, xmm2         ; xmm0 = sqrt(dx^2 + dy^2)
    ret

; double int_to_double(int64_t n)
; rdi = n
int_to_double:
    cvtsi2sd xmm0, rdi
    ret

_start:
    mov  eax, 60
    xor  edi, edi
    syscall
