import java.math.BigInteger;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    static long nextSeed(long seed) {
        return (seed * 48271) % 2147483647L;
    }

    static boolean addBinaryAdversarial() {
        long seed = 11;
        for (int round = 0; round < 10; round++) {
            StringBuilder aBuilder = new StringBuilder("1");
            long s = seed;
            for (int i = 1; i < 500; i++) {
                s = nextSeed(s);
                aBuilder.append(s % 2 == 0 ? '0' : '1');
            }
            StringBuilder bBuilder = new StringBuilder("1");
            for (int i = 1; i < 371; i++) {
                s = nextSeed(s);
                bBuilder.append(s % 2 == 0 ? '0' : '1');
            }
            seed = s;
            String a = aBuilder.toString();
            String b = bBuilder.toString();
            String expected = new BigInteger(a, 2).add(new BigInteger(b, 2)).toString(2);
            if (!Solution.addBinary(a, b).equals(expected)) return false;
        }
        return true;
    }

    static boolean everyPowerOfTwoHasOneBit() {
        for (int i = 0; i < 32; i++) {
            if (Solution.hammingWeight(1 << i) != 1) return false;
        }
        return true;
    }

    static boolean hammingWeightPseudoRandomOracle() {
        long seed = 5;
        for (int i = 0; i < 200; i++) {
            seed = nextSeed(seed);
            long raw = (seed * 2 + (i % 2)) % 4294967296L; // exercises bit 31 too
            int n = (int) raw; // same bit pattern, Java int semantics
            int expected = Long.bitCount(raw);
            if (Solution.hammingWeight(n) != expected) return false;
        }
        return true;
    }

    static boolean singleNumberLargeShuffled() {
        int[] nums = new int[10000];
        int idx = 0;
        for (int v = 1; v <= 5000; v++) {
            nums[idx++] = v;
            nums[idx++] = 5001 - v;
        }
        // insert 999999 at position 3777, shifting the rest right
        int[] withSingleton = new int[10001];
        System.arraycopy(nums, 0, withSingleton, 0, 3777);
        withSingleton[3777] = 999999;
        System.arraycopy(nums, 3777, withSingleton, 3778, nums.length - 3777);
        return Solution.singleNumber(withSingleton) == 999999;
    }

    static boolean rangeBitwiseAndBruteForceOracle() {
        long seed = 17;
        for (int i = 0; i < 100; i++) {
            seed = nextSeed(seed);
            int left = (int) (seed % 500);
            int width = (int) ((seed >> 3) % 40);
            int right = left + width;
            int expected = left;
            for (int x = left + 1; x <= right; x++) expected &= x;
            if (Solution.rangeBitwiseAnd(left, right) != expected) return false;
        }
        return true;
    }

    public static void main(String[] args) {
        // addBinary
        check("addBinary: carry creates an extra digit",
              Solution.addBinary("11", "1").equals("100"));
        check("addBinary: classic example",
              Solution.addBinary("1010", "1011").equals("10101"));
        check("addBinary: zero plus zero is a single zero",
              Solution.addBinary("0", "0").equals("0"));
        check("addBinary: zero plus something",
              Solution.addBinary("0", "1101").equals("1101"));
        check("addBinary: cascading carries",
              Solution.addBinary("1111", "1111").equals("11110"));
        check("addBinary: very different lengths",
              Solution.addBinary("100", "110010").equals("110110"));
        check("addBinary: 100-digit input — numeric conversion would round",
              Solution.addBinary("1".repeat(100), "1").equals("1" + "0".repeat(100)));
        check("addBinary: two long strings",
              Solution.addBinary("1".repeat(80), "1".repeat(80)).equals("1".repeat(80) + "0"));
        check("addBinary: 500-digit adversarial sums match a BigInteger oracle",
              addBinaryAdversarial());

        // hammingWeight
        check("hammingWeight: 11 has three set bits", Solution.hammingWeight(11) == 3);
        check("hammingWeight: power of two has one", Solution.hammingWeight(128) == 1);
        check("hammingWeight: zero has none", Solution.hammingWeight(0) == 0);
        check("hammingWeight: one", Solution.hammingWeight(1) == 1);
        check("hammingWeight: bit 31 alone (the signed trap)",
              Solution.hammingWeight(0x80000000) == 1);
        check("hammingWeight: all bits except bit 1",
              Solution.hammingWeight(0xFFFFFFFD) == 31);
        check("hammingWeight: all 32 bits set",
              Solution.hammingWeight(0xFFFFFFFF) == 32);
        check("hammingWeight: alternating bits",
              Solution.hammingWeight(0xAAAAAAAA) == 16);
        check("hammingWeight: every power of two has exactly one bit",
              everyPowerOfTwoHasOneBit());
        check("hammingWeight: matches a bit-count oracle on pseudo-random values",
              hammingWeightPseudoRandomOracle());

        // singleNumber
        check("singleNumber: three elements", Solution.singleNumber(new int[]{2, 2, 1}) == 1);
        check("singleNumber: classic example",
              Solution.singleNumber(new int[]{4, 1, 2, 1, 2}) == 4);
        check("singleNumber: single element", Solution.singleNumber(new int[]{1}) == 1);
        check("singleNumber: negative singleton",
              Solution.singleNumber(new int[]{7, -3, 7}) == -3);
        check("singleNumber: singleton at the start",
              Solution.singleNumber(new int[]{9, 5, 5, 8, 8}) == 9);
        check("singleNumber: singleton at the end",
              Solution.singleNumber(new int[]{5, 5, 8, 8, 9}) == 9);
        check("singleNumber: zero as the singleton",
              Solution.singleNumber(new int[]{3, 0, 3}) == 0);
        check("singleNumber: large shuffled array", singleNumberLargeShuffled());
        check("singleNumber: pairs of negatives around a negative singleton",
              Solution.singleNumber(new int[]{-1, -2, -3, -2, -1}) == -3);

        // rangeBitwiseAnd
        check("rangeBitwiseAnd: classic example [5,7]", Solution.rangeBitwiseAnd(5, 7) == 4);
        check("rangeBitwiseAnd: zero range", Solution.rangeBitwiseAnd(0, 0) == 0);
        check("rangeBitwiseAnd: left equals right", Solution.rangeBitwiseAnd(6, 6) == 6);
        check("rangeBitwiseAnd: full signed-positive range",
              Solution.rangeBitwiseAnd(1, 2147483647) == 0);
        check("rangeBitwiseAnd: adjacent numbers sharing a prefix",
              Solution.rangeBitwiseAnd(10, 11) == 10);
        check("rangeBitwiseAnd: range crossing a power of two is zero",
              Solution.rangeBitwiseAnd(7, 8) == 0);
        check("rangeBitwiseAnd: power-of-two block [12,15]",
              Solution.rangeBitwiseAnd(12, 15) == 12);
        check("rangeBitwiseAnd: huge range keeps only bit 30",
              Solution.rangeBitwiseAnd(1500000000, 2000000000) == 1073741824);
        check("rangeBitwiseAnd: largest adjacent pair",
              Solution.rangeBitwiseAnd(2147483646, 2147483647) == 2147483646);
        check("rangeBitwiseAnd: matches a brute-force oracle on small ranges",
              rangeBitwiseAndBruteForceOracle());
        check("rangeBitwiseAnd: near-max narrow ranges",
              Solution.rangeBitwiseAnd(2147483640, 2147483647) == 2147483640
              && Solution.rangeBitwiseAnd(2147483599, 2147483647) == 2147483584);

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
