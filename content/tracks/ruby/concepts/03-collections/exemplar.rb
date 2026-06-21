def sum_of_squares(nums)
  nums.sum { |n| n ** 2 }
end

def words_longer_than(words, min_length)
  words.select { |w| w.length > min_length }
end

def invert_hash(h)
  h.each_with_object({}) { |(k, v), acc| acc[v] = k }
end

def group_by_first_letter(words)
  words.group_by { |w| w[0] }
end

if __FILE__ == $PROGRAM_NAME
  p sum_of_squares([1, 2, 3, 4])
  p words_longer_than(["hi", "hello", "hey", "greetings"], 3)
  p invert_hash({ a: 1, b: 2, c: 3 })
  p group_by_first_letter(["apple", "avocado", "banana", "apricot"])
end
