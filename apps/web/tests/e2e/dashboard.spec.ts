import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("renders stat cards", async ({ page }) => {
    await expect(page.getByText(/concepts completed|concepts done/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/tested out/i)).toBeVisible();
    await expect(page.getByText(/time saved/i)).toBeVisible();
  });

  test("ContinueBuildingCard is visible", async ({ page }) => {
    const card = page.getByTestId("continue-building-card");
    await expect(card).toBeVisible({ timeout: 5000 });
  });

  test("Resume button navigates to capstone when session exists", async ({ page }) => {
    const resumeBtn = page.getByRole("button", { name: /resume/i });
    if (await resumeBtn.isVisible()) {
      await resumeBtn.click();
      await expect(page).toHaveURL(/\/capstone/);
    }
  });

  test("Start building button navigates to capstone when no session", async ({ page }) => {
    const startBtn = page.getByRole("button", { name: /start building/i });
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await expect(page).toHaveURL(/\/capstone/);
    }
  });
});
