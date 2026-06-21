fun firstNonNull(vararg values: String?): String? =
    values.firstOrNull { !it.isNullOrBlank() }

fun safeDivide(a: Int, b: Int): Double? =
    if (b == 0) null else a.toDouble() / b

fun parsePositiveInt(s: String?): Int? =
    s?.toIntOrNull()?.takeIf { it > 0 }

fun coalesce(primary: String?, secondary: String?, fallback: String): String =
    primary?.takeIf { it.isNotBlank() }
        ?: secondary?.takeIf { it.isNotBlank() }
        ?: fallback

fun main() {
    println(firstNonNull(null, "", "hello"))   // hello
    println(safeDivide(10, 2))                 // 5.0
    println(safeDivide(10, 0))                 // null
    println(parsePositiveInt("42"))            // 42
    println(parsePositiveInt(null))            // null
    println(coalesce(null, "second", "third")) // second
}
