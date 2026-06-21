# Classes & Modules

## What you'll learn

Ruby's class model — `initialize`, instance vs class variables, `attr_accessor`, single inheritance with `super`, and the difference between `include` and `extend` for modules.

## Key concepts

### Defining a class

```ruby
class BankAccount
  def initialize(owner, balance = 0)
    @owner   = owner    # instance variable
    @balance = balance
  end

  def deposit(amount)
    @balance += amount
  end

  def balance
    @balance
  end

  def to_s
    "#{@owner}: $#{@balance}"
  end
end

acct = BankAccount.new("Alice", 100)
acct.deposit(50)
puts acct  # => Alice: $150
```

### attr_accessor, attr_reader, attr_writer

These generate getter/setter methods — the Ruby equivalent of Java properties or C# auto-properties.

```ruby
class Person
  attr_accessor :name   # generates def name / def name=
  attr_reader   :id     # read-only
  attr_writer   :email  # write-only

  def initialize(id, name)
    @id   = id
    @name = name
  end
end

p = Person.new(1, "Alice")
p.name = "Alicia"
p.name  # => "Alicia"
p.id    # => 1
```

### Class methods and class variables

```ruby
class Counter
  @@count = 0           # class variable — shared across all instances

  def initialize
    @@count += 1
  end

  def self.count        # class method
    @@count
  end
end

Counter.new
Counter.new
Counter.count  # => 2
```

Prefer class-level instance variables (`@count` on `self`) over `@@` when subclassing — `@@` is shared across the entire inheritance chain.

### Inheritance and super

```ruby
class Animal
  attr_reader :name

  def initialize(name)
    @name = name
  end

  def speak
    raise NotImplementedError, "#{self.class} must implement speak"
  end
end

class Dog < Animal
  def speak
    "#{name} says woof"
  end
end

class Cat < Animal
  def initialize(name, indoor: true)
    super(name)          # calls Animal#initialize
    @indoor = indoor
  end

  def speak
    "#{name} says meow"
  end
end
```

`super` with no arguments passes all the current method's arguments up the chain. `super()` passes none. `super(x)` passes `x` explicitly.

### include vs extend

`include` mixes a module's methods in as **instance methods**. `extend` mixes them in as **class methods** (methods on the class object itself).

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

Staff.new("Bob").greet  # => "Hi, I'm Bob"

class Team
  extend Greetable
  def self.name = "Engineering"
end

Team.greet  # => "Hi, I'm Engineering"
```

## vs other languages

| | Ruby | Java | Python | C++ |
|---|---|---|---|---|
| Constructor name | `initialize` | class name | `__init__` | class name |
| Instance var syntax | `@name` | `this.name` | `self.name` | `this->name` |
| Getters/setters | `attr_accessor` macro | manual or Lombok | `@property` | manual |
| Multiple inheritance | No — but `include` multiple modules | No | Yes | Yes |
| Interface equivalent | Module (duck-typed) | `interface` | ABC or Protocol | pure virtual class |

Ruby has no access modifiers like `private` / `protected` in the Java sense as part of the class signature — they're method calls that apply to the methods defined after them in the source. `private` is the most common; Ruby methods are public by default.

## The task

```ruby
class Rectangle
  # attr_reader for width and height
  # initialize(width, height)
  # area → Integer/Float
  # perimeter → Integer/Float
  # square? → Boolean (width == height)
  # to_s → "Rectangle(#{width}x#{height})"
end

class Square < Rectangle
  # initialize(side) — calls super appropriately
  # to_s → "Square(#{width})"
end
```
