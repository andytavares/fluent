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

puts "sum_of_squares"
assert_equal 30,  sum_of_squares([1, 2, 3, 4]),  "1^2+2^2+3^2+4^2"
assert_equal 0,   sum_of_squares([]),             "empty array"
assert_equal 25,  sum_of_squares([5]),            "single element"
assert_equal 14,  sum_of_squares([-1, -2, -3]),   "negative numbers"

puts "\nwords_longer_than"
assert_equal ["hello", "greetings"], words_longer_than(["hi", "hello", "hey", "greetings"], 3), "min 3"
assert_equal [], words_longer_than(["a", "bb", "ccc"], 5), "none match"
assert_equal ["apple"], words_longer_than(["apple", "fig"], 3), "boundary"
assert_equal [], words_longer_than([], 2), "empty input"

puts "\ninvert_hash"
assert_equal({ 1 => :a, 2 => :b }, invert_hash({ a: 1, b: 2 }), "symbol keys")
assert_equal({ "x" => "foo" }, invert_hash({ "foo" => "x" }), "string keys")
assert_equal({}, invert_hash({}), "empty hash")

puts "\ngroup_by_first_letter"
result = group_by_first_letter(["apple", "avocado", "banana", "apricot"])
assert_equal ["apple", "avocado", "apricot"], result["a"], "a-words"
assert_equal ["banana"], result["b"], "b-words"
assert_equal nil, result["c"], "missing letter is nil"
assert_equal({}, group_by_first_letter([]), "empty input")

puts "\n#{$passed} passed, #{$failed} failed"
exit 1 if $failed > 0
