// topN returns the names of the top n scorers, sorted descending by score.
fun topN(scores: Map<String, Int>, n: Int): List<String> {
    // TODO
    return emptyList()
}

// wordFrequency returns a map of word -> count.
fun wordFrequency(words: List<String>): Map<String, Int> {
    // TODO
    return emptyMap()
}

// flatten flattens one level of nesting.
fun flatten(nested: List<List<Int>>): List<Int> {
    // TODO
    return emptyList()
}

// runningTotal returns cumulative sums: [1, 2, 3] -> [1, 3, 6].
fun runningTotal(numbers: List<Int>): List<Int> {
    // TODO
    return emptyList()
}

fun main() {
    println(topN(mapOf("Alice" to 90, "Bob" to 95, "Carol" to 80), 2))
    // [Bob, Alice]
    println(wordFrequency(listOf("a", "b", "a", "c", "b", "a")))
    // {a=3, b=2, c=1}
    println(flatten(listOf(listOf(1, 2), listOf(3, 4))))
    // [1, 2, 3, 4]
    println(runningTotal(listOf(1, 2, 3, 4)))
    // [1, 3, 6, 10]
}
