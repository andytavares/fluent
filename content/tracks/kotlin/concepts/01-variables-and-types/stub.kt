// celsiusToFahrenheit converts a Celsius temperature to Fahrenheit.
fun celsiusToFahrenheit(celsius: Double): Double {
    // TODO
    return 0.0
}

// greet returns "Hello, <name>!" or "Hello, stranger!" when name is null/blank.
fun greet(name: String?): String {
    // TODO
    return ""
}

// describeNumber returns "positive", "negative", or "zero".
fun describeNumber(n: Int): String {
    // TODO
    return ""
}

// initials returns the initials of a full name, e.g. "Ada Lovelace" -> "A.L."
fun initials(fullName: String): String {
    // TODO
    return ""
}

fun main() {
    println(celsiusToFahrenheit(0.0))    // 32.0
    println(greet("Ada"))                // Hello, Ada!
    println(greet(null))                 // Hello, stranger!
    println(describeNumber(-5))          // negative
    println(initials("Ada Lovelace"))    // A.L.
}
