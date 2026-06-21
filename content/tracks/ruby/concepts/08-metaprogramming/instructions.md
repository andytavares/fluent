# Metaprogramming

## What you'll learn

Ruby's runtime introspection and code-generation APIs — `method_missing`, `define_method`, `send`, `respond_to_missing?`, open classes, and `class_eval`.

## Key concepts

### send — dynamic dispatch

`send` calls any method by name (even private ones). `public_send` restricts to public methods.

```ruby
"hello".send(:upcase)           # => "HELLO"
[1, 2, 3].send(:push, 4)        # => [1, 2, 3, 4]
42.send(:+, 8)                  # => 50

method_name = :length
"ruby".send(method_name)        # => 4
```

### respond_to?

Check whether an object responds to a method before calling it:

```ruby
"hello".respond_to?(:upcase)    # => true
"hello".respond_to?(:nonexist)  # => false
42.respond_to?(:each)           # => false
```

### method_missing

Called when a method lookup fails. Override it to create proxy objects, dynamic accessors, or DSL syntax.

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

  def respond_to_missing?(name, include_private = false)
    key = name.to_s
    key.end_with?("=") || @data.key?(key) || super
  end
end

r = FlexibleRecord.new
r.name = "Alice"
r.age  = 30
r.name  # => "Alice"
r.age   # => 30
```

Always override `respond_to_missing?` alongside `method_missing` — otherwise `respond_to?` lies, and `method(:name)` breaks.

### define_method

Generate methods dynamically at class-definition time. This is how Rails generates `find_by_*` methods, serialization helpers, and more.

```ruby
class Formatter
  %w[bold italic underline].each do |style|
    define_method(style) do |text|
      "<#{style}>#{text}</#{style}>"
    end
  end
end

f = Formatter.new
f.bold("hello")       # => "<bold>hello</bold>"
f.italic("world")     # => "<italic>world</italic>"
```

### Open classes (monkey patching)

Any class, including built-ins, can be reopened and extended at any time:

```ruby
class Integer
  def factorial
    return 1 if self <= 1
    self * (self - 1).factorial
  end
end

5.factorial  # => 120
```

Use this sparingly. In a gem or app, prefer refinements (`using`) to scope monkey patches to a file.

### class_eval / module_eval

Evaluate a block or string in the context of a class — useful for dynamically generating method definitions when you need access to variables that aren't in the class's normal scope.

```ruby
class MyClass; end

MyClass.class_eval do
  def hello
    "world"
  end
end

MyClass.new.hello  # => "world"
```

`instance_eval` does the same on a single object (rather than a class).

## vs other languages

| | Ruby | Python | JavaScript | Java |
|---|---|---|---|---|
| Dynamic dispatch | `send(:method, args)` | `getattr(obj, name)(args)` | `obj[name](args)` | `Method.invoke(obj, args)` |
| Missing method hook | `method_missing` | `__getattr__` | `Proxy` (ES6) | No equivalent |
| Generate methods | `define_method` | `setattr` + lambda | `obj[name] = fn` | Reflection / code gen |
| Open classes | Yes — any class, any time | No (monkey patching has limits) | Yes (prototype) | No |
| Metaprogramming cost | Runtime only | Runtime only | Runtime only | Compile-time (annotations) |

The big risk with `method_missing` is silent failures. If you forget to call `super` at the end, any truly undefined method will return `nil` instead of raising `NoMethodError`. Always call `super` in `method_missing` for unhandled cases.

## The task

```ruby
def method_exists?(obj, method_name)
  # Return true if obj responds to method_name (as a symbol or string)
end

def dynamic_accessor(klass, *attr_names)
  # For each name in attr_names, add a getter and setter to klass
  # using define_method (do not use attr_accessor).
  # Getters read from @name, setters write to @name.
end

class HashProxy
  # Wrap a Hash so that any key can be accessed as a method call.
  # hp = HashProxy.new({ name: "Alice", age: 30 })
  # hp.name  => "Alice"
  # hp.age   => 30
  # hp.missing raises NoMethodError (via super)
  # implement with method_missing and respond_to_missing?
end
```
