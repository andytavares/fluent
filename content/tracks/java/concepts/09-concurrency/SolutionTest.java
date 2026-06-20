import java.util.*;
import java.util.concurrent.*;

public class SolutionTest {
    private static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) throws Exception {
        // AtomicCounter: basic
        Solution.AtomicCounter c = new Solution.AtomicCounter();
        check("AtomicCounter: initial 0", c.value() == 0);
        c.increment(); c.increment();
        check("AtomicCounter: after 2 increments", c.value() == 2);
        c.decrement();
        check("AtomicCounter: after decrement", c.value() == 1);

        // AtomicCounter: concurrent increments
        Solution.AtomicCounter concurrent = new Solution.AtomicCounter();
        List<Thread> threads = new ArrayList<>();
        for (int i = 0; i < 1000; i++) {
            Thread t = new Thread(concurrent::increment);
            threads.add(t);
            t.start();
        }
        for (Thread t : threads) t.join();
        check("AtomicCounter: 1000 concurrent increments", concurrent.value() == 1000);

        // parallelMap
        List<Integer> data = List.of(1, 2, 3, 4, 5);
        List<Integer> doubled = Solution.parallelMap(data, n -> n * 2, 2);
        check("parallelMap: size preserved", doubled.size() == 5);
        check("parallelMap: values doubled", doubled.equals(List.of(2, 4, 6, 8, 10)));

        List<Integer> empty = Solution.parallelMap(List.of(), n -> n, 4);
        check("parallelMap: empty list", empty.isEmpty());

        List<Integer> single = Solution.parallelMap(List.of(7), n -> n * n, 2);
        check("parallelMap: single element", single.equals(List.of(49)));

        // asyncSquare
        check("asyncSquare: 5^2 = 25", Solution.asyncSquare(5).get() == 25);
        check("asyncSquare: 0^2 = 0",  Solution.asyncSquare(0).get() == 0);
        check("asyncSquare: (-3)^2 = 9", Solution.asyncSquare(-3).get() == 9);

        System.out.println("\n" + passed + " passed, " + failed + " failed");
        if (failed > 0) System.exit(1);
    }
}
