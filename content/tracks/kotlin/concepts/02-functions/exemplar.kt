fun repeat(str: String, times: Int = 2): String = str.repeat(times)

fun String.wordCount(): Int = trim().split(Regex("\\s+")).count { it.isNotEmpty() }

fun joinWith(vararg parts: String, separator: String = ", "): String =
    parts.joinToString(separator)

infix fun Int.pow(exp: Int): Int {
    var result = 1
    repeat(exp) { result *= this }
    return result
}

fun main() {
    println(repeat("ha"))               // haha
    println(repeat("ab", 3))           // ababab
    println("hello world".wordCount()) // 2
    println(joinWith("a", "b", "c"))   // a, b, c
    println(2 pow 10)                  // 1024
}
