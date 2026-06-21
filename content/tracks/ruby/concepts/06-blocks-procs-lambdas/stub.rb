def make_multiplier(factor)
  # TODO: return a lambda that multiplies its argument by factor
end

def apply_twice(value, callable)
  # TODO: apply callable to value, then to the result
end

def compose(f, g)
  # TODO: return a lambda equivalent to f(g(x))
end

def memoize(callable)
  # TODO: return a caching lambda
end

if __FILE__ == $PROGRAM_NAME
  triple = make_multiplier(3)
  p triple.call(4)

  p apply_twice(2, ->(n) { n * 3 })

  add1   = ->(n) { n + 1 }
  double = ->(n) { n * 2 }
  p compose(double, add1).call(5)

  calls = 0
  expensive = ->(n) { calls += 1; n * n }
  cached = memoize(expensive)
  p cached.call(4)
  p cached.call(4)
  p calls
end
