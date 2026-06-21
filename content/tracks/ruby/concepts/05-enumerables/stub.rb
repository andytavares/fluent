def top_n_words(text, n)
  # TODO: count word frequencies, return n most frequent (ties: alpha ascending)
end

def running_total(nums)
  # TODO: return cumulative sum array
end

def first_n_multiples(base, n)
  # TODO: use a lazy enumerator over an infinite range to find first n multiples of base
end

if __FILE__ == $PROGRAM_NAME
  p top_n_words("the cat sat on the mat the cat", 2)
  p running_total([1, 2, 3, 4, 5])
  p first_n_multiples(3, 5)
end
