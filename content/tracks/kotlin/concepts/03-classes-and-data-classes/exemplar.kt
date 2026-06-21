data class Money(val amount: Double, val currency: String)

fun Money.add(other: Money): Money {
    require(currency == other.currency) {
        "Cannot add $currency and ${other.currency}"
    }
    return copy(amount = amount + other.amount)
}

fun Money.format(): String = "$currency ${"%.2f".format(amount)}"

object ExchangeRates {
    fun usdToEur(amount: Double): Double = amount * 0.92
    fun eurToUsd(amount: Double): Double = amount * (1.0 / 0.92)
}

fun main() {
    val m1 = Money(10.0, "USD")
    val m2 = Money(5.50, "USD")
    println(m1.format())             // USD 10.00
    println(m1.add(m2).format())     // USD 15.50
    println(ExchangeRates.usdToEur(100.0))  // 92.0
}
