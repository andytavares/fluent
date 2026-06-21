# System Calls

## What you'll learn

How Linux system calls work at the instruction level: the syscall ABI register assignment, the `syscall` instruction, and how to use `write(2)` and `exit(60)` directly without libc.

## Key concepts

### The Linux syscall ABI

The kernel exposes services through the `syscall` instruction. The ABI (separate from the user-space calling convention) uses:

| Role | Register |
|------|----------|
| Syscall number | `rax` |
| Arg 1 | `rdi` |
| Arg 2 | `rsi` |
| Arg 3 | `rdx` |
| Arg 4 | `r10` (not `rcx`!) |
| Arg 5 | `r8` |
| Arg 6 | `r9` |
| Return value | `rax` |

Note that arg 4 is `r10`, not `rcx`. This is different from the user-space ABI because the kernel clobbers `rcx` and `r11` internally (it stores the return address in `rcx` and RFLAGS in `r11`).

### Common syscall numbers (x86-64 Linux)

| Number | Name | Signature |
|--------|------|-----------|
| 0 | `read` | `read(fd, buf, count)` |
| 1 | `write` | `write(fd, buf, count)` |
| 60 | `exit` | `exit(status)` |
| 231 | `exit_group` | `exit_group(status)` |

Full table: `/usr/include/asm/unistd_64.h` or `syscall(2)` man page.

### Writing to stdout

```nasm
section .data
    msg db "Hello, kernel!", 10    ; 10 = newline
    msg_len equ $ - msg            ; $ is current address, so len = end - start

section .text
    ; write(1, msg, msg_len)
    mov  rax, 1          ; syscall: write
    mov  rdi, 1          ; fd: stdout
    mov  rsi, msg        ; buf: address of message
    mov  rdx, msg_len    ; count: bytes to write
    syscall              ; returns bytes written in rax (or negative errno)
```

### Exiting cleanly

```nasm
    mov  rax, 60         ; syscall: exit
    xor  rdi, rdi        ; status: 0
    syscall              ; does not return
```

Use `exit_group` (231) for multi-threaded programs — `exit` (60) only terminates the calling thread.

### Error handling

On error, `syscall` returns a negative value in `rax` (specifically `-errno`). To check:

```nasm
    syscall
    test  rax, rax
    js    .error         ; SF=1 means rax is negative
```

## vs other languages

In C, `printf("hello\n")` ultimately calls `write(1, ...)` through the C runtime's stdio buffering layer. `exit(0)` in C calls destructors, flushes stdio, then calls `exit_group`. Here you call the kernel directly — no buffering, no cleanup.

Go's runtime also issues `syscall` instructions, but wraps them in goroutine-scheduler-aware wrappers so the scheduler can park goroutines during blocking calls. The raw kernel interface is the same.

## The task

Implement `print_message` which writes a null-terminated string to stdout using the write syscall, then implement `exit_with_code` which calls exit:

```nasm
; void print_message(const char *msg, int64_t len)
; rdi = pointer to string, rsi = byte count
; Writes msg to stdout (fd=1) via syscall write(1)
print_message:
    ; TODO

; void exit_with_code(int64_t code)
; rdi = exit status code
; Calls syscall exit(60)
exit_with_code:
    ; TODO
```
