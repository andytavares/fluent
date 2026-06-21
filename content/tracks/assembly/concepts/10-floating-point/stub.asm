; floating-point — stub
; Target: x86-64 Linux, NASM syntax
; Assemble: nasm -f elf64 stub.asm -o stub.o && ld stub.o -o stub && ./stub

global euclidean_distance
global int_to_double
global _start

section .data
    zero_d   dq 0.0

section .text

; double euclidean_distance(double x1, double y1, double x2, double y2)
; xmm0=x1, xmm1=y1, xmm2=x2, xmm3=y2
; Returns sqrt((x2-x1)^2 + (y2-y1)^2) in xmm0
euclidean_distance:
    ; TODO: subsd, mulsd, addsd, sqrtsd
    movsd  xmm0, [zero_d]   ; placeholder: returns 0.0
    ret

; double int_to_double(int64_t n)
; rdi = integer, returns (double)n in xmm0
int_to_double:
    ; TODO: cvtsi2sd
    movsd  xmm0, [zero_d]   ; placeholder: returns 0.0
    ret

_start:
    ; euclidean_distance((0,0),(3,4)) should return 5.0
    ; (using immediate constants via data section is idiomatic)
    ; For the stub just call and exit cleanly
    mov  eax, 60
    xor  edi, edi
    syscall
