fun <T : Comparable<T>> clamp(value: T, min: T, max: T): T = when {
    value < min -> min
    value > max -> max
    else        -> value
}

class Stack<T> {
    private val elements = ArrayDeque<T>()

    fun push(item: T) { elements.addLast(item) }
    fun pop(): T? = if (elements.isEmpty()) null else elements.removeLast()
    fun peek(): T? = elements.lastOrNull()
    val size: Int get() = elements.size
}

inline fun <reified T> partition(list: List<Any>): Pair<List<T>, List<Any>> {
    val matching = list.filterIsInstance<T>()
    val rest = list.filter { it !is T }
    return Pair(matching, rest)
}

fun main() {
    println(clamp(5, 1, 10))    // 5
    println(clamp(-1, 0, 10))   // 0
    println(clamp(15, 0, 10))   // 10

    val stack = Stack<Int>()
    stack.push(1)
    stack.push(2)
    println(stack.pop())        // 2
    println(stack.peek())       // 1

    val mixed = listOf(1, "hello", 2, "world", 3.0)
    val (strings, others) = partition<String>(mixed)
    println(strings)            // [hello, world]
    println(others)             // [1, 2, 3.0]
}
