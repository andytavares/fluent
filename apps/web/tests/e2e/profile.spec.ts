import { test, expect } from "@playwright/test";

test.describe("Profile page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/profile");
  });

  test("displays user name and email", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 5000 });
  });

  test("renders mastery table with concept rows", async ({ page }) => {
    const table = page.getByRole("table");
    await expect(table).toBeVisible({ timeout: 5000 });
    await expect(table.getByRole("row")).toHaveCount({ min: 1 } as never);
  });

  test("Share credential button copies URL to clipboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const btn = page.getByRole("button", { name: /share.*credential/i });
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();
    await expect(page.getByRole("button", { name: /copied/i })).toBeVisible({ timeout: 3000 });
  });
});
