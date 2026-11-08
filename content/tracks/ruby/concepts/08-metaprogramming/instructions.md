## What you build

You write a method check, a helper that defines accessors at runtime, and a proxy class that turns hash keys into methods. This lesson builds on **Exception Handling**.

## Key concepts

### `send` calls a method by name

`send` calls any method, private ones too. `public_send` calls only public methods. Python uses `getattr` for the same job.

```ruby
"hello".send(:upcase)     # => "HELLO"
[1, 2, 3].send(:push, 4)  # => [1, 2, 3, 4]
42.send(:+, 8)            # => 50

method_name = :length
"ruby".send(method_name)  # => 4
```

### `respond_to?` checks for a method

Check whether an object responds to a method before you call it.

```ruby
"hello".respond_to?(:upcase)    # => true
"hello".respond_to?(:nonexist)  # => false
42.respond_to?(:each)           # => false
```

### `method_missing` catches failed lookups

Ruby calls `method_missing` when a method lookup fails. Override it for proxy objects, dynamic accessors or DSL syntax. Call `super` for every name you do not handle.

```ruby
class FlexibleRecord
  def initialize
    @data = {}
  end

  def method_missing(name, *args)
    key = name.to_s
    if key.end_with?("=")
      @data[key.chomp("=")] = args.first
    elsif @data.key?(key)
      @data[key]
    else
      super
    end
  end

  def respond_to_missing?(name, all)
    key = name.to_s
    key.end_with?("=") ||
      @data.key?(key) || super
  end
end

r = FlexibleRecord.new
r.name = "Alice"
r.age = 30
r.name  # => "Alice"
r.age   # => 30
```

### Override `respond_to_missing?` with `method_missing`

Without it, `respond_to?` returns `false` for a method that works, and `method(:name)` fails.

### `define_method` generates methods

`define_method` makes methods at class-definition time. Rails generates `find_by_*` methods and serialization helpers this way.

```ruby
class Formatter
  %w[bold italic underline].each do |style|
    define_method(style) do |text|
      "<#{style}>#{text}</#{style}>"
    end
  end
end

f = Formatter.new
f.bold("hello")
# => "<bold>hello</bold>"
f.italic("world")
# => "<italic>world</italic>"
```

### You can reopen any class

You can reopen and extend any class at any time, built-in classes too. Ruby developers call this monkey patching. Use it sparingly. In a gem or app, use refinements (`using`) to limit a patch to one file.

```ruby
class Integer
  def factorial
    return 1 if self <= 1
    self * (self - 1).factorial
  end
end

5.factorial  # => 120
```

### `class_eval` runs code inside a class

`class_eval` (also `module_eval`) runs a block or string in the context of a class. Use it to define methods that need variables from outside the class scope. `instance_eval` does the same for a single object.

```ruby
class MyClass; end

MyClass.class_eval do
  def hello
    "world"
  end
end

MyClass.new.hello  # => "world"
```

## Watch out

- `respond_to?` does not see names that `method_missing` handles. Override `respond_to_missing?` too.
- `method_missing` catches every unmatched call, typos too. Without `super`, a real `NoMethodError` becomes a silent `nil`.
- The block of `define_method` is a closure, so it sees `style`. A `def` cannot see outer local variables.
- `send` ignores `private` and `protected`. Use `public_send` to keep normal visibility rules.

## The task

Write two helpers and a proxy class in `stub.rb`. They use dynamic dispatch and runtime method definition.

1. `method_exists?(obj, method_name)` returns `true` if `obj` responds to `method_name`, else `false`.
2. `method_name` can be a `Symbol` or a `String`.
3. `dynamic_accessor(klass, *attr_names)` adds a getter and a setter to `klass` for each name.
4. `dynamic_accessor` must use `define_method`, not `attr_accessor`.
5. The getter for `name` reads `@name`. The setter `name=` writes `@name`.
6. A getter for an unset variable returns `nil`.
7. `HashProxy.new(hash)` wraps a `Hash`. Each key of the hash reads as a method call.
8. `HashProxy` uses `method_missing` and `respond_to_missing?`. Keys can be symbols or strings.
9. `respond_to?` returns `true` for a key. It returns `false` for a name that is neither a key nor a real method.
10. A name that is not a key raises `NoMethodError`, from `super`.

```ruby
method_exists?("hello", :upcase)  # => true
method_exists?("hello", "length") # => true
method_exists?("hello", :nonexistent)
# => false
method_exists?(42, :+)            # => true
method_exists?(42, :each)        # => false

klass = Class.new
dynamic_accessor(klass, :name, :age)
obj = klass.new
obj.name = "Alice"
obj.name        # => "Alice"
obj.age = 30
obj.age         # => 30
obj.name = "Alicia"
obj.name        # => "Alicia"
klass.new.name  # => nil

hp = HashProxy.new(
  { name: "Bob", city: "Austin" }
)
hp.name                       # => "Bob"
hp.city                       # => "Austin"
hp.respond_to?(:name)         # => true
hp.respond_to?(:missing_key)  # => false
hp.totally_missing  # NoMethodError

hp2 = HashProxy.new(
  { "country" => "Canada" }
)
hp2.country  # => "Canada"
```
