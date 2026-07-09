import { test, expect } from "@playwright/test";

test.describe("Infeelit smoke tests", () => {
  test("homepage loads and shows feed", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page.locator("header")).toBeVisible({ timeout: 15_000 });
  });

  test("welcome page loads", async ({ page }) => {
    await page.goto("/welcome");
    await expect(page).toHaveURL("/welcome");
    await expect(page.getByRole("button").first()).toBeVisible({ timeout: 15_000 });
  });

  test("record page loads", async ({ page }) => {
    await page.goto("/record");
    await expect(page).toHaveURL("/record");
    await expect(page.locator("header")).toBeVisible({ timeout: 15_000 });
  });

  test("profile page loads", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL("/profile");
    await expect(page.getByRole("button", { name: /record a memory/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
