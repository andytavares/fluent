public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
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

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
