def repeat_call(n, &block)
  # TODO: call block n times, passing the 0-based index. Return nil.
end

def transform_all(values, &block)
  # TODO: apply block to each element and return a new array.
  # If no block given, return values unchanged.
end

def build_logger(prefix)
  # TODO: return a Proc that prepends "#{prefix}: " to its argument
end

def keyword_summary(name:, age:, city: "Unknown")
  # TODO: return "#{name}, age #{age}, from #{city}"
end

if __FILE__ == $PROGRAM_NAME
  repeat_call(3) { |i| puts i }
  p transform_all([1, 2, 3]) { |n| n * 10 }
  logger = build_logger("INFO")
  p logger.call("server started")
  p keyword_summary(name: "Alice", age: 30)
end
