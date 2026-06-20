import java.util.List;

public class SolutionTest {
    private static int passed = 0, failed = 0;

    static void check(String name, boolean condition) {
        if (condition) { System.out.println("  PASS: " + name); passed++; }
        else           { System.out.println("  FAIL: " + name); failed++; }
    }

    static boolean throwsAppException(Runnable fn, int expectedCode) {
        try { fn.run(); return false; }
        catch (Solution.AppException e) { return e.getCode() == expectedCode; }
        catch (Exception e) { return false; }
    }

    public static void main(String[] args) {
        // parsePositiveInt
        check("parsePositiveInt: 42", Solution.parsePositiveInt("42") == 42);
        check("parsePositiveInt: 1",  Solution.parsePositiveInt("1")  == 1);
        check("parsePositiveInt: throws 400 for 'abc'",  throwsAppException(() -> Solution.parsePositiveInt("abc"), 400));
        check("parsePositiveInt: throws 422 for 0",      throwsAppException(() -> Solution.parsePositiveInt("0"), 422));
        check("parsePositiveInt: throws 422 for -5",     throwsAppException(() -> Solution.parsePositiveInt("-5"), 422));

        // safeRead
        check("safeRead: trims whitespace", "hello".equals(Solution.safeRead("  hello  ")));
        check("safeRead: returns trimmed",  "ok".equals(Solution.safeRead("ok")));
        check("safeRead: throws 400 for null",  throwsAppException(() -> Solution.safeRead(null), 400));
        check("safeRead: throws 400 for blank", throwsAppException(() -> Solution.safeRead("   "), 400));
        check("safeRead: throws 400 for empty", throwsAppException(() -> Solution.safeRead(""), 400));

        // sumInts
        check("sumInts: sums valid list", Solution.sumInts(List.of("1", "2", "3")) == 6);
        check("sumInts: single element", Solution.sumInts(List.of("10")) == 10);
        check("sumInts: propagates exception", throwsAppException(() -> Solution.sumInts(List.of("1", "bad", "3")), 400));

        System.out.println("\n" + passed + " passed, " + failed + " failed");
        if (failed > 0) System.exit(1);
    }
}
