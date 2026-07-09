# String Operations

## What you'll learn

The x86 string instructions (`movsb`, `cmpsb`, `scasb`, `stosb`) and the `rep` prefix that repeats them using `rcx` as a count, plus how to implement `strlen` and `strcpy` manually.

## Key concepts

### String instruction registers

The string instructions use fixed registers:

| Register | Role |
|----------|------|
| `rsi` | Source pointer (auto-incremented/decremented) |
| `rdi` | Destination pointer (auto-incremented/decremented) |
| `rcx` | Count for `rep` prefix |
| `al`/`ax`/`eax`/`rax` | Scan/store value for `scasb`/`stosb` |
| `RFLAGS.DF` | Direction: 0 = forward (default), 1 = backward |

Direction flag `DF` is controlled by `cld` (clear, forward) and `std` (set, backward). Always call `cld` before using string instructions unless you explicitly need reverse direction.

### The instructions

```nasm
; movsb — copy byte [rsi] -> [rdi], advance both
cld
movsb           ; [rdi] = [rsi]; rsi++; rdi++

; stosb — store al into [rdi], advance rdi
stosb           ; [rdi] = al; rdi++

; scasb — compare al with [rdi], advance rdi, set flags
scasb           ; cmp al, [rdi]; rdi++

; cmpsb — compare [rsi] with [rdi], advance both, set flags
cmpsb           ; cmp [rsi], [rdi]; rsi++; rdi++
```

### The `rep` prefix

`rep` repeats the following string instruction until `rcx == 0`:

```nasm
; memcpy(dst, src, n):  rdi=dst, rsi=src, rcx=n
cld
rep movsb           ; copies rcx bytes from [rsi] to [rdi]

; memset(dst, 0, n):  rdi=dst, rcx=n, al=0
xor  al, al
rep stosb

; repz/repe: repeat while equal (ZF=1) and rcx!=0
; repnz/repne: repeat while not equal (ZF=0) and rcx!=0
```

### Manual `strlen`

`scasb` with `repne` scans until `[rdi] != al`:

```nasm
; size_t strlen(const char *s)  — rdi = s
strlen_impl:
    xor   ecx, ecx
    not   rcx            ; rcx = UINT64_MAX (max scan length)
    xor   al, al         ; looking for NUL byte
    cld
    repne scasb          ; scan until [rdi] == 0, decrement rcx each time
    not   rcx            ; rcx = bytes scanned
    dec   rcx            ; subtract 1 for the NUL byte
    mov   rax, rcx
    ret
```

After `repne scasb`, `rcx` holds `(initial_rcx - bytes_consumed)`. `not rcx` then `dec rcx` recovers the length.

### Manual `strcpy`

```nasm
; strcpy(dst, src) — rdi=dst, rsi=src
; Copies bytes including NUL terminator
strcpy_impl:
    cld
.loop:
    lodsb               ; al = [rsi]; rsi++
    stosb               ; [rdi] = al; rdi++
    test al, al
    jnz  .loop          ; continue until NUL copied
    ret
```

## vs other languages

`strlen` in C's standard library uses `repne scasb` on some platforms, and SIMD word-at-a-time scanning on others. The manual loop above is correct but not optimal for large strings — a real libc implementation processes 16 or 32 bytes per iteration using SSE2 or AVX2.

In Go, `len(s)` for a `string` is O(1) because the length is stored alongside the pointer. The assembly equivalent would be passing `n` as a separate argument — which is exactly what Go does internally.

## Watch out

- Forgetting `cld` before `movsb`/`scasb`/`stosb`/`lodsb` leaves `DF` in whatever state a previous `std` left it — the instructions then walk backward through memory instead of forward, corrupting unrelated data.
- `repne scasb` decrements `rcx` on every byte scanned. Starting `rcx` too small makes the scan give up ("not found") before reaching the terminator, even on a valid string — seeding it with `UINT64_MAX` (via `not rcx` after zeroing) sidesteps this for any realistic string length.
- `rep`-prefixed string instructions have a fixed per-instruction setup cost that makes them slower than a manual byte loop for very short strings, despite being "the fast path" for large ones — real `memcpy`/`strlen` implementations dispatch on size and use SIMD for large buffers.
- `lodsb`/`stosb` only touch `al` — the upper 56 bits of `rax` are left exactly as they were, which is harmless here but will surface stale data if you later treat `rax` as a full 64-bit value without re-zeroing it.

## The task

Implement `my_strlen` and `my_strcpy` for null-terminated byte strings:

```nasm
; int64_t my_strlen(const char *s)
; rdi = null-terminated string
; Returns the length in rax, not counting the null terminator
my_strlen:
    ; TODO

; void my_strcpy(char *dst, const char *src)
; rdi = dst, rsi = src
; Copies src to dst, including the null terminator. Returns nothing (void).
my_strcpy:
    ; TODO
```

Register contract: for `my_strlen`, `rdi` is the input pointer (caller-saved, clobber freely) and the length is returned in `rax`. For `my_strcpy`, `rdi` and `rsi` are both inputs; the caller's copies of these pointers are not preserved across the call — `dst` and `src` themselves are left pointing one past the copied null terminator if you use `lodsb`/`stosb`, which is fine since nothing reads them afterward.

```nasm
my_strlen("Hello");            // 5
my_strlen("");                 // 0   — empty string
my_strlen("Hello, World!");    // 13

char buf[64];
my_strcpy(buf, "Hello");       // buf == "Hello\0", buf[5] == 0
```

You may use the `repne scasb` pattern for `my_strlen` and `lodsb`/`stosb` for `my_strcpy`, or implement them as explicit loops.
