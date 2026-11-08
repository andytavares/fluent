## What you build

You write `my_strlen` and `my_strcpy` for null-terminated byte strings. You can use the x86 string instructions and the `rep` prefix. This lesson builds on **Arrays & Loops**.

## Key concepts

### String instructions use fixed registers

Each string instruction moves its pointers forward or backward after each byte.

| Register | Role |
|----------|------|
| `rsi` | Source pointer (moves after each byte) |
| `rdi` | Destination pointer (moves after each byte) |
| `rcx` | Count for the `rep` prefix |
| `al`/`ax`/`eax`/`rax` | Value for `scasb`, `stosb` and `lodsb` |
| `RFLAGS.DF` | Direction: 0 = forward (default), 1 = backward |

`cld` clears DF (forward), and `std` sets it (backward). Run `cld` before string instructions, unless you need the reverse direction.

```nasm
; forward: rsi and rdi go up
cld
```

### Four string instructions move or compare bytes

`lodsb` loads `[rsi]` into `al` and moves `rsi` forward.

```nasm
cld
; [rdi] = [rsi]; rsi++; rdi++
movsb
; [rdi] = al; rdi++
stosb
; cmp al, [rdi]; rdi++
scasb
; cmp [rsi], [rdi]; rsi++; rdi++
cmpsb
; al = [rsi]; rsi++
lodsb
```

### `rep` repeats a string instruction `rcx` times

`rep` repeats the next string instruction until `rcx == 0`. `repe` (or `repz`) also stops when ZF=0. `repne` (or `repnz`) also stops when ZF=1.

```nasm
; memcpy: rdi=dst, rsi=src, rcx=n
cld
; copy rcx bytes from [rsi] to [rdi]
rep movsb

; memset to 0: rdi=dst, rcx=n
xor  al, al
rep stosb
```

### `repne scasb` finds a byte

`repne scasb` scans until `[rdi]` equals `al`. Each byte scanned subtracts 1 from `rcx`. After the scan, `rcx` is the start value minus the bytes scanned, so `not rcx` and `dec rcx` give the length.

```nasm
; size_t strlen(const char *s)
; rdi = s
strlen_impl:
    xor   ecx, ecx
    ; rcx = UINT64_MAX (max scan length)
    not   rcx
    ; look for the NUL byte
    xor   al, al
    cld
    ; scan until [rdi] == 0
    repne scasb
    ; rcx = bytes scanned
    not   rcx
    ; subtract 1 for the NUL byte
    dec   rcx
    mov   rax, rcx
    ret
```

### `lodsb` and `stosb` copy a string

The loop copies one byte per pass and stops after it copies the NUL terminator.

```nasm
; strcpy(dst, src): rdi=dst, rsi=src
strcpy_impl:
    cld
.loop:
    ; al = [rsi]; rsi++
    lodsb
    ; [rdi] = al; rdi++
    stosb
    test al, al
    ; continue until NUL is copied
    jnz  .loop
    ret
```

### Real libraries scan many bytes at a time

Some C libraries use `repne scasb` for `strlen`. Others use SSE2 or AVX2 to scan 16 or 32 bytes per pass, which is faster for long strings. In Go, `len(s)` is O(1), because Go stores the length next to the pointer. In assembly, you get the same effect when you pass `n` as a separate argument.

```nasm
; Go-style: rdi = pointer, rsi = length
mov  rax, rsi
```

## Watch out

- Without `cld`, DF keeps the state of an earlier `std`. The instructions then walk backward and corrupt other data.
- `repne scasb` stops when `rcx` reaches 0. A small start value stops the scan before the terminator.
- Start `rcx` at `UINT64_MAX`: zero it, then `not rcx`. Then any real string fits.
- `rep` string instructions have a fixed setup cost. For very short strings, a byte loop is faster.
- Real `memcpy` and `strlen` pick a method by size, and use SIMD for large buffers.
- `lodsb` writes only `al`. The upper 56 bits of `rax` keep old data until you zero them.

## The task

Write `my_strlen` and `my_strcpy` for null-terminated byte strings.

1. `my_strlen` takes `rdi = s`, a pointer to a null-terminated string.
2. `my_strlen` returns the number of bytes before the null terminator in `rax`.
3. `my_strcpy` takes `rdi = dst` and `rsi = src`.
4. `my_strcpy` copies every byte of `src` to `dst`, including the null terminator.
5. `my_strcpy` returns nothing.

You can use `repne scasb` for `my_strlen` and `lodsb`/`stosb` for `my_strcpy`. Explicit loops work too. The input registers are caller-saved. After `lodsb`/`stosb`, `rdi` and `rsi` point one past the terminator, and that is fine. An empty string has length 0.

```nasm
; int64_t my_strlen(const char *s)
my_strlen:
    ; TODO
    ret

; void my_strcpy(char *dst,
;     const char *src)
my_strcpy:
    ; TODO
    ret

my_strlen("Hello")          ; 5
my_strlen("")               ; 0
my_strlen("X")              ; 1
my_strlen("Hello, World!")  ; 13
my_strcpy(buf, "Hello")
; buf = "Hello", buf[5] = 0
```
