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

puts "repeat_call"
collected = []
result = repeat_call(3) { |i| collected << i }
assert_equal [0, 1, 2], collected, "collects 0-based indices"
assert_nil result, "returns nil"

collected = []
repeat_call(0) { |i| collected << i }
assert_equal [], collected, "zero iterations"

puts "\ntransform_all"
assert_equal [2, 4, 6], transform_all([1, 2, 3]) { |n| n * 2 }, "doubles"
assert_equal ["A", "B"], transform_all(["a", "b"]) { |s| s.upcase }, "upcase"
assert_equal [1, 2, 3], transform_all([1, 2, 3]), "no block returns original"
assert_equal [], transform_all([]) { |n| n }, "empty array"

puts "\nbuild_logger"
info  = build_logger("INFO")
error = build_logger("ERROR")
assert_equal "INFO: server started",  info.call("server started"),  "info prefix"
assert_equal "ERROR: disk full",      error.call("disk full"),      "error prefix"
assert_equal "INFO: ",                info.call(""),                "empty message"

puts "\nkeyword_summary"
assert_equal "Alice, age 30, from Portland", keyword_summary(name: "Alice", age: 30, city: "Portland"), "all args"
assert_equal "Bob, age 25, from Unknown",    keyword_summary(name: "Bob", age: 25),                      "default city"

puts "\n#{$passed} passed, #{$failed} failed"
exit 1 if $failed > 0
