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

puts "make_multiplier"
triple = make_multiplier(3)
double = make_multiplier(2)
assert_equal 12, triple.call(4), "3 * 4"
assert_equal 0,  triple.call(0), "3 * 0"
assert_equal(-6, triple.call(-2), "3 * -2")
assert_equal 10, double.call(5), "2 * 5"
assert_equal true, triple.lambda?, "returns a lambda"

puts "\napply_twice"
assert_equal 18,   apply_twice(2, ->(n) { n * 3 }),    "2 -> 6 -> 18"
assert_equal 6,    apply_twice(4, ->(n) { n + 1 }),    "4 -> 5 -> 6"
assert_equal "aaaa", apply_twice("a", ->(s) { s * 2 }),  "string doubling applied twice"

puts "\ncompose"
add1   = ->(n) { n + 1 }
double = ->(n) { n * 2 }
f = compose(double, add1)
assert_equal 12, f.call(5), "double(add1(5)) = double(6) = 12"
assert_equal 2,  f.call(0), "double(add1(0)) = double(1) = 2"

g = compose(add1, double)
assert_equal 11, g.call(5), "add1(double(5)) = add1(10) = 11"

puts "\nmemoize"
call_count = 0
expensive = ->(n) { call_count += 1; n ** 2 }
cached = memoize(expensive)

assert_equal 16, cached.call(4), "first call result"
assert_equal 16, cached.call(4), "cached result"
assert_equal 1,  call_count,     "underlying called only once for same arg"

assert_equal 9, cached.call(3), "different arg computed"
assert_equal 2, call_count,     "underlying called for new arg"

assert_equal 9, cached.call(3), "second different arg cached"
assert_equal 2, call_count,     "no extra call for cached arg"

puts "\n#{$passed} passed, #{$failed} failed"
exit 1 if $failed > 0
