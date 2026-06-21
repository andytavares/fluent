// clamp returns value constrained to [min, max].
fun <T : Comparable<T>> clamp(value: T, min: T, max: T): T {
    // TODO
    return value
}

// Stack is a generic LIFO data structure.
class Stack<T> {
    // TODO

    fun push(item: T) {
        // TODO
    }

    fun pop(): T? {
        // TODO
        return null
    }

    fun peek(): T? {
        // TODO
        return null
    }

    val size: Int
        get() = 0  // TODO
}

// partition splits list into (items of type T, everything else).
inline fun <reified T> partition(list: List<Any>): Pair<List<T>, List<Any>> {
    // TODO
    return Pair(emptyList(), emptyList())
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
