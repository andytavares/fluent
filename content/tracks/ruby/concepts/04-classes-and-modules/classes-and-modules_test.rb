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

puts "Rectangle"
r = Rectangle.new(4, 6)
assert_equal 4,                   r.width,      "width"
assert_equal 6,                   r.height,     "height"
assert_equal 24,                  r.area,       "area"
assert_equal 20,                  r.perimeter,  "perimeter"
assert_equal false,               r.square?,    "not square"
assert_equal "Rectangle(4x6)",    r.to_s,       "to_s"

r2 = Rectangle.new(5, 5)
assert_equal true, r2.square?, "square rectangle"

r3 = Rectangle.new(3, 1)
assert_equal 3, r3.area,  "area 3x1"
assert_equal 8, r3.perimeter, "perimeter 3x1"

puts "\nSquare"
s = Square.new(7)
assert_equal 7,          s.width,      "width from side"
assert_equal 7,          s.height,     "height from side"
assert_equal 49,         s.area,       "area"
assert_equal 28,         s.perimeter,  "perimeter"
assert_equal true,       s.square?,    "always square"
assert_equal "Square(7)", s.to_s,      "to_s"

assert_equal true, Square.new(1).square?, "unit square"

puts "\nSquare is a Rectangle"
assert_equal true, Square.new(3).is_a?(Rectangle), "inheritance"

puts "\n#{$passed} passed, #{$failed} failed"
exit 1 if $failed > 0
