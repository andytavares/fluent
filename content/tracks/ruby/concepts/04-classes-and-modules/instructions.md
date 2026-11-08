## What you build

You model rectangles and squares with a small class hierarchy that uses `attr_reader`, `super` and method overrides. This lesson builds on **Collections**.

## Key concepts

### `initialize` sets up instance variables

`new` calls `initialize`. An instance variable starts with `@` and belongs to one object.

```ruby
class BankAccount
  def initialize(owner, balance = 0)
    @owner = owner
    @balance = balance
  end

  def deposit(amount)
    @balance += amount
  end

  def to_s
    "#{@owner}: $#{@balance}"
  end
end

acct = BankAccount.new("Alice", 100)
acct.deposit(50)
puts acct  # Alice: $150
```

### `attr_*` methods generate getters and setters

`attr_accessor` makes a getter and a setter, like a C# auto-property. `attr_reader` makes only the getter, and `attr_writer` only the setter.

```ruby
class Person
  # Defines name and name=
  attr_accessor :name
  attr_reader :id
  attr_writer :email

  def initialize(id, name)
    @id = id
    @name = name
  end
end

p = Person.new(1, "Alice")
p.name = "Alicia"
p.name  # => "Alicia"
p.id    # => 1
```

### `self.` defines a class method

A class variable starts with `@@`. All instances, and all subclasses, share it.

```ruby
class Counter
  @@count = 0

  def initialize
    @@count += 1
  end

  def self.count
    @@count
  end
end

Counter.new
Counter.new
Counter.count  # => 2
```

### A subclass inherits with `<`

Ruby has single inheritance. A class can still include many modules.

```ruby
class Animal
  attr_reader :name

  def initialize(name)
    @name = name
  end

  def speak
    raise NotImplementedError,
          "#{self.class} needs speak"
  end
end

class Dog < Animal
  def speak
    "#{name} says woof"
  end
end
```

### `super` calls the parent method

Bare `super` passes all the arguments of the current method. `super()` passes none, and `super(x)` passes only `x`.

```ruby
class Cat < Animal
  def initialize(name, indoor: true)
    # Calls Animal#initialize
    super(name)
    @indoor = indoor
  end

  def speak
    "#{name} says meow"
  end
end
```

### `include` adds instance methods, `extend` adds class methods

A module mixed in with `include` gives its methods to each instance. A module mixed in with `extend` gives them to the class object itself.

```ruby
module Greetable
  def greet
    "Hi, I'm #{name}"
  end
end

class Staff
  include Greetable
  attr_reader :name
  def initialize(name) = @name = name
end
Staff.new("Bob").greet
# => "Hi, I'm Bob"

class Team
  extend Greetable
  def self.name = "Engineering"
end
Team.greet  # => "Hi, I'm Engineering"
```

### `private` is a method call

Methods are public by default. `private` is not part of a signature: it is a method call that applies to the methods defined after it.

```ruby
class Vault
  def open = check_code

  private

  def check_code = true
end
```

## Watch out

- `attr_accessor` makes a plain getter and setter with no validation. Write the setter by hand when you need checks.
- Bare `super` passes the exact arguments the current method got. `super()` passes none.
- In `Square#initialize(side)`, bare `super` passes one argument. `Rectangle#initialize` needs `super(side, side)`.
- A subclass changes the same `@@count` as its parent. Use a class-level `@count` for one count per class.
- `==` compares numbers by value. For your own objects, `==` checks identity unless you define `#==`.

## The task

Write two classes in `stub.rb`. `Square` is a `Rectangle` with equal sides.

`Rectangle` has `attr_reader :width, :height` and these methods:

1. `initialize(width, height)` stores both dimensions.
2. `area` returns `width * height`.
3. `perimeter` returns `2 * (width + height)`.
4. `square?` returns `true` when `width == height`, else `false`.
5. `to_s` returns `"Rectangle(#{width}x#{height})"`.

`Square < Rectangle` has these methods:

6. `initialize(side)` calls `super`, so `width` and `height` both equal `side`.
7. `to_s` returns `"Square(#{width})"`.
8. `area`, `perimeter` and `square?` come from `Rectangle` unchanged.

```ruby
r = Rectangle.new(4, 6)
r.width      # => 4
r.height     # => 6
r.area       # => 24
r.perimeter  # => 20
r.square?    # => false
r.to_s       # => "Rectangle(4x6)"

Rectangle.new(5, 5).square?  # => true
Rectangle.new(3, 1).area     # => 3
Rectangle.new(3, 1).perimeter # => 8

s = Square.new(7)
s.width      # => 7
s.height     # => 7
s.area       # => 49
s.perimeter  # => 28
s.square?    # => true
s.to_s       # => "Square(7)"

Square.new(1).square?        # => true
Square.new(3).is_a?(Rectangle) # => true
```
