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
  puts "  FAIL: #{name} — expected #{klass}, got #{e.class}"
  $failed += 1
end

puts "method_exists?"
assert_equal true,  method_exists?("hello", :upcase),       "string upcase exists"
assert_equal true,  method_exists?("hello", "length"),      "string method as string"
assert_equal false, method_exists?("hello", :nonexistent),  "nonexistent method"
assert_equal true,  method_exists?(42, :+),                 "integer +"
assert_equal false, method_exists?(42, :each),              "integer has no each"

puts "\ndynamic_accessor"
klass = Class.new
dynamic_accessor(klass, :name, :age, :email)
obj = klass.new

obj.name = "Alice"
assert_equal "Alice", obj.name, "name getter"

obj.age = 30
assert_equal 30, obj.age, "age getter"

obj.email = "alice@example.com"
assert_equal "alice@example.com", obj.email, "email getter"

obj.name = "Alicia"
assert_equal "Alicia", obj.name, "setter overwrites"

assert_equal nil, klass.new.name, "new instance starts nil"

puts "\nHashProxy"
hp = HashProxy.new({ name: "Bob", city: "Austin" })
assert_equal "Bob",    hp.name, "symbol key access"
assert_equal "Austin", hp.city, "second key"
assert_equal true,     hp.respond_to?(:name), "respond_to? known key"
assert_equal false,    hp.respond_to?(:missing_key), "respond_to? unknown key"
assert_raises_error(NoMethodError) { hp.totally_missing }

hp2 = HashProxy.new({ "country" => "Canada" })
assert_equal "Canada", hp2.country, "string key access"

puts "\n#{$passed} passed, #{$failed} failed"
exit 1 if $failed > 0
