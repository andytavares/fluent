// firstNonNull returns the first non-null, non-blank string, or null if none.
fun firstNonNull(vararg values: String?): String? {
    // TODO
    return null
}

// safeDivide returns a / b as Double, or null if b is zero.
fun safeDivide(a: Int, b: Int): Double? {
    // TODO
    return null
}

// parsePositiveInt parses s as an Int and returns it only if positive, else null.
fun parsePositiveInt(s: String?): Int? {
    // TODO
    return null
}

// coalesce returns the first non-null, non-blank value among primary, secondary, fallback.
fun coalesce(primary: String?, secondary: String?, fallback: String): String {
    // TODO
    return ""
}

fun main() {
    println(firstNonNull(null, "", "hello"))   // hello
    println(safeDivide(10, 2))                 // 5.0
    println(safeDivide(10, 0))                 // null
    println(parsePositiveInt("42"))            // 42
    println(parsePositiveInt(null))            // null
    println(coalesce(null, "second", "third")) // second
}
