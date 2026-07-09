# File I/O & Stdlib

## What you'll learn

Reading and writing files, working with `JSON` and `CSV`, path manipulation with `Pathname`, and globbing with `Dir`.

## Key concepts

### Reading files

```ruby
# Slurp the whole file
content = File.read("data.txt")

# Read line by line (memory-efficient)
File.foreach("data.txt") { |line| puts line.chomp }

# Read all lines into an array
lines = File.readlines("data.txt", chomp: true)
```

`chomp: true` (Ruby 2.4+) strips the trailing newline from each line — almost always what you want.

### Writing files

```ruby
File.write("output.txt", "hello\n")  # overwrites

File.open("output.txt", "a") do |f|  # append mode
  f.puts "another line"
end                                   # file is closed automatically
```

The block form of `File.open` closes the file when the block exits, even if an exception is raised — equivalent to `try-with-resources` in Java or a `defer f.Close()` in Go.

### Pathname

`Pathname` wraps a path string with a rich object API. It's more composable than `File.join` strings:

```ruby
require "pathname"

base = Pathname.new("/var/log")
log  = base / "app" / "errors.log"   # => #<Pathname:/var/log/app/errors.log>

log.exist?
log.directory?
log.extname    # => ".log"
log.basename   # => #<Pathname:errors.log>
log.parent     # => #<Pathname:/var/log/app>

Pathname.new("~/docs").expand_path   # resolves ~
```

### Dir.glob

```ruby
Dir.glob("**/*.rb")          # all .rb files recursively
Dir.glob("data/*.{csv,tsv}") # CSV or TSV files in data/
Dir["tmp/**/*"].each { |f| File.delete(f) if File.file?(f) }
```

`Dir[]` is a shorthand alias for `Dir.glob`.

### JSON

```ruby
require "json"

# Parse
data = JSON.parse('{"name":"Alice","age":30}')
data["name"]  # => "Alice"

# With symbol keys (common in Rails-style code):
data = JSON.parse('{"name":"Alice"}', symbolize_names: true)
data[:name]   # => "Alice"

# Generate
JSON.generate({ name: "Alice", scores: [1, 2, 3] })
# => '{"name":"Alice","scores":[1,2,3]}'

# Pretty-print
JSON.pretty_generate({ name: "Alice" })
```

### CSV

```ruby
require "csv"

# Parse a CSV string
CSV.parse("name,age\nAlice,30\nBob,25", headers: true) do |row|
  puts "#{row["name"]} is #{row["age"]}"
end

# Read a CSV file
CSV.foreach("data.csv", headers: true) { |row| p row.to_h }

# Write a CSV file
CSV.open("out.csv", "w") do |csv|
  csv << ["name", "score"]
  csv << ["Alice", 95]
end
```

### Tempfile for tests

When tests need real files, use `Tempfile` — it creates a temp file and deletes it on GC or explicit `unlink`:

```ruby
require "tempfile"

Tempfile.create("prefix") do |f|
  f.write("data")
  f.rewind
  puts f.read
end  # file deleted here
```

## vs other languages

| | Ruby | Python | Go | Java |
|---|---|---|---|---|
| File slurp | `File.read` | `open(f).read()` | `os.ReadFile` | `Files.readString` |
| Block-scoped file | `File.open(f) { |f| }` | `with open(f) as f:` | `defer f.Close()` | `try-with-resources` |
| JSON parse | `JSON.parse(str)` | `json.loads(str)` | `json.Unmarshal` | `ObjectMapper.readValue` |
| Path join | `Pathname.new(a) / b` | `Path(a) / b` | `filepath.Join(a, b)` | `Paths.get(a, b)` |
| Glob | `Dir.glob("**/*.rb")` | `glob.glob("**/*.py")` | `filepath.Glob` | `Files.walk` |

Ruby's stdlib has no async I/O — all file operations are synchronous. For high-concurrency I/O in Ruby, use threads (CRuby has a GVL but releases it for I/O) or Ractors (Ruby 3+).

## Watch out

- `File.exist?` (and most `File` methods) accept either a `String` or anything that responds to `to_path`/`to_str` — but to be safe, call `.to_s` on a `Pathname` argument before passing it to older APIs that expect a plain string.
- `JSON.parse` returns **string** keys by default (`data["name"]`, not `data[:name]`) — you need `symbolize_names: true` to get symbols. Mixing this up with a hash literal (which defaults to symbols) is a common source of `nil` lookups.
- `File.foreach`/`File.readlines` without `chomp: true` leave the trailing `"\n"` on every line — don't forget it when counting or comparing lines.
- `CSV.parse(str, headers: true)` treats the first row as headers, not data — iterating gives you one row per **data** row, and `row["col"]` looks up by header name, not by string content.
- `Tempfile.create` requires an explicit `f.flush` (or closing the file) before another process/method reads it — writes are buffered and not guaranteed visible until flushed.

## The task

Implement four functions covering file reading/writing, JSON, and CSV.

**`count_lines(path)`** — returns the number of lines in the file at `path` (a `String` or `Pathname`). Returns `0` if the file does not exist.

```ruby
# file contains "alpha\nbeta\ngamma\n"
count_lines("data.txt")               # => 3
count_lines(Pathname.new("data.txt")) # => 3
count_lines("/nonexistent/file.txt")  # => 0
# file contains "no trailing newline" (no \n at end)
count_lines("one_line.txt")           # => 1
```

**`parse_json_keys(json_string)`** — parses `json_string` and returns an `Array` of the top-level keys as strings, sorted alphabetically.

```ruby
parse_json_keys('{"zebra":1,"apple":2,"mango":3}')  # => ["apple", "mango", "zebra"]
parse_json_keys('{}')                                # => []
parse_json_keys('{"x":null}')                        # => ["x"]
```

**`csv_column(csv_string, column_name)`** — parses `csv_string` (whose first row is a header row) and returns an `Array` of values from the column named `column_name`, as strings exactly as they appear in the CSV.

```ruby
csv = "name,score\nAlice,95\nBob,87\nCarol,91"
csv_column(csv, "name")   # => ["Alice", "Bob", "Carol"]
csv_column(csv, "score")  # => ["95", "87", "91"]  — strings, not integers
```

**`write_lines(path, lines)`** — writes each element of the `lines` array as a separate line to the file at `path`, overwriting any existing content.

```ruby
write_lines("out.txt", ["hello", "world", "ruby"])
File.readlines("out.txt", chomp: true)  # => ["hello", "world", "ruby"]

write_lines("out.txt", ["overwritten"])
File.readlines("out.txt", chomp: true)  # => ["overwritten"]  — old content gone

write_lines("out.txt", [])
File.read("out.txt")  # => ""
```
