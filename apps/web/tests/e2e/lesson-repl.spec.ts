import { test, expect } from "@playwright/test";

test.describe("Lesson REPL", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tracks/go/concepts/variables-and-types");
  });

  test("renders CodeEditor with Go stub", async ({ page }) => {
    await expect(page.locator(".cm-editor")).toBeVisible();
  });

  test("Run button triggers SSE stream and shows output", async ({ page }) => {
    await page.getByRole("button", { name: /run/i }).click();
    await expect(page.getByTestId("output-pane")).toBeVisible();
    await expect(page.getByText(/streaming|complete/i)).toBeVisible({ timeout: 15000 });
  });

  test("Submit button appears when concept is in_progress", async ({ page }) => {
    await expect(page.getByRole("button", { name: /submit/i })).toBeVisible();
  });

  test("Test-out link opens TestOutModal", async ({ page }) => {
    await page.getByRole("button", { name: /test.?out/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/4:00/)).toBeVisible();
  });
});
