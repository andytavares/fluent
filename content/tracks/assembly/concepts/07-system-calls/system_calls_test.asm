; system-calls — test suite
; Compile: nasm -f elf64 stub.asm -o stub.o && nasm -f elf64 system_calls_test.asm -o test.o && ld stub.o test.o -o test && ./test
;
; Strategy: print_message writes to fd 1 (stdout). To verify the actual bytes
; written (not just "didn't crash"), we temporarily redirect fd 1 to the write
; end of a pipe, call print_message, restore the real stdout, then read the
; bytes back out of the pipe and compare them byte-for-byte against what we
; expect. This actually exercises the syscall ABI (write, dup2, pipe, read,
; close) rather than trusting print_message's own claims about what it did.

global _start
extern print_message
extern exit_with_code

section .data
    data_hello   db "hello"          ; 5 bytes, no newline
    data_hello_len equ $ - data_hello

    data_one     db "X"              ; 1 byte
    data_one_len equ $ - data_one

    msg_p1  db "PASS: print_message writes 'hello' via write(1,...)", 10
    len_p1  equ $ - msg_p1
    msg_f1  db "FAIL: print_message did not write 'hello' correctly", 10
    len_f1  equ $ - msg_f1

    msg_p2  db "PASS: print_message writes a single byte", 10
    len_p2  equ $ - msg_p2
    msg_f2  db "FAIL: print_message single-byte write wrong", 10
    len_f2  equ $ - msg_f2

    msg_p3  db "PASS: print_message with len=0 writes nothing", 10
    len_p3  equ $ - msg_p3
    msg_f3  db "FAIL: print_message with len=0 wrote bytes", 10
    len_f3  equ $ - msg_f3

    msg_p4  db "PASS: exit_with_code terminates the process", 10
    len_p4  equ $ - msg_p4
    msg_f4  db "FAIL: exit_with_code did not exit with status 0", 10
    len_f4  equ $ - msg_f4

    msg_ok  db "All tests passed", 10
    len_ok  equ $ - msg_ok
    msg_ng  db "Some tests FAILED", 10
    len_ng  equ $ - msg_ng

section .bss
    pipefd        resd 2      ; pipefd[0] = read end, pipefd[1] = write end
    saved_stdout  resd 1
    readbuf       resb 64

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

; Redirects fd 1 to a fresh pipe's write end, saving the original stdout fd
; in [saved_stdout] and the pipe fds in [pipefd].
capture_stdout_start:
    mov   eax, 32               ; dup
    mov   edi, 1
    syscall
    mov   [saved_stdout], eax

    mov   eax, 22                ; pipe
    lea   rdi, [pipefd]
    syscall

    mov   eax, 33                ; dup2(pipefd[1], 1)
    mov   edi, [pipefd + 4]
    mov   esi, 1
    syscall
    ret

; Restores the real stdout, closes the pipe's write end, and reads whatever
; was written into the pipe's read end into [readbuf]. Returns bytes read in rax.
capture_stdout_end:
    mov   eax, 33                ; dup2(saved_stdout, 1) — restore real stdout
    mov   edi, [saved_stdout]
    mov   esi, 1
    syscall

    mov   eax, 3                 ; close(saved_stdout)
    mov   edi, [saved_stdout]
    syscall

    mov   eax, 3                 ; close(pipefd[1]) — writer side no longer needed
    mov   edi, [pipefd + 4]
    syscall

    mov   eax, 0                 ; read(pipefd[0], readbuf, 64)
    mov   edi, [pipefd]
    lea   rsi, [readbuf]
    mov   edx, 64
    syscall

    push  rax                    ; preserve byte count across close()
    mov   eax, 3                 ; close(pipefd[0])
    mov   edi, [pipefd]
    syscall
    pop   rax
    ret

; Compares readbuf[0..len-1] to [rdi][0..len-1]. rdi=expected ptr, rdx=len.
; Returns rax=1 if equal, rax=0 if not.
buf_matches:
    xor   rax, rax
    xor   rcx, rcx
.loop:
    cmp   rcx, rdx
    jge   .eq
    mov   r8b, [rdi + rcx]
    mov   r9b, [readbuf + rcx]
    cmp   r8b, r9b
    jne   .neq
    inc   rcx
    jmp   .loop
.eq:
    mov   rax, 1
    ret
.neq:
    xor   rax, rax
    ret

_start:
    xor  r15d, r15d

    ; Test 1: print_message writes exactly "hello" (5 bytes)
    call capture_stdout_start
    lea  rdi, [data_hello]
    mov  rsi, data_hello_len
    call print_message
    call capture_stdout_end        ; rax = bytes read back
    cmp  rax, data_hello_len
    jne  .f1
    lea  rdi, [data_hello]
    mov  rdx, data_hello_len
    call buf_matches
    test rax, rax
    jz   .f1
    print msg_p1, len_p1
    jmp  .t2
.f1: print msg_f1, len_f1
    inc  r15

    ; Test 2: print_message writes exactly one byte "X"
.t2:
    call capture_stdout_start
    lea  rdi, [data_one]
    mov  rsi, data_one_len
    call print_message
    call capture_stdout_end
    cmp  rax, data_one_len
    jne  .f2
    lea  rdi, [data_one]
    mov  rdx, data_one_len
    call buf_matches
    test rax, rax
    jz   .f2
    print msg_p2, len_p2
    jmp  .t3
.f2: print msg_f2, len_f2
    inc  r15

    ; Test 3: print_message with len=0 writes nothing
.t3:
    call capture_stdout_start
    lea  rdi, [data_one]
    mov  rsi, 0
    call print_message
    call capture_stdout_end
    test rax, rax
    jnz  .f3
    print msg_p3, len_p3
    jmp  .t4
.f3: print msg_f3, len_f3
    inc  r15

    ; Test 4: exit_with_code(0) actually terminates the process with status 0.
    ; We fork so the parent can observe the child's exit status without
    ; ending this test process itself.
.t4:
    mov  eax, 57                 ; fork
    syscall
    test rax, rax
    jnz  .parent_wait
    ; child: call exit_with_code(0) — must terminate the process here
    mov  rdi, 0
    call exit_with_code
    ; if exit_with_code failed to terminate, exit with a distinct nonzero code
    mov  eax, 60
    mov  edi, 77
    syscall

.parent_wait:
    mov  rdi, rax                ; child pid
    lea  rsi, [readbuf]          ; reuse readbuf as scratch for the status word
    xor  edx, edx                ; options = 0
    xor  r10, r10                ; rusage = NULL
    mov  eax, 61                 ; wait4(pid, &status, 0, NULL)
    syscall

    mov  eax, [readbuf]
    and  eax, 0xff00             ; WEXITSTATUS(status): exit code lives in bits 8-15
    shr  eax, 8
    test eax, eax
    jnz  .f4
    print msg_p4, len_p4
    jmp  .summary
.f4:
    print msg_f4, len_f4
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
