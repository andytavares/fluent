class Rectangle
  attr_reader :width, :height

  def initialize(width, height)
    @width  = width
    @height = height
  end

  def area
    width * height
  end

  def perimeter
    2 * (width + height)
  end

  def square?
    width == height
  end

  def to_s
    "Rectangle(#{width}x#{height})"
  end
end

class Square < Rectangle
  def initialize(side)
    super(side, side)
  end

  def to_s
    "Square(#{width})"
  end
end

if __FILE__ == $PROGRAM_NAME
  r = Rectangle.new(4, 6)
  puts r
  puts r.area
  puts r.perimeter
  puts r.square?

  s = Square.new(5)
  puts s
  puts s.area
  puts s.square?
end
