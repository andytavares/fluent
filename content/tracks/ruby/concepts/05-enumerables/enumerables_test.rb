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

puts "top_n_words"
assert_equal ["the", "cat"], top_n_words("the cat sat on the mat the cat", 2), "top 2"
assert_equal ["the"],        top_n_words("the cat sat on the mat the cat", 1), "top 1"
assert_equal ["a", "b"],     top_n_words("a b a b c", 2),                      "tie broken alphabetically"
assert_equal [],             top_n_words("", 3),                               "empty string"
assert_equal ["hello"],      top_n_words("hello", 5),                          "fewer words than n"

puts "\nrunning_total"
assert_equal [1, 3, 6, 10, 15], running_total([1, 2, 3, 4, 5]), "basic"
assert_equal [5],               running_total([5]),              "single"
assert_equal [],                running_total([]),               "empty"
assert_equal [1, 0, 3],         running_total([1, -1, 3]),       "with negatives"

puts "\nfirst_n_multiples"
assert_equal [3, 6, 9, 12, 15],  first_n_multiples(3, 5),  "multiples of 3"
assert_equal [7, 14, 21],        first_n_multiples(7, 3),  "multiples of 7"
assert_equal [10],               first_n_multiples(10, 1), "single multiple"
assert_equal [],                 first_n_multiples(4, 0),  "zero count"

puts "\n#{$passed} passed, #{$failed} failed"
exit 1 if $failed > 0
