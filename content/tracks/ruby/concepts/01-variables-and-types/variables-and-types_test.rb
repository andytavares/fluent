require_relative "exemplar"

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

def assert_nil(actual, name)
  assert_equal(nil, actual, name)
end

puts "describe_type"
assert_equal "integer", describe_type(42),    "positive integer"
assert_equal "integer", describe_type(-7),    "negative integer"
assert_equal "integer", describe_type(0),     "zero"
assert_equal "float",   describe_type(3.14),  "float"
assert_equal "float",   describe_type(-0.5),  "negative float"
assert_equal "string",  describe_type("hi"),  "string"
assert_equal "string",  describe_type(""),    "empty string"
assert_equal "symbol",  describe_type(:ok),   "symbol"
assert_equal "boolean", describe_type(true),  "true"
assert_equal "boolean", describe_type(false), "false"
assert_equal "nil",     describe_type(nil),   "nil"

puts "\nto_symbol"
assert_equal :hello, to_symbol("hello"), "basic string"
assert_equal :foo_bar, to_symbol("foo_bar"), "underscore string"
assert_equal :"", to_symbol(""), "empty string"

puts "\nsafe_divide"
assert_equal 5.0,  safe_divide(10, 2),  "even division"
assert_equal 0.5,  safe_divide(1, 2),   "fractional result"
assert_nil         safe_divide(10, 0),  "zero divisor"
assert_nil         safe_divide(0, 0),   "zero/zero"
assert_equal(-2.5, safe_divide(-5, 2),  "negative dividend")

puts "\ninterpolate_greeting"
assert_equal "Hello, Alice! Welcome to Ruby.", interpolate_greeting("Alice", "Ruby"),  "basic"
assert_equal "Hello, Bob! Welcome to Go.",    interpolate_greeting("Bob",   "Go"),    "different name"
assert_equal "Hello, ! Welcome to Ruby.",     interpolate_greeting("",      "Ruby"),  "empty name"

puts "\n#{$passed} passed, #{$failed} failed"
exit 1 if $failed > 0
