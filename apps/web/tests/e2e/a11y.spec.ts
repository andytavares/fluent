import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = [
  { name: "landing", path: "/" },
  { name: "sign-in", path: "/auth/sign-in" },
  { name: "dashboard", path: "/dashboard" },
  { name: "learning-path", path: "/tracks/go" },
  { name: "profile", path: "/profile" },
];

for (const { name, path } of pages) {
  test(`${name} page has no critical a11y violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    // Filter to only critical/serious violations
    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(
      critical,
      `Found ${critical.length} critical/serious a11y violations on ${name}:\n${critical
        .map((v) => `  [${v.impact}] ${v.id}: ${v.description}`)
        .join("\n")}`
    ).toHaveLength(0);
  });
}
