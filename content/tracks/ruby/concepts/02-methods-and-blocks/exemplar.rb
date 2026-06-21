def repeat_call(n, &block)
  n.times { |i| block.call(i) }
  nil
end

def transform_all(values, &block)
  return values unless block
  values.map { |v| block.call(v) }
end

def build_logger(prefix)
  ->(message) { "#{prefix}: #{message}" }
end

def keyword_summary(name:, age:, city: "Unknown")
  "#{name}, age #{age}, from #{city}"
end

if __FILE__ == $PROGRAM_NAME
  repeat_call(3) { |i| puts i }
  p transform_all([1, 2, 3]) { |n| n * 10 }
  logger = build_logger("INFO")
  p logger.call("server started")
  p keyword_summary(name: "Alice", age: 30)
end
