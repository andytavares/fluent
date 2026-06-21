def top_n_words(text, n)
  counts = text.split.each_with_object(Hash.new(0)) { |w, h| h[w] += 1 }
  counts.sort_by { |word, freq| [-freq, word] }
        .first(n)
        .map(&:first)
end

def running_total(nums)
  sum = 0
  nums.map { |n| sum += n }
end

def first_n_multiples(base, n)
  (1..Float::INFINITY).lazy
                      .map { |i| i * base }
                      .first(n)
end

if __FILE__ == $PROGRAM_NAME
  p top_n_words("the cat sat on the mat the cat", 2)
  p running_total([1, 2, 3, 4, 5])
  p first_n_multiples(3, 5)
end
