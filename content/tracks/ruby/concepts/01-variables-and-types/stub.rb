def describe_type(value)
  # TODO: return "integer", "float", "string", "symbol", "boolean", or "nil"
end

def to_symbol(str)
  # TODO: convert str to a symbol
end

def safe_divide(a, b)
  # TODO: return a.fdiv(b), or nil if b is zero
end

def interpolate_greeting(name, lang)
  # TODO: return "Hello, #{name}! Welcome to #{lang}."
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
