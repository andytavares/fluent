import java.util.List;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    public static void main(String[] args) {
        // climbStairs
        check("climbStairs: one stair", Solution.climbStairs(1) == 1);
        check("climbStairs: two stairs", Solution.climbStairs(2) == 2);
        check("climbStairs: three stairs", Solution.climbStairs(3) == 3);
        check("climbStairs: five stairs", Solution.climbStairs(5) == 8);
        check("climbStairs: ten stairs", Solution.climbStairs(10) == 89);
        check("climbStairs: forty-five stairs", Solution.climbStairs(45) == 1836311903);

        // rob
        check("rob: classic example", Solution.rob(new int[]{1, 2, 3, 1}) == 4);
        check("rob: skip pattern pays off", Solution.rob(new int[]{2, 7, 9, 3, 1}) == 12);
        check("rob: empty street", Solution.rob(new int[]{}) == 0);
        check("rob: single house", Solution.rob(new int[]{5}) == 5);
        check("rob: two houses take the larger", Solution.rob(new int[]{2, 10}) == 10);
        check("rob: both ends beat every-other", Solution.rob(new int[]{2, 1, 1, 2}) == 4);
        check("rob: all zeros", Solution.rob(new int[]{0, 0, 0}) == 0);

        // wordBreak
        check("wordBreak: two words",
              Solution.wordBreak("leetcode", List.of("leet", "code")) == true);
        check("wordBreak: word reuse",
              Solution.wordBreak("applepenapple", List.of("apple", "pen")) == true);
        check("wordBreak: overlapping but unsegmentable",
              Solution.wordBreak("catsandog", List.of("cats", "dog", "sand", "and", "cat")) == false);
        check("wordBreak: empty string is segmentable",
              Solution.wordBreak("", List.of("a")) == true);
        check("wordBreak: single unmatched char",
              Solution.wordBreak("a", List.of("b")) == false);
        check("wordBreak: greedy first match dead-ends",
              Solution.wordBreak("cars", List.of("car", "ca", "rs")) == true);
        check("wordBreak: one word repeated many times",
              Solution.wordBreak("aaaa", List.of("a")) == true);
        check("wordBreak: whole string is one word",
              Solution.wordBreak("dynamic", List.of("dynamic")) == true);

        // coinChange
        check("coinChange: classic example", Solution.coinChange(new int[]{1, 2, 5}, 11) == 3);
        check("coinChange: unreachable amount", Solution.coinChange(new int[]{2}, 3) == -1);
        check("coinChange: zero amount needs zero coins", Solution.coinChange(new int[]{1}, 0) == 0);
        check("coinChange: single coin exact", Solution.coinChange(new int[]{1}, 1) == 1);
        check("coinChange: greedy largest-first fails",
              Solution.coinChange(new int[]{1, 5, 11}, 15) == 3);
        check("coinChange: coin larger than amount", Solution.coinChange(new int[]{5, 10}, 3) == -1);
        check("coinChange: big denominations, big amount",
              Solution.coinChange(new int[]{186, 419, 83, 408}, 6249) == 20);

        // lengthOfLIS
        check("lengthOfLIS: classic example",
              Solution.lengthOfLIS(new int[]{10, 9, 2, 5, 3, 7, 101, 18}) == 4);
        check("lengthOfLIS: values revisited",
              Solution.lengthOfLIS(new int[]{0, 1, 0, 3, 2, 3}) == 4);
        check("lengthOfLIS: all equal — strictness",
              Solution.lengthOfLIS(new int[]{7, 7, 7, 7}) == 1);
        check("lengthOfLIS: empty array", Solution.lengthOfLIS(new int[]{}) == 0);
        check("lengthOfLIS: single element", Solution.lengthOfLIS(new int[]{1}) == 1);
        check("lengthOfLIS: strictly descending",
              Solution.lengthOfLIS(new int[]{5, 4, 3, 2, 1}) == 1);
        check("lengthOfLIS: strictly ascending",
              Solution.lengthOfLIS(new int[]{1, 2, 3, 4}) == 4);
        check("lengthOfLIS: replacement mid-run",
              Solution.lengthOfLIS(new int[]{4, 10, 4, 3, 8, 9}) == 3);

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
