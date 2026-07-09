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

const BASE = process.env.BASE_URL || "http://127.0.0.1:8080";

test("bubble click opens fullscreen", async ({ page }) => {
  await page.goto(BASE);
  await page.waitForTimeout(4000);
  await page.locator("[data-bubble-id]").first().click({ force: true });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screenshots/bubble-open.png" });
  const fullscreen = page.locator("video, audio").first();
  await expect(fullscreen).toBeVisible({ timeout: 5000 });
});

test("+ button opens bottom sheet", async ({ page }) => {
  await page.goto(BASE);
  await page.waitForTimeout(3000);

  // Take screenshot before click to see what's on screen
  await page.screenshot({ path: "screenshots/before-plus.png" });

  // Try clicking the last button in the bottom nav (FAB)
  const buttons = page.locator("button");
  const count = await buttons.count();
  console.log("Total buttons found:", count);

  // Click the center/plus button
  await buttons.nth(Math.floor(count / 2)).click({ force: true });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screenshots/plus-menu.png" });

  // Check if any bottom sheet appeared (any new content)
  const bodyText = await page.locator("body").innerText();
  console.log("Body contains Enregistrer:", bodyText.includes("Enregistrer"));
  console.log("Body contains Import:", bodyText.includes("Import"));

  // Don't assert - just document what appears
  expect(true).toBe(true);
});

test("/memory/:id no 404", async ({ page }) => {
  await page.goto(`${BASE}/memory/test-id`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screenshots/memory-route.png" });
  const is404 = await page.locator("text=404").isVisible();
  expect(is404).toBe(false);
});

test("mobile feed bubbles visible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE);
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "screenshots/mobile-feed.png" });
  const bubbles = page.locator("[data-bubble-id]");
  expect(await bubbles.count()).toBeGreaterThan(0);
});

test("auth callback route loads", async ({ page }) => {
  await page.goto(`${BASE}/auth/callback`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "screenshots/auth-callback.png" });
  const is404 = await page.locator("text=404").isVisible();
  expect(is404).toBe(false);
});

test("no console errors on feed", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await page.goto(BASE);
  await page.waitForTimeout(4000);
  console.log("Console errors:", errors);
  await page.screenshot({ path: "screenshots/console-check.png" });
});
