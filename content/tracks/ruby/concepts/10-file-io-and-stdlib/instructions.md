## What you build

You write four functions that count file lines, read JSON keys, extract a CSV column and write lines to a file. This lesson builds on **Modules & Mixins**.

## Key concepts

### Three ways to read a file

`File.read` reads the whole file. `File.foreach` reads one line at a time and uses less memory. `File.readlines` returns an array of lines.

```ruby
content = File.read("data.txt")

File.foreach("data.txt") do |line|
  puts line.chomp
end

lines = File.readlines("data.txt",
                       chomp: true)
```

`chomp: true` (Ruby 2.4 or later) removes the trailing newline from each line.

### The block form of `File.open` closes the file

`File.write` overwrites a file. `File.open` with a block closes the file when the block exits, even after an exception. It works like `try`-with-resources in Java or `defer f.Close()` in Go.

```ruby
File.write("output.txt", "hello\n")

# "a" opens in append mode
File.open("output.txt", "a") do |f|
  f.puts "another line"
end
```

### `Pathname` makes paths into objects

`Pathname` wraps a path string in an object. It composes better than `File.join` strings.

```ruby
require "pathname"

base = Pathname.new("/var/log")
log = base / "app" / "errors.log"
# => #<Pathname:/var/log/app/errors.log>

log.exist?
log.directory?
log.extname   # => ".log"
log.basename  # => #<Pathname:errors.log>
log.parent    # => #<Pathname:/var/log/app>

# Resolves ~
Pathname.new("~/docs").expand_path
```

### `Dir.glob` finds files by pattern

`Dir[]` is short for `Dir.glob`.

```ruby
# All .rb files, recursively
Dir.glob("**/*.rb")
# CSV or TSV files in data/
Dir.glob("data/*.{csv,tsv}")

Dir["tmp/**/*"].each do |f|
  File.delete(f) if File.file?(f)
end
```

### `JSON` parses to string keys

`JSON.parse` returns string keys. Pass `symbolize_names: true` for symbol keys, which Rails-style code often uses.

```ruby
require "json"

data = JSON.parse('{"name":"Alice"}')
data["name"]  # => "Alice"

data = JSON.parse('{"name":"Alice"}',
                  symbolize_names: true)
data[:name]   # => "Alice"

JSON.generate({ name: "Alice", n: [1, 2] })
# => '{"name":"Alice","n":[1,2]}'

JSON.pretty_generate({ name: "Alice" })
```

### `CSV` reads rows by header

With `headers: true`, the first row is the header row. `row["col"]` looks up a value by header name.

```ruby
require "csv"

text = "name,age\nAlice,30\nBob,25"
CSV.parse(text, headers: true) do |row|
  puts "#{row["name"]} is #{row["age"]}"
end

CSV.foreach("data.csv",
            headers: true) do |row|
  p row.to_h
end

CSV.open("out.csv", "w") do |csv|
  csv << ["name", "score"]
  csv << ["Alice", 95]
end
```

### `Tempfile` gives tests a real file

`Tempfile.create` with a block makes a temporary file and deletes it when the block exits. Ruby deletes a `Tempfile.new` file on `unlink` or at garbage collection.

```ruby
require "tempfile"

Tempfile.create("prefix") do |f|
  f.write("data")
  f.rewind
  puts f.read
end
```

### File I/O is synchronous

The standard library has no async I/O. For many concurrent I/O tasks, use threads or Ractors (Ruby 3 or later). CRuby has a GVL, but it releases the GVL during I/O.

## Watch out

- Most `File` methods accept a `String` or an object with `to_path`. For older APIs, call `.to_s` on a `Pathname`.
- `JSON.parse` gives string keys, so `data[:name]` returns `nil`. Pass `symbolize_names: true` for symbols.
- Without `chomp: true`, `File.foreach` and `File.readlines` keep the `"\n"` on every line.
- With `headers: true`, `CSV.parse` treats the first row as headers. Each row you get is a data row.
- Ruby buffers writes to a `Tempfile`. Call `f.flush`, or close the file, before another reader opens it.

## The task

Write four functions in `stub.rb`. They read and write files, and parse JSON and CSV.

1. `count_lines(path)` returns the number of lines in the file at `path`.
2. `path` can be a `String` or a `Pathname`.
3. `count_lines` returns `0` if the file does not exist. An empty file also has 0 lines.
4. A last line with no trailing newline still counts as a line.
5. `parse_json_keys(json_string)` parses a JSON object and returns its top-level keys as strings.
6. `parse_json_keys` sorts the keys alphabetically.
7. `csv_column(csv_string, column_name)` parses CSV text whose first row is the header row.
8. `csv_column` returns the values of the column named `column_name`, as strings, exactly as they appear.
9. `write_lines(path, lines)` writes each element of `lines` as one line to the file at `path`.
10. `write_lines` overwrites any old content. An empty array leaves an empty file.

```ruby
# File holds "alpha\nbeta\ngamma\n"
count_lines(path)                # => 3
count_lines(Pathname.new(path))  # => 3
# File is empty
count_lines(path)                # => 0
# File holds "no trailing newline"
count_lines(path)                # => 1
count_lines("/nonexistent/path/file.txt")
# => 0

parse_json_keys(
  '{"zebra":1,"apple":2,"mango":3}'
)
# => ["apple", "mango", "zebra"]
parse_json_keys('{"name":"Alice","id":1}')
# => ["id", "name"]
parse_json_keys('{}')          # => []
parse_json_keys('{"x":null}')  # => ["x"]

csv = "name,score\nAlice,95\nBob,87\nCarol,91"
csv_column(csv, "name")
# => ["Alice", "Bob", "Carol"]
csv_column(csv, "score")
# => ["95", "87", "91"]
csv_column("only\nrow1\nrow2", "only")
# => ["row1", "row2"]

write_lines(path, ["hello", "world"])
File.readlines(path, chomp: true)
# => ["hello", "world"]
write_lines(path, ["overwritten"])
File.readlines(path, chomp: true)
# => ["overwritten"]
write_lines(path, [])
File.read(path)  # => ""
```
