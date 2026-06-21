def make_multiplier(factor)
  ->(n) { n * factor }
end

def apply_twice(value, callable)
  callable.call(callable.call(value))
end

def compose(f, g)
  ->(x) { f.call(g.call(x)) }
end

def memoize(callable)
  cache = {}
  ->(arg) { cache.key?(arg) ? cache[arg] : cache[arg] = callable.call(arg) }
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
