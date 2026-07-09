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

## Watch out

- `respond_to?` does **not** automatically know about methods you handle in `method_missing` — you must also override `respond_to_missing?`, or `respond_to?` will report `false` for a method call that would actually work.
- `method_missing(name, *args)` intercepts **every** unmatched method call, including typos. Always fall through to `super` for anything you don't explicitly handle, so real `NoMethodError`s still surface instead of being swallowed.
- `define_method` accepts a block, and that block is a real closure — it captures variables from the surrounding scope (like the `style` loop variable above), unlike `def`, which cannot close over local variables.
- `send(:method_name)` bypasses `private`/`protected` visibility — it can call private methods from outside the class. Use `public_send` if you want normal visibility rules enforced.

## The task

Implement two dynamic-dispatch helpers and a proxy class.

**`method_exists?(obj, method_name)`** — returns `true` if `obj` responds to `method_name`, which may be passed as either a `Symbol` or a `String`.

```ruby
method_exists?("hello", :upcase)       # => true
method_exists?("hello", "length")      # => true
method_exists?("hello", :nonexistent)  # => false
method_exists?(42, :+)                 # => true
method_exists?(42, :each)              # => false
```

**`dynamic_accessor(klass, *attr_names)`** — for each name in `attr_names`, adds a getter and setter method to `klass` using `define_method` (not `attr_accessor`). The getter reads from the instance variable `@name`; the setter writes to it.

```ruby
klass = Class.new
dynamic_accessor(klass, :name, :age)

obj = klass.new
obj.name = "Bob"
obj.name        # => "Bob"
obj.age         # => nil  — never set
klass.new.name  # => nil  — fresh instance, unset ivar
```

**`HashProxy`** — wraps a `Hash` so any key can be read as a method call, via `method_missing` and `respond_to_missing?`. Keys may be symbols or strings in the underlying hash.

```ruby
hp = HashProxy.new({ name: "Alice", city: "Portland" })
hp.name              # => "Alice"
hp.city              # => "Portland"
hp.respond_to?(:name)         # => true
hp.respond_to?(:missing_key)  # => false
hp.totally_missing            # raises NoMethodError (falls through to super)

hp2 = HashProxy.new({ "country" => "Canada" })
hp2.country          # => "Canada"  — string keys work too
```
