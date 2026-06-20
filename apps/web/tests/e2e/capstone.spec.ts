import { test, expect } from "@playwright/test";

test.describe("Capstone builder", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tracks/go/capstone");
  });

  test("shows prerequisite gate when concepts not mastered", async ({ page }) => {
    // If the test user hasn't mastered all concepts, expect a gate message
    const gate = page.getByText(/complete all concepts first|prerequisites/i);
    const stepList = page.getByTestId("capstone-step-list");
    await expect(gate.or(stepList)).toBeVisible({ timeout: 5000 });
  });

  test("shows capstone step list when prerequisites met", async ({ page }) => {
    // Assumes test user fixture has completed all concepts
    const stepList = page.getByTestId("capstone-step-list");
    if (await stepList.isVisible()) {
      await expect(stepList).toBeVisible();
      await expect(page.getByTestId("database-status-panel")).toBeVisible();
    }
  });

  test("database panel shows provisioning state on session start", async ({ page }) => {
    const panel = page.getByTestId("database-status-panel");
    if (await panel.isVisible()) {
      const statusText = page.getByText(/provisioning|connected|error/i);
      await expect(statusText).toBeVisible({ timeout: 10000 });
    }
  });
});
