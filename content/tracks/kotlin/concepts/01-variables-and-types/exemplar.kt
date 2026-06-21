fun celsiusToFahrenheit(celsius: Double): Double = (celsius * 9.0 / 5.0) + 32.0

fun greet(name: String?): String =
    if (name.isNullOrBlank()) "Hello, stranger!" else "Hello, $name!"

fun describeNumber(n: Int): String = when {
    n > 0 -> "positive"
    n < 0 -> "negative"
    else  -> "zero"
}

fun initials(fullName: String): String =
    fullName.split(" ").joinToString("") { "${it.first()}." }

fun main() {
    println(celsiusToFahrenheit(0.0))    // 32.0
    println(greet("Ada"))                // Hello, Ada!
    println(greet(null))                 // Hello, stranger!
    println(describeNumber(-5))          // negative
    println(initials("Ada Lovelace"))    // A.L.
}
