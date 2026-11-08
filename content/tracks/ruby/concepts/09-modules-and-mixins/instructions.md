## What you build

You write two mixin modules, `Printable` and `Taggable`, and include both in an `Article` class. This lesson builds on **Metaprogramming**.

## Key concepts

### A module is a namespace

A module groups related constants, methods and classes under one name, like a package in Java or Go. Use `::` to reach a constant inside it.

```ruby
module Geometry
  PI = 3.14159265358979

  def self.circle_area(radius)
    PI * radius ** 2
  end

  class Point
    attr_reader :x, :y
    def initialize(x, y) = (@x, @y = x, y)
  end
end

Geometry::PI             # => 3.14159...
Geometry.circle_area(5)  # => 78.53...
Geometry::Point.new(1, 2)
```

### `include` adds instance methods

`include` puts the module in the ancestor chain of the class, directly above the class. The module methods become instance methods.

```ruby
module Serializable
  def to_json
    pairs = instance_variables.map do |var|
      key = var.to_s.delete_prefix("@")
      val = instance_variable_get(var)
      "\"#{key}\":#{val.inspect}"
    end
    "{#{pairs.join(",")}}"
  end
end

class User
  include Serializable
  attr_accessor :name, :email

  def initialize(name, email)
    @name = name
    @email = email
  end
end

User.new("Alice", "a@x.com").to_json
```

### `prepend` wraps the methods of a class

`prepend` puts the module before the class in the ancestor chain. The module method runs first and calls `super` to reach the method of the class. Use it for instrumentation, logging and decoration.

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

`prepend` wraps any method without a subclass and without a change to the original class. Java and Go have no match for it. ActiveSupport and Rails use it for around-hooks.

### `extend` adds class methods

`extend` adds the module methods to the singleton class of the receiver. On a class, they become class methods.

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

### The `included` hook does both

A common pattern uses the `included` hook to extend the class when it includes the module.

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

MyClass.class_info
# => "class method"
MyClass.new.instance_info
# => "instance method"
```

### `ancestors` shows the method lookup order

Ruby searches the classes and modules in `ancestors` from left to right. A module included later comes earlier in the chain.

```ruby
module A; end
module B; end
class C
  include A
  include B
end

C.ancestors
# => [C, B, A, Object, Kernel,
#     BasicObject]
Pipeline.ancestors.first(2)
# => [Timed, Pipeline]
```

## Watch out

- Ruby searches the last included module first. If two modules define one method, the last one included wins.
- Ruby does not report a conflict. Only the method earliest in `ancestors` runs.
- A mixin that reads `@tags` before it is set gets `nil`, not `[]`. Use `@tags ||= []` in the accessor.
- `include` works in a class body or as `klass.include(Mod)`. To change one object, use `extend` on it.

## The task

Write two mixin modules and an `Article` class in `stub.rb`. `Article` includes both modules.

1. `Printable#print_info` prints `"#{self.class.name}: #{to_s}"` to standard output with `puts`.
2. `print_info` relies on the including class to define `to_s`.
3. `Taggable#tags` returns the `@tags` array. On first access, it sets `@tags` to `[]`.
4. `Taggable#add_tag(tag)` appends `tag` to `tags` and returns `self`, so calls can chain.
5. `Taggable#tagged_with?(tag)` returns `true` if `tags` includes `tag`, else `false`.
6. `Article` includes `Printable` and `Taggable` and has `attr_reader :title`.
7. `Article#initialize(title)` stores `title`. `Article#to_s` returns `title`.

Each `Article` has its own tag list. A new article has no tags.

```ruby
a = Article.new("Hello World")
# Prints "Article: Hello World"
a.print_info

b = Article.new("Test Article")
b.tags                    # => []
b.tagged_with?("ruby")    # => false
b.add_tag("ruby")
b.tags                    # => ["ruby"]
b.tagged_with?("ruby")    # => true
b.tagged_with?("python")  # => false

c = Article.new("Chainable")
c.add_tag("a").add_tag("b").add_tag("c")
# => c
c.tags  # => ["a", "b", "c"]

x = Article.new("X")
y = Article.new("Y")
x.add_tag("shared")
x.tags  # => ["shared"]
y.tags  # => []

Article.ancestors.include?(Printable)
# => true
Article.ancestors.include?(Taggable)
# => true
```
