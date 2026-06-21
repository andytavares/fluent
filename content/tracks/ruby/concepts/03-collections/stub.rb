def sum_of_squares(nums)
  # TODO: return the sum of squares of each number
end

def words_longer_than(words, min_length)
  # TODO: return words whose length is strictly greater than min_length
end

def invert_hash(h)
  # TODO: swap keys and values; assume values are unique
end

def group_by_first_letter(words)
  # TODO: return a Hash mapping first letter => [words starting with that letter]
end

if __FILE__ == $PROGRAM_NAME
  p sum_of_squares([1, 2, 3, 4])
  p words_longer_than(["hi", "hello", "hey", "greetings"], 3)
  p invert_hash({ a: 1, b: 2, c: 3 })
  p group_by_first_letter(["apple", "avocado", "banana", "apricot"])
end
