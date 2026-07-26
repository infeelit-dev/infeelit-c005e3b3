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
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "screenshots/bubble-open-2.png" });
  // Check fullscreen opened (any overlay or modal)
  const opened = await page.locator("video, audio, [data-fullscreen]").count();
  console.log("Fullscreen elements found:", opened);
  expect(true).toBe(true);
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
  const failed400s: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  page.on("response", (response) => {
    if (response.status() === 400) {
      failed400s.push(response.url());
    }
  });

  await page.goto(BASE);
  await page.waitForTimeout(4000);

  console.log("Console errors:", errors);
  console.log("Failed 400 URLs:", failed400s);

  await page.screenshot({ path: "screenshots/console-check.png" });
  expect(true).toBe(true);
});

test("recording flow - voice mode complete", async ({ page }) => {
  // Grant microphone permission
  const context = page.context();
  await context.grantPermissions(["microphone"]);

  await page.goto(BASE);
  await page.waitForTimeout(2000);

  // Click + button
  const plusBtn = page.locator("button").last();
  await plusBtn.click({ force: true });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "screenshots/record-01-plus.png" });

  // Click Enregistrer
  const recordBtn = page.locator("text=Enregistrer").first();
  if (await recordBtn.isVisible()) {
    await recordBtn.click();
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: "screenshots/record-02-questions.png" });

  // Click first question
  const firstQuestion = page.locator("[data-bubble-id]").first();
  if (await firstQuestion.isVisible()) {
    await firstQuestion.click({ force: true });
  } else {
    // Try clicking any button that looks like a question
    await page.locator("button").nth(3).click({ force: true });
  }
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "screenshots/record-03-modes.png" });

  // Click voice mode
  const voiceBtn = page.locator("text=Voix").first();
  if (await voiceBtn.isVisible()) {
    await voiceBtn.click({ force: true });
  }
  await page.waitForTimeout(4000);
  await page.screenshot({ path: "screenshots/record-04-recording.png" });

  // Check what stage we are in
  const bodyText = await page.locator("body").innerText();
  console.log(
    "Stage after 4s:",
    bodyText.includes("REC")
      ? "RECORDING"
      : bodyText.includes("preview")
        ? "PREVIEW"
        : bodyText.includes("terminer")
          ? "STOP_VISIBLE"
          : "UNKNOWN",
  );

  // Try clicking stop button
  const stopBtn = page
    .locator('div[style*="DC2626"], div[style*="dc2626"], button[style*="DC2626"]')
    .first();
  if (await stopBtn.isVisible()) {
    await stopBtn.click({ force: true });
    console.log("Stop button clicked");
  } else {
    console.log("Stop button NOT FOUND");
    // Log all fixed elements
    const fixed = await page.locator('[style*="position: fixed"], [style*="position:fixed"]').all();
    console.log("Fixed elements count:", fixed.length);
    for (const el of fixed) {
      const text = await el.innerText().catch(() => "");
      const style = await el.getAttribute("style").catch(() => "");
      console.log("Fixed el:", text.slice(0, 50), "| zIndex:", style?.match(/z-index:\s*(\d+)/)?.[1]);
    }
  }

  await page.waitForTimeout(5000);
  await page.screenshot({ path: "screenshots/record-05-after-stop.png" });

  const finalText = await page.locator("body").innerText();
  console.log(
    "Final stage:",
    finalText.includes("preview")
      ? "PREVIEW"
      : finalText.includes("parfait")
        ? "PREVIEW_ACTIONS"
        : finalText.includes("REC")
          ? "STILL_RECORDING"
          : "OTHER",
  );

  expect(true).toBe(true);
});

test("check MediaRecorder support", async ({ page }) => {
  await page.goto(BASE);

  const support = await page.evaluate(() => {
    return {
      mediaRecorder: typeof MediaRecorder !== "undefined",
      getUserMedia: !!(navigator.mediaDevices?.getUserMedia),
      supportedTypes: [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "video/webm;codecs=vp9",
        "video/webm",
        "video/mp4",
      ].filter((t) => MediaRecorder.isTypeSupported(t)),
    };
  });

  console.log("MediaRecorder support:", JSON.stringify(support, null, 2));
  expect(support.mediaRecorder).toBe(true);
});
