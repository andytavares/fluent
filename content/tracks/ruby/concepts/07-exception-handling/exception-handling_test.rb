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

def assert_raises_error(klass, name = klass.name)
  yield
  puts "  FAIL: #{name} — expected #{klass} to be raised"
  $failed += 1
rescue klass
  puts "  PASS: #{name}"
  $passed += 1
rescue => e
  puts "  FAIL: #{name} — expected #{klass}, got #{e.class}: #{e.message}"
  $failed += 1
end

puts "ValidationError"
err = ValidationError.new("email", "is invalid")
assert_equal "email: is invalid", err.message, "message format"
assert_equal "email",             err.field,   "field accessor"
assert_equal true, err.is_a?(StandardError), "inherits StandardError"

err2 = ValidationError.new("age", "must be >= 18")
assert_equal "age: must be >= 18", err2.message, "different field and message"
assert_equal "age",                err2.field,   "age field"

puts "\nparse_positive_integer"
assert_equal 42,  parse_positive_integer("42"),   "valid positive"
assert_equal 1,   parse_positive_integer("1"),    "boundary: 1"
assert_equal 999, parse_positive_integer("999"),  "large number"
assert_raises_error(ArgumentError) { parse_positive_integer("abc") }
assert_raises_error(ArgumentError) { parse_positive_integer("") }
assert_raises_error(ArgumentError) { parse_positive_integer("3.14") }
assert_raises_error(RangeError)    { parse_positive_integer("0") }
assert_raises_error(RangeError)    { parse_positive_integer("-5") }

puts "\nwith_retry"
calls = 0
result = with_retry(3) do
  calls += 1
  raise "fail" if calls < 3
  "success"
end
assert_equal "success", result, "succeeds on 3rd attempt"
assert_equal 3,         calls,  "called exactly 3 times"

calls2 = 0
result2 = with_retry(1) { calls2 += 1; "immediate" }
assert_equal "immediate", result2, "succeeds on first attempt"
assert_equal 1,           calls2,  "called once"

assert_raises_error(RuntimeError) do
  with_retry(2) { raise "always fails" }
end

exhausted_calls = 0
begin
  with_retry(3) { exhausted_calls += 1; raise "persistent" }
rescue RuntimeError
  assert_equal 3, exhausted_calls, "retried max_attempts times before giving up"
end

puts "\n#{$passed} passed, #{$failed} failed"
exit 1 if $failed > 0
