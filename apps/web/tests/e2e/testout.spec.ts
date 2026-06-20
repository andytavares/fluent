import { test, expect } from "@playwright/test";

test.describe("Test-out flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tracks/go/concepts/goroutines");
    await page.getByRole("button", { name: /test.?out/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("shows 4-minute countdown timer", async ({ page }) => {
    await expect(page.getByText(/3:5\d|4:00/)).toBeVisible();
  });

  test("dismissing modal closes without submission", async ({ page }) => {
    await page.getByRole("button", { name: /escape|cancel|close/i }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("submit button enabled when code is non-empty", async ({ page }) => {
    const editor = page.locator(".cm-editor");
    await editor.click();
    await page.keyboard.type("package main");
    await expect(page.getByRole("button", { name: /submit/i })).toBeEnabled();
  });
});
