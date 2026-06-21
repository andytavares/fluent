// repeat returns str repeated times times (default 2).
fun repeat(str: String, times: Int = 2): String {
    // TODO
    return ""
}

// wordCount counts the number of whitespace-separated words in this string.
fun String.wordCount(): Int {
    // TODO
    return 0
}

// joinWith joins the variadic parts using separator (default ", ").
fun joinWith(vararg parts: String, separator: String = ", "): String {
    // TODO
    return ""
}

// pow raises this Int to the power exp (exp >= 0).
infix fun Int.pow(exp: Int): Int {
    // TODO
    return 0
}

fun main() {
    println(repeat("ha"))              // haha
    println(repeat("ab", 3))          // ababab
    println("hello world".wordCount()) // 2
    println(joinWith("a", "b", "c"))   // a, b, c
    println(2 pow 10)                  // 1024
}
