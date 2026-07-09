import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class SolutionTest {
    static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    static List<List<String>> sortGroups(List<List<String>> groups) {
        List<List<String>> copy = new ArrayList<>();
        for (List<String> g : groups) {
            List<String> inner = new ArrayList<>(g);
            inner.sort(String::compareTo);
            copy.add(inner);
        }
        copy.sort((a, b) -> String.join(" ", a).compareTo(String.join(" ", b)));
        return copy;
    }

    public static void main(String[] args) {
        // isAnagram
        check("isAnagram: classic anagram", Solution.isAnagram("anagram", "nagaram"));
        check("isAnagram: same letters, wrong counts", !Solution.isAnagram("rat", "car"));
        check("isAnagram: different lengths", !Solution.isAnagram("ab", "a"));
        check("isAnagram: empty strings", Solution.isAnagram("", ""));
        check("isAnagram: identical strings", Solution.isAnagram("abc", "abc"));
        check("isAnagram: multiplicities differ, same character set", !Solution.isAnagram("aacc", "ccac"));
        check("isAnagram: case-sensitive comparison", !Solution.isAnagram("Abc", "abc"));
        check("isAnagram: single characters match", Solution.isAnagram("a", "a"));
        check("isAnagram: single characters mismatch", !Solution.isAnagram("a", "b"));

        StringBuilder sSb = new StringBuilder();
        for (int i = 0; i < 2000; i++) sSb.append("abcdefghij");
        String longS = sSb.toString();
        String longT = new StringBuilder(longS).reverse().toString();
        check("isAnagram: long shuffled string is an anagram", Solution.isAnagram(longS, longT));
        String longTDiff = longT.replaceFirst("a", "z");
        check("isAnagram: long strings differing by one character", !Solution.isAnagram(longS, longTDiff));

        // groupAnagrams
        List<List<String>> ga1 = sortGroups(Solution.groupAnagrams(new String[]{"eat", "tea", "tan", "ate", "nat", "bat"}));
        List<List<String>> expected1 = sortGroups(List.of(List.of("eat", "tea", "ate"), List.of("tan", "nat"), List.of("bat")));
        check("groupAnagrams: classic example", ga1.equals(expected1));

        check("groupAnagrams: empty input array", Solution.groupAnagrams(new String[]{}).isEmpty());
        check("groupAnagrams: single empty string", Solution.groupAnagrams(new String[]{""}).equals(List.of(List.of(""))));
        check("groupAnagrams: single string", Solution.groupAnagrams(new String[]{"a"}).equals(List.of(List.of("a"))));

        List<List<String>> ga2 = sortGroups(Solution.groupAnagrams(new String[]{"ab", "ba", "ab"}));
        check("groupAnagrams: duplicate strings land in one group", ga2.equals(List.of(List.of("ab", "ab", "ba"))));

        List<List<String>> ga3 = sortGroups(Solution.groupAnagrams(new String[]{"", "b", ""}));
        List<List<String>> expected3 = sortGroups(List.of(List.of("", ""), List.of("b")));
        check("groupAnagrams: multiple empty strings group together", ga3.equals(expected3));

        List<List<String>> ga4 = sortGroups(Solution.groupAnagrams(new String[]{"ab", "cd", "ef"}));
        List<List<String>> expected4 = sortGroups(List.of(List.of("ab"), List.of("cd"), List.of("ef")));
        check("groupAnagrams: no anagram partners - all singleton groups", ga4.equals(expected4));

        String word = "abcde";
        String[] rotations = new String[5];
        for (int i = 0; i < 5; i++) rotations[i] = word.substring(i) + word.substring(0, i);
        List<List<String>> ga5 = Solution.groupAnagrams(rotations);
        List<String> flat5 = new ArrayList<>();
        for (List<String> g : ga5) flat5.addAll(g);
        flat5.sort(String::compareTo);
        List<String> rotSorted = new ArrayList<>(Arrays.asList(rotations));
        rotSorted.sort(String::compareTo);
        check("groupAnagrams: many rotations of one word form a single group", ga5.size() == 1 && flat5.equals(rotSorted));

        String[] strs1000 = new String[1000];
        for (int i = 0; i < 500; i++) strs1000[i] = (i % 2 == 0) ? "abc" : "cba";
        for (int i = 0; i < 500; i++) strs1000[500 + i] = (i % 2 == 0) ? "xyz" : "zyx";
        List<List<String>> ga6 = Solution.groupAnagrams(strs1000);
        List<Integer> sizes = new ArrayList<>();
        for (List<String> g : ga6) sizes.add(g.size());
        sizes.sort(Integer::compareTo);
        check("groupAnagrams: 1000 strings across two groups", ga6.size() == 2 && sizes.equals(List.of(500, 500)));

        // twoSum
        check("twoSum: classic example", Arrays.equals(Solution.twoSum(new int[]{2, 7, 11, 15}, 9), new int[]{0, 1}));
        check("twoSum: pair not at the front", Arrays.equals(Solution.twoSum(new int[]{3, 2, 4}, 6), new int[]{1, 2}));
        check("twoSum: duplicate values form the pair", Arrays.equals(Solution.twoSum(new int[]{3, 3}, 6), new int[]{0, 1}));
        check("twoSum: negative numbers", Arrays.equals(Solution.twoSum(new int[]{-3, 4, 90}, 1), new int[]{0, 1}));
        check("twoSum: target zero", Arrays.equals(Solution.twoSum(new int[]{5, -7, 2, 7}, 0), new int[]{1, 3}));
        check("twoSum: pair at the two ends", Arrays.equals(Solution.twoSum(new int[]{1, 9, 4, 7, 5}, 6), new int[]{0, 4}));

        int[] bigNums = new int[100000];
        for (int i = 0; i < 100000; i++) bigNums[i] = i * 2;
        bigNums[99999] = 99999;
        check("twoSum: large array, pair deep inside", Arrays.equals(Solution.twoSum(bigNums, 99999 + 50000), new int[]{25000, 99999}));

        // longestConsecutive
        check("longestConsecutive: classic example", Solution.longestConsecutive(new int[]{100, 4, 200, 1, 3, 2}) == 4);
        check("longestConsecutive: longer run with duplicates", Solution.longestConsecutive(new int[]{0, 3, 7, 2, 5, 8, 4, 6, 0, 1}) == 9);
        check("longestConsecutive: empty array", Solution.longestConsecutive(new int[]{}) == 0);
        check("longestConsecutive: single element", Solution.longestConsecutive(new int[]{7}) == 1);
        check("longestConsecutive: no consecutive values", Solution.longestConsecutive(new int[]{10, 20, 30}) == 1);
        check("longestConsecutive: run crossing zero with negatives", Solution.longestConsecutive(new int[]{-2, 1, -1, 0}) == 4);
        check("longestConsecutive: duplicates inside a run don't lengthen it", Solution.longestConsecutive(new int[]{1, 2, 2, 3}) == 3);

        int n = 50000;
        int[] shuffled = new int[n];
        for (int i = 0; i < n; i++) shuffled[i] = i;
        long seed = 42;
        for (int i = n - 1; i > 0; i--) {
            seed = (seed * 1103515245L + 12345L) % 2147483648L;
            int j = (int) (seed % (i + 1));
            int tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
        }
        check("longestConsecutive: one 50k-element run, shuffled - punishes O(n^2)", Solution.longestConsecutive(shuffled) == n);

        System.out.printf("%n%d passed, %d failed%n", passed, failed);
        if (failed > 0) System.exit(1);
    }
}
