import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.Function;

public class Solution {

    public static class AtomicCounter {
        private final AtomicInteger value = new AtomicInteger(0);

        public void increment() { value.incrementAndGet(); }
        public void decrement() { value.decrementAndGet(); }
        public int value()      { return value.get(); }
    }

    public static List<Integer> parallelMap(List<Integer> items,
                                            Function<Integer, Integer> fn,
                                            int threads) {
        ExecutorService exec = Executors.newFixedThreadPool(threads);
        List<Future<Integer>> futures = new ArrayList<>();
        for (Integer item : items) {
            futures.add(exec.submit(() -> fn.apply(item)));
        }
        exec.shutdown();
        List<Integer> results = new ArrayList<>(futures.size());
        for (Future<Integer> f : futures) {
            try { results.add(f.get()); }
            catch (Exception e) { throw new RuntimeException(e); }
        }
        return results;
    }

    public static CompletableFuture<Integer> asyncSquare(int n) {
        return CompletableFuture.supplyAsync(() -> n * n);
    }

    public static void main(String[] args) throws Exception {
        AtomicCounter c = new AtomicCounter();
        c.increment(); c.increment(); c.decrement();
        System.out.println("counter = " + c.value());
        System.out.println("square = " + asyncSquare(5).get());
    }
}
