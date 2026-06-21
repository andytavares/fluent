class Rectangle
  # TODO: attr_reader for width and height
  # TODO: initialize(width, height)
  # TODO: area
  # TODO: perimeter
  # TODO: square?
  # TODO: to_s -> "Rectangle(#{width}x#{height})"
end

class Square < Rectangle
  # TODO: initialize(side) calling super
  # TODO: to_s -> "Square(#{width})"
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
