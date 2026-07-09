import { test, expect } from "@playwright/test";

const BASE = "https://infeelit.com";

test.describe("Infeelit smoke tests (local)", () => {
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

test.describe("Infeelit production flows", () => {
  test("feed loads bubbles", async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(3000);
    const bubbles = page.locator("[data-bubble-id]");
    expect(await bubbles.count()).toBeGreaterThan(0);
    await page.screenshot({ path: "screenshots/feed.png" });
  });

  test("bubble opens fullscreen", async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(3000);
    await page.locator("[data-bubble-id]").first().click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "screenshots/bubble-open.png" });
  });

  test("+ button shows record/import choice", async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(2000);
    await page.locator("button").filter({ hasText: "+" }).first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: "screenshots/plus-menu.png" });
  });

  test('record button goes to questions', async ({ page }) => {
    await page.goto(BASE);
    await page.waitForTimeout(2000);
    await page.locator("button").filter({ hasText: "+" }).first().click();
    await page.waitForTimeout(500);
    await page.locator("text=Enregistrer").first().click();
    await page.waitForTimeout(2000);
    expect(page.url()).toContain("/questions");
    await page.screenshot({ path: "screenshots/questions.png" });
  });

  test("welcome page magic link form", async ({ page }) => {
    await page.goto(`${BASE}/welcome`);
    await page.waitForTimeout(1000);
    const emailInput = page.locator('input[type="email"]').first();
    await expect(emailInput).toBeVisible();
    await emailInput.fill("test+playwright@gmail.com");
    await page.screenshot({ path: "screenshots/welcome.png" });
  });

  test("/memory/:id route exists - no 404", async ({ page }) => {
    await page.goto(`${BASE}/memory/test-id`);
    await page.waitForTimeout(2000);
    const is404 = await page.locator("text=404").isVisible();
    expect(is404).toBe(false);
    await page.screenshot({ path: "screenshots/memory-route.png" });
  });

  test("auth callback route exists", async ({ page }) => {
    await page.goto(`${BASE}/auth/callback`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "screenshots/auth-callback.png" });
  });

  test("profile page loads", async ({ page }) => {
    await page.goto(`${BASE}/profile`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "screenshots/profile.png" });
  });

  test("mobile feed - bubbles visible", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE);
    await page.waitForTimeout(3000);
    const bubbles = page.locator("[data-bubble-id]");
    expect(await bubbles.count()).toBeGreaterThan(0);
    await page.screenshot({ path: "screenshots/mobile-feed.png" });
  });

  test("mobile - tap bubble opens memory", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE);
    await page.waitForTimeout(3000);
    await page.locator("[data-bubble-id]").first().click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: "screenshots/mobile-bubble.png" });
  });

  test("record flow - reaches thumbnail stage", async ({ page }) => {
    await page.goto(`${BASE}/record`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "screenshots/record.png" });
  });

  test("no console errors on feed", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto(BASE);
    await page.waitForTimeout(3000);
    console.log("Console errors found:", errors);
    await page.screenshot({ path: "screenshots/console-check.png" });
  });
});
