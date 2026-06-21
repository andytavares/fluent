require_relative "exemplar"
require "tempfile"
require "pathname"

$passed = 0
$failed = 0

def assert_equal(expected, actual, name)
  if expected == actual
    puts "  PASS: #{name}"
    $passed += 1
  else
    puts "  FAIL: #{name} — expected #{expected.inspect}, got #{actual.inspect}"
    $failed += 1
  end
end

puts "count_lines"
Tempfile.create("test_count") do |f|
  f.puts "alpha"
  f.puts "beta"
  f.puts "gamma"
  f.flush
  assert_equal 3, count_lines(f.path), "three lines"
  assert_equal 3, count_lines(Pathname.new(f.path)), "Pathname argument"
end

Tempfile.create("empty") do |f|
  f.flush
  assert_equal 0, count_lines(f.path), "empty file"
end

assert_equal 0, count_lines("/nonexistent/path/file.txt"), "missing file returns 0"

Tempfile.create("one_line") do |f|
  f.print "no trailing newline"
  f.flush
  assert_equal 1, count_lines(f.path), "single line no newline"
end

puts "\nparse_json_keys"
assert_equal ["apple", "mango", "zebra"], parse_json_keys('{"zebra":1,"apple":2,"mango":3}'), "sorted keys"
assert_equal ["id", "name"],             parse_json_keys('{"name":"Alice","id":1}'),          "two keys sorted"
assert_equal [],                         parse_json_keys('{}'),                                "empty object"
assert_equal ["x"],                      parse_json_keys('{"x":null}'),                       "single key"

puts "\ncsv_column"
csv1 = "name,score\nAlice,95\nBob,87\nCarol,91"
assert_equal ["Alice", "Bob", "Carol"], csv_column(csv1, "name"),  "name column"
assert_equal ["95", "87", "91"],        csv_column(csv1, "score"), "score column as strings"

csv2 = "city,country\nPortland,US\nTokyo,JP"
assert_equal ["Portland", "Tokyo"], csv_column(csv2, "city"), "city column"

csv3 = "only\nrow1\nrow2"
assert_equal ["row1", "row2"], csv_column(csv3, "only"), "single column"

puts "\nwrite_lines"
Tempfile.create("write_test") do |f|
  path = f.path
  write_lines(path, ["hello", "world", "ruby"])
  content = File.readlines(path, chomp: true)
  assert_equal ["hello", "world", "ruby"], content, "three lines written"

  write_lines(path, ["overwritten"])
  content2 = File.readlines(path, chomp: true)
  assert_equal ["overwritten"], content2, "file overwritten"
end

Tempfile.create("write_empty") do |f|
  write_lines(f.path, [])
  assert_equal "", File.read(f.path), "empty lines writes empty file"
end

puts "\n#{$passed} passed, #{$failed} failed"
exit 1 if $failed > 0
