import { test, expect } from "@playwright/test";

test.describe("Learning path", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tracks/go");
  });

  test("renders ordered concept nodes", async ({ page }) => {
    const nodes = page.getByTestId("concept-node");
    await expect(nodes.first()).toBeVisible();
    await expect(nodes).toHaveCount(10);
  });

  test("locked concepts are not clickable", async ({ page }) => {
    const locked = page.getByTestId("concept-node").filter({ hasText: /locked/i }).first();
    await expect(locked).toHaveAttribute("aria-disabled", "true");
  });

  test("available concept navigates to lesson page", async ({ page }) => {
    const available = page.getByTestId("concept-node").filter({ hasText: /available/i }).first();
    await available.click();
    await expect(page).toHaveURL(/\/concepts\//);
  });

  test("wip concepts are hidden", async ({ page }) => {
    // No concept node should show a "wip" badge
    await expect(page.getByText("wip")).not.toBeVisible();
  });
});
