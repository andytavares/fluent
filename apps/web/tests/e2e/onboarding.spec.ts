import { test, expect } from "@playwright/test";

test.describe("Onboarding flow", () => {
  test.beforeEach(async ({ page }) => {
    // Assumes test user is signed in via auth state fixture in CI
    await page.goto("/tracks/go/onboarding");
  });

  test("shows confidence selector on first visit", async ({ page }) => {
    await expect(page.getByRole("radiogroup")).toBeVisible();
    await expect(page.getByText("beginner", { exact: false })).toBeVisible();
  });

  test("beginner path skips placement and goes to learning path", async ({ page }) => {
    await page.getByLabel(/beginner/i).check();
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page).toHaveURL(/\/tracks\/go($|\?)/);
  });

  test("experienced path triggers placement flow", async ({ page }) => {
    await page.getByLabel(/experienced/i).check();
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page.getByText(/placement task/i)).toBeVisible();
  });

  test("placement can be skipped", async ({ page }) => {
    await page.getByLabel(/experienced/i).check();
    await page.getByRole("button", { name: /continue/i }).click();
    await page.getByRole("button", { name: /skip/i }).click();
    await expect(page).toHaveURL(/\/tracks\/go($|\?)/);
  });
});
