class ValidationError < StandardError
  # TODO: attr_reader :field
  # TODO: initialize(field, message) — super with "#{field}: #{message}"
end

def parse_positive_integer(str)
  # TODO: parse str as integer, raise ArgumentError if invalid, RangeError if <= 0
end

def with_retry(max_attempts, &block)
  # TODO: call block; retry on StandardError up to max_attempts total; re-raise after
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
