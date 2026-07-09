# Text Processing

## What you'll learn

So far you've manipulated data you already had in variables and arrays; now you'll pull data out of arbitrary text. `grep`, `sed`, and `awk` are the core text-processing triad. Together they handle 90% of the log parsing, data extraction, and transformation tasks you'll face in shell scripts.

## Key concepts

**`grep` — search for patterns:**

```bash
grep "error" app.log                  # basic search
grep -i "error" app.log               # case-insensitive
grep -n "error" app.log               # show line numbers
grep -c "error" app.log               # count matching lines
grep -v "debug" app.log               # invert — lines NOT matching
grep -E "error|warn" app.log          # extended regex (ERE)
grep -P "\d{3}-\d{4}" contacts.txt   # Perl regex (not on all systems)
grep -r "TODO" ./src/                 # recursive
grep -l "TODO" ./src/*.sh             # print only filenames
```

**`sed` — stream editor for substitution and transformation:**

```bash
sed 's/foo/bar/' file.txt            # replace first match per line
sed 's/foo/bar/g' file.txt           # replace all matches per line
sed 's/foo/bar/gi' file.txt          # case-insensitive, global
sed -n '5,10p' file.txt              # print lines 5–10
sed '/^#/d' file.txt                 # delete comment lines
sed -i 's/old/new/g' file.txt        # in-place edit (GNU sed)
sed -i '' 's/old/new/g' file.txt     # in-place on macOS (BSD sed)

# Capture groups with \1
sed 's/\(first\) \(second\)/\2 \1/'     # BRE groups (default)
sed -E 's/(first) (second)/\2 \1/'      # ERE groups (-E flag)
```

**`awk` — field-based processing:**

```bash
awk '{print $1}' file.txt            # print first field (whitespace-split)
awk '{print $NF}' file.txt           # print last field
awk -F: '{print $1}' /etc/passwd     # use : as field separator
awk 'NR==3' file.txt                 # print line 3 (NR = record number)
awk 'NR>=2 && NR<=5' file.txt        # print lines 2–5
awk '/pattern/' file.txt             # print lines matching pattern
awk '$3 > 100 {print $1, $3}' data   # conditional field printing

# BEGIN/END blocks
awk 'BEGIN {sum=0} {sum+=$2} END {print sum}' data.txt
```

**Combining them:**

```bash
# Extract unique IPs from a log, count occurrences, sort by count
grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' access.log \
  | sort | uniq -c | sort -rn | head -10
```

## Watch out

- `grep` without `-o` prints the whole matching **line**, not the matched substring — a common surprise for people expecting `re.search().group()` semantics. Use `-o` (or `-oE`) to print just what matched.
- BRE vs ERE: plain `grep`/`sed` use POSIX Basic Regular Expressions, where `(`, `)`, `|`, `+`, `{` are literal characters unless backslash-escaped. `grep -E`/`sed -E` (or `egrep`) switch to Extended syntax where those are metacharacters. Mixing the two up is the most common "my regex doesn't match" bug.
- `sed -i` differs between GNU (Linux) and BSD (macOS) — GNU accepts `sed -i 's/a/b/' f`, BSD requires an explicit (possibly empty) backup extension: `sed -i '' 's/a/b/' f`. Scripts that need to run on both should detect the platform or use `perl -pi -e` instead.
- `awk '{print $1}'` splits on **runs of whitespace** by default, not a single delimiter — two spaces between fields doesn't create an empty field like `str.split(" ")` would in Python. Set `-F` explicitly when the delimiter matters (e.g. `-F:` for `/etc/passwd`).

## vs other languages

| Task | Python | Bash triad |
|------|--------|-----------|
| Regex search | `re.search(pattern, line)` | `grep -E 'pattern' file` |
| String replace | `str.replace()` / `re.sub()` | `sed 's/old/new/g'` |
| Split on delimiter | `line.split(':')` | `awk -F: '{print $N}'` |
| Filter lines | list comprehension + condition | `grep -v` / `awk '/pattern/'` |
| Count occurrences | `Counter()` | `sort | uniq -c` |

`awk` is Turing-complete — it has variables, arrays, loops, and functions. You rarely need all of that, but knowing it means you can handle complex CSV-style transformations without switching to Python.

## The task

You're writing three functions that read text from **stdin** (not arguments) and print to stdout — call them as the right side of a pipe: `echo "..." | extract_emails`.

**`extract_emails`** — reads stdin, prints every email address found, one per line, in the order encountered. Use `grep -oE` with an email pattern. If no email is found, prints nothing.

```bash
echo "contact user@example.com" | extract_emails
# user@example.com

echo "send to a@b.com and x@y.org today" | extract_emails
# a@b.com
# x@y.org

echo "no addresses here" | extract_emails
# (nothing printed)
```

**`remove_comments`** — reads stdin, strips lines that start with `#` (allowing leading whitespace before the `#`), and prints the remaining lines unchanged. Use `grep -v`/`grep -E -v` or `sed`.

```bash
printf '# comment\nreal line\n  # indented comment\nanother line\n' | remove_comments
# real line
# another line
```

**`sum_second_column`** — reads stdin with whitespace-separated columns, echoes the sum of the second column as an integer. Use `awk`. Empty input sums to `0`.

```bash
printf 'a 10\nb 20\nc 30\n' | sum_second_column   # 60
printf 'item 42\n' | sum_second_column            # 42
printf '' | sum_second_column                     # 0
```
