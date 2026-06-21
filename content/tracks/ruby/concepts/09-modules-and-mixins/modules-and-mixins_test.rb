require_relative "exemplar"
require "stringio"

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

puts "Printable"
a = Article.new("Hello World")
output = []
allow_print = ->(msg) { output << msg }
# Capture stdout
old_stdout = $stdout
$stdout = StringIO.new
a.print_info
printed = $stdout.string.chomp
$stdout = old_stdout
assert_equal "Article: Hello World", printed, "print_info output"

puts "\nTaggable — basic"
a2 = Article.new("Test Article")
assert_equal [], a2.tags, "starts empty"
assert_equal false, a2.tagged_with?("ruby"), "not tagged initially"

a2.add_tag("ruby")
assert_equal ["ruby"], a2.tags, "one tag added"
assert_equal true,  a2.tagged_with?("ruby"),   "tagged with ruby"
assert_equal false, a2.tagged_with?("python"),  "not tagged with python"

puts "\nTaggable — chaining"
a3 = Article.new("Chainable")
result = a3.add_tag("a").add_tag("b").add_tag("c")
assert_equal a3, result, "add_tag returns self"
assert_equal ["a", "b", "c"], a3.tags, "all tags present after chaining"

puts "\nTaggable — independent instances"
x = Article.new("X")
y = Article.new("Y")
x.add_tag("shared")
assert_equal ["shared"], x.tags, "x has tag"
assert_equal [],         y.tags, "y is independent"

puts "\nModule inclusion"
assert_equal true, Article.ancestors.include?(Printable), "includes Printable"
assert_equal true, Article.ancestors.include?(Taggable),  "includes Taggable"

puts "\n#{$passed} passed, #{$failed} failed"
exit 1 if $failed > 0
