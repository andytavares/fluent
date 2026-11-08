## What you build

You write `print_message`, which writes bytes to stdout, and `exit_with_code`, which ends the process. Both call the Linux kernel directly with `syscall`, without libc. This lesson builds on **Memory & Addressing**.

## Key concepts

### The syscall ABI has its own registers

The kernel gives its services through the `syscall` instruction. This ABI is separate from the user-space calling convention.

| Role | Register |
|------|----------|
| Syscall number | `rax` |
| Arg 1 | `rdi` |
| Arg 2 | `rsi` |
| Arg 3 | `rdx` |
| Arg 4 | `r10` (not `rcx`) |
| Arg 5 | `r8` |
| Arg 6 | `r9` |
| Return value | `rax` |

Argument 4 goes in `r10`, because `syscall` overwrites `rcx` and `r11`. It stores the return address in `rcx` and RFLAGS in `r11`.

```nasm
; arg 4 of a syscall
mov  r10, 0
syscall
; rcx and r11 now hold other values
```

### Each syscall has a number

These are common numbers on x86-64 Linux. The full table is in `/usr/include/asm/unistd_64.h` and the `syscall(2)` man page.

| Number | Name | Signature |
|--------|------|-----------|
| 0 | `read` | `read(fd, buf, count)` |
| 1 | `write` | `write(fd, buf, count)` |
| 60 | `exit` | `exit(status)` |
| 231 | `exit_group` | `exit_group(status)` |

### `write` sends bytes to a file descriptor

File descriptor 1 is stdout. `$` is the current address, so `$ - msg` is the length of `msg`.

```nasm
section .data
    ; 10 = newline
    msg db "Hello, kernel!", 10
    msg_len equ $ - msg

section .text
    ; write(1, msg, msg_len)
    ; syscall: write
    mov  rax, 1
    ; fd: stdout
    mov  rdi, 1
    ; buf: address of the message
    mov  rsi, msg
    ; count: bytes to write
    mov  rdx, msg_len
    ; rax = bytes written, or -errno
    syscall
```

### `exit` ends the calling thread

`exit` (60) does not return. In a multi-threaded program, use `exit_group` (231) to end all threads.

```nasm
    ; syscall: exit
    mov  rax, 60
    ; status: 0
    xor  rdi, rdi
    ; does not return
    syscall
```

### A negative return value is an error

On error, `syscall` returns `-errno` in `rax`.

```nasm
    syscall
    test  rax, rax
    ; SF=1: rax is negative
    js    .error
```

### libc and runtimes wrap the same instruction

In C, `printf("hello\n")` buffers in stdio, then calls `write(1, ...)`. C `exit(0)` runs exit handlers, flushes stdio, then calls `exit_group`. The Go runtime wraps each `syscall` so the scheduler can park a goroutine during a blocking call. Here you call the kernel directly, with no buffer and no cleanup.

```nasm
; no buffer: the bytes go to fd 1 now
mov  rax, 1
syscall
```

## Watch out

- Argument 4 goes in `r10`, not `rcx`. Every `syscall` overwrites `rcx` and `r11`.
- `write` can write fewer bytes than you ask for, for example to a full pipe. Real code calls `write` again with the remaining bytes.
- The task needs only one `write` call. Production code must handle the short write.
- `exit` (60) ends only the calling thread. In a multi-threaded program, other threads keep running. Use `exit_group` (231).
- The kernel keeps only the low 8 bits of the exit status. To a shell, `exit_with_code(256)` and `exit_with_code(0)` look the same.

## The task

Write two procedures that call the kernel with `syscall`, without libc.

1. `print_message` takes `rdi = msg`, a byte pointer, and `rsi = len`, a byte count.
2. `print_message` writes exactly `len` bytes from `msg` to stdout (file descriptor 1). Use `write` (syscall 1).
3. `print_message` returns nothing.
4. `exit_with_code` takes the exit status in `rdi`.
5. `exit_with_code` ends the process with `exit` (syscall 60) and that status. It never returns.

The `write` syscall needs `rdi = 1`, `rsi = msg` and `rdx = len`. Move `rsi` into `rdx` and `rdi` into `rsi` before you set `rdi`. Otherwise you overwrite an input. `syscall` overwrites `rax`, `rcx` and `r11`. A length of 0 is valid and writes nothing.

```nasm
; void print_message(const char *msg,
;     int64_t len)
print_message:
    ; TODO
    ret

; void exit_with_code(int64_t code)
exit_with_code:
    ; TODO

print_message("hello", 5)
; writes the 5 bytes "hello"
print_message("X", 1)
; writes 1 byte: "X"
print_message(msg, 0)
; writes nothing
exit_with_code(0)
; process ends with status 0
```
