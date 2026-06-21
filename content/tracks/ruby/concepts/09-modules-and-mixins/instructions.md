# Modules & Mixins

## What you'll learn

Modules as namespaces vs mixins, the difference between `include`, `prepend`, and `extend`, and how to read Ruby's method resolution order (MRO).

## Key concepts

### Modules as namespaces

A module groups related constants and methods under a name — the equivalent of a package in Java or Go.

```ruby
module Geometry
  PI = 3.14159265358979

  def self.circle_area(radius)
    PI * radius ** 2
  end

  class Point
    attr_reader :x, :y
    def initialize(x, y) = @x, @y = x, y
  end
end

Geometry::PI                     # => 3.14159...
Geometry.circle_area(5)          # => 78.53...
Geometry::Point.new(1, 2)
```

### include — instance-method mixin

`include` inserts the module into the class's ancestor chain, just above the class itself. Module methods become instance methods.

```ruby
module Serializable
  def to_json
    pairs = instance_variables.map do |var|
      key   = var.to_s.delete_prefix("@")
      value = instance_variable_get(var).inspect
      "\"#{key}\":#{value}"
    end
    "{#{pairs.join(",")}}"
  end
end

class User
  include Serializable
  attr_accessor :name, :email

  def initialize(name, email)
    @name  = name
    @email = email
  end
end

User.new("Alice", "alice@example.com").to_json
```

### prepend — method wrapping

`prepend` inserts the module **before** the class in the ancestor chain. This means module methods run first — they can call `super` to delegate to the class's own implementation. Classic use: instrumentation, logging, decoration.

```ruby
module Timed
  def process(data)
    start = Time.now
    result = super
    puts "Elapsed: #{Time.now - start}s"
    result
  end
end

class Pipeline
  prepend Timed

  def process(data)
    data.upcase
  end
end

Pipeline.new.process("hello")
# Elapsed: 0.000012s
# => "HELLO"
```

### extend — class-level mixin

`extend` adds module methods as class methods (methods on the singleton class of the object receiving `extend`).

```ruby
module ClassMethods
  def description
    "I am #{name}"
  end
end

class Widget
  extend ClassMethods
end

Widget.description  # => "I am Widget"
```

A common pattern combines `include` and `extend` in a single module using the `included` hook:

```ruby
module Concerns
  def self.included(base)
    base.extend(ClassMethods)
  end

  module ClassMethods
    def class_info = "class method"
  end

  def instance_info = "instance method"
end

class MyClass
  include Concerns
end

MyClass.class_info        # => "class method"
MyClass.new.instance_info # => "instance method"
```

### Method Resolution Order (MRO)

Ruby uses C3 linearization (same as Python). Read the ancestor chain with `ancestors`:

```ruby
module A; end
module B; end
class C
  include A
  include B
end

C.ancestors  # => [C, B, A, Object, Kernel, BasicObject]
```

Note that later `include` calls appear earlier in the chain — `B` was included after `A`, so `B` is searched first. `prepend` inserts before the class: `[Timed, Pipeline, Object, ...]`.

## vs other languages

| | Ruby | Java | Python | Go |
|---|---|---|---|---|
| Multi-inheritance | Via modules (mixins) | Interfaces only | Yes (MRO) | Interfaces (implicit) |
| Module as namespace | Yes — `Module::Constant` | Package | Module | Package |
| Method wrapping | `prepend` | No (need proxy/decorator) | `__mro__` / decorator | No |
| include order matters | Yes — last in, first searched | N/A | Yes (C3) | N/A |

`prepend` is Ruby-specific and genuinely powerful — it lets you wrap any method without subclassing or changing the original class. ActiveSupport and Rails use it extensively for around-hooks.

## The task

```ruby
module Printable
  # Add an instance method `print_info` that prints "#{self.class.name}: #{to_s}"
end

module Taggable
  # Add instance methods:
  #   tags         -> returns the @tags array (initialize it to [] if nil)
  #   add_tag(tag) -> appends tag to @tags, returns self (for chaining)
  #   tagged_with?(tag) -> returns true if @tags includes tag
end

class Article
  include Printable
  include Taggable

  attr_reader :title

  def initialize(title)
    @title = title
  end

  def to_s
    title
  end
end
```
