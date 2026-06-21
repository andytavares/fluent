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

## The task

```ruby
def count_lines(path)
  # Return the number of lines in the file at path (String or Pathname).
  # Return 0 if the file does not exist.
end

def parse_json_keys(json_string)
  # Parse json_string and return an Array of the top-level keys as strings,
  # sorted alphabetically.
end

def csv_column(csv_string, column_name)
  # Parse csv_string (with headers) and return an Array of values
  # from the given column_name. Values should be strings as-is from the CSV.
end

def write_lines(path, lines)
  # Write each element of lines as a separate line to path.
  # Overwrite if file exists.
end
```
