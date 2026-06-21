sealed class Expr {
    data class Num(val value: Double) : Expr()
    data class Add(val left: Expr, val right: Expr) : Expr()
    data class Mul(val left: Expr, val right: Expr) : Expr()
    data class Neg(val expr: Expr) : Expr()
}

fun evaluate(expr: Expr): Double = when (expr) {
    is Expr.Num -> expr.value
    is Expr.Add -> evaluate(expr.left) + evaluate(expr.right)
    is Expr.Mul -> evaluate(expr.left) * evaluate(expr.right)
    is Expr.Neg -> -evaluate(expr.expr)
}

fun describe(expr: Expr): String = when (expr) {
    is Expr.Num -> "${expr.value}"
    is Expr.Add -> "(${describe(expr.left)} + ${describe(expr.right)})"
    is Expr.Mul -> "(${describe(expr.left)} * ${describe(expr.right)})"
    is Expr.Neg -> "(-${describe(expr.expr)})"
}

fun main() {
    val e = Expr.Add(Expr.Num(1.0), Expr.Mul(Expr.Num(2.0), Expr.Num(3.0)))
    println(evaluate(e))   // 7.0
    println(describe(e))   // (1.0 + (2.0 * 3.0))
}
