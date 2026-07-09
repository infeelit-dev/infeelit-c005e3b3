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

  test("questions route opens chapters selector", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("infeelit_user_name", "Test");
    });
    await page.goto("/questions");
    await expect(page).toHaveURL("/");
    await expect(page.getByText(/De quoi tu veux parler|What do you want to talk about/i)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("profile page loads for guests", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL("/profile");
    await expect(page.getByRole("button", { name: /Create my space|Créer mon espace/i })).toBeVisible({
      timeout: 15_000,
    });
  });
});
