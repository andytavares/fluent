fun topN(scores: Map<String, Int>, n: Int): List<String> =
    scores.entries
        .sortedByDescending { it.value }
        .take(n)
        .map { it.key }

fun wordFrequency(words: List<String>): Map<String, Int> =
    words.groupingBy { it }.eachCount()

fun flatten(nested: List<List<Int>>): List<Int> = nested.flatten()

fun runningTotal(numbers: List<Int>): List<Int> {
    var sum = 0
    return numbers.map { sum += it; sum }
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
