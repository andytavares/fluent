def describe_type(value)
  case value
  when Integer then "integer"
  when Float   then "float"
  when String  then "string"
  when Symbol  then "symbol"
  when TrueClass, FalseClass then "boolean"
  when NilClass then "nil"
  end
end

def to_symbol(str)
  str.to_sym
end

def safe_divide(a, b)
  return nil if b.zero?
  a.fdiv(b)
end

def interpolate_greeting(name, lang)
  "Hello, #{name}! Welcome to #{lang}."
end

if __FILE__ == $PROGRAM_NAME
  p describe_type(42)
  p describe_type(:ok)
  p describe_type(nil)
  p to_symbol("hello")
  p safe_divide(10, 3)
  p safe_divide(10, 0)
  p interpolate_greeting("Alice", "Ruby")
end
