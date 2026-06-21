class ValidationError < StandardError
  attr_reader :field

  def initialize(field, message)
    @field = field
    super("#{field}: #{message}")
  end
end

def parse_positive_integer(str)
  value = Integer(str)
  raise RangeError, "must be positive, got #{value}" if value <= 0
  value
rescue ArgumentError
  raise ArgumentError, "invalid integer string: #{str.inspect}"
end

def with_retry(max_attempts, &block)
  attempts = 0
  begin
    attempts += 1
    block.call
  rescue StandardError
    retry if attempts < max_attempts
    raise
  end
end

if __FILE__ == $PROGRAM_NAME
  begin
    raise ValidationError.new("email", "is invalid")
  rescue ValidationError => e
    puts e.message
    puts e.field
  end

  p parse_positive_integer("42")

  begin
    parse_positive_integer("abc")
  rescue ArgumentError => e
    puts e.message
  end

  calls = 0
  result = with_retry(3) do
    calls += 1
    raise "oops" if calls < 3
    "done"
  end
  p result
  p calls
end
